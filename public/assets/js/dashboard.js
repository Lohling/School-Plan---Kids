// ===== STUNDENPLAN DATEN (Grundschule optimiert) =====
const timetableData = {
    '2a': {
        'Mo': [
            { time: '1. Stunde:', subject: 'Deutsch', teacher: 'Frau Bauer', room: 'R 001', type: 'lesson' },
            { time: '2. Stunde:', subject: 'Mathe', teacher: 'Frau Bauer', room: 'R 001', type: 'lesson' },
            { time: 'Pause', subject: 'Große Pause', type: 'break' },
            { time: '3. Stunde:', subject: 'HSU', teacher: 'Herr Müller', room: 'R 143', type: 'lesson' },
            { time: '4. Stunde:', subject: 'Sport', teacher: 'Herr Schmitt', room: 'Turnhalle A', type: 'lesson' },
        ],
        'Di': [
            { time: '1. Stunde:', subject: 'Deutsch', teacher: 'Frau Bauer', room: 'R 001', type: 'lesson' },
            { time: '2. Stunde:', subject: 'Musik', teacher: 'Frau Klein', room: 'R 105', type: 'lesson' },
            { time: 'Pause', subject: 'Kleine Pause', type: 'break' },
            { time: '3. Stunde:', subject: 'Mathe', teacher: 'Frau Bauer', room: 'R 001', type: 'lesson', isVertretung: true },
            { time: '4. Stunde:', subject: 'Lesen/Fördern', teacher: 'Frau Maier', room: 'R 203', type: 'lesson' },
        ],
        'Mi': [
            { time: '1. Stunde:', subject: 'HSU', teacher: 'Herr Müller', room: 'R 143', type: 'lesson' },
            { time: '2. Stunde:', subject: 'Kunst', teacher: 'Frau Weber', room: 'R 308', type: 'lesson' },
            { time: 'Pause', subject: 'Große Pause', type: 'break' },
            { time: '3. Stunde:', subject: 'Deutsch', teacher: 'Frau Bauer', room: 'R 001', type: 'lesson' },
        ],
        'Do': [
            { time: '1. Stunde:', subject: 'Mathe', teacher: 'Frau Bauer', room: 'R 001', type: 'lesson' },
            { time: '2. Stunde:', subject: 'Religion', teacher: 'Frau Klein', room: 'R 105', type: 'lesson' },
            { time: 'Pause', subject: 'Kleine Pause', type: 'break' },
            { time: '3. Stunde:', subject: 'Sport', teacher: 'Herr Schmitt', room: 'Turnhalle A', type: 'lesson' },
            { time: '4. Stunde:', subject: 'Deutsch', teacher: 'Herr Müller', room: 'R 143', type: 'lesson', isVertretung: true },
        ],
        'Fr': [
            { time: '1. Stunde:', subject: 'Deutsch', teacher: 'Frau Bauer', room: 'R 001', type: 'lesson' },
            { time: '2. Stunde:', subject: 'HSU', teacher: 'Herr Müller', room: 'R 143', type: 'lesson' },
            { time: 'Pause', subject: 'Große Pause', type: 'break' },
            { time: '3. Stunde:', subject: 'Mathe', teacher: 'Frau Bauer', room: 'R 001', type: 'lesson' },
            { time: '4. Stunde:', subject: 'Englisch', teacher: 'Mr. Jones', room: 'R 205', type: 'lesson' },
        ]
    },
    '3b': {
        'Mo': [
            { time: '1. Stunde:', subject: 'Deutsch', teacher: 'Frau Bauer', room: 'R 203', type: 'lesson' },
            { time: '2. Stunde:', subject: 'Sport', teacher: 'Herr Schmitt', room: 'Turnhalle B', type: 'lesson' },
            { time: 'Pause', subject: 'Große Pause', type: 'break' },
            { time: '3. Stunde:', subject: 'Mathe', teacher: 'Herr Wagner', room: 'R 002', type: 'lesson' },
            { time: '4. Stunde:', subject: 'Kunst', teacher: 'Frau Weber', room: 'R 308', type: 'lesson' },
        ],
        'Di': [
            { time: '1. Stunde:', subject: 'HSU', teacher: 'Herr Müller', room: 'R 143', type: 'lesson' },
            { time: '2. Stunde:', subject: 'Englisch', teacher: 'Frau Schulze', room: 'R 204', type: 'lesson' },
            { time: 'Pause', subject: 'Kleine Pause', type: 'break' },
            { time: '3. Stunde:', subject: 'Deutsch', teacher: 'Frau Bauer', room: 'R 203', type: 'lesson' },
        ],
        'Mi': [
            { time: '1. Stunde:', subject: 'Mathe', teacher: 'Herr Wagner', room: 'R 002', type: 'lesson' },
            { time: '2. Stunde:', subject: 'Werken/Gestalten', teacher: 'Frau Klein', room: 'R 105', type: 'lesson' },
            { time: 'Pause', subject: 'Große Pause', type: 'break' },
            { time: '3. Stunde:', subject: 'Deutsch (Vertr.)', teacher: 'Frau Maier', room: 'R 001', type: 'lesson', isVertretung: true },
        ],
        'Do': [
            { time: '1. Stunde:', subject: 'Deutsch', teacher: 'Frau Bauer', room: 'R 203', type: 'lesson' },
            { time: '2. Stunde:', subject: 'HSU', teacher: 'Herr Müller', room: 'R 143', type: 'lesson' },
            { time: 'Pause', subject: 'Kleine Pause', type: 'break' },
            { time: '3. Stunde:', subject: 'Englisch', teacher: 'Frau Schulze', room: 'R 204', type: 'lesson' },
            { time: '4. Stunde:', subject: 'Mathe', teacher: 'Herr Wagner', room: 'R 002', type: 'lesson' },
        ],
        'Fr': [
            { time: '1. Stunde:', subject: 'Musik', teacher: 'Frau Klein', room: 'R 105', type: 'lesson' },
            { time: '2. Stunde:', subject: 'Sport', teacher: 'Herr Schmitt', room: 'Turnhalle B', type: 'lesson' },
            { time: 'Pause', subject: 'Große Pause', type: 'break' },
            { time: '3. Stunde:', subject: 'Religion', teacher: 'Frau Bauer', room: 'R 203', type: 'lesson' },
        ]
    },
    '3c': {
        'Mo': [
            { time: '1. Stunde:', subject: 'Deutsch', teacher: 'Herr Maier', room: 'R 220', type: 'lesson' },
            { time: '2. Stunde:', subject: 'Mathe', teacher: 'Herr Schmidt', room: 'R 115', type: 'lesson' },
            { time: 'Pause', subject: 'Große Pause', type: 'break' },
            { time: '3. Stunde:', subject: 'HSU', teacher: 'Frau Dr. Koch', room: 'R 410', type: 'lesson' },
        ],
        'Di': [
            { time: '1. Stunde:', subject: 'Sport', teacher: 'Frau Berg', room: 'Turnhalle C', type: 'lesson' },
            { time: '2. Stunde:', subject: 'Englisch', teacher: 'Mr. Black', room: 'R 209', type: 'lesson' },
            { time: 'Pause', subject: 'Kleine Pause', type: 'break' },
            { time: '3. Stunde:', subject: 'Deutsch', teacher: 'Herr Maier', room: 'R 220', type: 'lesson' },
        ],
        'Mi': [
            { time: '1. Stunde:', subject: 'Mathe', teacher: 'Herr Schmidt', room: 'R 115', type: 'lesson' },
            { time: '2. Stunde:', subject: 'Kunst', teacher: 'Herr Maier', room: 'R 410', type: 'lesson', isVertretung: true },
            { time: 'Pause', subject: 'Große Pause', type: 'break' },
            { time: '3. Stunde:', subject: 'Religion', teacher: 'Herr Schmidt', room: 'R 115', type: 'lesson' },
        ],
        'Do': [
            { time: '1. Stunde:', subject: 'Deutsch', teacher: 'Herr Maier', room: 'R 220', type: 'lesson' },
            { time: '2. Stunde:', subject: 'Musik', teacher: 'Mme Dubois', room: 'R 210', type: 'lesson' },
            { time: 'Pause', subject: 'Kleine Pause', type: 'break' },
            { time: '3. Stunde:', subject: 'Mathe', teacher: 'Herr Schmidt', room: 'R 115', type: 'lesson' },
        ],
        'Fr': [
            { time: '1. Stunde:', subject: 'HSU', teacher: 'Herr Dr. Fischer', room: 'R 305', type: 'lesson' },
            { time: '2. Stunde:', subject: 'Englisch', teacher: 'Mr. Black', room: 'R 209', type: 'lesson' },
            { time: 'Pause', subject: 'Große Pause', type: 'break' },
            { time: '3. Stunde:', subject: 'Sport', teacher: 'Frau Berg', room: 'Turnhalle C', type: 'lesson' },
        ]
    },
    '4c': {
        'Mo': [
            { time: '1. Stunde:', subject: 'Deutsch', teacher: 'Herr Klein', room: 'R 215', type: 'lesson' },
            { time: '2. Stunde:', subject: 'Mathe', teacher: 'Herr Dr. Fischer', room: 'R 110', type: 'lesson' },
            { time: 'Pause', subject: 'Kleine Pause', type: 'break' },
            { time: '3. Stunde:', subject: 'HSU', teacher: 'Frau Berg', room: 'R 301', type: 'lesson' },
            { time: '4. Stunde:', subject: 'Englisch', teacher: 'Ms. Smith', room: 'R 207', type: 'lesson' },
        ],
        'Di': [
            { time: '1. Stunde:', subject: 'Sport', teacher: 'Herr Schmitt', room: 'Turnhalle A', type: 'lesson' },
            { time: '2. Stunde:', subject: 'Deutsch', teacher: 'Herr Klein', room: 'R 215', type: 'lesson' },
            { time: 'Pause', subject: 'Große Pause', type: 'break' },
            { time: '3. Stunde:', subject: 'Mathe', teacher: 'Herr Dr. Fischer', room: 'R 110', type: 'lesson' },
            { time: '4. Stunde:', subject: 'Religion', teacher: 'Frau Keller', room: 'R 309', type: 'lesson' },
        ],
        'Mi': [
            { time: '1. Stunde:', subject: 'Kunst', teacher: 'Frau Keller', room: 'R 309', type: 'lesson' },
            { time: '2. Stunde:', subject: 'Deutsch', teacher: 'Herr Klein', room: 'R 215', type: 'lesson' },
            { time: 'Pause', subject: 'Kleine Pause', type: 'break' },
            { time: '3. Stunde:', subject: 'HSU (Vertr.)', teacher: 'Herr Wagner', room: 'R 405', type: 'lesson', isVertretung: true },
        ],
        'Do': [
            { time: '1. Stunde:', subject: 'Englisch', teacher: 'Ms. Smith', room: 'R 207', type: 'lesson' },
            { time: '2. Stunde:', subject: 'Mathe', teacher: 'Herr Dr. Fischer', room: 'R 110', type: 'lesson' },
            { time: 'Pause', subject: 'Große Pause', type: 'break' },
            { time: '3. Stunde:', subject: 'Deutsch', teacher: 'Herr Klein', room: 'R 215', type: 'lesson' },
            { time: '4. Stunde:', subject: 'Musik', teacher: 'Frau Berg', room: 'R 301', type: 'lesson' },
        ],
        'Fr': [
            { time: '1. Stunde:', subject: 'Werken/Gestalten', teacher: 'Frau Berg', room: 'R 301', type: 'lesson' },
            { time: '2. Stunde:', subject: 'Deutsch', teacher: 'Herr Klein', room: 'R 215', type: 'lesson', isVertretung: true },
            { time: 'Pause', subject: 'Kleine Pause', type: 'break' },
            { time: '3. Stunde:', subject: 'HSU', teacher: 'Herr Dr. Fischer', room: 'R 110', type: 'lesson' },
        ]
    }
};

