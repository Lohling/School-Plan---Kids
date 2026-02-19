-- =====================================================
-- FIX: Doppelte Stundennummern bei Lehrern bereinigen
-- Regel: Ein Lehrer kann pro Wochentag jede Stundennummer
--        nur EINMAL belegen (in einer Klasse).
-- Priorität: Die Klasse, dessen Klassenlehrer der Lehrer ist,
--             wird behalten. Sonst alphabetisch erste Klasse.
-- =====================================================

DO $$
DECLARE
    v_removed INTEGER;
BEGIN
    -- Alle Stundenplan-Einträge wo ein Lehrer die gleiche
    -- Stundennummer am gleichen Wochentag in mehreren Klassen hat,
    -- werden bereinigt (teacher_id = NULL gesetzt für Duplikate).
    WITH ranked AS (
        SELECT
            te.id,
            te.teacher_id,
            te.weekday,
            te.lesson_number,
            c.name AS class_name,
            ROW_NUMBER() OVER (
                PARTITION BY te.teacher_id, te.weekday, te.lesson_number
                ORDER BY
                    -- Bevorzuge die Klasse, wo der Lehrer Klassenlehrer ist
                    CASE WHEN c.class_teacher_id = te.teacher_id THEN 0 ELSE 1 END,
                    -- Danach alphabetisch nach Klassenname
                    c.name ASC
            ) AS rn
        FROM timetable_entries te
        JOIN classes c ON te.class_id = c.id
        WHERE te.teacher_id IS NOT NULL
          AND te.entry_type = 'lesson'
    ),
    to_clear AS (
        SELECT id FROM ranked WHERE rn > 1
    )
    UPDATE timetable_entries
    SET teacher_id = NULL
    WHERE id IN (SELECT id FROM to_clear);

    GET DIAGNOSTICS v_removed = ROW_COUNT;
    RAISE NOTICE '✅ % Stundenplan-Einträge bereinigt (teacher_id auf NULL gesetzt).', v_removed;
    RAISE NOTICE 'Kein Lehrer hat jetzt noch die gleiche Stundennummer mehrfach am selben Tag.';
END $$;

-- Zur Kontrolle: Verbleibende Konflikte anzeigen (sollte leer sein)
SELECT
    u.first_name || ' ' || u.last_name AS lehrer,
    te.weekday AS wochentag,
    te.lesson_number AS stunde,
    COUNT(*) AS anzahl_klassen,
    string_agg(c.name, ', ' ORDER BY c.name) AS klassen
FROM timetable_entries te
JOIN classes c ON te.class_id = c.id
JOIN users u ON te.teacher_id = u.id
WHERE te.teacher_id IS NOT NULL
  AND te.entry_type = 'lesson'
GROUP BY u.first_name, u.last_name, te.weekday, te.lesson_number
HAVING COUNT(*) > 1
ORDER BY lehrer, te.weekday, te.lesson_number;
