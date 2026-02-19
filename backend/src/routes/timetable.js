/**
 * Stundenplan-Routen
 * Stundenplan anzeigen, Vertretungen, Unterrichtsinhalte
 */

const express = require('express');
const router = express.Router();
const { getOne, getMany, query } = require('../config/database');
const { authenticate, requireTeacherOrAdmin, requireAdmin } = require('../middleware/auth');

const getClassAccessForUser = async (user, classId) => {
    // Ensure class belongs to user's school
    const cls = await getOne(
        'SELECT id, school_id FROM classes WHERE id = $1',
        [classId]
    );

    if (!cls) {
        return { ok: false, status: 404, error: 'Klasse nicht gefunden' };
    }

    if (cls.school_id !== user.school_id) {
        // Avoid leaking existence of classes across schools
        return { ok: false, status: 404, error: 'Klasse nicht gefunden' };
    }

    // Admin/Teacher can access any class in their school
    if (user.role === 'admin' || user.role === 'teacher') {
        return { ok: true };
    }

    // Student: must be assigned to this class
    if (user.role === 'student') {
        const membership = await getOne(
            'SELECT 1 FROM student_classes WHERE student_id = $1 AND class_id = $2 LIMIT 1',
            [user.id, classId]
        );
        if (!membership) {
            return { ok: false, status: 403, error: 'Keine Berechtigung für diese Klasse' };
        }
        return { ok: true };
    }

    // Parent: must have a child assigned to this class
    if (user.role === 'parent') {
        const membership = await getOne(
            `SELECT 1
             FROM parent_students ps
             JOIN student_classes sc ON ps.student_id = sc.student_id
             WHERE ps.parent_id = $1 AND sc.class_id = $2
             LIMIT 1`,
            [user.id, classId]
        );
        if (!membership) {
            return { ok: false, status: 403, error: 'Keine Berechtigung für diese Klasse' };
        }
        return { ok: true };
    }

    return { ok: false, status: 403, error: 'Keine Berechtigung' };
};

const getPrimaryClassIdForUser = async (user) => {
    if (user.role === 'student') {
        const row = await getOne(
            `SELECT sc.class_id
             FROM student_classes sc
             JOIN classes c ON sc.class_id = c.id
             WHERE sc.student_id = $1 AND c.school_id = $2
             LIMIT 1`,
            [user.id, user.school_id]
        );
        return row?.class_id || null;
    }

    if (user.role === 'parent') {
        const row = await getOne(
            `SELECT sc.class_id
             FROM parent_students ps
             JOIN student_classes sc ON ps.student_id = sc.student_id
             JOIN classes c ON sc.class_id = c.id
             WHERE ps.parent_id = $1 AND c.school_id = $2
             LIMIT 1`,
            [user.id, user.school_id]
        );
        return row?.class_id || null;
    }

    return null;
};

/**
 * GET /api/timetable/class/:classId
 * Stundenplan einer Klasse abrufen
 */
router.get('/class/:classId', authenticate, async (req, res) => {
    try {
        const { classId } = req.params;
        const { weekday } = req.query;

        const access = await getClassAccessForUser(req.user, classId);
        if (!access.ok) {
            return res.status(access.status).json({ error: access.error });
        }

        let sql = `
            SELECT 
                te.id, te.weekday, te.lesson_number, te.start_time, te.end_time, te.entry_type,
                s.name as subject_name, s.short_name, s.color, s.icon,
                r.name as room_name,
                u.first_name as teacher_first_name, u.last_name as teacher_last_name
            FROM timetable_entries te
            JOIN classes c ON te.class_id = c.id
            LEFT JOIN subjects s ON te.subject_id = s.id
            LEFT JOIN rooms r ON te.room_id = r.id
            LEFT JOIN users u ON te.teacher_id = u.id
            WHERE te.class_id = $1 AND c.school_id = $2
        `;
        
        const params = [classId, req.user.school_id];
        
        if (weekday) {
            sql += ' AND te.weekday = $3';
            params.push(weekday);
        }
        
        sql += ' ORDER BY te.weekday, te.start_time';

        const entries = await getMany(sql, params);

        // Gruppiere nach Wochentag
        const timetable = {};
        entries.forEach(entry => {
            if (!timetable[entry.weekday]) {
                timetable[entry.weekday] = [];
            }
            timetable[entry.weekday].push({
                id: entry.id,
                lessonNumber: entry.lesson_number,
                startTime: entry.start_time,
                endTime: entry.end_time,
                type: entry.entry_type,
                subject: entry.subject_name,
                shortName: entry.short_name,
                color: entry.color,
                icon: entry.icon,
                room: entry.room_name,
                teacher: entry.teacher_last_name 
                    ? `${entry.teacher_first_name} ${entry.teacher_last_name}`
                    : null,
            });
        });

        res.json({ timetable });
    } catch (error) {
        console.error('Timetable Error:', error);
        res.status(500).json({ error: 'Fehler beim Laden des Stundenplans' });
    }
});

