/**
 * School Plan Kids - Trigger Route
 *
 * Standardmäßig ist die Website GESPERRT (schwarzer Bildschirm).
 * POST /api/trigger/activate  → Startet den 10s-Entsperr-Countdown
 * GET  /api/trigger/status    → Gibt den aktuellen Status zurück (öffentlich)
 */

const express = require('express');
const router = express.Router();

// -------------------------------------------------------
// State:
 //   locked: true  → schwarzer Bildschirm
//   locked: false → Website sichtbar
//   countdownStartedAt: Timestamp wenn Countdown läuft, sonst null
// -------------------------------------------------------
let triggerState = {
    locked: true,              // Standardmäßig gesperrt
    countdownStartedAt: null,  // null = Countdown noch nicht gestartet
};

const COUNTDOWN_DURATION_MS = 10 * 1000; // 10 Sekunden

// -------------------------------------------------------
// GET /api/trigger/status
// -------------------------------------------------------
router.get('/status', (req, res) => {
    const now = Date.now();

    // Countdown abgelaufen → dauerhaft entsperren
    if (triggerState.locked && triggerState.countdownStartedAt) {
        const elapsed = now - triggerState.countdownStartedAt;
        if (elapsed >= COUNTDOWN_DURATION_MS) {
            triggerState.locked = false;
            triggerState.countdownStartedAt = null;
        }
    }

    const remainingMs = (triggerState.locked && triggerState.countdownStartedAt)
        ? Math.max(0, COUNTDOWN_DURATION_MS - (now - triggerState.countdownStartedAt))
        : null;

    res.json({
        locked: triggerState.locked,
        countdownStartedAt: triggerState.countdownStartedAt,
        remainingMs, // null = kein Countdown aktiv, Zahl = Countdown läuft
    });
});

// -------------------------------------------------------
// POST /api/trigger/activate
// -------------------------------------------------------
router.post('/activate', (req, res) => {
    const secret = req.body?.secret || req.headers['x-trigger-secret'];
    const expectedSecret = process.env.TRIGGER_SECRET || 'trigger_secret_change_me';

    if (secret !== expectedSecret) {
        return res.status(401).json({ error: 'Ungültiges Trigger-Secret.' });
    }

    if (!triggerState.locked) {
        return res.json({ success: false, message: 'Website ist bereits freigegeben.' });
    }

    if (triggerState.countdownStartedAt) {
        return res.json({ success: false, message: 'Countdown läuft bereits.' });
    }

    triggerState.countdownStartedAt = Date.now();
    console.log(`[Trigger] Entsperr-Countdown gestartet um ${new Date().toISOString()}`);

    res.json({
        success: true,
        countdownStartedAt: triggerState.countdownStartedAt,
        message: `Website wird in ${COUNTDOWN_DURATION_MS / 1000}s freigegeben.`,
    });
});

// -------------------------------------------------------
// POST /api/trigger/reset
// Setzt den Zustand auf "gesperrt" zurück (schwarzer Bildschirm)
// -------------------------------------------------------
router.post('/reset', (req, res) => {
    const secret = req.body?.secret || req.headers['x-trigger-secret'];
    const expectedSecret = process.env.TRIGGER_SECRET || 'trigger_secret_change_me';

    if (secret !== expectedSecret) {
        return res.status(401).json({ error: 'Ungültiges Trigger-Secret.' });
    }

    triggerState.locked = true;
    triggerState.countdownStartedAt = null;

    console.log(`[Trigger] Reset auf gesperrt um ${new Date().toISOString()}`);

    res.json({ success: true, message: 'Schwarzer Bildschirm wieder aktiv.' });
});

module.exports = router;
