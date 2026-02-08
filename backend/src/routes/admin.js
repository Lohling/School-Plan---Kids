/**
 * Admin-Routen
 * Benutzerverwaltung, Stundenplan-Bearbeitung, Übersichten
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { getMany, getOne, query } = require('../config/database');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Alle Routen erfordern Admin-Rechte
router.use(authenticate, requireAdmin);

/**
 * GET /api/admin/dashboard
 * Admin-Dashboard Übersicht
 */
router.get('/dashboard', async (req, res) => {
    try {
        const schoolId = req.user.school_id;

        // Statistiken sammeln
        const [
            userCounts,
            classCounts,
            pendingSickNotes,
            recentNews
        ] = await Promise.all([
            getMany(
                `SELECT role, COUNT(*) as count FROM users WHERE school_id = $1 AND is_active = true GROUP BY role`,
                [schoolId]
            ),
            getOne(
                `SELECT COUNT(*) as count FROM classes WHERE school_id = $1`,
                [schoolId]
            ),
            getOne(
                `SELECT COUNT(*) as count FROM sick_notes sn
                 JOIN users u ON COALESCE(sn.student_id, sn.teacher_id) = u.id
                 WHERE u.school_id = $1 AND sn.status = 'pending'`,
                [schoolId]
            ),
            getMany(
                `SELECT id, title, created_at FROM news WHERE school_id = $1 ORDER BY created_at DESC LIMIT 5`,
                [schoolId]
            )
        ]);

        const stats = {
            users: userCounts.reduce((acc, item) => ({ ...acc, [item.role]: parseInt(item.count) }), {}),
            classes: parseInt(classCounts?.count || 0),
            pendingSickNotes: parseInt(pendingSickNotes?.count || 0),
            recentNews: recentNews
        };

        res.json({ stats });
    } catch (error) {
        console.error('Dashboard Error:', error);
        res.status(500).json({ error: 'Fehler beim Laden' });
    }
});

/**
 * GET /api/admin/users
 * Alle Benutzer der Schule
 */
router.get('/users', async (req, res) => {
    try {
        const { role, search } = req.query;

        let sql = `
            SELECT id, email, first_name, last_name, role, avatar_emoji, is_active, created_at
            FROM users 
            WHERE school_id = $1
        `;
        const params = [req.user.school_id];

        if (role) {
            params.push(role);
            sql += ` AND role = $${params.length}`;
        }

        if (search) {
            params.push(`%${search}%`);
            sql += ` AND (first_name ILIKE $${params.length} OR last_name ILIKE $${params.length} OR email ILIKE $${params.length})`;
        }

        sql += ' ORDER BY role, last_name, first_name';

        const users = await getMany(sql, params);

        res.json({ users });
    } catch (error) {
        res.status(500).json({ error: 'Fehler beim Laden' });
    }
});

/**
 * POST /api/admin/users
 * Neuen Benutzer erstellen
 */
router.post('/users', [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('firstName').notEmpty().trim(),
    body('lastName').notEmpty().trim(),
    body('role').isIn(['student', 'parent', 'teacher', 'admin']),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password, firstName, lastName, role, avatarEmoji } = req.body;

        // Prüfen ob E-Mail bereits existiert
        const existing = await getOne('SELECT id FROM users WHERE email = $1', [email]);
        if (existing) {
            return res.status(400).json({ error: 'E-Mail bereits registriert' });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const result = await query(
            `INSERT INTO users (school_id, email, password_hash, first_name, last_name, role, avatar_emoji)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id`,
            [req.user.school_id, email, passwordHash, firstName, lastName, role, avatarEmoji || '😊']
        );

        // Audit Log
        await query(
            'INSERT INTO audit_log (user_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4)',
            [req.user.id, 'user_created', 'user', result.rows[0].id]
        );

        res.status(201).json({ 
            success: true, 
            message: 'Benutzer erstellt',
            userId: result.rows[0].id
        });
    } catch (error) {
        console.error('Create User Error:', error);
        res.status(500).json({ error: 'Fehler beim Erstellen' });
    }
});

/**
 * PUT /api/admin/users/:id
 * Benutzer aktualisieren
 */