/**
 * GET /api/timetable/teacher/:teacherId
 * Stundenplan eines Lehrers
 */
router.get('/teacher/:teacherId', authenticate, requireTeacherOrAdmin, async (req, res) => {
    try {
        const { teacherId } = req.params;

        // Only allow access to teachers from the same school
        const teacher = await getOne(
            `SELECT id
             FROM users
             WHERE id = $1 AND role = 'teacher' AND school_id = $2 AND is_active = true`,
            [teacherId, req.user.school_id]
        );

        if (!teacher) {
            return res.status(404).json({ error: 'Lehrer nicht gefunden' });
        }

        // Prüfen ob Lehrer selbst oder Admin
        if (req.user.role === 'teacher' && req.user.id !== teacherId) {
            // Lehrer können auch Kollegen-Pläne sehen
        }

        const entries = await getMany(`
            SELECT 
                te.id, te.weekday, te.lesson_number, te.start_time, te.end_time,
                s.name as subject_name, s.color,
                r.name as room_name,
                c.name as class_name
            FROM timetable_entries te
            LEFT JOIN subjects s ON te.subject_id = s.id
            LEFT JOIN rooms r ON te.room_id = r.id
            LEFT JOIN classes c ON te.class_id = c.id
            WHERE te.teacher_id = $1 AND c.school_id = $2
            ORDER BY te.weekday, te.start_time
        `, [teacherId, req.user.school_id]);

        // Gruppiere nach Wochentag und formatiere
        const timetable = {};
        entries.forEach(entry => {
            if (!timetable[entry.weekday]) {
                timetable[entry.weekday] = [];
            }
            timetable[entry.weekday].push({
                id: entry.id,
                lessonNumber: entry.lesson_number,
                startTime: entry.start_time,
                endTime: entry.end_time,
                type: 'lesson',
                subject: entry.subject_name,
                color: entry.color,
                room: entry.room_name,
                className: entry.class_name,
            });
        });

        res.json({ timetable });
    } catch (error) {
        res.status(500).json({ error: 'Fehler beim Laden' });
    }
});

/**
 * GET /api/timetable/my
 * Eigenen Stundenplan abrufen (für Schüler und Lehrer)
 */
