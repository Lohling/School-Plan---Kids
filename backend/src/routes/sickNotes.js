/**
 * Krankmeldungen
 * Für Schüler (durch Eltern) und Lehrer (selbst)
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { getMany, getOne, query } = require('../config/database');
const { authenticate, requireAdmin, requireTeacherOrAdmin } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// File Upload Konfiguration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Sichere Dateinamen generieren
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    },
});

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // Max 5MB
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Nur PDF, JPG und PNG erlaubt'));
        }
    },
});

/**
 * GET /api/sick-notes
 * Eigene Krankmeldungen abrufen
 */
router.get('/', authenticate, async (req, res) => {
    try {
        const { role, id: userId } = req.user;
        let sickNotes = [];

        if (role === 'parent') {
            // Eltern: Krankmeldungen ihrer Kinder
            sickNotes = await getMany(
                `SELECT sn.*, u.first_name || ' ' || u.last_name as child_name
                 FROM sick_notes sn
                 JOIN users u ON sn.student_id = u.id
                 WHERE sn.submitted_by = $1
                 ORDER BY sn.created_at DESC`,
                [userId]
            );
        } else if (role === 'teacher') {
            // Lehrer: Eigene Krankmeldungen
            sickNotes = await getMany(
                `SELECT * FROM sick_notes WHERE teacher_id = $1 ORDER BY created_at DESC`,
                [userId]
            );
        }

        res.json({ sickNotes });
    } catch (error) {
        res.status(500).json({ error: 'Fehler beim Laden' });
    }
});

/**
 * POST /api/sick-notes/student
 * Krankmeldung für Kind einreichen (Eltern)
 */
router.post('/student', authenticate, upload.single('attestation'), [
    body('studentId').isUUID(),
    body('startDate').isDate(),
    body('endDate').isDate(),
], async (req, res) => {
    try {
        if (req.user.role !== 'parent') {
            return res.status(403).json({ error: 'Nur für Eltern' });
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { studentId, startDate, endDate, reason } = req.body;

        // Prüfen ob das Kind dem Elternteil zugeordnet ist
        const relation = await getOne(
            'SELECT id FROM parent_students WHERE parent_id = $1 AND student_id = $2',
            [req.user.id, studentId]
        );

        if (!relation) {
            return res.status(403).json({ error: 'Dieses Kind ist Ihnen nicht zugeordnet' });
        }

        // Datei-Pfad (falls hochgeladen)
        const attachmentPath = req.file ? req.file.filename : null;

        await query(
            `INSERT INTO sick_notes (student_id, submitted_by, start_date, end_date, reason, attachment_path)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [studentId, req.user.id, startDate, endDate, reason || null, attachmentPath]
        );

        // Audit Log
        await query(
            'INSERT INTO audit_log (user_id, action, entity_type, entity_id) VALUES ($1, $2, $3, $4)',
            [req.user.id, 'sick_note_submitted', 'student', studentId]
        );

        res.status(201).json({ success: true, message: 'Krankmeldung eingereicht' });
    } catch (error) {
        console.error('Sick Note Error:', error);
        res.status(500).json({ error: 'Fehler beim Einreichen' });
    }
});

/**
 * POST /api/sick-notes/teacher
 * Lehrer meldet sich selbst krank
 */
router.post('/teacher', authenticate, upload.single('attestation'), [
    body('startDate').isDate(),
    body('endDate').isDate(),
], async (req, res) => {
    try {
        if (req.user.role !== 'teacher') {
            return res.status(403).json({ error: 'Nur für Lehrer' });
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { startDate, endDate, reason } = req.body;
        const attachmentPath = req.file ? req.file.filename : null;

        await query(
            `INSERT INTO sick_notes (teacher_id, submitted_by, start_date, end_date, reason, attachment_path)
             VALUES ($1, $1, $2, $3, $4, $5)`,
            [req.user.id, startDate, endDate, reason || null, attachmentPath]
        );

        res.status(201).json({ success: true, message: 'Krankmeldung eingereicht' });
    } catch (error) {
        res.status(500).json({ error: 'Fehler beim Einreichen' });
    }
});

/**
 * GET /api/sick-notes/admin
 * Alle Krankmeldungen für Admin
 */
router.get('/admin', authenticate, requireAdmin, async (req, res) => {
    try {
        const { status, type } = req.query;

        let sql = `
            SELECT sn.*,
                   COALESCE(student.first_name || ' ' || student.last_name, teacher.first_name || ' ' || teacher.last_name) as person_name,
                   CASE WHEN sn.student_id IS NOT NULL THEN 'student' ELSE 'teacher' END as person_type,
                   submitter.first_name || ' ' || submitter.last_name as submitted_by_name,
                   reviewer.first_name || ' ' || reviewer.last_name as reviewed_by_name
            FROM sick_notes sn
            LEFT JOIN users student ON sn.student_id = student.id
            LEFT JOIN users teacher ON sn.teacher_id = teacher.id
            LEFT JOIN users submitter ON sn.submitted_by = submitter.id
            LEFT JOIN users reviewer ON sn.reviewed_by = reviewer.id
            WHERE 1=1
        `;

        const params = [];

        if (status) {
            params.push(status);
            sql += ` AND sn.status = $${params.length}`;
        }

        if (type === 'student') {
            sql += ' AND sn.student_id IS NOT NULL';
        } else if (type === 'teacher') {
            sql += ' AND sn.teacher_id IS NOT NULL';
        }

        sql += ' ORDER BY sn.created_at DESC';

        const sickNotes = await getMany(sql, params);

        res.json({ sickNotes });
    } catch (error) {
        res.status(500).json({ error: 'Fehler beim Laden' });
    }
});

/**
 * PUT /api/sick-notes/:id/review
 * Krankmeldung bestätigen/ablehnen (Admin)
 */
router.put('/:id/review', authenticate, requireAdmin, [
    body('status').isIn(['approved', 'rejected']),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { status, adminNote } = req.body;

        await query(
            `UPDATE sick_notes 
             SET status = $1, reviewed_by = $2, reviewed_at = NOW(), admin_note = $3
             WHERE id = $4`,
            [status, req.user.id, adminNote || null, req.params.id]
        );

        res.json({ success: true, message: `Krankmeldung ${status === 'approved' ? 'bestätigt' : 'abgelehnt'}` });
    } catch (error) {
        res.status(500).json({ error: 'Fehler beim Aktualisieren' });
    }
});

/**
 * GET /api/sick-notes/class/:classId
 * Krankmeldungen einer Klasse (für Lehrer)
 */
router.get('/class/:classId', authenticate, requireTeacherOrAdmin, async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        const sickNotes = await getMany(
            `SELECT sn.start_date, sn.end_date, sn.status,
                    u.first_name, u.last_name, u.avatar_emoji
             FROM sick_notes sn
             JOIN users u ON sn.student_id = u.id
             JOIN student_classes sc ON u.id = sc.student_id
             WHERE sc.class_id = $1
               AND sn.start_date <= $2
               AND sn.end_date >= $2
               AND sn.status = 'approved'`,
            [req.params.classId, today]
        );

        res.json({ sickNotes });
    } catch (error) {
        res.status(500).json({ error: 'Fehler beim Laden' });
    }
});

module.exports = router;
