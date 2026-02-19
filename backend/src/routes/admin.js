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
 * Hilfsfunktion: Überprüft ob ein Lehrer zur gleichen Zeit einen Unterricht hat
 * @param teacherId - ID des Lehrers
 * @param weekday - Wochentag (Mo, Di, Mi, Do, Fr)
 * @param startTime - Startzeit
 * @param endTime - Endzeit
 * @param schoolId - Schulen-ID
 * @param excludeEntryId - Optional: ID des zu ignorierenden Eintrags (z.B. beim Aktualisieren)
 * @returns Objekt mit conflict-Status und überlappenden Einträgen
 */
const checkTeacherTimeConflict = async (teacherId, weekday, startTime, endTime, schoolId, excludeEntryId = null) => {
    if (!teacherId) {
        return { hasConflict: false, conflicts: [] };
    }

    let sql = `
        SELECT 
            te.id, te.class_id, te.lesson_number, te.start_time, te.end_time,
            c.name as class_name,
            u.first_name, u.last_name
        FROM timetable_entries te
        JOIN classes c ON te.class_id = c.id
        JOIN users u ON te.teacher_id = u.id
        WHERE te.teacher_id = $1 
          AND c.school_id = $2
          AND te.weekday = $3
          AND te.entry_type = 'lesson'
          AND (
              (te.start_time, te.end_time) OVERLAPS ($4::TIME, $5::TIME)
          )
    `;
    
    const params = [teacherId, schoolId, weekday, startTime, endTime];
    
    if (excludeEntryId) {
        sql += ` AND te.id != $${params.length + 1}`;
        params.push(excludeEntryId);
    }

    const conflicts = await getMany(sql, params);

    return {
        hasConflict: conflicts.length > 0,
        conflicts: conflicts.map(c => ({
            id: c.id,
            className: c.class_name,
            startTime: c.start_time,
            endTime: c.end_time,
            lessonNumber: c.lesson_number
        }))
    };
};

/**
 * Hilfsfunktion: Überprüft ob ein Lehrer am selben Wochentag bereits eine Stunde mit derselben Stundennummer hat
 * @param teacherId - ID des Lehrers
 * @param weekday - Wochentag (Mo, Di, Mi, Do, Fr)
 * @param lessonNumber - Stundennummer (z.B. 1, 2, 3...)
 * @param schoolId - Schulen-ID
 * @param excludeEntryId - Optional: ID des zu ignorierenden Eintrags (beim Aktualisieren)
 * @returns Objekt mit conflict-Status und überlappenden Einträgen
 */
const checkTeacherLessonNumberConflict = async (teacherId, weekday, lessonNumber, schoolId, excludeEntryId = null) => {
    if (!teacherId) {
        return { hasConflict: false, conflicts: [] };
    }

    let sql = `
        SELECT 
            te.id, te.lesson_number, te.start_time, te.end_time,
            c.name as class_name
        FROM timetable_entries te
        JOIN classes c ON te.class_id = c.id
        WHERE te.teacher_id = $1
          AND c.school_id = $2
          AND te.weekday = $3
          AND te.lesson_number = $4
          AND te.entry_type = 'lesson'
    `;

    const params = [teacherId, schoolId, weekday, lessonNumber];

    if (excludeEntryId) {
        sql += ` AND te.id != $${params.length + 1}`;
        params.push(excludeEntryId);
    }

    const conflicts = await getMany(sql, params);

    return {
        hasConflict: conflicts.length > 0,
        conflicts: conflicts.map(c => ({
            id: c.id,
            className: c.class_name,
            startTime: c.start_time,
            endTime: c.end_time,
            lessonNumber: c.lesson_number
        }))
    };
};

