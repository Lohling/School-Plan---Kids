-- =====================================================
-- School Plan Kids - Datenbank Schema
-- Datenschutzfreundlich und kinderoptimiert
-- =====================================================

-- Extension für UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABELLE: Schulen
-- =====================================================
CREATE TABLE schools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABELLE: Benutzer (Schüler, Eltern, Lehrer, Admin)
-- =====================================================
CREATE TYPE user_role AS ENUM ('student', 'parent', 'teacher', 'admin');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL,
    avatar_emoji VARCHAR(10) DEFAULT '😊', -- Kinderfreundliches Avatar-System
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index für schnelle Login-Abfragen
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_school_role ON users(school_id, role);

-- =====================================================
-- TABELLE: Klassen
-- =====================================================
CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL, -- z.B. "2a", "3b"
    grade_level INTEGER NOT NULL, -- Klassenstufe 1-4
    school_year VARCHAR(20) NOT NULL, -- z.B. "2025/2026"
    class_teacher_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_classes_school ON classes(school_id);

-- =====================================================
-- TABELLE: Schüler-Klassen-Zuordnung
-- =====================================================
CREATE TABLE student_classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    school_year VARCHAR(20) NOT NULL,
    UNIQUE(student_id, class_id, school_year)
);

-- =====================================================
-- TABELLE: Eltern-Kind-Beziehung
-- =====================================================
CREATE TABLE parent_students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    relationship VARCHAR(50) DEFAULT 'Elternteil', -- Mutter, Vater, Erziehungsberechtigter
    UNIQUE(parent_id, student_id)
);

-- =====================================================
-- TABELLE: Lehrer-Klassen-Zuordnung (welche Klassen unterrichtet ein Lehrer)
-- =====================================================
CREATE TABLE teacher_classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    subject VARCHAR(100) NOT NULL, -- Fach das unterrichtet wird
    UNIQUE(teacher_id, class_id, subject)
);

-- =====================================================
-- TABELLE: Fächer
-- =====================================================
CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- Deutsch, Mathe, HSU, etc.
    short_name VARCHAR(20), -- DE, MA, HSU
    color VARCHAR(7) DEFAULT '#e64043', -- Hex-Farbe für Darstellung
    icon VARCHAR(10) DEFAULT '📚' -- Emoji-Icon für Kinder
);

-- =====================================================
-- TABELLE: Räume
-- =====================================================
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- z.B. "R 001", "Turnhalle A"
    building VARCHAR(100),
    capacity INTEGER
);

-- =====================================================
-- TABELLE: Stundenplan-Einträge
-- =====================================================
CREATE TYPE weekday AS ENUM ('Mo', 'Di', 'Mi', 'Do', 'Fr');
CREATE TYPE lesson_type AS ENUM ('lesson', 'break', 'free');

CREATE TABLE timetable_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES users(id) ON DELETE SET NULL,
    subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
    room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
    weekday weekday NOT NULL,
    lesson_number INTEGER NOT NULL, -- 1. Stunde, 2. Stunde, etc.
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    entry_type lesson_type DEFAULT 'lesson',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_timetable_class_day ON timetable_entries(class_id, weekday);
CREATE INDEX idx_timetable_teacher ON timetable_entries(teacher_id);

-- =====================================================
-- TABELLE: Vertretungen
-- =====================================================
CREATE TABLE substitutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    original_entry_id UUID NOT NULL REFERENCES timetable_entries(id) ON DELETE CASCADE,
    substitute_teacher_id UUID REFERENCES users(id) ON DELETE SET NULL,
    substitute_subject_id UUID REFERENCES subjects(id),
    substitute_room_id UUID REFERENCES rooms(id),
    date DATE NOT NULL, -- Spezifisches Datum der Vertretung
    reason TEXT, -- Grund (intern, nicht für Schüler sichtbar)
    note_for_students TEXT, -- Kinderfreundliche Nachricht
    is_cancelled BOOLEAN DEFAULT false, -- Fällt die Stunde aus?
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_substitutions_date ON substitutions(date);

-- =====================================================
-- TABELLE: Unterrichtsinhalte (von Lehrern eingetragen)
-- =====================================================
CREATE TABLE lesson_contents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timetable_entry_id UUID NOT NULL REFERENCES timetable_entries(id) ON DELETE CASCADE,
    date DATE NOT NULL, -- Datum der Stunde
    topic VARCHAR(255), -- Thema der Stunde
    description TEXT, -- Beschreibung
    homework TEXT, -- Hausaufgaben (kinderfreundlich)
    materials TEXT, -- Benötigte Materialien
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_lesson_contents_date ON lesson_contents(date);

