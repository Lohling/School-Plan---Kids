/**
 * Klassen-Routen
 * Klassenverwaltung und -informationen
 */

const express = require('express');
const router = express.Router();
const { getMany, getOne, query } = require('../config/database');
const { authenticate, requireAdmin, requireTeacherOrAdmin } = require('../middleware/auth');

/**
 * GET /api/classes
 * Alle Klassen der Schule
 */
router.get('/', authenticate, async (req, res) => {
    try {
        const classes = await getMany(
            `SELECT c.*, 
                    u.first_name || ' ' || u.last_name as class_teacher_name,
                    COUNT(sc.student_id) as student_count
             FROM classes c
             LEFT JOIN users u ON c.class_teacher_id = u.id
             LEFT JOIN student_classes sc ON c.id = sc.class_id
             WHERE c.school_id = $1
             GROUP BY c.id, u.first_name, u.last_name
             ORDER BY c.grade_level, c.name`,
            [req.user.school_id]
        );

        res.json({ classes });
    } catch (error) {
        res.status(500).json({ error: 'Fehler beim Laden der Klassen' });
    }
});

/**
 * GET /api/classes/:id
 * Einzelne Klasse mit Details
 */
router.get('/:id', authenticate, async (req, res) => {
    try {
        const classInfo = await getOne(
            `SELECT c.*, u.first_name || ' ' || u.last_name as class_teacher_name
             FROM classes c
             LEFT JOIN users u ON c.class_teacher_id = u.id
             WHERE c.id = $1`,
            [req.params.id]
        );

        if (!classInfo) {
            return res.status(404).json({ error: 'Klasse nicht gefunden' });
        }

        // Schüler der Klasse
        const students = await getMany(
            `SELECT u.id, u.first_name, u.last_name, u.avatar_emoji
             FROM student_classes sc
             JOIN users u ON sc.student_id = u.id
             WHERE sc.class_id = $1 AND u.is_active = true
             ORDER BY u.last_name, u.first_name`,
            [req.params.id]
        );

        // Lehrer die diese Klasse unterrichten
        const teachers = await getMany(
            `SELECT DISTINCT u.id, u.first_name, u.last_name, tc.subject
             FROM teacher_classes tc
             JOIN users u ON tc.teacher_id = u.id
             WHERE tc.class_id = $1
             ORDER BY u.last_name`,
            [req.params.id]
        );

        res.json({ 
            class: classInfo,
            students,
            teachers
        });
    } catch (error) {
        res.status(500).json({ error: 'Fehler beim Laden' });
    }
});

/**
 * GET /api/classes/my
 * Klassen des aktuellen Benutzers
 */
router.get('/user/my', authenticate, async (req, res) => {
    try {
        const { role, id: userId } = req.user;
        let classes = [];

        if (role === 'student') {
            classes = await getMany(
                `SELECT c.* FROM student_classes sc
                 JOIN classes c ON sc.class_id = c.id
                 WHERE sc.student_id = $1`,
                [userId]
            );
        } else if (role === 'parent') {
            classes = await getMany(
                `SELECT DISTINCT c.*, u.first_name || ' ' || u.last_name as child_name
                 FROM parent_students ps
                 JOIN student_classes sc ON ps.student_id = sc.student_id
                 JOIN classes c ON sc.class_id = c.id
                 JOIN users u ON ps.student_id = u.id
                 WHERE ps.parent_id = $1`,
                [userId]
            );
        } else if (role === 'teacher') {
            classes = await getMany(
                `SELECT DISTINCT c.*, tc.subject
                 FROM teacher_classes tc
                 JOIN classes c ON tc.class_id = c.id
                 WHERE tc.teacher_id = $1
                 ORDER BY c.grade_level, c.name`,
                [userId]
            );
        } else if (role === 'admin') {
            // Admin sieht alle Klassen
            classes = await getMany(
                `SELECT c.* FROM classes c WHERE c.school_id = $1 ORDER BY c.grade_level, c.name`,
                [req.user.school_id]
            );
        }

        res.json({ classes });
    } catch (error) {
        res.status(500).json({ error: 'Fehler beim Laden' });
    }
});

/**
 * POST /api/classes
 * Neue Klasse erstellen (Admin)
 */
router.post('/', authenticate, requireAdmin, async (req, res) => {
    try {
        const { name, gradeLevel, schoolYear, classTeacherId } = req.body;

        const result = await query(
            `INSERT INTO classes (school_id, name, grade_level, school_year, class_teacher_id)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id`,
            [req.user.school_id, name, gradeLevel, schoolYear, classTeacherId || null]
        );

        res.status(201).json({ 
            success: true, 
            message: 'Klasse erstellt',
            classId: result.rows[0].id
        });
    } catch (error) {
        res.status(500).json({ error: 'Fehler beim Erstellen' });
    }
});

/**
 * PUT /api/classes/:id
 * Klasse aktualisieren (Admin)
 */
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
    try {
        const { name, gradeLevel, classTeacherId } = req.body;

        await query(
            `UPDATE classes SET name = $1, grade_level = $2, class_teacher_id = $3
             WHERE id = $4`,
            [name, gradeLevel, classTeacherId || null, req.params.id]
        );

        res.json({ success: true, message: 'Klasse aktualisiert' });
    } catch (error) {
        res.status(500).json({ error: 'Fehler beim Aktualisieren' });
    }
});

/**
 * POST /api/classes/:id/students
 * Schüler zur Klasse hinzufügen
 */
router.post('/:id/students', authenticate, requireAdmin, async (req, res) => {
    try {
        const { studentId, schoolYear } = req.body;

        await query(
            `INSERT INTO student_classes (student_id, class_id, school_year)
             VALUES ($1, $2, $3)
             ON CONFLICT (student_id, class_id, school_year) DO NOTHING`,
            [studentId, req.params.id, schoolYear]
        );

        res.json({ success: true, message: 'Schüler hinzugefügt' });
    } catch (error) {
        res.status(500).json({ error: 'Fehler beim Hinzufügen' });
    }
});

module.exports = router;
