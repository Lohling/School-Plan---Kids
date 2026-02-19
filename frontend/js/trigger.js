/**
 * School Plan Kids - Lehrer-Trigger
 *
 * Standardverhalten:
 *   - Overlay ist beim Öffnen der Website SOFORT sichtbar (gesperrt).
 *   - Sobald der Lehrer die Leertaste drückt, startet ein 10s-Countdown.
 *   - Nach dem Countdown wird die Website dauerhaft freigegeben.
 */

const Trigger = (() => {
    const POLL_INTERVAL_MS = 1000;

    let pollTimer      = null;
    let barTimer       = null;
    let countdownActive = false; // Wird true, sobald der Countdown einmalig gestartet wurde

    const overlay = document.getElementById('trigger-overlay');
    const bar     = document.getElementById('trigger-overlay-bar');

    // --------------------------------------------------
    // Overlay sofort beim Laden anzeigen (statisch, kein Balken)
    // --------------------------------------------------
    function showOverlayStatic() {
        bar.style.transition = 'none';
        bar.style.width = '0%'; // Balken versteckt bis Countdown startet
        overlay.classList.remove('trigger-overlay--hidden');
        overlay.classList.add('trigger-overlay--visible');
    }

    // --------------------------------------------------
    // Countdown-Balken starten (einmalig)
    // --------------------------------------------------
    function startCountdown(remainingMs) {
        if (countdownActive) return;
        countdownActive = true;

        // Balken erscheint und läuft in remainingMs bis auf 0%
        bar.style.transition = 'none';
        bar.style.width = '100%';

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                bar.style.transition = `width ${remainingMs}ms linear`;
                bar.style.width = '0%';
            });
        });
    }

    // --------------------------------------------------
    // Overlay ausblenden (dauerhaft – aber Polling läuft weiter für Reset)
    // --------------------------------------------------
    function hideOverlay() {
        clearTimeout(barTimer);
        overlay.classList.remove('trigger-overlay--visible');
        overlay.classList.add('trigger-overlay--hidden');
        countdownActive = false;
    }

    // --------------------------------------------------
    // Backend-Status abfragen
    // --------------------------------------------------
    async function pollStatus() {
        try {
            const response = await fetch('/api/trigger/status');
            if (!response.ok) return;

            const data = await response.json();

            if (data.locked) {
                // Gesperrt → Overlay zeigen (bei Reset auch wieder)
                if (overlay.classList.contains('trigger-overlay--hidden')) {
                    showOverlayStatic();
                    countdownActive = false;
                }
                if (data.remainingMs !== null && !countdownActive) {
                    startCountdown(data.remainingMs);
                }
            } else {
                // Freigegeben → Overlay verstecken
                if (!overlay.classList.contains('trigger-overlay--hidden')) {
                    hideOverlay();
                }
            }
        } catch (e) {
            // Netzwerkfehler → still ignorieren
        }
    }

    // --------------------------------------------------
    // Start
    // --------------------------------------------------
    function start() {
        // Sofort Overlay zeigen – kein Warten auf Backend
        showOverlayStatic();
        // Dann Backend-Status pollen
        pollStatus();
        pollTimer = setInterval(pollStatus, POLL_INTERVAL_MS);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }

    return { stop: () => { clearInterval(pollTimer); clearTimeout(barTimer); } };
})();
