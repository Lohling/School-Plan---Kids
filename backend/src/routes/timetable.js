/**
 * Stundenplan-Routen
 * Stundenplan anzeigen, Vertretungen, Unterrichtsinhalte
 */

const express = require('express');
const router = express.Router();
const { getOne, getMany, query } = require('../config/database');
const { authenticate, requireTeacherOrAdmin, requireAdmin } = require('../middleware/auth');

/**
 * GET /api/timetable/class/:classId
 * Stundenplan einer Klasse abrufen
 */
router.get('/class/:classId', authenticate, async (req, res) => {
    try {
        const { classId } = req.params;
        const { weekday } = req.query;

        let sql = `
            SELECT 
                te.id, te.weekday, te.lesson_number, te.start_time, te.end_time, te.entry_type,
                s.name as subject_name, s.short_name, s.color, s.icon,
                r.name as room_name,
                u.first_name as teacher_first_name, u.last_name as teacher_last_name
            FROM timetable_entries te
            LEFT JOIN subjects s ON te.subject_id = s.id
            LEFT JOIN rooms r ON te.room_id = r.id
            LEFT JOIN users u ON te.teacher_id = u.id
            WHERE te.class_id = $1
        `;
        
        const params = [classId];
        
        if (weekday) {
            sql += ' AND te.weekday = $2';
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
            WHERE te.teacher_id = $1
            ORDER BY te.weekday, te.start_time
        `, [teacherId]);

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
                `SELECT class_id FROM student_classes WHERE student_id = $1 LIMIT 1`,
                [id]
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
                LEFT JOIN subjects s ON te.subject_id = s.id
                LEFT JOIN rooms r ON te.room_id = r.id
                LEFT JOIN users u ON te.teacher_id = u.id
                WHERE te.class_id = $1
                ORDER BY te.weekday, te.start_time
            `, [studentClass.class_id]);

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
            const [entries, breakEntries, supervisions] = await Promise.all([
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
                });
            });

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
                 WHERE ps.parent_id = $1 LIMIT 1`,
                [id]
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
                LEFT JOIN subjects s ON te.subject_id = s.id
                LEFT JOIN rooms r ON te.room_id = r.id
                LEFT JOIN users u ON te.teacher_id = u.id
                WHERE te.class_id = $1
                ORDER BY te.weekday, te.start_time
            `, [child.class_id]);

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
                c.name as class_name
            FROM substitutions sub
            JOIN timetable_entries te ON sub.original_entry_id = te.id
            JOIN classes c ON te.class_id = c.id
            LEFT JOIN subjects orig_s ON te.subject_id = orig_s.id
            LEFT JOIN subjects sub_s ON sub.substitute_subject_id = sub_s.id
            LEFT JOIN users orig_t ON te.teacher_id = orig_t.id
            LEFT JOIN users sub_t ON sub.substitute_teacher_id = sub_t.id
            LEFT JOIN rooms orig_r ON te.room_id = orig_r.id
            LEFT JOIN rooms sub_r ON sub.substitute_room_id = sub_r.id
            WHERE sub.date = $1
        `;

        const params = [targetDate];

        if (classId) {
            sql += ' AND te.class_id = $2';
            params.push(classId);
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
            'SELECT teacher_id FROM timetable_entries WHERE id = $1',
            [timetableEntryId]
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
