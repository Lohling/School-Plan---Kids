/**
 * School Plan Kids - Lehrer-Trigger
 * DEAKTIVIERT – Website ist direkt zugänglich.
 */

// Trigger deaktiviert
const Trigger = (() => {
    const POLL_INTERVAL_MS = 1000;

    let pollTimer      = null;
    let countdownActive = false;

    const overlay = document.getElementById('trigger-overlay');

    // --------------------------------------------------
    // Overlay sofort beim Laden anzeigen (statisch)
    // --------------------------------------------------
    function showOverlayStatic() {
        overlay.classList.remove('trigger-overlay--hidden');
        overlay.classList.add('trigger-overlay--visible');
    }

    // --------------------------------------------------
    // Overlay ausblenden
    // --------------------------------------------------
    function hideOverlay() {
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

    // Trigger ist deaktiviert – kein Start, kein Overlay
    // if (document.readyState === 'loading') {
    //     document.addEventListener('DOMContentLoaded', start);
    // } else {
    //     start();
    // }

    return { stop: () => { clearInterval(pollTimer); } };
})();
