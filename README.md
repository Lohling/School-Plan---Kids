# School Plan - Kids

Digitaler Vertretungsplan für Grundschüler mit benutzerdefinierten Dashboards für Schüler, Eltern, Lehrer und Administratoren.

## 🚀 Features

- **Login System** mit 4 Benutzertypen (Schüler, Eltern, Lehrer, Admin)
- **Schüler-Dashboard**: Anzeige des Stundenplans, Vertretungen, Krankschreibungen
- **Eltern-Dashboard**: Übersicht der Stundenplan ihrer Kinder, Fehlzeitenmanagement
- **Lehrer-Dashboard**: Verwaltung von Vertretungen, Klassen, Mitteilungen
- **Admin-Dashboard**: Verwaltung von Benutzern, Klassen, Stundenplänen
- **Responsive Design** für Mobile und Desktop
- **Docker & Docker Compose** für einfache Deployment

## 📋 Testzugänge

```
Schüler:      schueler1 / password123
Eltern:       eltern1 / password123
Lehrer:       lehrer1 / password123
Admin:        admin / admin123
```

## 🔧 Installation

### Lokal (ohne Docker)

```bash
# Abhängigkeiten installieren
npm install

# Server starten
npm start

# Im Browser öffnen
http://localhost:3000
```

### Mit Docker Compose

```bash
# Container bauen und starten
docker-compose up -d

# Logs anzeigen
docker-compose logs -f

# Container stoppen
docker-compose down
```

**Zugriff:** http://localhost

## 📁 Projektstruktur

```
school-plan-kids/
├── login.html              # Login-Seite
├── login.css               # Login-Styles
├── login.js                # Login-Logik
├── dashboard.html          # Hauptdashboard (alle Views)
├── dashboard.css           # Dashboard-Styles
├── dashboard.js            # Dashboard-Logik
├── auth.js                 # Authentifizierung & Session
├── style.css               # Globale Styles (Stundenplan)
├── script.js               # Original Stundenplan-Logik
├── server.js               # Express Backend
├── package.json            # Node Dependencies
├── docker-compose.yml      # Docker Compose Config
├── Dockerfile              # Node Container
├── nginx.conf              # Nginx Config
└── README.md               # Diese Datei
```

## 🎨 Design & Styling

Das Projekt behält das ursprüngliche Design mit:
- **Farben**: Rot/Rosa Gradient (#FF6B6B, #FF8E72)
- **Schriftarten**: Arial, Sans-Serif
- **Responsive Layout**: Mobile-First Approach
- **Animations**: Sanfte Übergänge und Hover-Effekte

## 🔐 Sicherheit

- Session-basierte Authentifizierung (sessionStorage)
- Passwort-Validierung
- Benutzertyp-Überprüfung
- CORS-Schutz
- Security Headers (X-Frame-Options, X-Content-Type-Options, etc.)

## 📱 Benutzertypen & Features

### 👨‍🎓 Schüler
- Anzeige des eigenen Stundenplans
- Vertretungsplan einsehen
- Krankschreibung einreichen
- Mitteilungen empfangen

### 👨‍👩‍👧 Eltern
- Stundenplan ihrer Kinder anzeigen
- Krankschreibung einreichen
- Fehlzeiten überwachen
- Mitteilungen erhalten

### 👨‍🏫 Lehrer
- Stundenplan ihrer Klassen verwalten
- Vertretungen eintragen
- Mitteilungen versenden
- Abwesenheiten dokumentieren

### 🔧 Administrator
- Benutzer verwalten
- Klassen konfigurieren
- Stundenpläne verwalten
- System-Logs anzeigen
- Statistiken

## 🐳 Docker Services

- **Nginx** (Port 80): Webserver & Reverse Proxy
- **Node.js** (Port 3000): Backend API
- **PostgreSQL** (Port 5432): Datenbank (optional)

## 📝 API Endpoints

- `GET /api/health` - Health Check
- `GET /api/timetable` - Stundenplan abrufen
- `POST /api/sick-note` - Krankschreibung einreichen
- `POST /api/substitution` - Vertretung registrieren

## 🔄 Development Workflow

1. **Lokale Entwicklung**:
   ```bash
   npm install
   npm run dev  # Mit Nodemon für Auto-Reload
   ```

2. **Docker Testing**:
   ```bash
   docker-compose up
   # http://localhost öffnen
   ```

3. **Production Deployment**:
   ```bash
   docker-compose -f docker-compose.yml up -d
   ```

## 🐛 Bekannte Limitierungen

- Authentifizierung ist Client-seitig (Mock-Datenbank)
- Keine echte Datenbankintegration im Standard-Setup
- Daten persistieren nicht über Session hinaus

## 🚀 Nächste Schritte

1. Echte Datenbankintegration (PostgreSQL)
2. Server-seitige Authentifizierung mit JWT
3. Email-Benachrichtigungen
4. Datei-Upload für Atteste
5. Erweiterte Admin-Verwaltung

## 📄 Lizenz

MIT License - Kostenlos nutzbar

## 👥 Support

Bei Fragen oder Problemen bitte ein Issue erstellen.