/**
 * Hilfsfunktion: Überprüft ob ein Lehrer am spezifischen Datum zur gleichen Zeit unterrichtet
 * (für Vertretungen, die an spezifischen Daten gelten)
 * @param teacherId - ID des Lehrers
 * @param date - Datum im Format YYYY-MM-DD
 * @param startTime - Startzeit
 * @param endTime - Endzeit
 * @param schoolId - Schulen-ID
 * @param excludeSubstitutionId - Optional: ID der zu ignorierenden Vertretung
 * @returns Objekt mit conflict-Status und überlappenden Einträgen
 */
const checkTeacherDateTimeConflict = async (teacherId, date, startTime, endTime, schoolId, excludeSubstitutionId = null) => {
    if (!teacherId) {
        return { hasConflict: false, conflicts: [] };
    }

    // Wochentag aus dem Datum ermitteln
    const dateObj = new Date(date);
    const weekdayNum = dateObj.getDay();
    const weekdaysMap = { 1: 'Mo', 2: 'Di', 3: 'Mi', 4: 'Do', 5: 'Fr', 0: null, 6: null };
    const weekday = weekdaysMap[weekdayNum];

    if (!weekday) {
        // Wochenende - es sollte keine regulären Lektionen geben
        return { hasConflict: false, conflicts: [] };
    }

    // Überprüfe normale Stundenplan-Einträge für diesen Tag
    let sql = `
        SELECT DISTINCT
            'regular' as type,
            te.id, te.class_id, te.lesson_number, te.start_time, te.end_time,
            c.name as class_name,
            u.first_name, u.last_name
        FROM timetable_entries te
        JOIN classes c ON te.class_id = c.id
        JOIN users u ON te.teacher_id = u.id
        WHERE te.teacher_id = $1 
          AND c.school_id = $2
          AND te.weekday = $3
          AND te.entry_type = 'lesson'
          AND (
              (te.start_time, te.end_time) OVERLAPS ($4::TIME, $5::TIME)
          )
        
        UNION
        
        -- Überprüfe auch andere Vertretungen für den Lehrer am gleichen Datum
        SELECT DISTINCT
            'substitution' as type,
            te.id, te.class_id, te.lesson_number, te.start_time, te.end_time,
            c.name as class_name,
            u.first_name, u.last_name
        FROM substitutions sub
        JOIN timetable_entries te ON sub.original_entry_id = te.id
        JOIN classes c ON te.class_id = c.id
        JOIN users u ON te.teacher_id = u.id
        WHERE sub.substitute_teacher_id = $1
          AND c.school_id = $2
          AND sub.date = $6::DATE
          AND sub.is_cancelled = false
          AND (
              (te.start_time, te.end_time) OVERLAPS ($4::TIME, $5::TIME)
          )
    `;
    
    const params = [teacherId, schoolId, weekday, startTime, endTime, date];
    
    if (excludeSubstitutionId) {
        sql += ` AND sub.id != $${params.length + 1}`;
        params.push(excludeSubstitutionId);
    }

    const conflicts = await getMany(sql, params);

    return {
        hasConflict: conflicts.length > 0,
        conflicts: conflicts.map(c => ({
            id: c.id,
            className: c.class_name,
            startTime: c.start_time,
            endTime: c.end_time,
            lessonNumber: c.lesson_number,
            type: c.type
        }))
    };
};

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

        // Safety: ensure class belongs to this admin's school
        const cls = await getOne('SELECT id FROM classes WHERE id = $1 AND school_id = $2', [classId, req.user.school_id]);
        if (!cls) {
            return res.status(404).json({ error: 'Klasse nicht gefunden' });
        }

        // Safety: ensure teacher belongs to this school (if provided)
        if (teacherId) {
            const teacher = await getOne(
                `SELECT id FROM users WHERE id = $1 AND role = 'teacher' AND school_id = $2 AND is_active = true`,
                [teacherId, req.user.school_id]
            );
            if (!teacher) {
                return res.status(400).json({ error: 'Ungültiger Lehrer für diese Schule' });
            }

            // Überprüfung: Lehrer kann nicht zur gleichen Zeit in zwei Klassen unterrichten
            const conflictCheck = await checkTeacherTimeConflict(teacherId, weekday, startTime, endTime, req.user.school_id);
            if (conflictCheck.hasConflict) {
                return res.status(409).json({ 
                    error: 'Zeitkonflikt! Der Lehrer unterrichtet bereits zur gleichen Zeit in einer anderen Klasse.',
                    conflicts: conflictCheck.conflicts
                });
            }

            // Überprüfung: Lehrer darf dieselbe Stundennummer pro Wochentag nur einmal haben
            if (entryType === 'lesson' || !entryType) {
                const lessonNrConflict = await checkTeacherLessonNumberConflict(teacherId, weekday, lessonNumber, req.user.school_id);
                if (lessonNrConflict.hasConflict) {
                    return res.status(409).json({
                        error: `Stundennummer-Konflikt! Der Lehrer hat am ${weekday} bereits eine ${lessonNumber}. Stunde in einer anderen Klasse.`,
                        conflicts: lessonNrConflict.conflicts
                    });
                }
            }
        }

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
        const { teacherId, subjectId, roomId, startTime, endTime, weekday } = req.body;

        // Zuerst den aktuellen Eintrag abrufen
        const currentEntry = await getOne(
            `SELECT te.id, te.teacher_id, te.weekday, te.lesson_number, te.start_time, te.end_time, te.class_id, te.entry_type
             FROM timetable_entries te
             JOIN classes c ON te.class_id = c.id
             WHERE te.id = $1 AND c.school_id = $2`,
            [req.params.id, req.user.school_id]
        );

        if (!currentEntry) {
            return res.status(404).json({ error: 'Stunde nicht gefunden' });
        }

        // Wenn Lehrer geändert wird, auf Konflikte überprüfen
        if (teacherId && teacherId !== currentEntry.teacher_id) {
            const teacher = await getOne(
                `SELECT id FROM users WHERE id = $1 AND role = 'teacher' AND school_id = $2 AND is_active = true`,
                [teacherId, req.user.school_id]
            );
            if (!teacher) {
                return res.status(400).json({ error: 'Ungültiger Lehrer für diese Schule' });
            }

            // Zeitkonflikt-Check mit dem neuen Lehrer (excludeEntryId verwendet, um den aktuellen Eintrag zu ignorieren)
            const conflictCheck = await checkTeacherTimeConflict(
                teacherId, 
                weekday || currentEntry.weekday, 
                startTime || currentEntry.start_time, 
                endTime || currentEntry.end_time, 
                req.user.school_id,
                req.params.id
            );
            if (conflictCheck.hasConflict) {
                return res.status(409).json({ 
                    error: 'Zeitkonflikt! Der Lehrer unterrichtet bereits zur gleichen Zeit in einer anderen Klasse.',
                    conflicts: conflictCheck.conflicts
                });
            }

            // Stundennummer-Duplikat-Check: Lehrer darf dieselbe Stundennummer pro Wochentag nur einmal haben
            const effectiveEntryType = currentEntry.entry_type;
            if (effectiveEntryType === 'lesson') {
                const effectiveWeekday = weekday || currentEntry.weekday;
                const effectiveLessonNumber = currentEntry.lesson_number;
                const lessonNrConflict = await checkTeacherLessonNumberConflict(
                    teacherId,
                    effectiveWeekday,
                    effectiveLessonNumber,
                    req.user.school_id,
                    req.params.id
                );
                if (lessonNrConflict.hasConflict) {
                    return res.status(409).json({
                        error: `Stundennummer-Konflikt! Der Lehrer hat am ${effectiveWeekday} bereits eine ${effectiveLessonNumber}. Stunde in einer anderen Klasse.`,
                        conflicts: lessonNrConflict.conflicts
                    });
                }
            }
        }

        const result = await query(
            `UPDATE timetable_entries te
             SET teacher_id = $1, subject_id = $2, room_id = $3, start_time = $4, end_time = $5, updated_at = NOW()
             FROM classes c
             WHERE te.id = $6 AND te.class_id = c.id AND c.school_id = $7`,
            [teacherId || null, subjectId || null, roomId || null, startTime, endTime, req.params.id, req.user.school_id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Stunde nicht gefunden' });
        }

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
        const result = await query(
            `DELETE FROM timetable_entries te
             USING classes c
             WHERE te.id = $1 AND te.class_id = c.id AND c.school_id = $2`,
            [req.params.id, req.user.school_id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Stunde nicht gefunden' });
        }
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

        // Safety: ensure original timetable entry belongs to this school
        const original = await getOne(
            `SELECT te.id, te.start_time, te.end_time
             FROM timetable_entries te
             JOIN classes c ON te.class_id = c.id
             WHERE te.id = $1 AND c.school_id = $2`,
            [originalEntryId, req.user.school_id]
        );
        if (!original) {
            return res.status(404).json({ error: 'Original-Stunde nicht gefunden' });
        }

        // Safety: ensure substitute teacher belongs to this school (if provided)
        if (substituteTeacherId) {
            const teacher = await getOne(
                `SELECT id FROM users WHERE id = $1 AND role = 'teacher' AND school_id = $2 AND is_active = true`,
                [substituteTeacherId, req.user.school_id]
            );
            if (!teacher) {
                return res.status(400).json({ error: 'Ungültiger Vertretungslehrer für diese Schule' });
            }

            // Überprüfung: Lehrer kann nicht zur gleichen Zeit in zwei Klassen unterrichten
            const conflictCheck = await checkTeacherDateTimeConflict(
                substituteTeacherId, 
                date, 
                original.start_time, 
                original.end_time, 
                req.user.school_id
            );
            if (conflictCheck.hasConflict) {
                return res.status(409).json({ 
                    error: 'Zeitkonflikt! Der Vertretungslehrer unterrichtet bereits zur gleichen Zeit.',
                    conflicts: conflictCheck.conflicts
                });
            }
        }

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
 * PUT /api/admin/substitution/:id
 * Vertretung aktualisieren
 */
router.put('/substitution/:id', async (req, res) => {
    try {
        const { substituteTeacherId, substituteSubjectId, substituteRoomId, reason, noteForStudents, isCancelled } = req.body;

        // Zuerst die aktuelle Vertretung abrufen
        const currentSubstitution = await getOne(
            `SELECT sub.id, sub.date, sub.substitute_teacher_id, te.start_time, te.end_time
             FROM substitutions sub
             JOIN timetable_entries te ON sub.original_entry_id = te.id
             JOIN classes c ON te.class_id = c.id
             WHERE sub.id = $1 AND c.school_id = $2`,
            [req.params.id, req.user.school_id]
        );

        if (!currentSubstitution) {
            return res.status(404).json({ error: 'Vertretung nicht gefunden' });
        }

        // Wenn Lehrer geändert wird, auf Zeitkonflikte überprüfen
        if (substituteTeacherId && substituteTeacherId !== currentSubstitution.substitute_teacher_id) {
            const teacher = await getOne(
                `SELECT id FROM users WHERE id = $1 AND role = 'teacher' AND school_id = $2 AND is_active = true`,
                [substituteTeacherId, req.user.school_id]
            );
            if (!teacher) {
                return res.status(400).json({ error: 'Ungültiger Vertretungslehrer für diese Schule' });
            }

            // Zeitkonflikt-Check mit dem neuen Lehrer (excludeSubstitutionId verwendet, um die aktuelle Vertretung zu ignorieren)
            const conflictCheck = await checkTeacherDateTimeConflict(
                substituteTeacherId, 
                currentSubstitution.date,
                currentSubstitution.start_time, 
                currentSubstitution.end_time, 
                req.user.school_id,
                req.params.id
            );
            if (conflictCheck.hasConflict) {
                return res.status(409).json({ 
                    error: 'Zeitkonflikt! Der Vertretungslehrer unterrichtet bereits zur gleichen Zeit.',
                    conflicts: conflictCheck.conflicts
                });
            }
        }

        const result = await query(
            `UPDATE substitutions sub
             SET substitute_teacher_id = $1, substitute_subject_id = $2, substitute_room_id = $3,
                 reason = $4, note_for_students = $5, is_cancelled = $6
             FROM timetable_entries te
             JOIN classes c ON te.class_id = c.id
             WHERE sub.id = $7 AND sub.original_entry_id = te.id AND c.school_id = $8`,
            [substituteTeacherId || null, substituteSubjectId || null, substituteRoomId || null,
             reason || null, noteForStudents || null, isCancelled || false, req.params.id, req.user.school_id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Vertretung nicht gefunden' });
        }

        res.json({ success: true, message: 'Vertretung aktualisiert' });
    } catch (error) {
        res.status(500).json({ error: 'Fehler beim Aktualisieren' });
    }
});

/**
 * DELETE /api/admin/substitution/:id
 * Vertretung löschen
 */
router.delete('/substitution/:id', async (req, res) => {
    try {
        const result = await query(
            `DELETE FROM substitutions sub
             USING timetable_entries te, classes c
             WHERE sub.id = $1 AND sub.original_entry_id = te.id AND te.class_id = c.id AND c.school_id = $2`,
            [req.params.id, req.user.school_id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Vertretung nicht gefunden' });
        }
        res.json({ success: true, message: 'Vertretung gelöscht' });
    } catch (error) {
        res.status(500).json({ error: 'Fehler beim Löschen' });
    }
});

/**
 * GET /api/admin/substitutions
 * Vertretungen für einen Zeitraum und optional eine Klasse abrufen
 */
router.get('/substitutions', async (req, res) => {
    try {
        const { classId, startDate, endDate } = req.query;

        let sql = `
            SELECT 
                sub.id, sub.original_entry_id, sub.date, sub.is_cancelled, 
                sub.reason, sub.note_for_students,
                sub.substitute_teacher_id, sub.substitute_subject_id, sub.substitute_room_id,
                te.lesson_number, te.weekday, te.class_id,
                orig_s.name as original_subject,
                sub_s.name as substitute_subject,
                orig_t.first_name || ' ' || orig_t.last_name as original_teacher,
                sub_t.first_name || ' ' || sub_t.last_name as substitute_teacher,
                orig_r.name as original_room,
                sub_r.name as substitute_room,
                c.name as class_name
            FROM substitutions sub
            JOIN timetable_entries te ON sub.original_entry_id = te.id
            JOIN classes c ON te.class_id = c.id
            LEFT JOIN subjects orig_s ON te.subject_id = orig_s.id
            LEFT JOIN subjects sub_s ON sub.substitute_subject_id = sub_s.id
            LEFT JOIN users orig_t ON te.teacher_id = orig_t.id
            LEFT JOIN users sub_t ON sub.substitute_teacher_id = sub_t.id
            LEFT JOIN rooms orig_r ON te.room_id = orig_r.id
            LEFT JOIN rooms sub_r ON sub.substitute_room_id = sub_r.id
            WHERE c.school_id = $1
        `;

        const params = [req.user.school_id];

        if (classId) {
            params.push(classId);
            sql += ` AND te.class_id = $${params.length}`;
        }
        if (startDate) {
            params.push(startDate);
            sql += ` AND sub.date >= $${params.length}`;
        }
        if (endDate) {
            params.push(endDate);
            sql += ` AND sub.date <= $${params.length}`;
        }

        sql += ' ORDER BY sub.date, c.name, te.lesson_number';

        const substitutions = await getMany(sql, params);

        res.json({ substitutions });
    } catch (error) {
        res.status(500).json({ error: 'Fehler beim Laden' });
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