router.get('/my', authenticate, async (req, res) => {
    try {
        const { role, id } = req.user;

        if (role === 'student') {
            // Schüler: Klasse finden und deren Stundenplan
            const studentClass = await getOne(
                `SELECT sc.class_id
                 FROM student_classes sc
                 JOIN classes c ON sc.class_id = c.id
                 WHERE sc.student_id = $1 AND c.school_id = $2
                 LIMIT 1`,
                [id, req.user.school_id]
            );

            if (!studentClass) {
                return res.json({ timetable: {}, message: 'Keine Klasse zugewiesen' });
            }

            // Klassen-Stundenplan direkt abfragen
            const entries = await getMany(`
                SELECT 
                    te.id, te.weekday, te.lesson_number, te.start_time, te.end_time, te.entry_type,
                    s.name as subject_name, s.short_name, s.color, s.icon,
                    r.name as room_name,
                    u.first_name as teacher_first_name, u.last_name as teacher_last_name
                FROM timetable_entries te
                JOIN classes c ON te.class_id = c.id
                LEFT JOIN subjects s ON te.subject_id = s.id
                LEFT JOIN rooms r ON te.room_id = r.id
                LEFT JOIN users u ON te.teacher_id = u.id
                WHERE te.class_id = $1 AND c.school_id = $2
                ORDER BY te.weekday, te.start_time
            `, [studentClass.class_id, req.user.school_id]);

            const timetable = {};
            entries.forEach(entry => {
                if (!timetable[entry.weekday]) {
                    timetable[entry.weekday] = [];
                }
                timetable[entry.weekday].push({
                    id: entry.id,
                    lessonNumber: entry.lesson_number,
                    startTime: entry.start_time,
                    endTime: entry.end_time,
                    type: entry.entry_type,
                    subject: entry.subject_name,
                    shortName: entry.short_name,
                    color: entry.color,
                    icon: entry.icon,
                    room: entry.room_name,
                    teacher: entry.teacher_last_name 
                        ? `${entry.teacher_first_name} ${entry.teacher_last_name}`
                        : null,
                });
            });

            return res.json({ timetable });
        } 
        
        if (role === 'teacher') {
            // Lehrer: Eigenen Stundenplan + Pausen mit Aufsichten
            // + Vertretungen, die der Lehrer übernimmt
            const [entries, substitutionsAsSub, breakEntries, supervisions] = await Promise.all([
                getMany(`
                    SELECT 
                        te.id, te.weekday, te.lesson_number, te.start_time, te.end_time, te.entry_type,
                        s.name as subject_name, s.short_name, s.color, s.icon,
                        r.name as room_name,
                        c.name as class_name
                    FROM timetable_entries te
                    LEFT JOIN subjects s ON te.subject_id = s.id
                    LEFT JOIN rooms r ON te.room_id = r.id
                    LEFT JOIN classes c ON te.class_id = c.id
                    WHERE te.teacher_id = $1
                    ORDER BY te.weekday, te.start_time
                `, [id]),
                // Vertretungen, wo dieser Lehrer EINSPRINGT (nur aktuelle/zukünftige relevante)
                getMany(`
                    SELECT 
                        sub.id, sub.date, sub.substitute_subject_id, sub.substitute_room_id,
                        te.lesson_number, te.weekday, te.start_time, te.end_time,
                        s.name as subject_name, s.short_name, s.color, s.icon,
                        r.name as room_name,
                        c.name as class_name
                    FROM substitutions sub
                    JOIN timetable_entries te ON sub.original_entry_id = te.id
                    JOIN classes c ON te.class_id = c.id
                    LEFT JOIN subjects s ON sub.substitute_subject_id = s.id
                    LEFT JOIN rooms r ON sub.substitute_room_id = r.id
                    WHERE sub.substitute_teacher_id = $1 AND sub.is_cancelled = false
                    ORDER BY sub.date, te.start_time
                `, [id]),
                // Pausen aus irgendeiner Klasse der Schule holen (sind universell)
                getMany(`
                    SELECT DISTINCT ON (te.weekday, te.start_time)
                        te.weekday, te.lesson_number, te.start_time, te.end_time, te.entry_type
                    FROM timetable_entries te
                    JOIN classes c ON te.class_id = c.id
                    WHERE te.entry_type = 'break' AND c.school_id = $1
                    ORDER BY te.weekday, te.start_time
                `, [req.user.school_id]),
                // Alle Pausenaufsichten der Schule
                getMany(`
                    SELECT bs.*, u.first_name || ' ' || u.last_name as teacher_name,
                           bs.teacher_id
                    FROM break_supervisions bs
                    JOIN users u ON bs.teacher_id = u.id
                    WHERE bs.school_id = $1
                    ORDER BY bs.weekday, bs.start_time
                `, [req.user.school_id])
            ]);

            const timetable = {};
            
            // Reguläre Stunden eintragen
            entries.forEach(entry => {
                if (!timetable[entry.weekday]) {
                    timetable[entry.weekday] = [];
                }
                timetable[entry.weekday].push({
                    id: entry.id,
                    lessonNumber: entry.lesson_number,
                    startTime: entry.start_time,
                    endTime: entry.end_time,
                    type: entry.entry_type || 'lesson',
                    subject: entry.subject_name,
                    shortName: entry.short_name,
                    color: entry.color,
                    icon: entry.icon,
                    room: entry.room_name,
                    className: entry.class_name,
                    isRegular: true
                });
            });

            // Vertretungseinsätze eintragen (nur für die aktuelle Anzeige-Logik relevant, 
            // eigentlich müsste man hier dates beachten. Da die Anzeige aber wochenbasiert ist,
            // ist das hier schwierig. Wir fügen sie als "Extra" hinzu oder lassen das Frontend filtern.)
            // HIER vereinfachen wir: Backend liefert nur Struktur, Frontend filtert nach Datum.
            // Aber `timetable` ist hier generisch (Wochentag). 
            // Vertretungen sind datumsspezifisch. Das passt nicht gut in die generische Wochenstruktur.
            // Lösung: Wir geben die 'substitutionsAsSub' separat zurück oder integrieren sie nur, wenn sie heute sind?
            // Besser: Der 'timetable' Endpoint liefert die generische Woche.
            // Die 'substitutions' Route liefert Änderungen.
            // Aber Lehrer sieht seine EINSÄTZE nicht in 'substitutions' Route (dort sieht er nur Änderungen für seine Klasse/Schule).
            // Wir lassen das hier erst mal so und verlassen uns auf die Substitutions-Route.


            // Pausen mit Aufsicht-Info einfügen
            breakEntries.forEach(brk => {
                if (!timetable[brk.weekday]) {
                    timetable[brk.weekday] = [];
                }
                // Aufsichten für diese Pause finden
                const breakSupervisions = supervisions.filter(s => 
                    s.weekday === brk.weekday && s.start_time === brk.start_time
                );
                const isSelfSupervision = breakSupervisions.some(s => s.teacher_id === id);

                timetable[brk.weekday].push({
                    lessonNumber: brk.lesson_number,
                    startTime: brk.start_time,
                    endTime: brk.end_time,
                    type: 'break',
                    subject: 'Pause',
                    supervisions: breakSupervisions.map(s => ({
                        teacherName: s.teacher_name,
                        location: s.location,
                        breakType: s.break_type,
                        isSelf: s.teacher_id === id
                    })),
                    isSelfSupervision
                });
            });

            // Einträge pro Tag nach Startzeit sortieren
            Object.keys(timetable).forEach(day => {
                timetable[day].sort((a, b) => {
                    if (a.startTime < b.startTime) return -1;
                    if (a.startTime > b.startTime) return 1;
                    return 0;
                });
            });

            return res.json({ timetable });
        }

        if (role === 'parent') {
            // Eltern: Stundenplan des ersten Kindes
            const child = await getOne(
                `SELECT ps.student_id, sc.class_id 
                 FROM parent_students ps
                 JOIN student_classes sc ON ps.student_id = sc.student_id
                 JOIN classes c ON sc.class_id = c.id
                 WHERE ps.parent_id = $1 AND c.school_id = $2
                 LIMIT 1`,
                [id, req.user.school_id]
            );

            if (!child) {
                return res.json({ timetable: {}, message: 'Kein Kind mit Klasse gefunden' });
            }

            const entries = await getMany(`
                SELECT 
                    te.id, te.weekday, te.lesson_number, te.start_time, te.end_time, te.entry_type,
                    s.name as subject_name, s.short_name, s.color, s.icon,
                    r.name as room_name,
                    u.first_name as teacher_first_name, u.last_name as teacher_last_name
                FROM timetable_entries te
                JOIN classes c ON te.class_id = c.id
                LEFT JOIN subjects s ON te.subject_id = s.id
                LEFT JOIN rooms r ON te.room_id = r.id
                LEFT JOIN users u ON te.teacher_id = u.id
                WHERE te.class_id = $1 AND c.school_id = $2
                ORDER BY te.weekday, te.start_time
            `, [child.class_id, req.user.school_id]);

            const timetable = {};
            entries.forEach(entry => {
                if (!timetable[entry.weekday]) {
                    timetable[entry.weekday] = [];
                }
                timetable[entry.weekday].push({
                    id: entry.id,
                    lessonNumber: entry.lesson_number,
                    startTime: entry.start_time,
                    endTime: entry.end_time,
                    type: entry.entry_type,
                    subject: entry.subject_name,
                    shortName: entry.short_name,
                    color: entry.color,
                    icon: entry.icon,
                    room: entry.room_name,
                    teacher: entry.teacher_last_name 
                        ? `${entry.teacher_first_name} ${entry.teacher_last_name}`
                        : null,
                });
            });

            return res.json({ timetable });
        }

        if (role === 'admin') {
            // Admin: Übersicht aller Klassen-Stundenpläne (leere Antwort, Admin nutzt Klassen-Ansicht)
            return res.json({ timetable: {}, message: 'Bitte wähle eine Klasse aus' });
        }

        res.status(400).json({ error: 'Funktion nicht verfügbar für diese Rolle' });
    } catch (error) {
        res.status(500).json({ error: 'Fehler beim Laden' });
    }
});

