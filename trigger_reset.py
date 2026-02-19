"""
School Plan Kids – Trigger Reset
=================================
Setzt die Website auf den Ursprungszustand zurück:
Schwarzer Bildschirm wird für alle Besucher sofort wieder angezeigt.

Ausführen:
    py trigger_reset.py
"""

import requests
import sys

SERVER_URL     = 'http://localhost:2080'
TRIGGER_SECRET = 'trigger_secret_change_me'

RESET_URL = f"{SERVER_URL.rstrip('/')}/api/trigger/reset"

print("Setze Trigger zurück...", end=" ", flush=True)

try:
    response = requests.post(
        RESET_URL,
        json={'secret': TRIGGER_SECRET},
        timeout=5
    )
    if response.status_code == 200:
        print("✅ Schwarzer Bildschirm ist wieder aktiv.")
    elif response.status_code == 401:
        print("❌ FEHLER: Falsches TRIGGER_SECRET.")
        sys.exit(1)
    else:
        print(f"❌ FEHLER: Statuscode {response.status_code}.")
        sys.exit(1)
except requests.exceptions.RequestException as e:
    print(f"❌ FEHLER: {e}")
    sys.exit(1)
