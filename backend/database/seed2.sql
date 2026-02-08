-- =====================================================
-- SEED DATA Part 2: Stundenpläne für restliche Klassen
-- Klasse 1b, 2b, 3a, 3b
-- =====================================================

DO $$
DECLARE
    v_school_id UUID;
    v_teacher_mueller UUID;
    v_teacher_schmidt UUID;
    v_teacher_weber UUID;
    v_teacher_fischer UUID;
    v_teacher_braun UUID;
    v_class_1b UUID;
    v_class_2b UUID;
    v_class_3a UUID;
    v_class_3b UUID;
    v_sub_deutsch UUID; v_sub_mathe UUID; v_sub_hsu UUID; v_sub_sport UUID;
    v_sub_musik UUID; v_sub_kunst UUID; v_sub_religion UUID; v_sub_englisch UUID;
    v_sub_werken UUID;
    v_room_102 UUID; v_room_104 UUID; v_room_105 UUID; v_room_106 UUID;
    v_room_turnhalle UUID; v_room_musikraum UUID; v_room_werkraum UUID;
    v_admin_id UUID;
BEGIN
    SELECT id INTO v_school_id FROM schools LIMIT 1;

    -- Lehrer IDs
    SELECT id INTO v_teacher_mueller FROM users WHERE email = 'mueller@schule.de';
    SELECT id INTO v_teacher_schmidt FROM users WHERE email = 'schmidt@schule.de';
    SELECT id INTO v_teacher_weber FROM users WHERE email = 'weber@schule.de';
    SELECT id INTO v_teacher_fischer FROM users WHERE email = 'fischer@schule.de';
    SELECT id INTO v_teacher_braun FROM users WHERE email = 'braun@schule.de';
    SELECT id INTO v_admin_id FROM users WHERE email = 'admin@schule.de';

    -- Klassen IDs
    SELECT id INTO v_class_1b FROM classes WHERE name = '1b' AND school_id = v_school_id;
    SELECT id INTO v_class_2b FROM classes WHERE name = '2b' AND school_id = v_school_id;
    SELECT id INTO v_class_3a FROM classes WHERE name = '3a' AND school_id = v_school_id;
    SELECT id INTO v_class_3b FROM classes WHERE name = '3b' AND school_id = v_school_id;

    -- Fächer IDs
    SELECT id INTO v_sub_deutsch FROM subjects WHERE short_name = 'DE' AND school_id = v_school_id;
    SELECT id INTO v_sub_mathe FROM subjects WHERE short_name = 'MA' AND school_id = v_school_id;
    SELECT id INTO v_sub_hsu FROM subjects WHERE short_name = 'HSU' AND school_id = v_school_id;
    SELECT id INTO v_sub_sport FROM subjects WHERE short_name = 'SP' AND school_id = v_school_id;
    SELECT id INTO v_sub_musik FROM subjects WHERE short_name = 'MU' AND school_id = v_school_id;
    SELECT id INTO v_sub_kunst FROM subjects WHERE short_name = 'KU' AND school_id = v_school_id;
    SELECT id INTO v_sub_religion FROM subjects WHERE short_name = 'RE' AND school_id = v_school_id;
    SELECT id INTO v_sub_englisch FROM subjects WHERE short_name = 'EN' AND school_id = v_school_id;
    SELECT id INTO v_sub_werken FROM subjects WHERE short_name = 'WG' AND school_id = v_school_id;

    -- Raum IDs
    SELECT id INTO v_room_102 FROM rooms WHERE name = 'Raum 102' AND school_id = v_school_id;
    SELECT id INTO v_room_104 FROM rooms WHERE name = 'Raum 104' AND school_id = v_school_id;
    SELECT id INTO v_room_105 FROM rooms WHERE name = 'Raum 105' AND school_id = v_school_id;
    SELECT id INTO v_room_106 FROM rooms WHERE name = 'Raum 106' AND school_id = v_school_id;
    SELECT id INTO v_room_turnhalle FROM rooms WHERE name = 'Turnhalle' AND school_id = v_school_id;
    SELECT id INTO v_room_musikraum FROM rooms WHERE name = 'Musikraum' AND school_id = v_school_id;
    SELECT id INTO v_room_werkraum FROM rooms WHERE name = 'Werkraum' AND school_id = v_school_id;

    -- =====================================================
    -- STUNDENPLAN Klasse 1b (Fr. Weber ist Klassenlehrerin)
    -- =====================================================
    INSERT INTO timetable_entries (class_id, teacher_id, subject_id, room_id, weekday, lesson_number, start_time, end_time, entry_type) VALUES
    -- Montag
    (v_class_1b, v_teacher_weber, v_sub_deutsch, v_room_102, 'Mo', 1, '08:00', '08:45', 'lesson'),
    (v_class_1b, v_teacher_weber, v_sub_mathe, v_room_102, 'Mo', 2, '08:50', '09:35', 'lesson'),
    (v_class_1b, NULL, NULL, NULL, 'Mo', 0, '09:35', '09:55', 'break'),
    (v_class_1b, v_teacher_weber, v_sub_deutsch, v_room_102, 'Mo', 3, '09:55', '10:40', 'lesson'),
    (v_class_1b, v_teacher_braun, v_sub_kunst, v_room_102, 'Mo', 4, '10:45', '11:30', 'lesson'),
    -- Dienstag
    (v_class_1b, v_teacher_weber, v_sub_mathe, v_room_102, 'Di', 1, '08:00', '08:45', 'lesson'),
    (v_class_1b, v_teacher_weber, v_sub_deutsch, v_room_102, 'Di', 2, '08:50', '09:35', 'lesson'),
    (v_class_1b, NULL, NULL, NULL, 'Di', 0, '09:35', '09:55', 'break'),
    (v_class_1b, v_teacher_mueller, v_sub_hsu, v_room_102, 'Di', 3, '09:55', '10:40', 'lesson'),
    (v_class_1b, v_teacher_mueller, v_sub_hsu, v_room_102, 'Di', 4, '10:45', '11:30', 'lesson'),
    -- Mittwoch
    (v_class_1b, v_teacher_weber, v_sub_deutsch, v_room_102, 'Mi', 1, '08:00', '08:45', 'lesson'),
    (v_class_1b, v_teacher_weber, v_sub_mathe, v_room_102, 'Mi', 2, '08:50', '09:35', 'lesson'),
    (v_class_1b, NULL, NULL, NULL, 'Mi', 0, '09:35', '09:55', 'break'),
    (v_class_1b, v_teacher_fischer, v_sub_sport, v_room_turnhalle, 'Mi', 3, '09:55', '10:40', 'lesson'),
    (v_class_1b, v_teacher_fischer, v_sub_sport, v_room_turnhalle, 'Mi', 4, '10:45', '11:30', 'lesson'),
    -- Donnerstag
    (v_class_1b, v_teacher_weber, v_sub_deutsch, v_room_102, 'Do', 1, '08:00', '08:45', 'lesson'),
    (v_class_1b, v_teacher_weber, v_sub_mathe, v_room_102, 'Do', 2, '08:50', '09:35', 'lesson'),
    (v_class_1b, NULL, NULL, NULL, 'Do', 0, '09:35', '09:55', 'break'),
    (v_class_1b, v_teacher_braun, v_sub_musik, v_room_musikraum, 'Do', 3, '09:55', '10:40', 'lesson'),
    (v_class_1b, v_teacher_weber, v_sub_religion, v_room_102, 'Do', 4, '10:45', '11:30', 'lesson'),
    -- Freitag
    (v_class_1b, v_teacher_weber, v_sub_mathe, v_room_102, 'Fr', 1, '08:00', '08:45', 'lesson'),
    (v_class_1b, v_teacher_weber, v_sub_deutsch, v_room_102, 'Fr', 2, '08:50', '09:35', 'lesson'),
    (v_class_1b, NULL, NULL, NULL, 'Fr', 0, '09:35', '09:55', 'break'),
    (v_class_1b, v_teacher_braun, v_sub_musik, v_room_musikraum, 'Fr', 3, '09:55', '10:40', 'lesson'),
    (v_class_1b, v_teacher_mueller, v_sub_hsu, v_room_102, 'Fr', 4, '10:45', '11:30', 'lesson');

    -- =====================================================
    -- STUNDENPLAN Klasse 2b (Fr. Braun ist Klassenlehrerin)
    -- =====================================================
    INSERT INTO timetable_entries (class_id, teacher_id, subject_id, room_id, weekday, lesson_number, start_time, end_time, entry_type) VALUES
    -- Montag
    (v_class_2b, v_teacher_braun, v_sub_deutsch, v_room_104, 'Mo', 1, '08:00', '08:45', 'lesson'),
    (v_class_2b, v_teacher_braun, v_sub_deutsch, v_room_104, 'Mo', 2, '08:50', '09:35', 'lesson'),
    (v_class_2b, NULL, NULL, NULL, 'Mo', 0, '09:35', '09:55', 'break'),
    (v_class_2b, v_teacher_weber, v_sub_mathe, v_room_104, 'Mo', 3, '09:55', '10:40', 'lesson'),
    (v_class_2b, v_teacher_weber, v_sub_mathe, v_room_104, 'Mo', 4, '10:45', '11:30', 'lesson'),
    -- Dienstag
    (v_class_2b, v_teacher_braun, v_sub_deutsch, v_room_104, 'Di', 1, '08:00', '08:45', 'lesson'),
    (v_class_2b, v_teacher_weber, v_sub_mathe, v_room_104, 'Di', 2, '08:50', '09:35', 'lesson'),
    (v_class_2b, NULL, NULL, NULL, 'Di', 0, '09:35', '09:55', 'break'),
    (v_class_2b, v_teacher_braun, v_sub_musik, v_room_musikraum, 'Di', 3, '09:55', '10:40', 'lesson'),
    (v_class_2b, v_teacher_mueller, v_sub_hsu, v_room_104, 'Di', 4, '10:45', '11:30', 'lesson'),
    -- Mittwoch
    (v_class_2b, v_teacher_weber, v_sub_mathe, v_room_104, 'Mi', 1, '08:00', '08:45', 'lesson'),
    (v_class_2b, v_teacher_braun, v_sub_deutsch, v_room_104, 'Mi', 2, '08:50', '09:35', 'lesson'),
    (v_class_2b, NULL, NULL, NULL, 'Mi', 0, '09:35', '09:55', 'break'),
    (v_class_2b, v_teacher_fischer, v_sub_sport, v_room_turnhalle, 'Mi', 3, '09:55', '10:40', 'lesson'),
    (v_class_2b, v_teacher_fischer, v_sub_sport, v_room_turnhalle, 'Mi', 4, '10:45', '11:30', 'lesson'),
    -- Donnerstag
    (v_class_2b, v_teacher_braun, v_sub_deutsch, v_room_104, 'Do', 1, '08:00', '08:45', 'lesson'),
    (v_class_2b, v_teacher_weber, v_sub_mathe, v_room_104, 'Do', 2, '08:50', '09:35', 'lesson'),
    (v_class_2b, NULL, NULL, NULL, 'Do', 0, '09:35', '09:55', 'break'),
    (v_class_2b, v_teacher_mueller, v_sub_hsu, v_room_104, 'Do', 3, '09:55', '10:40', 'lesson'),
    (v_class_2b, v_teacher_braun, v_sub_kunst, v_room_104, 'Do', 4, '10:45', '11:30', 'lesson'),
    -- Freitag
    (v_class_2b, v_teacher_braun, v_sub_deutsch, v_room_104, 'Fr', 1, '08:00', '08:45', 'lesson'),
    (v_class_2b, v_teacher_weber, v_sub_mathe, v_room_104, 'Fr', 2, '08:50', '09:35', 'lesson'),
    (v_class_2b, NULL, NULL, NULL, 'Fr', 0, '09:35', '09:55', 'break'),
    (v_class_2b, v_teacher_braun, v_sub_religion, v_room_104, 'Fr', 3, '09:55', '10:40', 'lesson'),
    (v_class_2b, v_teacher_braun, v_sub_musik, v_room_musikraum, 'Fr', 4, '10:45', '11:30', 'lesson');

    -- =====================================================
    -- STUNDENPLAN Klasse 3a (Hr. Fischer ist Klassenlehrer)
    -- =====================================================
    INSERT INTO timetable_entries (class_id, teacher_id, subject_id, room_id, weekday, lesson_number, start_time, end_time, entry_type) VALUES
    -- Montag
    (v_class_3a, v_teacher_fischer, v_sub_hsu, v_room_105, 'Mo', 1, '08:00', '08:45', 'lesson'),
    (v_class_3a, v_teacher_fischer, v_sub_hsu, v_room_105, 'Mo', 2, '08:50', '09:35', 'lesson'),
    (v_class_3a, NULL, NULL, NULL, 'Mo', 0, '09:35', '09:55', 'break'),
    (v_class_3a, v_teacher_schmidt, v_sub_mathe, v_room_105, 'Mo', 3, '09:55', '10:40', 'lesson'),
    (v_class_3a, v_teacher_schmidt, v_sub_deutsch, v_room_105, 'Mo', 4, '10:45', '11:30', 'lesson'),
    (v_class_3a, v_teacher_braun, v_sub_musik, v_room_musikraum, 'Mo', 5, '11:35', '12:20', 'lesson'),
    -- Dienstag
    (v_class_3a, v_teacher_schmidt, v_sub_deutsch, v_room_105, 'Di', 1, '08:00', '08:45', 'lesson'),
    (v_class_3a, v_teacher_schmidt, v_sub_mathe, v_room_105, 'Di', 2, '08:50', '09:35', 'lesson'),
    (v_class_3a, NULL, NULL, NULL, 'Di', 0, '09:35', '09:55', 'break'),
    (v_class_3a, v_teacher_fischer, v_sub_sport, v_room_turnhalle, 'Di', 3, '09:55', '10:40', 'lesson'),
    (v_class_3a, v_teacher_fischer, v_sub_sport, v_room_turnhalle, 'Di', 4, '10:45', '11:30', 'lesson'),
    (v_class_3a, v_teacher_braun, v_sub_kunst, v_room_105, 'Di', 5, '11:35', '12:20', 'lesson'),
    -- Mittwoch
    (v_class_3a, v_teacher_schmidt, v_sub_deutsch, v_room_105, 'Mi', 1, '08:00', '08:45', 'lesson'),
    (v_class_3a, v_teacher_schmidt, v_sub_deutsch, v_room_105, 'Mi', 2, '08:50', '09:35', 'lesson'),
    (v_class_3a, NULL, NULL, NULL, 'Mi', 0, '09:35', '09:55', 'break'),
    (v_class_3a, v_teacher_fischer, v_sub_hsu, v_room_105, 'Mi', 3, '09:55', '10:40', 'lesson'),
    (v_class_3a, v_teacher_mueller, v_sub_englisch, v_room_105, 'Mi', 4, '10:45', '11:30', 'lesson'),
    -- Donnerstag
    (v_class_3a, v_teacher_schmidt, v_sub_mathe, v_room_105, 'Do', 1, '08:00', '08:45', 'lesson'),
    (v_class_3a, v_teacher_schmidt, v_sub_mathe, v_room_105, 'Do', 2, '08:50', '09:35', 'lesson'),
    (v_class_3a, NULL, NULL, NULL, 'Do', 0, '09:35', '09:55', 'break'),
    (v_class_3a, v_teacher_mueller, v_sub_englisch, v_room_105, 'Do', 3, '09:55', '10:40', 'lesson'),
    (v_class_3a, v_teacher_mueller, v_sub_religion, v_room_105, 'Do', 4, '10:45', '11:30', 'lesson'),
    (v_class_3a, v_teacher_fischer, v_sub_hsu, v_room_105, 'Do', 5, '11:35', '12:20', 'lesson'),
    -- Freitag
    (v_class_3a, v_teacher_schmidt, v_sub_deutsch, v_room_105, 'Fr', 1, '08:00', '08:45', 'lesson'),
    (v_class_3a, v_teacher_schmidt, v_sub_mathe, v_room_105, 'Fr', 2, '08:50', '09:35', 'lesson'),
    (v_class_3a, NULL, NULL, NULL, 'Fr', 0, '09:35', '09:55', 'break'),
    (v_class_3a, v_teacher_braun, v_sub_kunst, v_room_105, 'Fr', 3, '09:55', '10:40', 'lesson'),
    (v_class_3a, v_teacher_mueller, v_sub_werken, v_room_werkraum, 'Fr', 4, '10:45', '11:30', 'lesson');

    -- =====================================================
    -- STUNDENPLAN Klasse 3b (Fr. Müller ist Klassenlehrerin)
    -- =====================================================
    INSERT INTO timetable_entries (class_id, teacher_id, subject_id, room_id, weekday, lesson_number, start_time, end_time, entry_type) VALUES
    -- Montag
    (v_class_3b, v_teacher_mueller, v_sub_deutsch, v_room_106, 'Mo', 1, '08:00', '08:45', 'lesson'),
    (v_class_3b, v_teacher_mueller, v_sub_deutsch, v_room_106, 'Mo', 2, '08:50', '09:35', 'lesson'),
    (v_class_3b, NULL, NULL, NULL, 'Mo', 0, '09:35', '09:55', 'break'),
    (v_class_3b, v_teacher_weber, v_sub_mathe, v_room_106, 'Mo', 3, '09:55', '10:40', 'lesson'),
    (v_class_3b, v_teacher_weber, v_sub_mathe, v_room_106, 'Mo', 4, '10:45', '11:30', 'lesson'),
    (v_class_3b, v_teacher_fischer, v_sub_sport, v_room_turnhalle, 'Mo', 5, '11:35', '12:20', 'lesson'),
    -- Dienstag
    (v_class_3b, v_teacher_mueller, v_sub_deutsch, v_room_106, 'Di', 1, '08:00', '08:45', 'lesson'),
    (v_class_3b, v_teacher_weber, v_sub_mathe, v_room_106, 'Di', 2, '08:50', '09:35', 'lesson'),
    (v_class_3b, NULL, NULL, NULL, 'Di', 0, '09:35', '09:55', 'break'),
    (v_class_3b, v_teacher_mueller, v_sub_hsu, v_room_106, 'Di', 3, '09:55', '10:40', 'lesson'),
    (v_class_3b, v_teacher_mueller, v_sub_hsu, v_room_106, 'Di', 4, '10:45', '11:30', 'lesson'),
    (v_class_3b, v_teacher_braun, v_sub_musik, v_room_musikraum, 'Di', 5, '11:35', '12:20', 'lesson'),
    -- Mittwoch
    (v_class_3b, v_teacher_weber, v_sub_mathe, v_room_106, 'Mi', 1, '08:00', '08:45', 'lesson'),
    (v_class_3b, v_teacher_mueller, v_sub_deutsch, v_room_106, 'Mi', 2, '08:50', '09:35', 'lesson'),
    (v_class_3b, NULL, NULL, NULL, 'Mi', 0, '09:35', '09:55', 'break'),
    (v_class_3b, v_teacher_mueller, v_sub_hsu, v_room_106, 'Mi', 3, '09:55', '10:40', 'lesson'),
    (v_class_3b, v_teacher_braun, v_sub_kunst, v_room_106, 'Mi', 4, '10:45', '11:30', 'lesson'),
    -- Donnerstag
    (v_class_3b, v_teacher_mueller, v_sub_deutsch, v_room_106, 'Do', 1, '08:00', '08:45', 'lesson'),
    (v_class_3b, v_teacher_weber, v_sub_mathe, v_room_106, 'Do', 2, '08:50', '09:35', 'lesson'),
    (v_class_3b, NULL, NULL, NULL, 'Do', 0, '09:35', '09:55', 'break'),
    (v_class_3b, v_teacher_mueller, v_sub_religion, v_room_106, 'Do', 3, '09:55', '10:40', 'lesson'),
    (v_class_3b, v_teacher_fischer, v_sub_sport, v_room_turnhalle, 'Do', 4, '10:45', '11:30', 'lesson'),
    (v_class_3b, v_teacher_mueller, v_sub_englisch, v_room_106, 'Do', 5, '11:35', '12:20', 'lesson'),
    -- Freitag
    (v_class_3b, v_teacher_mueller, v_sub_deutsch, v_room_106, 'Fr', 1, '08:00', '08:45', 'lesson'),
    (v_class_3b, v_teacher_weber, v_sub_mathe, v_room_106, 'Fr', 2, '08:50', '09:35', 'lesson'),
    (v_class_3b, NULL, NULL, NULL, 'Fr', 0, '09:35', '09:55', 'break'),
    (v_class_3b, v_teacher_braun, v_sub_musik, v_room_musikraum, 'Fr', 3, '09:55', '10:40', 'lesson'),
    (v_class_3b, v_teacher_mueller, v_sub_werken, v_room_werkraum, 'Fr', 4, '10:45', '11:30', 'lesson');

    -- =====================================================
    -- ZUSÄTZLICHE UNTERRICHTSINHALTE (realistischer)
    -- =====================================================
    -- Klasse 1a - Frau Müller Deutsch
    INSERT INTO lesson_contents (timetable_entry_id, date, topic, description, homework, materials, created_by)
    SELECT te.id, CURRENT_DATE - INTERVAL '4 days', 
           'Buchstabe Sch - Schreiben üben',
           'Wir haben den Buchstaben Sch geschrieben und Wörter damit gesammelt: Schule, Schere, Schaf',
           'Schreibheft S.12: Sch-Wörter abschreiben',
           'Schreibheft, Bleistift',
           v_teacher_mueller
    FROM timetable_entries te
    WHERE te.class_id = (SELECT id FROM classes WHERE name = '1a' AND school_id = v_school_id)
      AND te.weekday = 'Mo' AND te.lesson_number = 1 AND te.entry_type = 'lesson'
    LIMIT 1;

    INSERT INTO lesson_contents (timetable_entry_id, date, topic, description, homework, materials, created_by)
    SELECT te.id, CURRENT_DATE - INTERVAL '3 days',
           'Zahlen bis 20 - Verdoppeln',
           'Wir haben das Verdoppeln geübt: 3+3=6, 4+4=8, 5+5=10',
           'Arbeitsblatt Verdoppeln fertig machen',
           'Mathebuch, Rechenstäbchen',
           v_teacher_weber
    FROM timetable_entries te
    WHERE te.class_id = (SELECT id FROM classes WHERE name = '1a' AND school_id = v_school_id)
      AND te.weekday = 'Di' AND te.lesson_number = 2 AND te.entry_type = 'lesson'
    LIMIT 1;

    -- Klasse 2b - Frau Braun Deutsch
    INSERT INTO lesson_contents (timetable_entry_id, date, topic, description, homework, materials, created_by)
    SELECT te.id, CURRENT_DATE - INTERVAL '2 days',
           'Aufsatz: Mein Wochenende',
           'Jedes Kind hat über sein Wochenende geschrieben. Wir haben Satzanfänge geübt.',
           'Aufsatz in Reinschrift abschreiben',
           'Schreibheft, Textheft',
           v_teacher_braun
    FROM timetable_entries te
    WHERE te.class_id = v_class_2b
      AND te.weekday = 'Mo' AND te.lesson_number = 1 AND te.entry_type = 'lesson'
    LIMIT 1;

    -- Klasse 3a - Hr. Fischer HSU
    INSERT INTO lesson_contents (timetable_entry_id, date, topic, description, homework, materials, created_by)
    SELECT te.id, CURRENT_DATE - INTERVAL '1 day',
           'Der Wasserkreislauf',
           'Wir haben den Wasserkreislauf besprochen: Verdunstung, Wolkenbildung, Regen, Grundwasser',
           'Wasserkreislauf-Plakat vorbereiten (Gruppenarbeit)',
           'HSU-Ordner, Buntstifte, Kleber',
           v_teacher_fischer
    FROM timetable_entries te
    WHERE te.class_id = v_class_3a
      AND te.weekday = 'Mo' AND te.lesson_number = 1 AND te.entry_type = 'lesson'
    LIMIT 1;

    -- Klasse 3a - Sport
    INSERT INTO lesson_contents (timetable_entry_id, date, topic, description, homework, materials, created_by)
    SELECT te.id, CURRENT_DATE - INTERVAL '1 day',
           'Geräteturnen: Rolle vorwärts',
           'Aufwärmen mit Fangspiel, dann Rolle vorwärts an der Turnmatte geübt',
           NULL,
           'Sportkleidung, Turnschuhe',
           v_teacher_fischer
    FROM timetable_entries te
    WHERE te.class_id = v_class_3a
      AND te.weekday = 'Di' AND te.lesson_number = 3 AND te.entry_type = 'lesson'
    LIMIT 1;

    -- =====================================================
    -- ZUSÄTZLICHE NEWS (aktueller und relevanter)
    -- =====================================================
    INSERT INTO news (school_id, class_id, title, content, audience, priority, is_pinned, event_date, event_time, event_location, created_by) VALUES
    -- Aktuelle schulweite News
    (v_school_id, NULL, '🚌 Busplan-Änderung ab 10.02.',
     'Liebe Eltern,\n\nab dem 10. Februar fährt die Buslinie 42 morgens 5 Minuten früher (07:35 statt 07:40). Nachmittags bleibt alles beim Alten.\n\nBitte informiert eure Kinder!',
     'parents', 'important', true, NULL, NULL, NULL, v_admin_id),

    (v_school_id, NULL, '🎭 Theaterbesuch am 25.02.',
     'Am 25. Februar besuchen die Klassen 3a, 3b und 4a das Stadttheater. Aufgeführt wird "Jim Knopf und Lukas der Lokomotivführer".\n\nKosten: 5€ pro Kind\nAbfahrt: 09:00 Uhr am Schulhof\nRückkehr: ca. 12:30 Uhr',
     'all', 'normal', false, '2026-02-25', '09:00', 'Stadttheater', v_teacher_fischer),

    (v_school_id, NULL, '📸 Schulfotograf am 12.02.',
     'Am Donnerstag, den 12. Februar kommt der Schulfotograf! Bitte achtet darauf, dass eure Kinder an diesem Tag ordentlich angezogen sind.\n\nEinzelfotos + Klassenfotos werden gemacht.',
     'all', 'normal', false, '2026-02-12', '08:30', 'Klassenzimmer', v_admin_id),

    -- Klassen-spezifische News
    (v_school_id, v_class_3a, '🏊 Schwimmen ab nächste Woche',
     'Liebe Eltern der 3a,\n\nab nächster Woche findet jeden Mittwoch Schwimmunterricht statt. Bitte packt euren Kindern Folgendes ein:\n- Badeanzug/Badehose\n- Handtuch\n- Badekappe\n- Duschgel\n\nTreffpunkt: 09:50 Uhr am Schulhof',
     'class', 'important', false, CURRENT_DATE + INTERVAL '5 days', '09:50', 'Hallenbad', v_teacher_fischer),

    (v_school_id, v_class_2b, '🎶 Musikprojekt: Unser Klassenlied',
     'In den nächsten Wochen erarbeiten wir unser eigenes Klassenlied! Wer ein Instrument spielen kann, darf es gerne mitbringen. 🎵🎸\n\nAufführung beim Elternabend am 15. März!',
     'class', 'normal', false, NULL, NULL, NULL, v_teacher_braun);

    -- =====================================================
    -- ZUSÄTZLICHE EVENTS
    -- =====================================================
    INSERT INTO events (school_id, class_id, title, description, event_date, start_time, end_time, location, is_mandatory, audience, created_by) VALUES
    (v_school_id, NULL, 'Schulfrei: Lehrerfortbildung', 'An diesem Tag findet kein Unterricht statt.', '2026-03-13', NULL, NULL, NULL, false, 'all', v_admin_id),
    (v_school_id, v_class_3a, 'Klassenausflug 3a: Bauernhof', 'Besuch beim Bauernhof Huber. Festes Schuhwerk und Regenjacke mitbringen!', '2026-03-25', '08:30', '13:00', 'Bauernhof Huber, Feldweg 5', true, 'parents', v_teacher_fischer),
    (v_school_id, v_class_2b, 'Elternabend Klasse 2b', 'Thema: Leseförderung und Klassenfest-Planung', '2026-03-15', '19:00', '20:30', 'Raum 104', true, 'parents', v_teacher_braun);

    -- =====================================================
    -- ZUSÄTZLICHE KRANKMELDUNGEN
    -- =====================================================
    -- Emma Becker (1b) - genehmigt
    INSERT INTO sick_notes (student_id, submitted_by, start_date, end_date, reason, status, reviewed_by, reviewed_at)
    SELECT 
        (SELECT id FROM users WHERE email = 'emma.becker@schule.de'),
        (SELECT id FROM users WHERE email = 'stefan.becker@eltern.de'),
        CURRENT_DATE - INTERVAL '7 days',
        CURRENT_DATE - INTERVAL '5 days',
        'Fieber und Husten',
        'approved',
        v_admin_id,
        CURRENT_DATE - INTERVAL '7 days';

    -- Hannah Jung (2b) - pending
    INSERT INTO sick_notes (student_id, submitted_by, start_date, end_date, reason, status)
    SELECT 
        (SELECT id FROM users WHERE email = 'hannah.jung@schule.de'),
        (SELECT id FROM users WHERE email = 'sandra.jung@eltern.de'),
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '1 day',
        'Zahnarzttermin',
        'pending';

    -- Nele Lang (4a) - pending  
    INSERT INTO sick_notes (student_id, submitted_by, start_date, end_date, reason, status)
    SELECT
        (SELECT id FROM users WHERE email = 'nele.lang@schule.de'),
        (SELECT id FROM users WHERE email = 'lisa.lang@eltern.de'),
        CURRENT_DATE,
        CURRENT_DATE,
        'Bauchschmerzen',
        'pending';

    RAISE NOTICE '✅ Seed-Daten Teil 2 eingefügt (Stundenpläne 1b, 2b, 3a, 3b + Extras)';

END $$;