/**
 * GET /api/timetable/substitutions
 * Aktuelle Vertretungen abrufen
 */
router.get('/substitutions', authenticate, async (req, res) => {
    try {
        const { date, classId } = req.query;
        const targetDate = date || new Date().toISOString().split('T')[0];

        let effectiveClassId = classId || null;

        // For students/parents always scope to their own (primary) class
        if (req.user.role === 'student' || req.user.role === 'parent') {
            effectiveClassId = await getPrimaryClassIdForUser(req.user);
            if (!effectiveClassId) {
                return res.json({ substitutions: [], date: targetDate, message: 'Keine Klasse zugewiesen' });
            }
        }

        // For teachers/admin: if classId provided, ensure it's within their school
        if ((req.user.role === 'teacher' || req.user.role === 'admin') && effectiveClassId) {
            const access = await getClassAccessForUser(req.user, effectiveClassId);
            if (!access.ok) {
                return res.status(access.status).json({ error: access.error });
            }
        }

        let sql = `
            SELECT 
                sub.id, sub.date, sub.is_cancelled, sub.note_for_students,
                te.lesson_number, te.weekday,
                orig_s.name as original_subject,
                sub_s.name as substitute_subject,
                orig_t.first_name || ' ' || orig_t.last_name as original_teacher,
                sub_t.first_name || ' ' || sub_t.last_name as substitute_teacher,
                orig_r.name as original_room,
                sub_r.name as substitute_room,
                c.name as class_name,
                te.class_id
            FROM substitutions sub
            JOIN timetable_entries te ON sub.original_entry_id = te.id
            JOIN classes c ON te.class_id = c.id
            LEFT JOIN subjects orig_s ON te.subject_id = orig_s.id
            LEFT JOIN subjects sub_s ON sub.substitute_subject_id = sub_s.id
            LEFT JOIN users orig_t ON te.teacher_id = orig_t.id
            LEFT JOIN users sub_t ON sub.substitute_teacher_id = sub_t.id
            LEFT JOIN rooms orig_r ON te.room_id = orig_r.id
            LEFT JOIN rooms sub_r ON sub.substitute_room_id = sub_r.id
            WHERE sub.date = $1 AND c.school_id = $2
        `;

        const params = [targetDate, req.user.school_id];

        if (effectiveClassId) {
            sql += ' AND te.class_id = $3';
            params.push(effectiveClassId);
        }

        sql += ' ORDER BY c.name, te.lesson_number';

        const substitutions = await getMany(sql, params);

        res.json({ substitutions, date: targetDate });
    } catch (error) {
        res.status(500).json({ error: 'Fehler beim Laden der Vertretungen' });
    }
});

