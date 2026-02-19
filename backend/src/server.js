/**
 * School Plan Kids - Backend Server
 * Haupteinstiegspunkt der Anwendung
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Routes importieren
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const timetableRoutes = require('./routes/timetable');
const newsRoutes = require('./routes/news');
const sickNotesRoutes = require('./routes/sickNotes');
const classesRoutes = require('./routes/classes');
const adminRoutes = require('./routes/admin');
const triggerRoutes = require('./routes/trigger');

const app = express();
const PORT = process.env.PORT || 3001;

// =====================================================
// MIDDLEWARE
// =====================================================

// Security Headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "blob:"],
        },
    },
}));

// CORS für Frontend (Dev + Production)
const allowedOrigins = [
    'https://leo-kunstsk.riccardorohling.com',
    'http://localhost:2080',
    'http://localhost'
];

app.use(cors({
    origin: (origin, callback) => {
        // Erlaube Requests ohne Origin (z.B. Postman, curl, Server-to-Server)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('CORS nicht erlaubt'));
        }
    },
    credentials: true,
}));

// Rate Limiting - Schutz vor Brute-Force
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 Minute
    max: 200, // Max 200 Anfragen pro IP pro Minute
    message: { error: 'Zu viele Anfragen. Bitte warte einen Moment.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// Strengeres Limit für Login
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10, // 10 Login-Versuche
    message: { error: 'Zu viele Login-Versuche. Bitte warte 15 Minuten.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.post('/api/auth/login', loginLimiter);

// Multer Error Handler
const multer = require('multer');
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'Datei zu groß (max. 5MB)' });
        }
        return res.status(400).json({ error: 'Fehler beim Datei-Upload' });
    }
    if (err.message === 'Nur PDF, JPG und PNG erlaubt') {
        return res.status(400).json({ error: err.message });
    }
    next(err);
});

// Body Parser
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined'));
}

// =====================================================
// API ROUTES
// =====================================================

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/sick-notes', sickNotesRoutes);
app.use('/api/classes', classesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/trigger', triggerRoutes);

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'School Plan Kids API'
    });
});

// =====================================================
// ERROR HANDLING
// =====================================================

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route nicht gefunden' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    
    // Multer errors
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'Datei zu groß (max. 5MB)' });
        }
        return res.status(400).json({ error: 'Fehler beim Datei-Upload' });
    }
    if (err.message === 'Nur PDF, JPG und PNG erlaubt') {
        return res.status(400).json({ error: err.message });
    }
    
    // Keine sensiblen Fehlerdetails an Client senden
    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production' 
            ? 'Ein Fehler ist aufgetreten' 
            : err.message,
    });
});

// =====================================================
// SERVER STARTEN
// =====================================================

app.listen(PORT, () => {
    console.log(`🏫 School Plan Kids Backend läuft auf Port ${PORT}`);
    console.log(`📚 Umgebung: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