// ===== DASHBOARD INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    const user = sessionStorage.getItem('user') ? JSON.parse(sessionStorage.getItem('user')) : null;
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    // Initialize based on user type
    if (user.type === 'schueler') {
        initStudentDashboard(user);
    } else if (user.type === 'lehrer') {
        initTeacherDashboard(user);
    } else if (user.type === 'eltern') {
        initParentsDashboard(user);
    } else if (user.type === 'admin') {
        initAdminDashboard(user);
    }
});

// ===== STUDENT DASHBOARD =====
function initStudentDashboard(user) {
    const timetableView = document.getElementById('timetable-view');
    const classDropdown = document.getElementById('class-dropdown');
    const dayButtons = document.querySelectorAll('.tab-button');
    const newsHandle = document.getElementById('news-handle');
    const newsModal = document.getElementById('news-modal');
    const closeNewsButton = document.getElementById('close-news');
    const menuIcon = document.querySelector('.menu-icon');
    const sideMenu = document.getElementById('side-menu');
    const submitSickNoteButton = document.getElementById('submit-sick-note-button');
    const sickNoteModal = document.getElementById('sick-note-modal');
    const closeSickNoteButton = document.getElementById('close-sick-note');
    const sickNoteForm = document.getElementById('sick-note-form');

    let currentClass = user.class || classDropdown.value;
    let currentDay = 'Mo';

    function createLessonHTML(lesson) {
        const blockClass = lesson.type === 'break' ? 'pink-block' : 'red-block';
        const vertretungClass = lesson.isVertretung ? ' vertretung' : '';
        const details = lesson.teacher && lesson.room ? `mit ${lesson.teacher} &bull; ${lesson.room}` : '';

        return `
            <div class="timetable-row">
                <div class="time-label">${lesson.time}</div>
                <div class="lesson-block ${blockClass}${vertretungClass}">
                    <div class="lesson-subject">${lesson.subject}</div>
                    ${details ? `<div class="lesson-details">${details}</div>` : ''}
                </div>
            </div>
        `;
    }

    function renderTimetable() {
        const schedule = timetableData[currentClass]?.[currentDay] || [];
        timetableView.innerHTML = schedule.map(createLessonHTML).join('');
    }

    // Set user's class in dropdown
    classDropdown.value = currentClass;

    // Event listeners
    classDropdown.addEventListener('change', (e) => {
        currentClass = e.target.value;
        renderTimetable();
    });

    dayButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            document.querySelector('.tab-button.active').classList.remove('active');
            e.target.classList.add('active');
            currentDay = e.target.dataset.day;
            renderTimetable();
        });
    });

    newsHandle.addEventListener('click', () => {
        newsModal.classList.remove('hidden');
        setTimeout(() => newsModal.classList.add('visible'), 10);
    });

    closeNewsButton.addEventListener('click', () => {
        newsModal.classList.remove('visible');
        setTimeout(() => newsModal.classList.add('hidden'), 500);
    });

    menuIcon.addEventListener('click', () => {
        sideMenu.classList.toggle('visible');
    });

    submitSickNoteButton.addEventListener('click', () => {
        sideMenu.classList.remove('visible');
        sickNoteModal.classList.remove('hidden');
        setTimeout(() => sickNoteModal.classList.add('visible'), 10);
    });

    closeSickNoteButton.addEventListener('click', () => {
        sickNoteModal.classList.remove('visible');
        setTimeout(() => sickNoteModal.classList.add('hidden'), 500);
    });

    sickNoteForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const childName = document.getElementById('child-name').value;
        const startDateString = document.getElementById('start-date').value;
        const endDateString = document.getElementById('end-date').value;
        
        const formatter = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const dateStart = new Date(startDateString + 'T00:00:00Z');
        const dateEnd = new Date(endDateString + 'T00:00:00Z');
        
        const formattedStartDate = formatter.format(dateStart);
        const formattedEndDate = formatter.format(dateEnd);
        
        alert(`Krankschreibung für ${childName} erfolgreich eingereicht! Zeitraum: ${formattedStartDate} - ${formattedEndDate}.`);
        
        sickNoteModal.classList.remove('visible');
        setTimeout(() => {
            sickNoteModal.classList.add('hidden');
            sickNoteForm.reset();
        }, 500);
    });

    renderTimetable();
}