/**
 * POST /api/timetable/content
 * Unterrichtsinhalt eintragen (Lehrer)
 */
router.post('/content', authenticate, requireTeacherOrAdmin, async (req, res) => {
    try {
        const { timetableEntryId, date, topic, description, homework, materials } = req.body;

        // Prüfen ob der Lehrer diese Stunde unterrichtet
        const entry = await getOne(
            `SELECT te.teacher_id, te.class_id
             FROM timetable_entries te
             JOIN classes c ON te.class_id = c.id
             WHERE te.id = $1 AND c.school_id = $2`,
            [timetableEntryId, req.user.school_id]
        );

        if (!entry) {
            return res.status(404).json({ error: 'Stunde nicht gefunden' });
        }

        if (req.user.role === 'teacher' && entry.teacher_id !== req.user.id) {
            return res.status(403).json({ error: 'Keine Berechtigung für diese Stunde' });
        }

        // Inhalt speichern oder aktualisieren
        const existing = await getOne(
            'SELECT id FROM lesson_contents WHERE timetable_entry_id = $1 AND date = $2',
            [timetableEntryId, date]
        );

        if (existing) {
            await query(
                `UPDATE lesson_contents 
                 SET topic = $1, description = $2, homework = $3, materials = $4, updated_at = NOW()
                 WHERE id = $5`,
                [topic, description, homework, materials, existing.id]
            );
        } else {
            await query(
                `INSERT INTO lesson_contents (timetable_entry_id, date, topic, description, homework, materials, created_by)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [timetableEntryId, date, topic, description, homework, materials, req.user.id]
            );
        }

        res.json({ success: true, message: 'Unterrichtsinhalt gespeichert' });
    } catch (error) {
        res.status(500).json({ error: 'Fehler beim Speichern' });
    }
});

/**
 * GET /api/timetable/content/:entryId
 * Unterrichtsinhalt abrufen
 */
router.get('/content/:entryId', authenticate, async (req, res) => {
    try {
        const { date } = req.query;

        const entryMeta = await getOne(
            `SELECT te.id, te.class_id
             FROM timetable_entries te
             JOIN classes c ON te.class_id = c.id
             WHERE te.id = $1 AND c.school_id = $2`,
            [req.params.entryId, req.user.school_id]
        );

        if (!entryMeta) {
            return res.status(404).json({ error: 'Stunde nicht gefunden' });
        }

        if (req.user.role === 'student' || req.user.role === 'parent') {
            const ownClassId = await getPrimaryClassIdForUser(req.user);
            if (!ownClassId || ownClassId !== entryMeta.class_id) {
                return res.status(403).json({ error: 'Keine Berechtigung für diese Stunde' });
            }
        }
        
        const content = await getOne(
            `SELECT lc.*, u.first_name || ' ' || u.last_name as created_by_name
             FROM lesson_contents lc
             LEFT JOIN users u ON lc.created_by = u.id
             WHERE lc.timetable_entry_id = $1 AND lc.date = $2`,
            [req.params.entryId, date]
        );

        res.json({ content });
    } catch (error) {
        res.status(500).json({ error: 'Fehler beim Laden' });
    }
});

/**
 * GET /api/timetable/supervisions
 * Pausenaufsichten abrufen (für Lehrer)
 */
router.get('/supervisions', authenticate, requireTeacherOrAdmin, async (req, res) => {
    try {
        const { teacherId, weekday } = req.query;
        
        let sql = `
            SELECT bs.*, u.first_name || ' ' || u.last_name as teacher_name
            FROM break_supervisions bs
            JOIN users u ON bs.teacher_id = u.id
            WHERE bs.school_id = $1
        `;
        
        const params = [req.user.school_id];
        
        if (teacherId) {
            sql += ` AND bs.teacher_id = $${params.length + 1}`;
            params.push(teacherId);
        }
        
        if (weekday) {
            sql += ` AND bs.weekday = $${params.length + 1}`;
            params.push(weekday);
        }
        
        sql += ' ORDER BY bs.weekday, bs.start_time';

        const supervisions = await getMany(sql, params);

        res.json({ supervisions });
    } catch (error) {
        res.status(500).json({ error: 'Fehler beim Laden' });
    }
});

module.exports = router;
