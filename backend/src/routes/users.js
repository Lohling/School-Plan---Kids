/**
 * Benutzer-Routen
 * Profil, Einstellungen, etc.
 */

const express = require('express');
const router = express.Router();
const { getOne, getMany, query } = require('../config/database');
const { authenticate, requireAdmin, requireTeacherOrAdmin } = require('../middleware/auth');

/**
 * GET /api/users/profile
 * Eigenes Profil abrufen
 */
router.get('/profile', authenticate, async (req, res) => {
    try {
        const user = await getOne(
            `SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.avatar_emoji, u.created_at,
                    s.name as school_name
             FROM users u
             JOIN schools s ON u.school_id = s.id
             WHERE u.id = $1`,
            [req.user.id]
        );

        res.json({ user });
    } catch (error) {
        res.status(500).json({ error: 'Fehler beim Laden des Profils' });
    }
});

/**
 * PUT /api/users/profile
 * Profil aktualisieren
 */
router.put('/profile', authenticate, async (req, res) => {
    try {
        const { firstName, lastName, avatarEmoji } = req.body;

        // Nur erlaubte Emojis für Kinder
        const allowedEmojis = ['😊', '😄', '🌟', '🦊', '🐰', '🦁', '🐶', '🐱', '🦄', '🌈', '⭐', '🎨', '📚', '⚽', '🎵'];
        const safeEmoji = allowedEmojis.includes(avatarEmoji) ? avatarEmoji : '😊';

        // Nur Admins dürfen den Namen ändern
        if (req.user.role === 'admin') {
            await query(
                `UPDATE users SET first_name = $1, last_name = $2, avatar_emoji = $3, updated_at = NOW() 
                 WHERE id = $4`,
                [firstName, lastName, safeEmoji, req.user.id]
            );
        } else {
            await query(
                `UPDATE users SET avatar_emoji = $1, updated_at = NOW() 
                 WHERE id = $2`,
                [safeEmoji, req.user.id]
            );
        }

        res.json({ success: true, message: 'Profil aktualisiert' });
    } catch (error) {
        res.status(500).json({ error: 'Fehler beim Aktualisieren' });
    }
});

/**
 * GET /api/users/children
 * Kinder eines Elternteils abrufen
 */
router.get('/children', authenticate, async (req, res) => {
    try {
        if (req.user.role !== 'parent') {
            return res.status(403).json({ error: 'Nur für Eltern' });
        }

        const children = await getMany(
            `SELECT u.id, u.first_name, u.last_name, u.avatar_emoji,
                    c.id as class_id, c.name as class_name, c.grade_level
             FROM parent_students ps
             JOIN users u ON ps.student_id = u.id
             LEFT JOIN student_classes sc ON u.id = sc.student_id
             LEFT JOIN classes c ON sc.class_id = c.id
             WHERE ps.parent_id = $1`,
            [req.user.id]
        );

        res.json({ children });
    } catch (error) {
        res.status(500).json({ error: 'Fehler beim Laden der Kinder' });
    }
});

/**
 * GET /api/users/teachers
 * Alle Lehrer der Schule (für Admin/Lehrer)
 */
router.get('/teachers', authenticate, requireTeacherOrAdmin, async (req, res) => {
    try {
        const teachers = await getMany(
            `SELECT id, first_name, last_name, email, avatar_emoji 
             FROM users 
             WHERE school_id = $1 AND role = 'teacher' AND is_active = true
             ORDER BY last_name, first_name`,
            [req.user.school_id]
        );

        res.json({ teachers });
    } catch (error) {
        res.status(500).json({ error: 'Fehler beim Laden der Lehrer' });
    }
});

/**
 * GET /api/users/students
 * Alle Schüler einer Klasse (für Lehrer)
 */
router.get('/students/:classId', authenticate, requireTeacherOrAdmin, async (req, res) => {
    try {
        const students = await getMany(
            `SELECT u.id, u.first_name, u.last_name, u.avatar_emoji
             FROM student_classes sc
             JOIN users u ON sc.student_id = u.id
             WHERE sc.class_id = $1 AND u.is_active = true
             ORDER BY u.last_name, u.first_name`,
            [req.params.classId]
        );

        res.json({ students });
    } catch (error) {
        res.status(500).json({ error: 'Fehler beim Laden der Schüler' });
    }
});

module.exports = router;
