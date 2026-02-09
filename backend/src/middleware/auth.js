/**
 * JWT Authentifizierungs-Middleware
 * Schützt Routen und verifiziert Benutzer
 */

const jwt = require('jsonwebtoken');
const { getOne } = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key';

/**
 * Generiert einen JWT Token
 */
const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role,
            schoolId: user.school_id,
        },
        JWT_SECRET,
        { expiresIn: '8h' } // Token läuft nach 8 Stunden ab (Schultag)
    );
};

/**
 * Verifiziert den JWT Token aus dem Cookie oder Header
 */
const authenticate = async (req, res, next) => {
    try {
        // Token aus Cookie oder Authorization Header
        let token = req.cookies?.authToken;
        
        if (!token && req.headers.authorization) {
            const parts = req.headers.authorization.split(' ');
            if (parts.length === 2 && parts[0] === 'Bearer') {
                token = parts[1];
            }
        }

        if (!token) {
            return res.status(401).json({ error: 'Nicht angemeldet' });
        }

        // Token verifizieren
        const decoded = jwt.verify(token, JWT_SECRET);

        // Benutzer aus DB laden (für aktuelle Daten)
        const user = await getOne(
            'SELECT id, email, first_name, last_name, role, school_id, avatar_emoji, is_active FROM users WHERE id = $1',
            [decoded.id]
        );

        if (!user || !user.is_active) {
            return res.status(401).json({ error: 'Benutzer nicht gefunden oder deaktiviert' });
        }

        // Benutzer an Request anhängen
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Sitzung abgelaufen. Bitte erneut anmelden.' });
        }
        return res.status(401).json({ error: 'Ungültiger Token' });
    }
};

/**
 * Prüft ob Benutzer eine bestimmte Rolle hat
 */
const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Nicht angemeldet' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Keine Berechtigung für diese Aktion' });
        }

        next();
    };
};

/**
 * Prüft ob Benutzer Admin ist
 */
const requireAdmin = requireRole('admin');

/**
 * Prüft ob Benutzer Lehrer oder Admin ist
 */
const requireTeacherOrAdmin = requireRole('teacher', 'admin');

/**
 * Prüft ob Benutzer Elternteil ist
 */
const requireParent = requireRole('parent');

/**
 * Prüft ob Benutzer Schüler ist
 */
const requireStudent = requireRole('student');

module.exports = {
    generateToken,
    authenticate,
    requireRole,
    requireAdmin,
    requireTeacherOrAdmin,
    requireParent,
    requireStudent,
};
