-- =====================================================
-- SEED DATA: Dummy-Daten für School-Plan-Kids
-- Passwort für ALLE Benutzer: "test1234"
-- bcrypt hash für "test1234"
-- =====================================================

-- Hash für "test1234" (10 rounds)
-- Generiert mit: bcrypt.hashSync('test1234', 10)
DO $$
DECLARE
    v_school_id UUID;
    v_pw_hash VARCHAR(255) := '$2b$10$K1qojiYxkf4NN/KSd6Aj/OiQ0Pkl59uHj940wA18AXDRBBEm/Gk3S';
    -- Lehrer IDs
    v_teacher_mueller UUID;
    v_teacher_schmidt UUID;
    v_teacher_weber UUID;
    v_teacher_fischer UUID;
    v_teacher_braun UUID;
    -- Klassen IDs
    v_class_1a UUID;
    v_class_1b UUID;
    v_class_2a UUID;
    v_class_2b UUID;
    v_class_3a UUID;
    v_class_3b UUID;
    v_class_4a UUID;
    -- Schüler IDs
    v_student_1 UUID; v_student_2 UUID; v_student_3 UUID; v_student_4 UUID;
    v_student_5 UUID; v_student_6 UUID; v_student_7 UUID; v_student_8 UUID;
    v_student_9 UUID; v_student_10 UUID; v_student_11 UUID; v_student_12 UUID;
    v_student_13 UUID; v_student_14 UUID; v_student_15 UUID; v_student_16 UUID;
    v_student_17 UUID; v_student_18 UUID; v_student_19 UUID; v_student_20 UUID;
    v_student_21 UUID;
    -- Eltern IDs
    v_parent_1 UUID; v_parent_2 UUID; v_parent_3 UUID; v_parent_4 UUID;
    v_parent_5 UUID; v_parent_6 UUID; v_parent_7 UUID; v_parent_8 UUID;
    v_parent_9 UUID; v_parent_10 UUID;
    -- Fächer IDs
    v_sub_deutsch UUID; v_sub_mathe UUID; v_sub_hsu UUID; v_sub_sport UUID;
    v_sub_musik UUID; v_sub_kunst UUID; v_sub_religion UUID; v_sub_englisch UUID;
    v_sub_werken UUID;
    -- Raum IDs
    v_room_101 UUID; v_room_102 UUID; v_room_103 UUID; v_room_104 UUID;
    v_room_105 UUID; v_room_106 UUID; v_room_107 UUID;
    v_room_turnhalle UUID; v_room_musikraum UUID; v_room_werkraum UUID;
    -- Admin ID
    v_admin_id UUID;
    -- Timetable Entry IDs (für Vertretungen und Unterrichtsinhalte)
    v_tt_1 UUID; v_tt_2 UUID; v_tt_3 UUID; v_tt_4 UUID; v_tt_5 UUID;