-- =====================================================
-- TABELLE: Pausenaufsichten
-- =====================================================
CREATE TYPE break_type AS ENUM ('kleine_pause', 'grosse_pause', 'mittagspause');

CREATE TABLE break_supervisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    weekday weekday NOT NULL,
    break_type break_type NOT NULL,
    location VARCHAR(255), -- z.B. "Schulhof Nord", "Kantine"
    start_time TIME NOT NULL,
    end_time TIME NOT NULL
);

CREATE INDEX idx_supervision_teacher ON break_supervisions(teacher_id);

-- =====================================================
-- TABELLE: Krankmeldungen
-- =====================================================
CREATE TYPE sick_note_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE sick_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Für Schüler: student_id ist gesetzt, submitted_by ist der Elternteil
    -- Für Lehrer: teacher_id ist gesetzt, submitted_by ist der Lehrer selbst
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
    submitted_by UUID NOT NULL REFERENCES users(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT, -- Optional, datenschutzfreundlich (kein Detailzwang)
    attachment_path TEXT, -- Pfad zum Attest (verschlüsselt gespeichert)
    status sick_note_status DEFAULT 'pending',
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP,
    admin_note TEXT, -- Interne Notiz
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT sick_note_target CHECK (
        (student_id IS NOT NULL AND teacher_id IS NULL) OR
        (teacher_id IS NOT NULL AND student_id IS NULL)
    )
);

CREATE INDEX idx_sick_notes_status ON sick_notes(status);
CREATE INDEX idx_sick_notes_dates ON sick_notes(start_date, end_date);

-- =====================================================
-- TABELLE: Neuigkeiten / Ankündigungen
-- =====================================================
CREATE TYPE news_audience AS ENUM ('all', 'students', 'parents', 'teachers', 'class');
CREATE TYPE news_priority AS ENUM ('normal', 'important', 'urgent');

CREATE TABLE news (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE, -- NULL = schulweit
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    audience news_audience DEFAULT 'all',
    priority news_priority DEFAULT 'normal',
    is_pinned BOOLEAN DEFAULT false,
    event_date DATE, -- Falls es ein Termin ist (Elternabend etc.)
    event_time TIME,
    event_location VARCHAR(255),
    created_by UUID NOT NULL REFERENCES users(id),
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP, -- Automatisches Ausblenden
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_news_school_audience ON news(school_id, audience);
CREATE INDEX idx_news_class ON news(class_id);
CREATE INDEX idx_news_published ON news(published_at DESC);

-- =====================================================
-- TABELLE: Elternabende und Termine
-- =====================================================
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    location VARCHAR(255),
    is_mandatory BOOLEAN DEFAULT false,
    audience news_audience DEFAULT 'parents',
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_events_date ON events(event_date);

-- =====================================================
-- TABELLE: Audit-Log (Datenschutz - wer hat was geändert)
-- =====================================================
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_created ON audit_log(created_at DESC);

-- =====================================================
-- BEISPIELDATEN FÜR ENTWICKLUNG
-- =====================================================

-- Beispielschule
INSERT INTO schools (id, name, address, email) VALUES 
(uuid_generate_v4(), 'Sonnenschein Grundschule', 'Schulstraße 1, 12345 Musterstadt', 'info@sonnenschein-grundschule.de');

-- Beispiel-Admin (Passwort: "SchoolPlan@2026!Secure" - bcrypt hash)
INSERT INTO users (school_id, email, password_hash, first_name, last_name, role, avatar_emoji) 
SELECT id, 'admin@schule.de', '$2b$10$gvB6UJo0LLOVFjfp4XlP5ur/qbCpT/P9zOCDSb.S6yXfjsQ45BMBm', 'Admin', 'Schulleitung', 'admin', '👨‍💼'
FROM schools LIMIT 1;

-- Beispiel-Fächer
INSERT INTO subjects (school_id, name, short_name, color, icon)
SELECT s.id, sub.name, sub.short, sub.color, sub.icon
FROM schools s,
(VALUES 
    ('Deutsch', 'DE', '#e64043', '📖'),
    ('Mathematik', 'MA', '#4CAF50', '🔢'),
    ('Heimat- und Sachunterricht', 'HSU', '#2196F3', '🌍'),
    ('Sport', 'SP', '#FF9800', '⚽'),
    ('Musik', 'MU', '#9C27B0', '🎵'),
    ('Kunst', 'KU', '#E91E63', '🎨'),
    ('Religion/Ethik', 'RE', '#795548', '🕊️'),
    ('Englisch', 'EN', '#00BCD4', '🇬🇧'),
    ('Werken/Gestalten', 'WG', '#607D8B', '🔨')
) AS sub(name, short, color, icon);
