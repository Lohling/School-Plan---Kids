document.addEventListener('DOMContentLoaded', () => {
    // --- STUNDENPLAN DATEN (Grundschule optimiert) ---
    const timetableData = {
        
        // --- KLASSE 2A ---
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

        // --- KLASSE 3B ---
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

        // --- KLASSE 4C ---
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
        },

        // --- KLASSE 3C (Beibehalten und angepasst) ---
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
        }
    };
    
    // --- DOM ELEMENTE ZUWEISEN ---
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
    
    // Element für Fade-In am Ende ermitteln (mainContent ist bereits definiert)
    const mainContent = document.getElementById('main-content');

    let currentClass = classDropdown.value;
    let currentDay = dayButtons[0].dataset.day; 
    
    // --- HILFSFUNKTIONEN ---

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
/*
    function initializeContent(element) {
        // 1. Element sichtbar machen (von display: none zu block)
        element.style.display = 'block'; 
        
        // 2. Element in den Startzustand (opacity: 0) versetzen
        element.classList.add('main-content-fade');
        
        // 3. Erzeuge eine minimale Verzögerung (garantiert den Render-Zyklus)
        setTimeout(() => {
            // 4. Den Endzustand (opacity: 1) triggern, was die 3s Transition startet
            element.classList.remove('main-content-fade');
            element.classList.add('main-content-visible');
        }, 50); 
    }
*/
    // --- EVENT LISTENER ---

    // 1. Klassenauswahl
    classDropdown.addEventListener('change', (e) => {
        currentClass = e.target.value;
        renderTimetable();
    });

    // 2. Wochentags-Tabs
    dayButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            document.querySelector('.tab-button.active').classList.remove('active');
            e.target.classList.add('active');
            currentDay = e.target.dataset.day;
            renderTimetable();
        });
    });

    // 3. Neuigkeiten-Modal öffnen
    newsHandle.addEventListener('click', () => {
        newsModal.classList.remove('hidden'); 
        setTimeout(() => newsModal.classList.add('visible'), 10); 
    });

    // 4. Neuigkeiten-Modal schließen
    closeNewsButton.addEventListener('click', () => {
        newsModal.classList.remove('visible'); 
        setTimeout(() => newsModal.classList.add('hidden'), 500);
    });

    // 5. Seitenmenü umschalten
    menuIcon.addEventListener('click', () => {
        sideMenu.classList.toggle('visible'); 
    });

    // 6. Krankschreibungs-Modal öffnen
    submitSickNoteButton.addEventListener('click', () => {
        sideMenu.classList.remove('visible'); 
        sickNoteModal.classList.remove('hidden');
        setTimeout(() => sickNoteModal.classList.add('visible'), 10); 
    });

    // 7. Krankschreibungs-Modal schließen
    closeSickNoteButton.addEventListener('click', () => {
        sickNoteModal.classList.remove('visible');
        setTimeout(() => sickNoteModal.classList.add('hidden'), 500);
    });

    // 8. Formular-Absendung (Beispiel-Logik mit Datumsformatierung)
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

/*
    // --- STATUS-CHECK & START-LOGIK ---
    const FIREBASE_ENDPOINT = 'https://video-sync-seminarkurs-default-rtdb.europe-west1.firebasedatabase.app/status.json';
    const loadingScreen = document.getElementById('loading-screen');
    // const mainContent = document.getElementById('main-content'); // Bereits oben definiert
    const CHECK_INTERVAL = 1000; 
    const STARTUP_DELAY = 50300; //52000;  
    let countdownStarted = false;
const SESSION_TIMER_FINISHED = 'sessionTimerFinished'; 


async function checkTriggerStatus() {
    try {
        const response = await fetch(FIREBASE_ENDPOINT);
        if (!response.ok) {
            console.error('Fehler beim Abrufen des Status:', response.statusText);
            return;
        }

        const data = await response.json(); 
        const status = data.trigger_status ? data.trigger_status.toLowerCase() : 'waiting'; 
        
        // 1. Prüfen, ob der Timer bereits abgelaufen war (durch Local Storage)
        const timerFinished = localStorage.getItem(SESSION_TIMER_FINISHED);

        if (status === 'go') {
            
            // Wenn der Status GO ist und der Timer NOCH NICHT fertig war:
            if (!timerFinished && !countdownStarted) {
                console.log('Status: GO erkannt UND Timer noch nicht abgelaufen. Starte Countdown.');
                
                countdownStarted = true;
                clearInterval(statusCheckInterval); 

                setTimeout(() => {
                    console.log('Countdown beendet. Seite wird freigeschaltet.');
                    
                    loadingScreen.classList.add('hidden');
                    
                    // 🔥 NACH ABSCHLUSS DES TIMERS: Setze Local Storage Flag
                    localStorage.setItem(SESSION_TIMER_FINISHED, Date.now()); 
                    
                    initializeContent(mainContent); 
                    renderTimetable(); 
                    
                }, STARTUP_DELAY);
                
            } else if (timerFinished) {
                // Wenn Status GO ist und Timer schon abgelaufen war (Reloads während der Präsi)
                console.log('Status: GO erkannt, Timer war bereits abgelaufen. Sofortiger Start.');
                
                clearInterval(statusCheckInterval); 
                loadingScreen.classList.add('hidden');
                initializeContent(mainContent); 
                renderTimetable();
                
                return; // Beende die Funktion
            }

        } else if (status === 'waiting' || status === 'wait') {
            // Wenn der Status zurück auf WAITING oder inaktiv geht:
            if (timerFinished) {
                // 🔥 Setze Local Storage ZURÜCK, um Timer beim nächsten GO neu zu starten
                localStorage.removeItem(SESSION_TIMER_FINISHED);
                console.log('Status: WAITING erkannt. Timer-Flag zurückgesetzt.');
            }
            
            if (!countdownStarted) {
                console.log('Status: Warten. Aktueller Status:', status);
            }
        }
        
    } catch (error) {
        console.error('Netzwerk- oder Parsing-Fehler:', error);
    }
}
    // Starte Polling
    const statusCheckInterval = setInterval(checkTriggerStatus, CHECK_INTERVAL);

    // 🔥 WICHTIG: Inhalt beim Start unsichtbar machen (CSS-Überbrückung)
    mainContent.style.display = 'none'; 
    
    checkTriggerStatus();
});*/

renderTimetable();
});