router.put('/users/:id', async (req, res) => {
    try {
        const { firstName, lastName, role, isActive, avatarEmoji } = req.body;

        await query(
            `UPDATE users SET first_name = $1, last_name = $2, role = $3, is_active = $4, avatar_emoji = $5, updated_at = NOW()
             WHERE id = $6 AND school_id = $7`,
            [firstName, lastName, role, isActive, avatarEmoji, req.params.id, req.user.school_id]
        );

        res.json({ success: true, message: 'Benutzer aktualisiert' });
    } catch (error) {
        res.status(500).json({ error: 'Fehler beim Aktualisieren' });
    }
});

/**
 * PUT /api/admin/users/:id/reset-password
 * Passwort zurücksetzen
 */
router.put('/users/:id/reset-password', async (req, res) => {
    try {
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 8) {
            return res.status(400).json({ error: 'Passwort muss mindestens 8 Zeichen haben' });
        }

        const passwordHash = await bcrypt.hash(newPassword, 10);

        await query(
            'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2 AND school_id = $3',
            [passwordHash, req.params.id, req.user.school_id]
        );

        res.json({ success: true, message: 'Passwort zurückgesetzt' });
    } catch (error) {
        res.status(500).json({ error: 'Fehler beim Zurücksetzen' });
    }
});

/**
 * GET /api/admin/timetable/all
 * Alle Stundenpläne übersicht
 */
router.get('/timetable/all', async (req, res) => {
    try {
        const timetable = await getMany(
            `SELECT te.*, 
                    c.name as class_name,
                    s.name as subject_name,
                    r.name as room_name,
                    u.first_name || ' ' || u.last_name as teacher_name
             FROM timetable_entries te
             JOIN classes c ON te.class_id = c.id
             LEFT JOIN subjects s ON te.subject_id = s.id
             LEFT JOIN rooms r ON te.room_id = r.id
             LEFT JOIN users u ON te.teacher_id = u.id
             WHERE c.school_id = $1
             ORDER BY c.name, te.weekday, te.lesson_number`,
            [req.user.school_id]
        );

        res.json({ timetable });
    } catch (error) {
        res.status(500).json({ error: 'Fehler beim Laden' });
    }
});

/**
 * POST /api/admin/timetable
 * Neuen Stundenplan-Eintrag erstellen
 */
router.post('/timetable', [
    body('classId').isUUID(),
    body('weekday').isIn(['Mo', 'Di', 'Mi', 'Do', 'Fr']),
    body('lessonNumber').isInt({ min: 1, max: 10 }),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { classId, teacherId, subjectId, roomId, weekday, lessonNumber, startTime, endTime, entryType } = req.body;

        const result = await query(
            `INSERT INTO timetable_entries (class_id, teacher_id, subject_id, room_id, weekday, lesson_number, start_time, end_time, entry_type)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING id`,
            [classId, teacherId || null, subjectId || null, roomId || null, weekday, lessonNumber, startTime, endTime, entryType || 'lesson']
        );

        res.status(201).json({ 
            success: true, 
            message: 'Stunde erstellt',
            entryId: result.rows[0].id
        });
    } catch (error) {
        console.error('Create Timetable Error:', error);
        res.status(500).json({ error: 'Fehler beim Erstellen' });
    }
});

/**
 * PUT /api/admin/timetable/:id
 * Stundenplan-Eintrag aktualisieren
 */
router.put('/timetable/:id', async (req, res) => {
    try {
        const { teacherId, subjectId, roomId, startTime, endTime } = req.body;

        await query(
            `UPDATE timetable_entries 
             SET teacher_id = $1, subject_id = $2, room_id = $3, start_time = $4, end_time = $5, updated_at = NOW()
             WHERE id = $6`,
            [teacherId || null, subjectId || null, roomId || null, startTime, endTime, req.params.id]
        );

        res.json({ success: true, message: 'Stunde aktualisiert' });
    } catch (error) {
        res.status(500).json({ error: 'Fehler beim Aktualisieren' });
    }
});

/**
 * DELETE /api/admin/timetable/:id
 * Stundenplan-Eintrag löschen
 */
router.delete('/timetable/:id', async (req, res) => {
    try {
        await query('DELETE FROM timetable_entries WHERE id = $1', [req.params.id]);
        res.json({ success: true, message: 'Stunde gelöscht' });
    } catch (error) {
        res.status(500).json({ error: 'Fehler beim Löschen' });
    }
});

/**
 * POST /api/admin/substitution
 * Vertretung erstellen
 */
