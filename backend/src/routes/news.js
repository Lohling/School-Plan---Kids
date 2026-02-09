/**
 * Neuigkeiten und Ankündigungen
 * News, Termine, Elternabende
 */

const express = require('express');
const router = express.Router();
const { getMany, getOne, query } = require('../config/database');
const { authenticate, requireTeacherOrAdmin } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

/**
 * GET /api/news
 * Neuigkeiten abrufen (gefiltert nach Benutzerrolle)
 */
router.get('/', authenticate, async (req, res) => {
    try {
        const { role, school_id, id: userId } = req.user;
        const { classId, limit = 20 } = req.query;

        let sql = `
            SELECT n.*, 
                   u.first_name || ' ' || u.last_name as author_name,
                   c.name as class_name
            FROM news n
            LEFT JOIN users u ON n.created_by = u.id
            LEFT JOIN classes c ON n.class_id = c.id
            WHERE n.school_id = $1
              AND (n.expires_at IS NULL OR n.expires_at > NOW())
              AND n.published_at <= NOW()
        `;

        const params = [school_id];

        // Filter nach Zielgruppe basierend auf Rolle
        if (role === 'student') {
            sql += ` AND (n.audience = 'all' OR n.audience = 'students'`;
            
            // Klassen-spezifische News für Schüler
            const studentClass = await getOne(
                'SELECT class_id FROM student_classes WHERE student_id = $1',
                [userId]
            );
            
            if (studentClass) {
                sql += ` OR (n.audience = 'class' AND n.class_id = $${params.length + 1})`;
                params.push(studentClass.class_id);
            }
            sql += ')';
        } else if (role === 'parent') {
            sql += ` AND (n.audience = 'all' OR n.audience = 'parents'`;
            
            // News der Klassen der Kinder
            const childClasses = await getMany(
                `SELECT DISTINCT sc.class_id 
                 FROM parent_students ps
                 JOIN student_classes sc ON ps.student_id = sc.student_id
                 WHERE ps.parent_id = $1`,
                [userId]
            );
            
            if (childClasses.length > 0) {
                const classIds = childClasses.map(c => c.class_id);
                sql += ` OR (n.audience = 'class' AND n.class_id = ANY($${params.length + 1}::uuid[]))`;
                params.push(classIds);
            }
            sql += ')';
        } else if (role === 'teacher') {
            sql += ` AND (n.audience = 'all' OR n.audience = 'teachers'`;
            
            // Klassen-spezifische News für Lehrer ihrer Klassen
            if (classId) {
                sql += ` OR (n.audience = 'class' AND n.class_id = $${params.length + 1})`;
                params.push(classId);
            }
            sql += ')';
        }
        // Admin sieht alle

        sql += ` ORDER BY n.is_pinned DESC, n.priority DESC, n.published_at DESC LIMIT $${params.length + 1}`;
        params.push(parseInt(limit));

        const news = await getMany(sql, params);

        res.json({ news });
    } catch (error) {
        console.error('News Error:', error);
        res.status(500).json({ error: 'Fehler beim Laden der Neuigkeiten' });
    }
});

/**
 * POST /api/news
 * Neue Nachricht erstellen (Lehrer/Admin)
 */
router.post('/', authenticate, requireTeacherOrAdmin, [
    body('title').notEmpty().trim().escape(),
    body('content').notEmpty().trim(),
    body('audience').isIn(['all', 'students', 'parents', 'teachers', 'class']),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, content, audience, classId, priority, isPinned, eventDate, eventTime, eventLocation, expiresAt } = req.body;

        const result = await query(
            `INSERT INTO news (school_id, class_id, title, content, audience, priority, is_pinned, 
                               event_date, event_time, event_location, expires_at, created_by)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
             RETURNING id`,
            [
                req.user.school_id,
                classId || null,
                title,
                content,
                audience,
                priority || 'normal',
                isPinned || false,
                eventDate || null,
                eventTime || null,
                eventLocation || null,
                expiresAt || null,
                req.user.id
            ]
        );

        res.status(201).json({ 
            success: true, 
            message: 'Nachricht veröffentlicht',
            newsId: result.rows[0].id 
        });
    } catch (error) {
        console.error('Create News Error:', error);
        res.status(500).json({ error: 'Fehler beim Erstellen' });
    }
});

/**
 * GET /api/news/events
 * Kommende Termine/Veranstaltungen
 */
router.get('/events', authenticate, async (req, res) => {
    try {
        const { role, school_id, id: userId } = req.user;

        let sql = `
            SELECT e.*, u.first_name || ' ' || u.last_name as created_by_name,
                   c.name as class_name
            FROM events e
            LEFT JOIN users u ON e.created_by = u.id
            LEFT JOIN classes c ON e.class_id = c.id
            WHERE e.school_id = $1
              AND e.event_date >= CURRENT_DATE
        `;

        const params = [school_id];

        // Filter nach Zielgruppe
        if (role === 'parent') {
            sql += ` AND (e.audience = 'all' OR e.audience = 'parents'`;
            
            const childClasses = await getMany(
                `SELECT DISTINCT sc.class_id FROM parent_students ps
                 JOIN student_classes sc ON ps.student_id = sc.student_id
                 WHERE ps.parent_id = $1`,
                [userId]
            );
            
            if (childClasses.length > 0) {
                sql += ` OR e.class_id = ANY($${params.length + 1}::uuid[])`;
                params.push(childClasses.map(c => c.class_id));
            }
            sql += ')';
        }

        sql += ' ORDER BY e.event_date, e.start_time LIMIT 50';

        const events = await getMany(sql, params);

        res.json({ events });
    } catch (error) {
        res.status(500).json({ error: 'Fehler beim Laden' });
    }
});

/**
 * POST /api/news/events
 * Termin erstellen (Lehrer/Admin)
 */
router.post('/events', authenticate, requireTeacherOrAdmin, [
    body('title').notEmpty().trim(),
    body('eventDate').isDate(),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, description, eventDate, startTime, endTime, location, classId, audience, isMandatory } = req.body;

        await query(
            `INSERT INTO events (school_id, class_id, title, description, event_date, start_time, end_time, 
                                 location, audience, is_mandatory, created_by)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
            [
                req.user.school_id,
                classId || null,
                title,
                description || null,
                eventDate,
                startTime || null,
                endTime || null,
                location || null,
                audience || 'parents',
                isMandatory || false,
                req.user.id
            ]
        );

        res.status(201).json({ success: true, message: 'Termin erstellt' });
    } catch (error) {
        res.status(500).json({ error: 'Fehler beim Erstellen' });
    }
});

/**
 * DELETE /api/news/:id
 * Nachricht löschen
 */
router.delete('/:id', authenticate, requireTeacherOrAdmin, async (req, res) => {
    try {
        const news = await getOne('SELECT created_by FROM news WHERE id = $1', [req.params.id]);

        if (!news) {
            return res.status(404).json({ error: 'Nachricht nicht gefunden' });
        }

        // Nur Ersteller oder Admin darf löschen
        if (req.user.role !== 'admin' && news.created_by !== req.user.id) {
            return res.status(403).json({ error: 'Keine Berechtigung' });
        }

        await query('DELETE FROM news WHERE id = $1', [req.params.id]);

        res.json({ success: true, message: 'Nachricht gelöscht' });
    } catch (error) {
        res.status(500).json({ error: 'Fehler beim Löschen' });
    }
});

module.exports = router;