BEGIN
    -- Schule holen
    SELECT id INTO v_school_id FROM schools LIMIT 1;

    -- Fächer IDs holen
    SELECT id INTO v_sub_deutsch FROM subjects WHERE short_name = 'DE' AND school_id = v_school_id;
    SELECT id INTO v_sub_mathe FROM subjects WHERE short_name = 'MA' AND school_id = v_school_id;
    SELECT id INTO v_sub_hsu FROM subjects WHERE short_name = 'HSU' AND school_id = v_school_id;
    SELECT id INTO v_sub_sport FROM subjects WHERE short_name = 'SP' AND school_id = v_school_id;
    SELECT id INTO v_sub_musik FROM subjects WHERE short_name = 'MU' AND school_id = v_school_id;
    SELECT id INTO v_sub_kunst FROM subjects WHERE short_name = 'KU' AND school_id = v_school_id;
    SELECT id INTO v_sub_religion FROM subjects WHERE short_name = 'RE' AND school_id = v_school_id;
    SELECT id INTO v_sub_englisch FROM subjects WHERE short_name = 'EN' AND school_id = v_school_id;
    SELECT id INTO v_sub_werken FROM subjects WHERE short_name = 'WG' AND school_id = v_school_id;

    -- Admin ID holen
    SELECT id INTO v_admin_id FROM users WHERE role = 'admin' AND school_id = v_school_id LIMIT 1;

    -- =====================================================
    -- RÄUME
    -- =====================================================
    v_room_101 := uuid_generate_v4();
    v_room_102 := uuid_generate_v4();
    v_room_103 := uuid_generate_v4();
    v_room_104 := uuid_generate_v4();
    v_room_105 := uuid_generate_v4();
    v_room_106 := uuid_generate_v4();
    v_room_107 := uuid_generate_v4();
    v_room_turnhalle := uuid_generate_v4();
    v_room_musikraum := uuid_generate_v4();
    v_room_werkraum := uuid_generate_v4();

    INSERT INTO rooms (id, school_id, name, building, capacity) VALUES
    (v_room_101, v_school_id, 'Raum 101', 'Hauptgebäude', 28),
    (v_room_102, v_school_id, 'Raum 102', 'Hauptgebäude', 28),
    (v_room_103, v_school_id, 'Raum 103', 'Hauptgebäude', 30),
    (v_room_104, v_school_id, 'Raum 104', 'Hauptgebäude', 28),
    (v_room_105, v_school_id, 'Raum 105', 'Neubau', 25),
    (v_room_106, v_school_id, 'Raum 106', 'Neubau', 25),
    (v_room_107, v_school_id, 'Raum 107', 'Neubau', 30),
    (v_room_turnhalle, v_school_id, 'Turnhalle', 'Sporthalle', 60),
    (v_room_musikraum, v_school_id, 'Musikraum', 'Hauptgebäude', 30),
    (v_room_werkraum, v_school_id, 'Werkraum', 'Neubau', 20);

    -- =====================================================
    -- LEHRER (Passwort: test1234)
    -- =====================================================
    v_teacher_mueller := uuid_generate_v4();
    v_teacher_schmidt := uuid_generate_v4();
    v_teacher_weber := uuid_generate_v4();
    v_teacher_fischer := uuid_generate_v4();
    v_teacher_braun := uuid_generate_v4();

    INSERT INTO users (id, school_id, email, password_hash, first_name, last_name, role, avatar_emoji) VALUES
    (v_teacher_mueller, v_school_id, 'mueller@schule.de', v_pw_hash, 'Maria', 'Müller', 'teacher', '👩‍🏫'),
    (v_teacher_schmidt, v_school_id, 'schmidt@schule.de', v_pw_hash, 'Thomas', 'Schmidt', 'teacher', '👨‍🏫'),
    (v_teacher_weber, v_school_id, 'weber@schule.de', v_pw_hash, 'Sabine', 'Weber', 'teacher', '🌟'),
    (v_teacher_fischer, v_school_id, 'fischer@schule.de', v_pw_hash, 'Klaus', 'Fischer', 'teacher', '⚽'),
    (v_teacher_braun, v_school_id, 'braun@schule.de', v_pw_hash, 'Anna', 'Braun', 'teacher', '🎵');

    -- =====================================================
    -- KLASSEN
    -- =====================================================
    v_class_1a := uuid_generate_v4();
    v_class_1b := uuid_generate_v4();
    v_class_2a := uuid_generate_v4();
    v_class_2b := uuid_generate_v4();
    v_class_3a := uuid_generate_v4();
    v_class_3b := uuid_generate_v4();
    v_class_4a := uuid_generate_v4();

    INSERT INTO classes (id, school_id, name, grade_level, school_year, class_teacher_id) VALUES
    (v_class_1a, v_school_id, '1a', 1, '2025/2026', v_teacher_mueller),
    (v_class_1b, v_school_id, '1b', 1, '2025/2026', v_teacher_weber),
    (v_class_2a, v_school_id, '2a', 2, '2025/2026', v_teacher_schmidt),
    (v_class_2b, v_school_id, '2b', 2, '2025/2026', v_teacher_braun),
    (v_class_3a, v_school_id, '3a', 3, '2025/2026', v_teacher_fischer),
    (v_class_3b, v_school_id, '3b', 3, '2025/2026', v_teacher_mueller),
    (v_class_4a, v_school_id, '4a', 4, '2025/2026', v_teacher_schmidt);

    -- =====================================================
    -- SCHÜLER (Passwort: test1234)
    -- =====================================================
    v_student_1 := uuid_generate_v4();  v_student_2 := uuid_generate_v4();
    v_student_3 := uuid_generate_v4();  v_student_4 := uuid_generate_v4();
    v_student_5 := uuid_generate_v4();  v_student_6 := uuid_generate_v4();
    v_student_7 := uuid_generate_v4();  v_student_8 := uuid_generate_v4();
    v_student_9 := uuid_generate_v4();  v_student_10 := uuid_generate_v4();
    v_student_11 := uuid_generate_v4(); v_student_12 := uuid_generate_v4();
    v_student_13 := uuid_generate_v4(); v_student_14 := uuid_generate_v4();
    v_student_15 := uuid_generate_v4(); v_student_16 := uuid_generate_v4();
    v_student_17 := uuid_generate_v4(); v_student_18 := uuid_generate_v4();
    v_student_19 := uuid_generate_v4(); v_student_20 := uuid_generate_v4();
    v_student_21 := uuid_generate_v4();

    INSERT INTO users (id, school_id, email, password_hash, first_name, last_name, role, avatar_emoji) VALUES
    -- Klasse 1a
    (v_student_1, v_school_id, 'leon.klein@schule.de', v_pw_hash, 'Leon', 'Klein', 'student', '🦊'),
    (v_student_2, v_school_id, 'mia.hofmann@schule.de', v_pw_hash, 'Mia', 'Hofmann', 'student', '🦄'),
    (v_student_3, v_school_id, 'noah.richter@schule.de', v_pw_hash, 'Noah', 'Richter', 'student', '🐶'),
    -- Klasse 1b
    (v_student_4, v_school_id, 'emma.becker@schule.de', v_pw_hash, 'Emma', 'Becker', 'student', '🐱'),
    (v_student_5, v_school_id, 'finn.wolf@schule.de', v_pw_hash, 'Finn', 'Wolf', 'student', '🦁'),
    (v_student_6, v_school_id, 'lina.schaefer@schule.de', v_pw_hash, 'Lina', 'Schäfer', 'student', '🐰'),
    -- Klasse 2a
    (v_student_7, v_school_id, 'ben.wagner@schule.de', v_pw_hash, 'Ben', 'Wagner', 'student', '⭐'),
    (v_student_8, v_school_id, 'sophie.meyer@schule.de', v_pw_hash, 'Sophie', 'Meyer', 'student', '🌈'),
    (v_student_9, v_school_id, 'paul.schuster@schule.de', v_pw_hash, 'Paul', 'Schuster', 'student', '🎨'),
    -- Klasse 2b
    (v_student_10, v_school_id, 'hannah.jung@schule.de', v_pw_hash, 'Hannah', 'Jung', 'student', '📚'),
    (v_student_11, v_school_id, 'elias.frank@schule.de', v_pw_hash, 'Elias', 'Frank', 'student', '⚽'),
    (v_student_12, v_school_id, 'lena.krause@schule.de', v_pw_hash, 'Lena', 'Krause', 'student', '🎵'),
    -- Klasse 3a
    (v_student_13, v_school_id, 'lukas.baumann@schule.de', v_pw_hash, 'Lukas', 'Baumann', 'student', '🦊'),
    (v_student_14, v_school_id, 'marie.winter@schule.de', v_pw_hash, 'Marie', 'Winter', 'student', '🌟'),
    (v_student_15, v_school_id, 'max.sommer@schule.de', v_pw_hash, 'Max', 'Sommer', 'student', '😊'),
    -- Klasse 3b
    (v_student_16, v_school_id, 'anna.berger@schule.de', v_pw_hash, 'Anna', 'Berger', 'student', '🦄'),
    (v_student_17, v_school_id, 'jonas.otto@schule.de', v_pw_hash, 'Jonas', 'Otto', 'student', '🐶'),
    (v_student_18, v_school_id, 'clara.koenig@schule.de', v_pw_hash, 'Clara', 'König', 'student', '🐱'),
    -- Klasse 4a
    (v_student_19, v_school_id, 'tim.hartmann@schule.de', v_pw_hash, 'Tim', 'Hartmann', 'student', '🦁'),
    (v_student_20, v_school_id, 'nele.lang@schule.de', v_pw_hash, 'Nele', 'Lang', 'student', '🐰'),
    (v_student_21, v_school_id, 'david.neumann@schule.de', v_pw_hash, 'David', 'Neumann', 'student', '⭐');

    -- Schüler den Klassen zuordnen
    INSERT INTO student_classes (student_id, class_id, school_year) VALUES
    -- 1a
    (v_student_1, v_class_1a, '2025/2026'), (v_student_2, v_class_1a, '2025/2026'), (v_student_3, v_class_1a, '2025/2026'),
    -- 1b
    (v_student_4, v_class_1b, '2025/2026'), (v_student_5, v_class_1b, '2025/2026'), (v_student_6, v_class_1b, '2025/2026'),
    -- 2a
    (v_student_7, v_class_2a, '2025/2026'), (v_student_8, v_class_2a, '2025/2026'), (v_student_9, v_class_2a, '2025/2026'),
    -- 2b
    (v_student_10, v_class_2b, '2025/2026'), (v_student_11, v_class_2b, '2025/2026'), (v_student_12, v_class_2b, '2025/2026'),
    -- 3a
    (v_student_13, v_class_3a, '2025/2026'), (v_student_14, v_class_3a, '2025/2026'), (v_student_15, v_class_3a, '2025/2026'),
    -- 3b
    (v_student_16, v_class_3b, '2025/2026'), (v_student_17, v_class_3b, '2025/2026'), (v_student_18, v_class_3b, '2025/2026'),
    -- 4a
    (v_student_19, v_class_4a, '2025/2026'), (v_student_20, v_class_4a, '2025/2026'), (v_student_21, v_class_4a, '2025/2026');

    -- =====================================================
    -- ELTERN (Passwort: test1234)
    -- =====================================================
    v_parent_1 := uuid_generate_v4();  v_parent_2 := uuid_generate_v4();
    v_parent_3 := uuid_generate_v4();  v_parent_4 := uuid_generate_v4();
    v_parent_5 := uuid_generate_v4();  v_parent_6 := uuid_generate_v4();
    v_parent_7 := uuid_generate_v4();  v_parent_8 := uuid_generate_v4();
    v_parent_9 := uuid_generate_v4();  v_parent_10 := uuid_generate_v4();

    INSERT INTO users (id, school_id, email, password_hash, first_name, last_name, role, avatar_emoji) VALUES
    (v_parent_1, v_school_id, 'peter.klein@eltern.de', v_pw_hash, 'Peter', 'Klein', 'parent', '👨‍💼'),
    (v_parent_2, v_school_id, 'claudia.hofmann@eltern.de', v_pw_hash, 'Claudia', 'Hofmann', 'parent', '👩'),
    (v_parent_3, v_school_id, 'stefan.becker@eltern.de', v_pw_hash, 'Stefan', 'Becker', 'parent', '👨'),
    (v_parent_4, v_school_id, 'martina.wagner@eltern.de', v_pw_hash, 'Martina', 'Wagner', 'parent', '👩'),
    (v_parent_5, v_school_id, 'markus.meyer@eltern.de', v_pw_hash, 'Markus', 'Meyer', 'parent', '👨'),
    (v_parent_6, v_school_id, 'sandra.jung@eltern.de', v_pw_hash, 'Sandra', 'Jung', 'parent', '👩'),
    (v_parent_7, v_school_id, 'michael.baumann@eltern.de', v_pw_hash, 'Michael', 'Baumann', 'parent', '👨'),
    (v_parent_8, v_school_id, 'katrin.berger@eltern.de', v_pw_hash, 'Katrin', 'Berger', 'parent', '👩'),
    (v_parent_9, v_school_id, 'thomas.hartmann@eltern.de', v_pw_hash, 'Thomas', 'Hartmann', 'parent', '👨'),
    (v_parent_10, v_school_id, 'lisa.lang@eltern.de', v_pw_hash, 'Lisa', 'Lang', 'parent', '👩');

    -- Eltern-Kind Zuordnungen
    INSERT INTO parent_students (parent_id, student_id, relationship) VALUES
    (v_parent_1, v_student_1, 'Vater'),       -- Peter Klein -> Leon Klein
    (v_parent_2, v_student_2, 'Mutter'),       -- Claudia Hofmann -> Mia Hofmann
    (v_parent_3, v_student_4, 'Vater'),        -- Stefan Becker -> Emma Becker
    (v_parent_4, v_student_7, 'Mutter'),       -- Martina Wagner -> Ben Wagner
    (v_parent_4, v_student_8, 'Mutter'),       -- Martina Wagner -> Sophie Meyer (Patchwork)
    (v_parent_5, v_student_8, 'Vater'),        -- Markus Meyer -> Sophie Meyer
    (v_parent_6, v_student_10, 'Mutter'),      -- Sandra Jung -> Hannah Jung
    (v_parent_7, v_student_13, 'Vater'),       -- Michael Baumann -> Lukas Baumann
    (v_parent_8, v_student_16, 'Mutter'),      -- Katrin Berger -> Anna Berger
    (v_parent_9, v_student_19, 'Vater'),       -- Thomas Hartmann -> Tim Hartmann
    (v_parent_10, v_student_20, 'Mutter');     -- Lisa Lang -> Nele Lang

    -- =====================================================
    -- LEHRER-KLASSEN-ZUORDNUNG (wer unterrichtet was wo)
    -- =====================================================
    INSERT INTO teacher_classes (teacher_id, class_id, subject) VALUES
    -- Frau Müller: Klassenlehrerin 1a + 3b, unterrichtet Deutsch & HSU
    (v_teacher_mueller, v_class_1a, 'Deutsch'),
    (v_teacher_mueller, v_class_1a, 'HSU'),
    (v_teacher_mueller, v_class_3b, 'Deutsch'),
    (v_teacher_mueller, v_class_3b, 'HSU'),
    -- Herr Schmidt: Klassenlehrer 2a + 4a, unterrichtet Mathe & Deutsch
    (v_teacher_schmidt, v_class_2a, 'Mathematik'),
    (v_teacher_schmidt, v_class_2a, 'Deutsch'),
    (v_teacher_schmidt, v_class_4a, 'Mathematik'),
    (v_teacher_schmidt, v_class_4a, 'Deutsch'),
    -- Frau Weber: Klassenlehrerin 1b, unterrichtet Deutsch & Mathe
    (v_teacher_weber, v_class_1b, 'Deutsch'),
    (v_teacher_weber, v_class_1b, 'Mathematik'),
    (v_teacher_weber, v_class_2b, 'Mathematik'),
    -- Herr Fischer: Klassenlehrer 3a, unterrichtet Sport überall + HSU
    (v_teacher_fischer, v_class_3a, 'HSU'),
    (v_teacher_fischer, v_class_3a, 'Sport'),
    (v_teacher_fischer, v_class_1a, 'Sport'),
    (v_teacher_fischer, v_class_1b, 'Sport'),
    (v_teacher_fischer, v_class_2a, 'Sport'),
    (v_teacher_fischer, v_class_4a, 'Sport'),
    -- Frau Braun: Klassenlehrerin 2b, Musik & Kunst
    (v_teacher_braun, v_class_2b, 'Deutsch'),
    (v_teacher_braun, v_class_2b, 'Musik'),
    (v_teacher_braun, v_class_1a, 'Musik'),
    (v_teacher_braun, v_class_1b, 'Musik'),
    (v_teacher_braun, v_class_3a, 'Musik'),
    (v_teacher_braun, v_class_3a, 'Kunst');

    -- =====================================================
    -- STUNDENPLAN für Klasse 2a (vollständig, Mo-Fr)
    -- =====================================================
    v_tt_1 := uuid_generate_v4(); v_tt_2 := uuid_generate_v4();
    v_tt_3 := uuid_generate_v4(); v_tt_4 := uuid_generate_v4();
    v_tt_5 := uuid_generate_v4();

    INSERT INTO timetable_entries (id, class_id, teacher_id, subject_id, room_id, weekday, lesson_number, start_time, end_time, entry_type) VALUES
    -- === MONTAG ===
    (v_tt_1, v_class_2a, v_teacher_schmidt, v_sub_deutsch, v_room_103, 'Mo', 1, '08:00', '08:45', 'lesson'),
    (uuid_generate_v4(), v_class_2a, v_teacher_schmidt, v_sub_mathe, v_room_103, 'Mo', 2, '08:50', '09:35', 'lesson'),
    (uuid_generate_v4(), v_class_2a, NULL, NULL, NULL, 'Mo', 0, '09:35', '09:55', 'break'),
    (v_tt_2, v_class_2a, v_teacher_fischer, v_sub_sport, v_room_turnhalle, 'Mo', 3, '09:55', '10:40', 'lesson'),
    (uuid_generate_v4(), v_class_2a, v_teacher_fischer, v_sub_sport, v_room_turnhalle, 'Mo', 4, '10:45', '11:30', 'lesson'),
    -- === DIENSTAG ===
    (v_tt_3, v_class_2a, v_teacher_schmidt, v_sub_mathe, v_room_103, 'Di', 1, '08:00', '08:45', 'lesson'),
    (uuid_generate_v4(), v_class_2a, v_teacher_schmidt, v_sub_deutsch, v_room_103, 'Di', 2, '08:50', '09:35', 'lesson'),
    (uuid_generate_v4(), v_class_2a, NULL, NULL, NULL, 'Di', 0, '09:35', '09:55', 'break'),
    (uuid_generate_v4(), v_class_2a, v_teacher_braun, v_sub_musik, v_room_musikraum, 'Di', 3, '09:55', '10:40', 'lesson'),
    (uuid_generate_v4(), v_class_2a, v_teacher_weber, v_sub_mathe, v_room_103, 'Di', 4, '10:45', '11:30', 'lesson'),
    -- === MITTWOCH ===
    (uuid_generate_v4(), v_class_2a, v_teacher_schmidt, v_sub_deutsch, v_room_103, 'Mi', 1, '08:00', '08:45', 'lesson'),
    (uuid_generate_v4(), v_class_2a, v_teacher_schmidt, v_sub_mathe, v_room_103, 'Mi', 2, '08:50', '09:35', 'lesson'),
    (uuid_generate_v4(), v_class_2a, NULL, NULL, NULL, 'Mi', 0, '09:35', '09:55', 'break'),
    (v_tt_4, v_class_2a, v_teacher_schmidt, v_sub_hsu, v_room_103, 'Mi', 3, '09:55', '10:40', 'lesson'),
    (uuid_generate_v4(), v_class_2a, v_teacher_schmidt, v_sub_hsu, v_room_103, 'Mi', 4, '10:45', '11:30', 'lesson'),
    -- === DONNERSTAG ===
    (uuid_generate_v4(), v_class_2a, v_teacher_schmidt, v_sub_deutsch, v_room_103, 'Do', 1, '08:00', '08:45', 'lesson'),
    (uuid_generate_v4(), v_class_2a, v_teacher_schmidt, v_sub_mathe, v_room_103, 'Do', 2, '08:50', '09:35', 'lesson'),
    (uuid_generate_v4(), v_class_2a, NULL, NULL, NULL, 'Do', 0, '09:35', '09:55', 'break'),
    (uuid_generate_v4(), v_class_2a, v_teacher_braun, v_sub_kunst, v_room_103, 'Do', 3, '09:55', '10:40', 'lesson'),
    (v_tt_5, v_class_2a, v_teacher_braun, v_sub_kunst, v_room_103, 'Do', 4, '10:45', '11:30', 'lesson'),
    -- === FREITAG ===
    (uuid_generate_v4(), v_class_2a, v_teacher_schmidt, v_sub_deutsch, v_room_103, 'Fr', 1, '08:00', '08:45', 'lesson'),
    (uuid_generate_v4(), v_class_2a, v_teacher_weber, v_sub_mathe, v_room_103, 'Fr', 2, '08:50', '09:35', 'lesson'),
    (uuid_generate_v4(), v_class_2a, NULL, NULL, NULL, 'Fr', 0, '09:35', '09:55', 'break'),
    (uuid_generate_v4(), v_class_2a, v_teacher_weber, v_sub_religion, v_room_103, 'Fr', 3, '09:55', '10:40', 'lesson'),
    (uuid_generate_v4(), v_class_2a, v_teacher_braun, v_sub_musik, v_room_musikraum, 'Fr', 4, '10:45', '11:30', 'lesson');

    -- =====================================================
    -- STUNDENPLAN für Klasse 1a (Mo-Fr)
    -- =====================================================
    INSERT INTO timetable_entries (class_id, teacher_id, subject_id, room_id, weekday, lesson_number, start_time, end_time, entry_type) VALUES
    -- Montag
    (v_class_1a, v_teacher_mueller, v_sub_deutsch, v_room_101, 'Mo', 1, '08:00', '08:45', 'lesson'),
    (v_class_1a, v_teacher_mueller, v_sub_deutsch, v_room_101, 'Mo', 2, '08:50', '09:35', 'lesson'),
    (v_class_1a, NULL, NULL, NULL, 'Mo', 0, '09:35', '09:55', 'break'),
    (v_class_1a, v_teacher_mueller, v_sub_hsu, v_room_101, 'Mo', 3, '09:55', '10:40', 'lesson'),
    (v_class_1a, v_teacher_braun, v_sub_musik, v_room_musikraum, 'Mo', 4, '10:45', '11:30', 'lesson'),
    -- Dienstag
    (v_class_1a, v_teacher_mueller, v_sub_deutsch, v_room_101, 'Di', 1, '08:00', '08:45', 'lesson'),
    (v_class_1a, v_teacher_weber, v_sub_mathe, v_room_101, 'Di', 2, '08:50', '09:35', 'lesson'),
    (v_class_1a, NULL, NULL, NULL, 'Di', 0, '09:35', '09:55', 'break'),
    (v_class_1a, v_teacher_fischer, v_sub_sport, v_room_turnhalle, 'Di', 3, '09:55', '10:40', 'lesson'),
    (v_class_1a, v_teacher_fischer, v_sub_sport, v_room_turnhalle, 'Di', 4, '10:45', '11:30', 'lesson'),
    -- Mittwoch
    (v_class_1a, v_teacher_weber, v_sub_mathe, v_room_101, 'Mi', 1, '08:00', '08:45', 'lesson'),
    (v_class_1a, v_teacher_weber, v_sub_mathe, v_room_101, 'Mi', 2, '08:50', '09:35', 'lesson'),
    (v_class_1a, NULL, NULL, NULL, 'Mi', 0, '09:35', '09:55', 'break'),
    (v_class_1a, v_teacher_mueller, v_sub_hsu, v_room_101, 'Mi', 3, '09:55', '10:40', 'lesson'),
    (v_class_1a, v_teacher_mueller, v_sub_deutsch, v_room_101, 'Mi', 4, '10:45', '11:30', 'lesson'),
    -- Donnerstag
    (v_class_1a, v_teacher_mueller, v_sub_deutsch, v_room_101, 'Do', 1, '08:00', '08:45', 'lesson'),
    (v_class_1a, v_teacher_weber, v_sub_mathe, v_room_101, 'Do', 2, '08:50', '09:35', 'lesson'),
    (v_class_1a, NULL, NULL, NULL, 'Do', 0, '09:35', '09:55', 'break'),
    (v_class_1a, v_teacher_braun, v_sub_kunst, v_room_101, 'Do', 3, '09:55', '10:40', 'lesson'),
    (v_class_1a, v_teacher_mueller, v_sub_religion, v_room_101, 'Do', 4, '10:45', '11:30', 'lesson'),
    -- Freitag
    (v_class_1a, v_teacher_mueller, v_sub_deutsch, v_room_101, 'Fr', 1, '08:00', '08:45', 'lesson'),
    (v_class_1a, v_teacher_weber, v_sub_mathe, v_room_101, 'Fr', 2, '08:50', '09:35', 'lesson'),
    (v_class_1a, NULL, NULL, NULL, 'Fr', 0, '09:35', '09:55', 'break'),
    (v_class_1a, v_teacher_braun, v_sub_musik, v_room_musikraum, 'Fr', 3, '09:55', '10:40', 'lesson'),
    (v_class_1a, v_teacher_mueller, v_sub_hsu, v_room_101, 'Fr', 4, '10:45', '11:30', 'lesson');

    -- =====================================================
    -- STUNDENPLAN für Klasse 4a (Mo-Fr)
    -- =====================================================
    INSERT INTO timetable_entries (class_id, teacher_id, subject_id, room_id, weekday, lesson_number, start_time, end_time, entry_type) VALUES
    -- Montag
    (v_class_4a, v_teacher_schmidt, v_sub_deutsch, v_room_107, 'Mo', 1, '08:00', '08:45', 'lesson'),
    (v_class_4a, v_teacher_schmidt, v_sub_mathe, v_room_107, 'Mo', 2, '08:50', '09:35', 'lesson'),
    (v_class_4a, NULL, NULL, NULL, 'Mo', 0, '09:35', '09:55', 'break'),
    (v_class_4a, v_teacher_schmidt, v_sub_deutsch, v_room_107, 'Mo', 3, '09:55', '10:40', 'lesson'),
    (v_class_4a, v_teacher_fischer, v_sub_sport, v_room_turnhalle, 'Mo', 4, '10:45', '11:30', 'lesson'),
    (v_class_4a, v_teacher_fischer, v_sub_sport, v_room_turnhalle, 'Mo', 5, '11:35', '12:20', 'lesson'),
    -- Dienstag
    (v_class_4a, v_teacher_schmidt, v_sub_mathe, v_room_107, 'Di', 1, '08:00', '08:45', 'lesson'),
    (v_class_4a, v_teacher_schmidt, v_sub_mathe, v_room_107, 'Di', 2, '08:50', '09:35', 'lesson'),
    (v_class_4a, NULL, NULL, NULL, 'Di', 0, '09:35', '09:55', 'break'),
    (v_class_4a, v_teacher_mueller, v_sub_englisch, v_room_107, 'Di', 3, '09:55', '10:40', 'lesson'),
    (v_class_4a, v_teacher_mueller, v_sub_hsu, v_room_107, 'Di', 4, '10:45', '11:30', 'lesson'),
    (v_class_4a, v_teacher_mueller, v_sub_hsu, v_room_107, 'Di', 5, '11:35', '12:20', 'lesson'),
    -- Mittwoch
    (v_class_4a, v_teacher_schmidt, v_sub_deutsch, v_room_107, 'Mi', 1, '08:00', '08:45', 'lesson'),
    (v_class_4a, v_teacher_schmidt, v_sub_deutsch, v_room_107, 'Mi', 2, '08:50', '09:35', 'lesson'),
    (v_class_4a, NULL, NULL, NULL, 'Mi', 0, '09:35', '09:55', 'break'),
    (v_class_4a, v_teacher_braun, v_sub_musik, v_room_musikraum, 'Mi', 3, '09:55', '10:40', 'lesson'),
    (v_class_4a, v_teacher_braun, v_sub_kunst, v_room_107, 'Mi', 4, '10:45', '11:30', 'lesson'),
    -- Donnerstag
    (v_class_4a, v_teacher_schmidt, v_sub_mathe, v_room_107, 'Do', 1, '08:00', '08:45', 'lesson'),
    (v_class_4a, v_teacher_schmidt, v_sub_deutsch, v_room_107, 'Do', 2, '08:50', '09:35', 'lesson'),
    (v_class_4a, NULL, NULL, NULL, 'Do', 0, '09:35', '09:55', 'break'),
    (v_class_4a, v_teacher_mueller, v_sub_englisch, v_room_107, 'Do', 3, '09:55', '10:40', 'lesson'),
    (v_class_4a, v_teacher_schmidt, v_sub_religion, v_room_107, 'Do', 4, '10:45', '11:30', 'lesson'),
    -- Freitag
    (v_class_4a, v_teacher_schmidt, v_sub_deutsch, v_room_107, 'Fr', 1, '08:00', '08:45', 'lesson'),
    (v_class_4a, v_teacher_schmidt, v_sub_mathe, v_room_107, 'Fr', 2, '08:50', '09:35', 'lesson'),
    (v_class_4a, NULL, NULL, NULL, 'Fr', 0, '09:35', '09:55', 'break'),
    (v_class_4a, v_teacher_schmidt, v_sub_werken, v_room_werkraum, 'Fr', 3, '09:55', '10:40', 'lesson'),
    (v_class_4a, v_teacher_schmidt, v_sub_werken, v_room_werkraum, 'Fr', 4, '10:45', '11:30', 'lesson');

    -- =====================================================
    -- VERTRETUNGEN (nächste Tage)
    -- =====================================================
    INSERT INTO substitutions (original_entry_id, substitute_teacher_id, substitute_subject_id, substitute_room_id, date, reason, note_for_students, is_cancelled, created_by) VALUES
    -- Herr Schmidt ist krank -> Frau Weber übernimmt Mathe
    (v_tt_3, v_teacher_weber, v_sub_mathe, v_room_103, CURRENT_DATE + INTERVAL '1 day', 'Herr Schmidt ist erkrankt', 'Frau Weber macht heute Mathe mit euch! 📚', false, v_admin_id),
    -- Sport fällt aus
    (v_tt_2, NULL, NULL, NULL, CURRENT_DATE + INTERVAL '2 days', 'Turnhalle wegen Veranstaltung gesperrt', 'Sport fällt leider aus 😔', true, v_admin_id),
    -- HSU vertretung
    (v_tt_4, v_teacher_fischer, v_sub_hsu, v_room_103, CURRENT_DATE + INTERVAL '3 days', 'Frau Müller auf Fortbildung', 'Herr Fischer macht heute HSU! 🌍', false, v_admin_id);

    -- =====================================================
    -- UNTERRICHTSINHALTE
    -- =====================================================
    INSERT INTO lesson_contents (timetable_entry_id, date, topic, description, homework, materials, created_by) VALUES
    (v_tt_1, CURRENT_DATE - INTERVAL '1 day', 'Buchstabe Sch', 'Wir haben den Buchstaben "Sch" gelernt und Wörter gesucht', 'Arbeitsblatt S.15 fertig machen', 'Lesebuch, Schreibheft', v_teacher_schmidt),
    (v_tt_3, CURRENT_DATE - INTERVAL '2 days', 'Einmaleins mit 3', 'Wir üben die 3er-Reihe', '3er-Reihe 5x aufschreiben', 'Matheheft, Buntstifte', v_teacher_schmidt),
    (v_tt_4, CURRENT_DATE - INTERVAL '3 days', 'Der Igel', 'Wir haben über den Igel im Winter gelernt', 'Igel-Bild ausmalen', 'HSU-Ordner', v_teacher_schmidt),
    (v_tt_5, CURRENT_DATE - INTERVAL '1 day', 'Herbstbild', 'Wir malen ein Herbstbild mit Wasserfarben', NULL, 'Wasserfarben, Pinsel, Malkittel', v_teacher_braun),
    (v_tt_1, CURRENT_DATE, 'Leseübung: Der kleine Bär', 'Gemeinsames Lesen und Nacherzählen', 'Geschichte zu Ende lesen', 'Lesebuch S.22-24', v_teacher_schmidt);

    -- =====================================================
    -- PAUSENAUFSICHTEN
    -- =====================================================
    INSERT INTO break_supervisions (school_id, teacher_id, weekday, break_type, location, start_time, end_time) VALUES
    (v_school_id, v_teacher_mueller, 'Mo', 'grosse_pause', 'Schulhof Nord', '09:35', '09:55'),
    (v_school_id, v_teacher_schmidt, 'Mo', 'grosse_pause', 'Schulhof Süd', '09:35', '09:55'),
    (v_school_id, v_teacher_weber, 'Di', 'grosse_pause', 'Schulhof Nord', '09:35', '09:55'),
    (v_school_id, v_teacher_fischer, 'Di', 'grosse_pause', 'Schulhof Süd', '09:35', '09:55'),
    (v_school_id, v_teacher_braun, 'Mi', 'grosse_pause', 'Schulhof Nord', '09:35', '09:55'),
    (v_school_id, v_teacher_mueller, 'Mi', 'grosse_pause', 'Schulhof Süd', '09:35', '09:55'),
    (v_school_id, v_teacher_schmidt, 'Do', 'grosse_pause', 'Schulhof Nord', '09:35', '09:55'),
    (v_school_id, v_teacher_braun, 'Do', 'grosse_pause', 'Schulhof Süd', '09:35', '09:55'),
    (v_school_id, v_teacher_fischer, 'Fr', 'grosse_pause', 'Schulhof Nord', '09:35', '09:55'),
    (v_school_id, v_teacher_weber, 'Fr', 'grosse_pause', 'Schulhof Süd', '09:35', '09:55');

    -- =====================================================
    -- KRANKMELDUNGEN
    -- =====================================================
    INSERT INTO sick_notes (student_id, submitted_by, start_date, end_date, reason, status, reviewed_by, reviewed_at) VALUES
    (v_student_1, v_parent_1, CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE - INTERVAL '3 days', 'Erkältung', 'approved', v_admin_id, CURRENT_DATE - INTERVAL '5 days'),
    (v_student_7, v_parent_4, CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE - INTERVAL '1 day', 'Magen-Darm', 'approved', v_admin_id, CURRENT_DATE - INTERVAL '2 days'),
    (v_student_13, v_parent_7, CURRENT_DATE, CURRENT_DATE + INTERVAL '2 days', 'Arzttermin', 'pending', NULL, NULL),
    (v_student_19, v_parent_9, CURRENT_DATE, CURRENT_DATE, 'Kopfschmerzen', 'pending', NULL, NULL);

    -- Lehrer-Krankmeldung
    INSERT INTO sick_notes (teacher_id, submitted_by, start_date, end_date, reason, status) VALUES
    (v_teacher_schmidt, v_teacher_schmidt, CURRENT_DATE + INTERVAL '1 day', CURRENT_DATE + INTERVAL '3 days', 'Grippe', 'pending');

    -- =====================================================
    -- NEUIGKEITEN / NEWS
    -- =====================================================
    INSERT INTO news (school_id, class_id, title, content, audience, priority, is_pinned, event_date, event_time, event_location, created_by, published_at) VALUES
    -- Schulweite News
    (v_school_id, NULL, '🎄 Weihnachtsfeier 2025', 
     'Liebe Eltern und Kinder,\n\nam 18. Dezember findet unsere große Weihnachtsfeier statt! Jede Klasse führt etwas vor. Bitte bringt Plätzchen und gute Laune mit! 🍪🎵',
     'all', 'important', true, '2025-12-18', '14:00', 'Aula', v_admin_id,
     '2025-12-01 10:00:00'),
    
    (v_school_id, NULL, '📢 Neue Pausenregeln',
     'Ab dem 26. Januar gelten neue Pausenregeln:\n1. Fußball nur auf dem Sportplatz\n2. Keine Handys auf dem Schulhof\n3. Bei Regen: Aufenthalt in den Klassenzimmern\n\nBitte besprecht das mit euren Kindern.',
     'all', 'normal', false, NULL, NULL, NULL, v_admin_id,
     '2026-01-20 08:30:00'),
    
    (v_school_id, NULL, '🏫 Elternsprechtag',
     'Der Elternsprechtag findet am 15. Februar statt. Bitte melden Sie sich bei der jeweiligen Klassenlehrerin/dem Klassenlehrer an.\n\nZeitraum: 15:00 - 19:00 Uhr',
     'parents', 'important', true, '2026-02-15', '15:00', 'Klassenzimmer', v_admin_id,
     '2026-02-03 09:00:00'),
    
    (v_school_id, NULL, '⚽ Bundesjugendspiele',
     'Am 20. März finden die Bundesjugendspiele statt!\n\nBitte denkt an:\n- Sportkleidung\n- Sonnencreme\n- Trinkflasche\n- Gute Laune! 🌞',
     'all', 'normal', false, '2026-03-20', '08:30', 'Sportplatz', v_teacher_fischer,
     '2026-02-14 11:00:00'),
    
    -- Klassen-spezifische News
    (v_school_id, v_class_2a, '📚 Leseabend Klasse 2a',
     'Am Freitag veranstalten wir einen Leseabend! Bringt euer Lieblingsbuch und eine Taschenlampe mit. Pizza gibt es auch! 🍕📖',
     'class', 'normal', false, CURRENT_DATE + INTERVAL '5 days', '18:00', 'Klassenzimmer 103', v_teacher_schmidt,
     CURRENT_TIMESTAMP - INTERVAL '2 days'),
    
    (v_school_id, v_class_1a, '🎨 Bastelnachmittag',
     'Nächsten Mittwoch basteln wir Frühlingsdeko für unsere Klassenzimmer! Bitte bringt eine Schere, Kleber und Buntpapier mit. 🌷🦋',
     'class', 'normal', false, CURRENT_DATE + INTERVAL '7 days', '14:00', 'Klassenzimmer 101', v_teacher_mueller,
     CURRENT_TIMESTAMP - INTERVAL '3 days'),
    
    -- Lehrer-News
    (v_school_id, NULL, '👩‍🏫 Lehrerkonferenz',
     'Nächsten Montag findet um 14:00 Uhr die Lehrerkonferenz statt. Thema: Digitalisierung im Unterricht. Bitte Laptop mitbringen.',
     'teachers', 'normal', false, CURRENT_DATE + INTERVAL '3 days', '14:00', 'Lehrerzimmer', v_admin_id,
     CURRENT_TIMESTAMP - INTERVAL '1 day');

    -- =====================================================
    -- EVENTS / TERMINE
    -- =====================================================
    INSERT INTO events (school_id, class_id, title, description, event_date, start_time, end_time, location, is_mandatory, audience, created_by) VALUES
    (v_school_id, NULL, 'Elternsprechtag', 'Individuelle Gespräche mit den Klassenlehrern', '2026-02-15', '15:00', '19:00', 'Klassenzimmer', true, 'parents', v_admin_id),
    (v_school_id, NULL, 'Bundesjugendspiele', 'Sportlicher Wettkampf für alle Klassen', '2026-03-20', '08:30', '13:00', 'Sportplatz', true, 'all', v_teacher_fischer),
    (v_school_id, v_class_2a, 'Elternabend Klasse 2a', 'Thema: Lernstandserhebung und Ausflug', '2026-02-20', '19:00', '20:30', 'Raum 103', true, 'parents', v_teacher_schmidt),
    (v_school_id, v_class_4a, 'Infoabend Übertritt', 'Informationen zum Übertritt an weiterführende Schulen', '2026-03-05', '19:00', '21:00', 'Aula', true, 'parents', v_teacher_schmidt),
    (v_school_id, NULL, 'Faschingsfeier', 'Alle Kinder dürfen verkleidet kommen! 🎭', '2026-02-13', '08:00', '11:30', 'Aula + Klassenzimmer', false, 'all', v_admin_id);

    RAISE NOTICE '✅ Seed-Daten erfolgreich eingefügt!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Accounts (Passwort: test1234):';
    RAISE NOTICE '  Admin:   admin@schule.de';
    RAISE NOTICE '  Lehrer:  mueller@schule.de, schmidt@schule.de, weber@schule.de, fischer@schule.de, braun@schule.de';
    RAISE NOTICE '  Eltern:  peter.klein@eltern.de, claudia.hofmann@eltern.de, stefan.becker@eltern.de, ...';
    RAISE NOTICE '  Schüler: leon.klein@schule.de, mia.hofmann@schule.de, ...';
    RAISE NOTICE '========================================';

END $$;