router.post('/substitution', [
    body('originalEntryId').isUUID(),
    body('date').isDate(),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { originalEntryId, substituteTeacherId, substituteSubjectId, substituteRoomId, date, reason, noteForStudents, isCancelled } = req.body;

        await query(
            `INSERT INTO substitutions (original_entry_id, substitute_teacher_id, substitute_subject_id, substitute_room_id, date, reason, note_for_students, is_cancelled, created_by)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [originalEntryId, substituteTeacherId || null, substituteSubjectId || null, substituteRoomId || null, date, reason || null, noteForStudents || null, isCancelled || false, req.user.id]
        );

        res.status(201).json({ success: true, message: 'Vertretung erstellt' });
    } catch (error) {
        console.error('Create Substitution Error:', error);
        res.status(500).json({ error: 'Fehler beim Erstellen' });
    }
});

/**
 * GET /api/admin/lesson-contents
 * Alle Unterrichtsinhalte einsehen
 */
router.get('/lesson-contents', async (req, res) => {
    try {
        const { classId, date, teacherId } = req.query;

        let sql = `
            SELECT lc.*, 
                   te.lesson_number, te.weekday,
                   c.name as class_name,
                   s.name as subject_name,
                   u.first_name || ' ' || u.last_name as teacher_name
            FROM lesson_contents lc
            JOIN timetable_entries te ON lc.timetable_entry_id = te.id
            JOIN classes c ON te.class_id = c.id
            LEFT JOIN subjects s ON te.subject_id = s.id
            LEFT JOIN users u ON lc.created_by = u.id
            WHERE c.school_id = $1
        `;
        const params = [req.user.school_id];

        if (classId) {
            params.push(classId);
            sql += ` AND te.class_id = $${params.length}`;
        }

        if (date) {
            params.push(date);
            sql += ` AND lc.date = $${params.length}`;
        }

        if (teacherId) {
            params.push(teacherId);
            sql += ` AND te.teacher_id = $${params.length}`;
        }

        sql += ' ORDER BY lc.date DESC, c.name, te.lesson_number LIMIT 100';

        const contents = await getMany(sql, params);

        res.json({ contents });
    } catch (error) {
        res.status(500).json({ error: 'Fehler beim Laden' });
    }
});

/**
 * GET /api/admin/audit-log
 * Audit-Log einsehen
 */
router.get('/audit-log', async (req, res) => {
    try {
        const logs = await getMany(
            `SELECT al.*, u.first_name || ' ' || u.last_name as user_name
             FROM audit_log al
             LEFT JOIN users u ON al.user_id = u.id
             WHERE u.school_id = $1
             ORDER BY al.created_at DESC
             LIMIT 100`,
            [req.user.school_id]
        );

        res.json({ logs });
    } catch (error) {
        res.status(500).json({ error: 'Fehler beim Laden' });
    }
});

/**
 * GET /api/admin/subjects
 * Alle Fächer
 */
router.get('/subjects', async (req, res) => {
    try {
        const subjects = await getMany(
            'SELECT * FROM subjects WHERE school_id = $1 ORDER BY name',
            [req.user.school_id]
        );
        res.json({ subjects });
    } catch (error) {
        res.status(500).json({ error: 'Fehler beim Laden' });
    }
});

/**
 * GET /api/admin/rooms
 * Alle Räume
 */
router.get('/rooms', async (req, res) => {
    try {
        const rooms = await getMany(
            'SELECT * FROM rooms WHERE school_id = $1 ORDER BY name',
            [req.user.school_id]
        );
        res.json({ rooms });
    } catch (error) {
        res.status(500).json({ error: 'Fehler beim Laden' });
    }
});

/**
 * POST /api/admin/parent-student
 * Eltern-Kind-Beziehung erstellen
 */
router.post('/parent-student', [
    body('parentId').isUUID(),
    body('studentId').isUUID(),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { parentId, studentId, relationship } = req.body;

        await query(
            `INSERT INTO parent_students (parent_id, student_id, relationship)
             VALUES ($1, $2, $3)
             ON CONFLICT (parent_id, student_id) DO UPDATE SET relationship = $3`,
            [parentId, studentId, relationship || 'Elternteil']
        );

        res.json({ success: true, message: 'Beziehung erstellt' });
    } catch (error) {
        res.status(500).json({ error: 'Fehler beim Erstellen' });
    }
});

module.exports = router;
