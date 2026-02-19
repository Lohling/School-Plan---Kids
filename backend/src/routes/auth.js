/**
 * Authentifizierungs-Routen
 * Login, Logout, Session-Check
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const { getOne, query } = require('../config/database');
const { generateToken, authenticate } = require('../middleware/auth');

/**
 * POST /api/auth/login
 * Benutzer-Anmeldung
 */
router.post('/login', [
    body('email').isEmail().normalizeEmail().withMessage('Gültige E-Mail erforderlich'),
    body('password').notEmpty().withMessage('Passwort erforderlich'),
], async (req, res) => {
    try {
        // Validierung prüfen
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        // Benutzer suchen
        const user = await getOne(
            `SELECT u.*, s.name as school_name 
             FROM users u 
             JOIN schools s ON u.school_id = s.id 
             WHERE u.email = $1 AND u.is_active = true`,
            [email]
        );

        if (!user) {
            // Generische Fehlermeldung (Sicherheit)
            return res.status(401).json({ error: 'E-Mail oder Passwort falsch' });
        }

        // Passwort prüfen
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'E-Mail oder Passwort falsch' });
        }

        // JWT Token erstellen
        const token = generateToken(user);

        // Audit Log
        await query(
            'INSERT INTO audit_log (user_id, action, ip_address) VALUES ($1, $2, $3)',
            [user.id, 'login', req.ip]
        );

        // Token als HttpOnly Cookie setzen (sicherer als localStorage)
        res.cookie('authToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 8 * 60 * 60 * 1000, // 8 Stunden
        });

        // Antwort ohne sensible Daten
        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                role: user.role,
                avatar: user.avatar_emoji,
                schoolName: user.school_name,
            },
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Anmeldung fehlgeschlagen' });
    }
});

/**
 * POST /api/auth/logout
 * Benutzer abmelden
 */
router.post('/logout', authenticate, async (req, res) => {
    try {
        // Audit Log
        await query(
            'INSERT INTO audit_log (user_id, action) VALUES ($1, $2)',
            [req.user.id, 'logout']
        );

        // Cookie löschen
        res.clearCookie('authToken');
        res.json({ success: true, message: 'Erfolgreich abgemeldet' });
    } catch (error) {
        res.status(500).json({ error: 'Abmeldung fehlgeschlagen' });
    }
});

/**
 * GET /api/auth/me
 * Aktuelle Session prüfen
 */
router.get('/me', authenticate, async (req, res) => {
    try {
        const user = await getOne(
            `SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.avatar_emoji, s.name as school_name
             FROM users u
             JOIN schools s ON u.school_id = s.id
             WHERE u.id = $1`,
            [req.user.id]
        );

        if (!user) {
            return res.status(404).json({ error: 'Benutzer nicht gefunden' });
        }

        res.json({
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                role: user.role,
                avatar: user.avatar_emoji,
                schoolName: user.school_name,
            },
        });
    } catch (error) {
        res.status(500).json({ error: 'Fehler beim Laden der Benutzerdaten' });
    }
});

/**
 * POST /api/auth/change-password
 * Passwort ändern
 */
router.post('/change-password', authenticate, [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 8 }).withMessage('Mindestens 8 Zeichen'),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { currentPassword, newPassword } = req.body;

        // Aktuelles Passwort prüfen
        const user = await getOne('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
        const valid = await bcrypt.compare(currentPassword, user.password_hash);

        if (!valid) {
            return res.status(400).json({ error: 'Aktuelles Passwort falsch' });
        }

        // Neues Passwort hashen und speichern
        const newHash = await bcrypt.hash(newPassword, 10);
        await query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [newHash, req.user.id]);

        // Audit Log
        await query(
            'INSERT INTO audit_log (user_id, action) VALUES ($1, $2)',
            [req.user.id, 'password_changed']
        );

        res.json({ success: true, message: 'Passwort erfolgreich geändert' });
    } catch (error) {
        res.status(500).json({ error: 'Passwortänderung fehlgeschlagen' });
    }
});

/**
 * GET /api/auth/random-user/:role
 * Gibt einen zufälligen Benutzer einer bestimmten Rolle zurück
 * Nur für Demo/Test-Zwecke
 */
router.get('/random-user/:role', async (req, res) => {
    try {
        const { role } = req.params;
        const validRoles = ['student', 'parent', 'teacher'];

        if (!validRoles.includes(role)) {
            return res.status(400).json({ error: 'Ungültige Rolle' });
        }

        // Zufälligen Benutzer der Rolle holen
        const randomUser = await getOne(
            `SELECT email, first_name, last_name, role, avatar_emoji
             FROM users 
             WHERE role = $1 AND is_active = true
             ORDER BY RANDOM() 
             LIMIT 1`,
            [role]
        );

        if (!randomUser) {
            return res.status(404).json({ error: 'Keine Benutzer dieser Rolle gefunden' });
        }

        res.json({
            success: true,
            user: {
                email: randomUser.email,
                firstName: randomUser.first_name,
                lastName: randomUser.last_name,
                role: randomUser.role,
                avatar: randomUser.avatar_emoji,
            },
        });
    } catch (error) {
        console.error('Random user Error:', error);
        res.status(500).json({ error: 'Fehler beim Abrufen des zufälligen Benutzers' });
    }
});

module.exports = router;
