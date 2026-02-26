-- =====================================================
-- SEED DATA Part 3:
--   • Neue Lehrerin Hofmann (EN, RE, WG)
--   • Vollständige teacher_classes für alle Klassen
--   • Korrekter Stundenplan Klasse 3b (kein Werken/RE/EN-Fehler)
--   • Neue Klasse 4b
--   • Mehr Schüler und Eltern pro Klasse
-- Passwort für ALLE neuen User: "test1234"
-- =====================================================

DO $$
DECLARE
    v_school_id UUID;
    v_pw_hash VARCHAR(255) := '$2b$10$K1qojiYxkf4NN/KSd6Aj/OiQ0Pkl59uHj940wA18AXDRBBEm/Gk3S';
    v_admin_id UUID;

    -- Bestehende Lehrer
    v_teacher_mueller  UUID;
    v_teacher_schmidt  UUID;
    v_teacher_weber    UUID;
    v_teacher_fischer  UUID;
    v_teacher_braun    UUID;

    -- Neue Lehrerin
    v_teacher_hofmann  UUID;

    -- Bestehende Klassen
    v_class_1a UUID; v_class_1b UUID;
    v_class_2a UUID; v_class_2b UUID;
    v_class_3a UUID; v_class_3b UUID;
    v_class_4a UUID;

    -- Neue Klasse
    v_class_4b UUID;

    -- Fächer
    v_sub_deutsch   UUID; v_sub_mathe   UUID; v_sub_hsu     UUID;
    v_sub_sport     UUID; v_sub_musik   UUID; v_sub_kunst   UUID;
    v_sub_religion  UUID; v_sub_englisch UUID; v_sub_werken UUID;

    -- Räume
    v_room_101 UUID; v_room_102 UUID; v_room_103 UUID;
    v_room_104 UUID; v_room_105 UUID; v_room_106 UUID;
    v_room_107 UUID; v_room_108 UUID;
    v_room_turnhalle UUID; v_room_musikraum UUID; v_room_werkraum UUID;

    -- Neue Schüler IDs (je 4 pro Klasse + 5 für 4b)
    -- Klasse 1a
    s1a_1 UUID; s1a_2 UUID; s1a_3 UUID; s1a_4 UUID;
    -- Klasse 1b
    s1b_1 UUID; s1b_2 UUID; s1b_3 UUID; s1b_4 UUID;
    -- Klasse 2a
    s2a_1 UUID; s2a_2 UUID; s2a_3 UUID; s2a_4 UUID;
    -- Klasse 2b
    s2b_1 UUID; s2b_2 UUID; s2b_3 UUID; s2b_4 UUID;
    -- Klasse 3a
    s3a_1 UUID; s3a_2 UUID; s3a_3 UUID; s3a_4 UUID;
    -- Klasse 3b
    s3b_1 UUID; s3b_2 UUID; s3b_3 UUID; s3b_4 UUID; s3b_5 UUID;
    -- Klasse 4a
    s4a_1 UUID; s4a_2 UUID; s4a_3 UUID; s4a_4 UUID;
    -- Klasse 4b (neu)
    s4b_1 UUID; s4b_2 UUID; s4b_3 UUID; s4b_4 UUID; s4b_5 UUID;

    -- Neue Eltern
    p1 UUID; p2 UUID;  p3  UUID; p4  UUID; p5  UUID;
    p6 UUID; p7 UUID;  p8  UUID; p9  UUID; p10 UUID;
    p11 UUID; p12 UUID; p13 UUID; p14 UUID; p15 UUID;
    p16 UUID; p17 UUID; p18 UUID;