// ===== TEACHER DASHBOARD =====
function initTeacherDashboard(user) {
    const teacherClasses = document.getElementById('teacher-classes');
    const classes = user.classes || ['2a', '3b', '3c', '4c'];

    const classesHTML = classes.map(cls => `
        <div class="class-card">
            <h3>Klasse ${cls}</h3>
            <p>Stundenplan anzeigen</p>
            <button onclick="showClassSchedule('${cls}')" class="view-btn">Anzeigen</button>
        </div>
    `).join('');

    teacherClasses.innerHTML = classesHTML;
}

// ===== PARENTS DASHBOARD =====
function initParentsDashboard(user) {
    const childrenSchedules = document.getElementById('children-schedules');
    const children = user.children || ['Max Mustermann', 'Anna Schmidt'];

    const childrenHTML = children.map((child, idx) => `
        <div class="child-schedule">
            <h3>${child}</h3>
            <p>Klasse: ${['2a', '3b', '3c', '4c'][idx % 4]}</p>
            <button class="view-btn">Stundenplan anzeigen</button>
        </div>
    `).join('');

    childrenSchedules.innerHTML = childrenHTML;
}

// ===== ADMIN DASHBOARD =====
function initAdminDashboard(user) {
    const adminContent = document.getElementById('admin-content');
    
    const adminHTML = `
        <div class="admin-panel">
            <div class="admin-card">
                <h3>📊 Statistik</h3>
                <p>Benutzer: 45</p>
                <p>Klassen: 8</p>
                <p>Lehrer: 12</p>
            </div>
            <div class="admin-card">
                <h3>⚙️ System</h3>
                <p>Status: Online</p>
                <p>Letztes Backup: Heute</p>
            </div>
        </div>
    `;

    adminContent.innerHTML = adminHTML;
}
