"""
School Plan Kids – Lehrer-Trigger
==================================
Drücken Sie die LEERTASTE, um die Website für die Schülerinnen
und Schüler nach einem 10s-Countdown freizugeben.
Das Programm beendet sich danach automatisch.

Voraussetzungen:
    py -m pip install requests pynput

Starten:
    py trigger_lehrer.py

Konfiguration:
    SERVER_URL      → URL Ihrer laufenden Website (ohne abschließenden /)
    TRIGGER_SECRET  → Muss mit dem Wert TRIGGER_SECRET in docker-compose.yml übereinstimmen
    TRIGGER_KEY     → Die Taste, die den Trigger auslöst (Standard: Leertaste)
"""

import sys
import requests
from pynput import keyboard

# ╔══════════════════════════════════════════════════════╗
# ║                  KONFIGURATION                       ║
# ╚══════════════════════════════════════════════════════╝

SERVER_URL     = 'http://localhost:2080'                      # ← Lokale URL (gleicher PC wie Docker)
TRIGGER_SECRET = 'trigger_secret_change_me'                  # ← MUSS mit docker-compose übereinstimmen!
TRIGGER_KEY    = keyboard.Key.space                          # ← Auslöse-Taste (Leertaste)

# ════════════════════════════════════════════════════════

ACTIVATE_URL = f"{SERVER_URL.rstrip('/')}/api/trigger/activate"

def send_trigger():
    """Sendet den Lockdown-Befehl an den Server."""
    try:
        response = requests.post(
            ACTIVATE_URL,
            json={'secret': TRIGGER_SECRET},
            timeout=5
        )
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Freigabe gestartet! Website wird in 10 Sekunden sichtbar.")
        elif response.status_code == 401:
            print("❌ FEHLER: Falsches TRIGGER_SECRET – bitte in der Konfiguration prüfen.")
        else:
            print(f"❌ FEHLER: Server antwortete mit Statuscode {response.status_code}.")
    except requests.exceptions.ConnectionError:
        print(f"❌ FEHLER: Konnte keine Verbindung zu {ACTIVATE_URL} herstellen.")
    except requests.exceptions.Timeout:
        print("❌ FEHLER: Server hat nicht innerhalb von 5 Sekunden geantwortet.")
    except requests.exceptions.RequestException as e:
        print(f"❌ FEHLER: {e}")


def on_key_press(key):
    if key == TRIGGER_KEY:
        print("\n--- Leertaste erkannt. Sende Freigabe-Signal ---")
        send_trigger()
        # Programm nach einmaliger Betätigung beenden
        return False  # False = Listener stoppen
    return True  # Andere Tasten weiterleiten


# ════════════════════════════════════════════════════════
# HAUPTPROGRAMM
# ════════════════════════════════════════════════════════

if __name__ == '__main__':
    print("=" * 55)
    print("  School Plan Kids – Lehrer-Trigger")
    print("=" * 55)
    print(f"  Server:  {ACTIVATE_URL}")
    print(f"  Taste:   Leertaste")
    print(f"  Aktion:  10s Countdown → Website freigeben")
    print("=" * 55)
    print("  Bereit. Drücken Sie die LEERTASTE zum Freigeben.")
    print("  Das Programm beendet sich danach automatisch.")
    print("=" * 55 + "\n")

    try:
        with keyboard.Listener(on_press=on_key_press) as listener:
            listener.join()
    except KeyboardInterrupt:
        print("\nProgramm beendet.")
        sys.exit(0)