BEGIN
    -- ─────────────────────────────────────────────────
    -- Basis-IDs holen
    -- ─────────────────────────────────────────────────
    SELECT id INTO v_school_id FROM schools LIMIT 1;
    SELECT id INTO v_admin_id  FROM users WHERE role = 'admin' AND school_id = v_school_id LIMIT 1;

    SELECT id INTO v_teacher_mueller FROM users WHERE email = 'mueller@schule.de';
    SELECT id INTO v_teacher_schmidt FROM users WHERE email = 'schmidt@schule.de';
    SELECT id INTO v_teacher_weber   FROM users WHERE email = 'weber@schule.de';
    SELECT id INTO v_teacher_fischer FROM users WHERE email = 'fischer@schule.de';
    SELECT id INTO v_teacher_braun   FROM users WHERE email = 'braun@schule.de';

    SELECT id INTO v_class_1a FROM classes WHERE name = '1a' AND school_id = v_school_id;
    SELECT id INTO v_class_1b FROM classes WHERE name = '1b' AND school_id = v_school_id;
    SELECT id INTO v_class_2a FROM classes WHERE name = '2a' AND school_id = v_school_id;
    SELECT id INTO v_class_2b FROM classes WHERE name = '2b' AND school_id = v_school_id;
    SELECT id INTO v_class_3a FROM classes WHERE name = '3a' AND school_id = v_school_id;
    SELECT id INTO v_class_3b FROM classes WHERE name = '3b' AND school_id = v_school_id;
    SELECT id INTO v_class_4a FROM classes WHERE name = '4a' AND school_id = v_school_id;

    SELECT id INTO v_sub_deutsch  FROM subjects WHERE short_name = 'DE'  AND school_id = v_school_id;
    SELECT id INTO v_sub_mathe    FROM subjects WHERE short_name = 'MA'  AND school_id = v_school_id;
    SELECT id INTO v_sub_hsu      FROM subjects WHERE short_name = 'HSU' AND school_id = v_school_id;
    SELECT id INTO v_sub_sport    FROM subjects WHERE short_name = 'SP'  AND school_id = v_school_id;
    SELECT id INTO v_sub_musik    FROM subjects WHERE short_name = 'MU'  AND school_id = v_school_id;
    SELECT id INTO v_sub_kunst    FROM subjects WHERE short_name = 'KU'  AND school_id = v_school_id;
    SELECT id INTO v_sub_religion FROM subjects WHERE short_name = 'RE'  AND school_id = v_school_id;
    SELECT id INTO v_sub_englisch FROM subjects WHERE short_name = 'EN'  AND school_id = v_school_id;
    SELECT id INTO v_sub_werken   FROM subjects WHERE short_name = 'WG'  AND school_id = v_school_id;

    SELECT id INTO v_room_101      FROM rooms WHERE name = 'Raum 101'   AND school_id = v_school_id;
    SELECT id INTO v_room_102      FROM rooms WHERE name = 'Raum 102'   AND school_id = v_school_id;
    SELECT id INTO v_room_103      FROM rooms WHERE name = 'Raum 103'   AND school_id = v_school_id;
    SELECT id INTO v_room_104      FROM rooms WHERE name = 'Raum 104'   AND school_id = v_school_id;
    SELECT id INTO v_room_105      FROM rooms WHERE name = 'Raum 105'   AND school_id = v_school_id;
    SELECT id INTO v_room_106      FROM rooms WHERE name = 'Raum 106'   AND school_id = v_school_id;
    SELECT id INTO v_room_107      FROM rooms WHERE name = 'Raum 107'   AND school_id = v_school_id;
    SELECT id INTO v_room_turnhalle  FROM rooms WHERE name = 'Turnhalle'  AND school_id = v_school_id;
    SELECT id INTO v_room_musikraum  FROM rooms WHERE name = 'Musikraum'  AND school_id = v_school_id;
    SELECT id INTO v_room_werkraum   FROM rooms WHERE name = 'Werkraum'   AND school_id = v_school_id;

    -- =====================================================
    -- NEUER RAUM 108 für Klasse 4b
    -- =====================================================
    v_room_108 := uuid_generate_v4();
    INSERT INTO rooms (id, school_id, name, building, capacity)
    VALUES (v_room_108, v_school_id, 'Raum 108', 'Neubau', 28)
    ON CONFLICT DO NOTHING;
    -- Falls Raum bereits existiert, ID neu laden
    SELECT id INTO v_room_108 FROM rooms WHERE name = 'Raum 108' AND school_id = v_school_id;

    -- =====================================================
    -- NEUE LEHRERIN: Eva Hofmann (EN, RE, WG)
    -- =====================================================
    v_teacher_hofmann := uuid_generate_v4();
    INSERT INTO users (id, school_id, email, password_hash, first_name, last_name, role, avatar_emoji)
    VALUES (v_teacher_hofmann, v_school_id, 'hofmann@schule.de', v_pw_hash, 'Eva', 'Hofmann', 'teacher', '🌍')
    ON CONFLICT (email) DO NOTHING;
    -- Falls bereits vorhanden, UUID aus DB laden
    SELECT id INTO v_teacher_hofmann FROM users WHERE email = 'hofmann@schule.de';

    -- =====================================================
    -- NEUE KLASSE 4b (Klassenlehrerin: Hofmann)
    -- =====================================================
    v_class_4b := uuid_generate_v4();
    INSERT INTO classes (id, school_id, name, grade_level, school_year, class_teacher_id)
    VALUES (v_class_4b, v_school_id, '4b', 4, '2025/2026', v_teacher_hofmann)
    ON CONFLICT DO NOTHING;
    -- Falls bereits vorhanden, ID aus DB laden
    SELECT id INTO v_class_4b FROM classes WHERE name = '4b' AND school_id = v_school_id;

    -- =====================================================
    -- VOLLSTÄNDIGE teacher_classes (alle fehlenden ergänzt)
    -- =====================================================

    -- Frau Müller: Klassenlehrerin 1a + 3b → DE, HSU, EN (für 4a auch EN)
    INSERT INTO teacher_classes (teacher_id, class_id, subject) VALUES
    (v_teacher_mueller, v_class_3b, 'Mathematik')      -- Notfall-Vertretung
    ON CONFLICT DO NOTHING;

    INSERT INTO teacher_classes (teacher_id, class_id, subject) VALUES
    (v_teacher_mueller, v_class_4a, 'Englisch'),
    (v_teacher_mueller, v_class_4a, 'HSU')
    ON CONFLICT DO NOTHING;

    -- Herr Schmidt: 2a, 4a Mathe+Deutsch, 3b Mathe
    INSERT INTO teacher_classes (teacher_id, class_id, subject) VALUES
    (v_teacher_schmidt, v_class_3b, 'Mathematik'),
    (v_teacher_schmidt, v_class_3a, 'Mathematik'),
    (v_teacher_schmidt, v_class_3a, 'Deutsch'),
    (v_teacher_schmidt, v_class_4b, 'Mathematik'),
    (v_teacher_schmidt, v_class_4b, 'Deutsch')
    ON CONFLICT DO NOTHING;

    -- Frau Weber: 1b DE+MA, 2a-2b MA, Religion in 1b
    INSERT INTO teacher_classes (teacher_id, class_id, subject) VALUES
    (v_teacher_weber, v_class_3b, 'Mathematik'),
    (v_teacher_weber, v_class_1a, 'Mathematik'),
    (v_teacher_weber, v_class_2a, 'Mathematik'),
    (v_teacher_weber, v_class_2b, 'Mathematik'),
    (v_teacher_weber, v_class_1b, 'Religion'),
    (v_teacher_weber, v_class_2a, 'Religion'),
    (v_teacher_weber, v_class_3a, 'Englisch')
    ON CONFLICT DO NOTHING;

    -- Herr Fischer: Sport 3./4. Klassen (OHNE 2b und 4b – kein Zeitkonflikt mehr)
    INSERT INTO teacher_classes (teacher_id, class_id, subject) VALUES
    (v_teacher_fischer, v_class_3b, 'Sport'),
    (v_teacher_fischer, v_class_3a, 'Werken'),
    (v_teacher_fischer, v_class_4a, 'Sport')
    ON CONFLICT DO NOTHING;

    -- Frau Braun: 2b Klassenlehrerin, Musik+Kunst überall, Sport+HSU 2b (als Klassenlehrerin)
    INSERT INTO teacher_classes (teacher_id, class_id, subject) VALUES
    (v_teacher_braun, v_class_3b, 'Musik'),
    (v_teacher_braun, v_class_3b, 'Kunst'),
    (v_teacher_braun, v_class_4a, 'Musik'),
    (v_teacher_braun, v_class_4a, 'Kunst'),
    (v_teacher_braun, v_class_1b, 'Kunst'),
    (v_teacher_braun, v_class_2a, 'Musik'),
    (v_teacher_braun, v_class_2a, 'Kunst'),
    (v_teacher_braun, v_class_4b, 'Musik'),
    (v_teacher_braun, v_class_4b, 'Kunst'),
    (v_teacher_braun, v_class_2b, 'Sport')
    ON CONFLICT DO NOTHING;

    -- Frau Hofmann: Englisch, Religion, Werken 3./4. Klassen; Sport 4b (als Klassenlehrerin)
    INSERT INTO teacher_classes (teacher_id, class_id, subject) VALUES
    (v_teacher_hofmann, v_class_3b, 'Englisch'),
    (v_teacher_hofmann, v_class_3b, 'Religion'),
    (v_teacher_hofmann, v_class_3b, 'Werken'),
    (v_teacher_hofmann, v_class_3a, 'Religion'),
    -- 3a Englisch unterrichtet Weber (kein Konflikt mit Hofmann)
    (v_teacher_hofmann, v_class_4a, 'Religion'),
    (v_teacher_hofmann, v_class_4a, 'Englisch'),
    (v_teacher_hofmann, v_class_4b, 'Englisch'),
    (v_teacher_hofmann, v_class_4b, 'Religion'),
    (v_teacher_hofmann, v_class_4b, 'Werken'),
    (v_teacher_hofmann, v_class_4b, 'Sport'),
    (v_teacher_hofmann, v_class_2b, 'Religion')
    ON CONFLICT DO NOTHING;

    -- =====================================================
    -- NEUER STUNDENPLAN KLASSE 3b
    -- (Alter Plan wird gelöscht und korrekt neu erstellt)
    -- Bayern Grundschule Klasse 3: DE:5 MA:5 HSU:3 SP:3 MU:2 KU:1 EN:2 RE:2 WG:1
    -- =====================================================
    DELETE FROM timetable_entries
    WHERE class_id = v_class_3b;

    INSERT INTO timetable_entries
        (class_id, teacher_id, subject_id, room_id, weekday, lesson_number, start_time, end_time, entry_type)
    VALUES
    -- === MONTAG (5 Stunden) ===
    -- Doppelstunde Mathe am Morgen: Kinder sind noch frisch
    (v_class_3b, v_teacher_schmidt, v_sub_mathe,    v_room_106, 'Mo', 1, '08:00','08:45','lesson'),
    (v_class_3b, v_teacher_schmidt, v_sub_mathe,    v_room_106, 'Mo', 2, '08:50','09:35','lesson'),
    (v_class_3b, NULL,              NULL,            NULL,       'Mo', 0, '09:35','09:55','break'),
    (v_class_3b, v_teacher_fischer, v_sub_sport,    v_room_turnhalle,'Mo', 3,'09:55','10:40','lesson'),
    (v_class_3b, v_teacher_braun,   v_sub_kunst,    v_room_106, 'Mo', 4, '10:45','11:30','lesson'),
    (v_class_3b, v_teacher_mueller, v_sub_deutsch,  v_room_106, 'Mo', 5, '11:35','12:20','lesson'),

    -- === DIENSTAG (5 Stunden) ===
    (v_class_3b, v_teacher_schmidt, v_sub_mathe,    v_room_106, 'Di', 1, '08:00','08:45','lesson'),
    (v_class_3b, v_teacher_mueller, v_sub_deutsch,  v_room_106, 'Di', 2, '08:50','09:35','lesson'),
    (v_class_3b, NULL,              NULL,            NULL,       'Di', 0, '09:35','09:55','break'),
    (v_class_3b, v_teacher_mueller, v_sub_hsu,      v_room_106, 'Di', 3, '09:55','10:40','lesson'),
    (v_class_3b, v_teacher_braun,   v_sub_musik,    v_room_musikraum,'Di', 4,'10:45','11:30','lesson'),
    (v_class_3b, v_teacher_hofmann, v_sub_englisch, v_room_106, 'Di', 5, '11:35','12:20','lesson'),

    -- === MITTWOCH (4 Stunden – kürzerer Tag) ===
    (v_class_3b, v_teacher_mueller, v_sub_deutsch,  v_room_106, 'Mi', 1, '08:00','08:45','lesson'),
    (v_class_3b, v_teacher_hofmann, v_sub_englisch, v_room_106, 'Mi', 2, '08:50','09:35','lesson'),
    (v_class_3b, NULL,              NULL,            NULL,       'Mi', 0, '09:35','09:55','break'),
    (v_class_3b, v_teacher_mueller, v_sub_hsu,      v_room_106, 'Mi', 3, '09:55','10:40','lesson'),
    (v_class_3b, v_teacher_hofmann, v_sub_religion, v_room_106, 'Mi', 4, '10:45','11:30','lesson'),

    -- === DONNERSTAG (5 Stunden) ===
    (v_class_3b, v_teacher_schmidt, v_sub_mathe,    v_room_106, 'Do', 1, '08:00','08:45','lesson'),
    (v_class_3b, v_teacher_mueller, v_sub_deutsch,  v_room_106, 'Do', 2, '08:50','09:35','lesson'),
    (v_class_3b, NULL,              NULL,            NULL,       'Do', 0, '09:35','09:55','break'),
    (v_class_3b, v_teacher_fischer, v_sub_sport,    v_room_turnhalle,'Do', 3,'09:55','10:40','lesson'),
    (v_class_3b, v_teacher_mueller, v_sub_hsu,      v_room_106, 'Do', 4, '10:45','11:30','lesson'),
    (v_class_3b, v_teacher_hofmann, v_sub_religion, v_room_106, 'Do', 5, '11:35','12:20','lesson'),

    -- === FREITAG (4 Stunden – kürzerer Tag) ===
    (v_class_3b, v_teacher_mueller, v_sub_deutsch,  v_room_106, 'Fr', 1, '08:00','08:45','lesson'),
    (v_class_3b, v_teacher_fischer, v_sub_sport,    v_room_turnhalle,'Fr', 2,'08:50','09:35','lesson'),
    (v_class_3b, NULL,              NULL,            NULL,       'Fr', 0, '09:35','09:55','break'),
    (v_class_3b, v_teacher_braun,   v_sub_musik,    v_room_musikraum,'Fr', 3,'09:55','10:40','lesson'),
    (v_class_3b, v_teacher_hofmann, v_sub_werken,   v_room_werkraum, 'Fr', 4,'10:45','11:30','lesson');

    -- Deutsch: Mo(1) Di(1) Mi(1) Do(1) Fr(1) = 5 ✓
    -- Mathe:   Mo(2) Di(1) Do(1)          = 4 ✓
    -- HSU:     Di(1) Mi(1) Do(1)          = 3 ✓
    -- Sport:   Mo(1) Do(1) Fr(1)          = 3 ✓
    -- Musik:   Di(1) Fr(1)                = 2 ✓
    -- Kunst:   Mo(1)                      = 1 ✓
    -- Englisch:Di(1) Mi(1)                = 2 ✓
    -- Religion:Mi(1) Do(1)                = 2 ✓
    -- Werken:  Fr(1)                      = 1 ✓

    -- =====================================================
    -- STUNDENPLAN KLASSE 4b
    -- (Bayern Kl.4: DE:5 MA:5 HSU:3 SP:3 MU:2 KU:1 EN:2 RE:2 WG:2)
    -- =====================================================
    INSERT INTO timetable_entries
        (class_id, teacher_id, subject_id, room_id, weekday, lesson_number, start_time, end_time, entry_type)
    VALUES
    -- MONTAG (5)
    (v_class_4b, v_teacher_schmidt,  v_sub_deutsch,   v_room_108,'Mo',1,'08:00','08:45','lesson'),
    (v_class_4b, v_teacher_schmidt,  v_sub_mathe,     v_room_108,'Mo',2,'08:50','09:35','lesson'),
    (v_class_4b, NULL,               NULL,            NULL,      'Mo',0,'09:35','09:55','break'),
    (v_class_4b, v_teacher_schmidt,  v_sub_deutsch,   v_room_108,'Mo',3,'09:55','10:40','lesson'),
    (v_class_4b, v_teacher_hofmann,  v_sub_sport,     v_room_turnhalle,'Mo',4,'10:45','11:30','lesson'),
    (v_class_4b, v_teacher_hofmann,  v_sub_sport,     v_room_turnhalle,'Mo',5,'11:35','12:20','lesson'),
    -- DIENSTAG (5)
    (v_class_4b, v_teacher_schmidt,  v_sub_mathe,     v_room_108,'Di',1,'08:00','08:45','lesson'),
    (v_class_4b, v_teacher_schmidt,  v_sub_mathe,     v_room_108,'Di',2,'08:50','09:35','lesson'),
    (v_class_4b, NULL,               NULL,            NULL,      'Di',0,'09:35','09:55','break'),
    (v_class_4b, v_teacher_hofmann,  v_sub_englisch,  v_room_108,'Di',3,'09:55','10:40','lesson'),
    (v_class_4b, v_teacher_hofmann,  v_sub_religion,  v_room_108,'Di',4,'10:45','11:30','lesson'),
    (v_class_4b, v_teacher_mueller,  v_sub_hsu,       v_room_108,'Di',5,'11:35','12:20','lesson'),
    -- MITTWOCH (4)
    (v_class_4b, v_teacher_schmidt,  v_sub_deutsch,   v_room_108,'Mi',1,'08:00','08:45','lesson'),
    (v_class_4b, v_teacher_schmidt,  v_sub_deutsch,   v_room_108,'Mi',2,'08:50','09:35','lesson'),
    (v_class_4b, NULL,               NULL,            NULL,      'Mi',0,'09:35','09:55','break'),
    (v_class_4b, v_teacher_braun,    v_sub_musik,     v_room_musikraum,'Mi',3,'09:55','10:40','lesson'),
    (v_class_4b, v_teacher_braun,    v_sub_kunst,     v_room_108,'Mi',4,'10:45','11:30','lesson'),
    -- DONNERSTAG (5)
    (v_class_4b, v_teacher_schmidt,  v_sub_mathe,     v_room_108,'Do',1,'08:00','08:45','lesson'),
    (v_class_4b, v_teacher_schmidt,  v_sub_deutsch,   v_room_108,'Do',2,'08:50','09:35','lesson'),
    (v_class_4b, NULL,               NULL,            NULL,      'Do',0,'09:35','09:55','break'),
    (v_class_4b, v_teacher_hofmann,  v_sub_englisch,  v_room_108,'Do',3,'09:55','10:40','lesson'),
    (v_class_4b, v_teacher_mueller,  v_sub_hsu,       v_room_108,'Do',4,'10:45','11:30','lesson'),
    (v_class_4b, v_teacher_hofmann,  v_sub_werken,    v_room_werkraum,'Do',5,'11:35','12:20','lesson'),
    -- FREITAG (4)
    (v_class_4b, v_teacher_schmidt,  v_sub_mathe,     v_room_108,'Fr',1,'08:00','08:45','lesson'),
    (v_class_4b, v_teacher_schmidt,  v_sub_deutsch,   v_room_108,'Fr',2,'08:50','09:35','lesson'),
    (v_class_4b, NULL,               NULL,            NULL,      'Fr',0,'09:35','09:55','break'),
    (v_class_4b, v_teacher_mueller,  v_sub_hsu,       v_room_108,'Fr',3,'09:55','10:40','lesson'),
    (v_class_4b, v_teacher_hofmann,  v_sub_werken,    v_room_werkraum,'Fr',4,'10:45','11:30','lesson');

    -- =====================================================
    -- NEUE SCHÜLER & ELTERN (4 pro bestehender Klasse + 5 für 4b)
    -- =====================================================
    -- Klasse 1a
    s1a_1 := uuid_generate_v4(); s1a_2 := uuid_generate_v4();
    s1a_3 := uuid_generate_v4(); s1a_4 := uuid_generate_v4();
    -- Klasse 1b
    s1b_1 := uuid_generate_v4(); s1b_2 := uuid_generate_v4();
    s1b_3 := uuid_generate_v4(); s1b_4 := uuid_generate_v4();
    -- Klasse 2a
    s2a_1 := uuid_generate_v4(); s2a_2 := uuid_generate_v4();
    s2a_3 := uuid_generate_v4(); s2a_4 := uuid_generate_v4();
    -- Klasse 2b
    s2b_1 := uuid_generate_v4(); s2b_2 := uuid_generate_v4();
    s2b_3 := uuid_generate_v4(); s2b_4 := uuid_generate_v4();
    -- Klasse 3a
    s3a_1 := uuid_generate_v4(); s3a_2 := uuid_generate_v4();
    s3a_3 := uuid_generate_v4(); s3a_4 := uuid_generate_v4();
    -- Klasse 3b
    s3b_1 := uuid_generate_v4(); s3b_2 := uuid_generate_v4();
    s3b_3 := uuid_generate_v4(); s3b_4 := uuid_generate_v4(); s3b_5 := uuid_generate_v4();
    -- Klasse 4a
    s4a_1 := uuid_generate_v4(); s4a_2 := uuid_generate_v4();
    s4a_3 := uuid_generate_v4(); s4a_4 := uuid_generate_v4();
    -- Klasse 4b
    s4b_1 := uuid_generate_v4(); s4b_2 := uuid_generate_v4(); s4b_3 := uuid_generate_v4();
    s4b_4 := uuid_generate_v4(); s4b_5 := uuid_generate_v4();

    INSERT INTO users (id, school_id, email, password_hash, first_name, last_name, role, avatar_emoji) VALUES
    -- Klasse 1a (4 neue)
    (s1a_1, v_school_id,'giulia.rossi@schule.de',    v_pw_hash,'Giulia','Rossi',   'student','🌸'),
    (s1a_2, v_school_id,'felix.braun@schule.de',     v_pw_hash,'Felix','Braun',    'student','🚂'),
    (s1a_3, v_school_id,'maya.ali@schule.de',        v_pw_hash,'Maya','Ali',       'student','🌼'),
    (s1a_4, v_school_id,'tobias.vogt@schule.de',     v_pw_hash,'Tobias','Vogt',    'student','🦖'),
    -- Klasse 1b (4 neue)
    (s1b_1, v_school_id,'leonie.fuchs@schule.de',    v_pw_hash,'Leonie','Fuchs',   'student','🐦'),
    (s1b_2, v_school_id,'oliver.stern@schule.de',    v_pw_hash,'Oliver','Stern',   'student','🌙'),
    (s1b_3, v_school_id,'amira.hassan@schule.de',    v_pw_hash,'Amira','Hassan',   'student','🌺'),
    (s1b_4, v_school_id,'lars.brandt@schule.de',     v_pw_hash,'Lars','Brandt',    'student','🎸'),
    -- Klasse 2a (4 neue)
    (s2a_1, v_school_id,'sara.kurt@schule.de',       v_pw_hash,'Sara','Kurt',      'student','🦋'),
    (s2a_2, v_school_id,'niklas.simon@schule.de',    v_pw_hash,'Niklas','Simon',   'student','🔭'),
    (s2a_3, v_school_id,'laura.heinz@schule.de',     v_pw_hash,'Laura','Heinz',    'student','🎀'),
    (s2a_4, v_school_id,'jan.albrecht@schule.de',    v_pw_hash,'Jan','Albrecht',   'student','🏆'),
    -- Klasse 2b (4 neue)
    (s2b_1, v_school_id,'marie.schubert@schule.de',  v_pw_hash,'Marie','Schubert', 'student','🎹'),
    (s2b_2, v_school_id,'daniel.huber@schule.de',    v_pw_hash,'Daniel','Huber',   'student','🐸'),
    (s2b_3, v_school_id,'sina.keller@schule.de',     v_pw_hash,'Sina','Keller',    'student','🌻'),
    (s2b_4, v_school_id,'fabian.roth@schule.de',     v_pw_hash,'Fabian','Roth',    'student','🚀'),
    -- Klasse 3a (4 neue)
    (s3a_1, v_school_id,'emre.yilmaz@schule.de',     v_pw_hash,'Emre','Yilmaz',   'student','⚡'),
    (s3a_2, v_school_id,'lara.patel@schule.de',      v_pw_hash,'Lara','Patel',    'student','🌈'),
    (s3a_3, v_school_id,'moritz.adam@schule.de',     v_pw_hash,'Moritz','Adam',   'student','🐧'),
    (s3a_4, v_school_id,'nora.schwarz@schule.de',    v_pw_hash,'Nora','Schwarz',  'student','🎭'),
    -- Klasse 3b (5 neue – Klasse bekommt mehr Schüler)
    (s3b_1, v_school_id,'lea.zimmermann@schule.de',  v_pw_hash,'Lea','Zimmermann','student','🦚'),
    (s3b_2, v_school_id,'nico.hoffmann2@schule.de',  v_pw_hash,'Nico','Hoffmann', 'student','🎯'),
    (s3b_3, v_school_id,'ida.wolf@schule.de',        v_pw_hash,'Ida','Wolf',      'student','🌿'),
    (s3b_4, v_school_id,'paul.gruber@schule.de',     v_pw_hash,'Paul','Gruber',   'student','🦅'),
    (s3b_5, v_school_id,'mia.kaiser@schule.de',      v_pw_hash,'Mia','Kaiser',    'student','🍀'),
    -- Klasse 4a (4 neue)
    (s4a_1, v_school_id,'jana.held@schule.de',       v_pw_hash,'Jana','Held',     'student','🔮'),
    (s4a_2, v_school_id,'rafael.maier@schule.de',    v_pw_hash,'Rafael','Maier',  'student','🎲'),
    (s4a_3, v_school_id,'sophie.arnold@schule.de',   v_pw_hash,'Sophie','Arnold', 'student','🌠'),
    (s4a_4, v_school_id,'ben.lehmann@schule.de',     v_pw_hash,'Ben','Lehmann',   'student','🎮'),
    -- Klasse 4b (5 neue – ganz neue Klasse)
    (s4b_1, v_school_id,'lenya.graf@schule.de',      v_pw_hash,'Lenya','Graf',    'student','🎪'),
    (s4b_2, v_school_id,'tom.lorenz@schule.de',      v_pw_hash,'Tom','Lorenz',    'student','🏄'),
    (s4b_3, v_school_id,'aisha.diallo@schule.de',    v_pw_hash,'Aisha','Diallo',  'student','🌙'),
    (s4b_4, v_school_id,'simon.engel@schule.de',     v_pw_hash,'Simon','Engel',   'student','🎺'),
    (s4b_5, v_school_id,'mila.stern@schule.de',      v_pw_hash,'Mila','Stern',    'student','🌟');

    -- Schüler den Klassen zuordnen
    INSERT INTO student_classes (student_id, class_id, school_year) VALUES
    (s1a_1,v_class_1a,'2025/2026'),(s1a_2,v_class_1a,'2025/2026'),(s1a_3,v_class_1a,'2025/2026'),(s1a_4,v_class_1a,'2025/2026'),
    (s1b_1,v_class_1b,'2025/2026'),(s1b_2,v_class_1b,'2025/2026'),(s1b_3,v_class_1b,'2025/2026'),(s1b_4,v_class_1b,'2025/2026'),
    (s2a_1,v_class_2a,'2025/2026'),(s2a_2,v_class_2a,'2025/2026'),(s2a_3,v_class_2a,'2025/2026'),(s2a_4,v_class_2a,'2025/2026'),
    (s2b_1,v_class_2b,'2025/2026'),(s2b_2,v_class_2b,'2025/2026'),(s2b_3,v_class_2b,'2025/2026'),(s2b_4,v_class_2b,'2025/2026'),
    (s3a_1,v_class_3a,'2025/2026'),(s3a_2,v_class_3a,'2025/2026'),(s3a_3,v_class_3a,'2025/2026'),(s3a_4,v_class_3a,'2025/2026'),
    (s3b_1,v_class_3b,'2025/2026'),(s3b_2,v_class_3b,'2025/2026'),(s3b_3,v_class_3b,'2025/2026'),(s3b_4,v_class_3b,'2025/2026'),(s3b_5,v_class_3b,'2025/2026'),
    (s4a_1,v_class_4a,'2025/2026'),(s4a_2,v_class_4a,'2025/2026'),(s4a_3,v_class_4a,'2025/2026'),(s4a_4,v_class_4a,'2025/2026'),
    (s4b_1,v_class_4b,'2025/2026'),(s4b_2,v_class_4b,'2025/2026'),(s4b_3,v_class_4b,'2025/2026'),(s4b_4,v_class_4b,'2025/2026'),(s4b_5,v_class_4b,'2025/2026');

    -- =====================================================
    -- NEUE ELTERN
    -- =====================================================
    p1:=uuid_generate_v4(); p2:=uuid_generate_v4(); p3:=uuid_generate_v4(); p4:=uuid_generate_v4();
    p5:=uuid_generate_v4(); p6:=uuid_generate_v4(); p7:=uuid_generate_v4(); p8:=uuid_generate_v4();
    p9:=uuid_generate_v4(); p10:=uuid_generate_v4(); p11:=uuid_generate_v4(); p12:=uuid_generate_v4();
    p13:=uuid_generate_v4(); p14:=uuid_generate_v4(); p15:=uuid_generate_v4(); p16:=uuid_generate_v4();
    p17:=uuid_generate_v4(); p18:=uuid_generate_v4();

    INSERT INTO users (id, school_id, email, password_hash, first_name, last_name, role, avatar_emoji) VALUES
    (p1,  v_school_id,'maria.rossi@eltern.de',      v_pw_hash,'Maria','Rossi',       'parent','👩'),
    (p2,  v_school_id,'hans.braun@eltern.de',        v_pw_hash,'Hans','Braun',         'parent','👨'),
    (p3,  v_school_id,'fatima.ali@eltern.de',        v_pw_hash,'Fatima','Ali',          'parent','👩'),
    (p4,  v_school_id,'ralf.vogt@eltern.de',         v_pw_hash,'Ralf','Vogt',           'parent','👨'),
    (p5,  v_school_id,'andrea.fuchs@eltern.de',      v_pw_hash,'Andrea','Fuchs',       'parent','👩'),
    (p6,  v_school_id,'juergen.stern@eltern.de',     v_pw_hash,'Jürgen','Stern',       'parent','👨'),
    (p7,  v_school_id,'yasmin.hassan@eltern.de',     v_pw_hash,'Yasmin','Hassan',      'parent','👩'),
    (p8,  v_school_id,'bettina.kurt@eltern.de',      v_pw_hash,'Bettina','Kurt',        'parent','👩'),
    (p9,  v_school_id,'stefan.simon@eltern.de',      v_pw_hash,'Stefan','Simon',        'parent','👨'),
    (p10, v_school_id,'claudia.schubert@eltern.de',  v_pw_hash,'Claudia','Schubert',   'parent','👩'),
    (p11, v_school_id,'mehmet.yilmaz@eltern.de',     v_pw_hash,'Mehmet','Yilmaz',      'parent','👨'),
    (p12, v_school_id,'katja.patel@eltern.de',       v_pw_hash,'Katja','Patel',         'parent','👩'),
    (p13, v_school_id,'anna.zimmermann@eltern.de',   v_pw_hash,'Anna','Zimmermann',    'parent','👩'),
    (p14, v_school_id,'dirk.gruber@eltern.de',       v_pw_hash,'Dirk','Gruber',         'parent','👨'),
    (p15, v_school_id,'ulrike.held@eltern.de',       v_pw_hash,'Ulrike','Held',          'parent','👩'),
    (p16, v_school_id,'antonio.maier@eltern.de',     v_pw_hash,'Antonio','Maier',       'parent','👨'),
    (p17, v_school_id,'sarah.graf@eltern.de',        v_pw_hash,'Sarah','Graf',           'parent','👩'),
    (p18, v_school_id,'thomas.lorenz@eltern.de',     v_pw_hash,'Thomas','Lorenz',       'parent','👨');

    -- Eltern-Kind-Zuordnungen
    INSERT INTO parent_students (parent_id, student_id, relationship) VALUES
    (p1,  s1a_1,'Mutter'),(p2,  s1a_2,'Vater'),(p3,  s1a_3,'Mutter'),(p4,  s1a_4,'Vater'),
    (p5,  s1b_1,'Mutter'),(p6,  s1b_2,'Vater'),(p7,  s1b_3,'Mutter'),
    (p8,  s2a_1,'Mutter'),(p9,  s2a_2,'Vater'),
    (p10, s2b_1,'Mutter'),
    (p11, s3a_1,'Vater'), (p12, s3a_2,'Mutter'),
    (p13, s3b_1,'Mutter'),(p14, s3b_4,'Vater'),
    (p15, s4a_1,'Mutter'),(p16, s4a_2,'Vater'),
    (p17, s4b_1,'Mutter'),(p18, s4b_2,'Vater');

    -- =====================================================
    -- PAUSENAUFSICHTEN – Hofmann einbinden
    -- =====================================================
    INSERT INTO break_supervisions (school_id, teacher_id, weekday, break_type, location, start_time, end_time) VALUES
    (v_school_id, v_teacher_hofmann, 'Mo', 'grosse_pause', 'Schulhof Ost', '09:35','09:55'),
    (v_school_id, v_teacher_hofmann, 'Do', 'grosse_pause', 'Schulhof Ost', '09:35','09:55');

    -- =====================================================
    -- KONFLIKT-BEREINIGUNG (globale 2. Runde nach Seed 3)
    -- Lehrer dürfen dieselbe Stundennummer pro Wochentag
    -- nur einmal belegen. Priorität: eigene Klasse, sonst alphabetisch.
    -- =====================================================
    WITH ranked AS (
        SELECT
            te.id,
            ROW_NUMBER() OVER (
                PARTITION BY te.teacher_id, te.weekday, te.lesson_number
                ORDER BY
                    CASE WHEN c.class_teacher_id = te.teacher_id THEN 0 ELSE 1 END,
                    c.name ASC
            ) AS rn
        FROM timetable_entries te
        JOIN classes c ON te.class_id = c.id
        WHERE te.teacher_id IS NOT NULL
          AND te.entry_type = 'lesson'
          AND c.school_id = v_school_id
    )
    UPDATE timetable_entries
    SET teacher_id = NULL
    WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

    RAISE NOTICE '✅ Seed 3 erfolgreich!';
    RAISE NOTICE '  Neue Lehrerin: Eva Hofmann  (hofmann@schule.de / test1234)';
    RAISE NOTICE '  Neue Klasse:   4b';
    RAISE NOTICE '  Neue Schüler:  33 (je 4 pro bestehender Klasse, 5 für 4b)';
    RAISE NOTICE '  Neue Eltern:   18';
    RAISE NOTICE '  3b-Stundenplan vollständig korrigiert.';
    RAISE NOTICE '  Lehrerzeit-Konflikte (Seed 3) automatisch bereinigt.';
END $$;
