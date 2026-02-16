/**
 * School Plan Kids - Hauptanwendung
 * Initialisierung und Page-Handler
 */

const App = {
    container: null,
    currentDay: 'Mo',
    selectedClassId: null,

    /**
     * Initialisiert die Anwendung
     */
    async init() {
        this.container = document.getElementById('app');
        
        // Session prüfen
        await Auth.checkSession();

        // Routen registrieren
        this.registerRoutes();

        // Router starten
        Router.init();
    },

    /**
     * Registriert alle Routen
     */
    registerRoutes() {
        // Öffentliche Routen
        Router.register('/login', () => this.renderLogin(), { guestOnly: true });

        // Geschützte Routen - Alle
        Router.register('/', () => this.renderDashboard(), { requiresAuth: true });
        Router.register('/profile', () => this.renderProfile(), { requiresAuth: true });
        Router.register('/news', () => this.renderNews(), { requiresAuth: true });

        // Schüler & Lehrer
        Router.register('/timetable', () => this.renderMyTimetable(), { 
            requiresAuth: true, 
            roles: ['student', 'teacher'] 
        });
        Router.register('/timetable/:classId', (params) => this.renderClassTimetable(params.classId), { 
            requiresAuth: true 
        });

        // Eltern
        Router.register('/children', () => this.renderChildren(), { 
            requiresAuth: true, 
            roles: ['parent'] 
        });
        Router.register('/events', () => this.renderEvents(), { 
            requiresAuth: true, 
            roles: ['parent'] 
        });
        Router.register('/sick-note', () => this.renderSickNote(), { 
            requiresAuth: true, 
            roles: ['parent', 'teacher'] 
        });

        // Lehrer
        Router.register('/colleagues', () => this.renderColleagues(), { 
            requiresAuth: true, 
            roles: ['teacher'] 
        });
        Router.register('/supervisions', () => this.renderSupervisions(), { 
            requiresAuth: true, 
            roles: ['teacher'] 
        });
        Router.register('/classes', () => this.renderTeacherClasses(), { 
            requiresAuth: true, 
            roles: ['teacher'] 
        });
        Router.register('/class/:classId/students', (params) => this.renderClassStudents(params.classId), { 
            requiresAuth: true, 
            roles: ['teacher', 'admin'] 
        });
        Router.register('/news/create', () => this.renderCreateNews(), { 
            requiresAuth: true, 
            roles: ['teacher', 'admin'] 
        });
        Router.register('/lesson-content/:entryId', (params) => this.renderLessonContent(params.entryId), { 
            requiresAuth: true, 
            roles: ['teacher'] 
        });

        // Admin
        Router.register('/admin', () => this.renderAdminDashboard(), { 
            requiresAuth: true, 
            roles: ['admin'] 
        });
        Router.register('/admin/users', () => this.renderAdminUsers(), { 
            requiresAuth: true, 
            roles: ['admin'] 
        });
        Router.register('/admin/classes', () => this.renderAdminClasses(), { 
            requiresAuth: true, 
            roles: ['admin'] 
        });
        Router.register('/admin/timetable', () => this.renderAdminTimetable(), { 
            requiresAuth: true, 
            roles: ['admin'] 
        });
        Router.register('/admin/timetable/:classId', (params) => this.renderAdminTimetableEdit(params.classId), { 
            requiresAuth: true, 
            roles: ['admin'] 
        });
        Router.register('/admin/news', () => this.renderAdminNews(), { 
            requiresAuth: true, 
            roles: ['admin'] 
        });
        Router.register('/admin/sick-notes', () => this.renderAdminSickNotes(), { 
            requiresAuth: true, 
            roles: ['admin'] 
        });
        Router.register('/admin/contents', () => this.renderAdminContents(), { 
            requiresAuth: true, 
            roles: ['admin'] 
        });
    },

    /**
     * Rendert eine Seite mit Layout
     */
    render(content, withNav = true) {
        if (withNav) {
            this.container.innerHTML = `
                ${Components.header()}
                ${Components.sideNav()}
                <main class="main-content">
                    ${content}
                </main>
            `;
        } else {
            this.container.innerHTML = content;
        }
    },

    // =====================================================
    // NAVIGATION
    // =====================================================

    toggleNav() {
        const nav = document.getElementById('side-nav');
        const overlay = document.getElementById('nav-overlay');
        nav.classList.toggle('open');
        overlay.classList.toggle('visible');
    },

    closeNav() {
        const nav = document.getElementById('side-nav');
        const overlay = document.getElementById('nav-overlay');
        nav.classList.remove('open');
        overlay.classList.remove('visible');
    },

    openNewsModal() {
        const modal = document.getElementById('news-modal');
        const handle = document.getElementById('news-handle');
        if (modal) modal.classList.add('visible');
        if (handle) handle.style.display = 'none';
    },

    closeNewsModal() {
        const modal = document.getElementById('news-modal');
        const handle = document.getElementById('news-handle');
        if (modal) modal.classList.remove('visible');
        if (handle) handle.style.display = '';
    },

    // =====================================================
    // LESSON CONTENT (Stundeninhalte)
    // =====================================================

    async openLessonContent(entryId, subject, lessonNumber, role) {
        const today = new Date().toISOString().split('T')[0];
        const canEdit = role === 'teacher' || role === 'admin';

        // Bestehenden Inhalt laden
        let content = null;
        try {
            const res = await API.timetable.getContent(entryId, today);
            content = res.content;
        } catch (e) {
            // kein Inhalt vorhanden
        }

        // Modal erstellen
        const modalHtml = `
            <div class="modal-overlay visible" id="lesson-content-overlay" onclick="if(event.target===this) App.closeLessonContent()">
                <div class="modal">
                    <div class="modal-header">
                        <h2 class="modal-title">${subject} — ${lessonNumber}. Stunde</h2>
                        <button class="modal-close" onclick="App.closeLessonContent()">X</button>
                    </div>
                    
                    ${canEdit ? `
                        <form onsubmit="App.saveLessonContent(event, '${entryId}', '${today}')">
                            <div class="form-row">
                                <label class="form-label">Thema</label>
                                <input type="text" id="lc-topic" class="form-input" 
                                    value="${content?.topic || ''}" placeholder="z.B. Addition im Zahlenraum 100">
                            </div>
                            <div class="form-row">
                                <label class="form-label">Beschreibung</label>
                                <textarea id="lc-description" class="form-input" rows="3"
                                    placeholder="Was wurde in der Stunde gemacht?">${content?.description || ''}</textarea>
                            </div>
                            <div class="form-row">
                                <label class="form-label">Hausaufgaben</label>
                                <textarea id="lc-homework" class="form-input" rows="2"
                                    placeholder="Aufgaben f\u00fcr zu Hause">${content?.homework || ''}</textarea>
                            </div>
                            <div class="form-row">
                                <label class="form-label">Ben\u00f6tigte Materialien</label>
                                <input type="text" id="lc-materials" class="form-input"
                                    value="${content?.materials || ''}" placeholder="z.B. Schere, Kleber, Farbstifte">
                            </div>
                            <button type="submit" class="btn btn-success btn-block mt-md">
                                Speichern
                            </button>
                        </form>
                        ${content ? `<p class="text-muted mt-sm" style="font-size: 12px; text-align: center;">
                            Zuletzt bearbeitet: ${new Date(content.updated_at || content.created_at).toLocaleString('de-DE')}
                            ${content.created_by_name ? ` von ${content.created_by_name}` : ''}
                        </p>` : ''}
                    ` : `
                        ${content ? `
                            <div class="lesson-content-view">
                                ${content.topic ? `
                                    <div class="lc-section">
                                        <div class="lc-label">Thema</div>
                                        <div class="lc-value">${content.topic}</div>
                                    </div>
                                ` : ''}
                                ${content.description ? `
                                    <div class="lc-section">
                                        <div class="lc-label">Beschreibung</div>
                                        <div class="lc-value">${content.description}</div>
                                    </div>
                                ` : ''}
                                ${content.homework ? `
                                    <div class="lc-section">
                                        <div class="lc-label">Hausaufgaben</div>
                                        <div class="lc-value">${content.homework}</div>
                                    </div>
                                ` : ''}
                                ${content.materials ? `
                                    <div class="lc-section">
                                        <div class="lc-label">Ben\u00f6tigte Materialien</div>
                                        <div class="lc-value">${content.materials}</div>
                                    </div>
                                ` : ''}
                                <p class="text-muted mt-sm" style="font-size: 12px; text-align: center;">
                                    ${content.created_by_name ? `Eingetragen von ${content.created_by_name}` : ''}
                                    ${content.updated_at ? ` am ${new Date(content.updated_at).toLocaleDateString('de-DE')}` : ''}
                                </p>
                            </div>
                        ` : `
                            <div class="empty-state">
                                <p>Noch keine Stundeninhalte eingetragen.</p>
                            </div>
                        `}
                    `}
                </div>
            </div>
        `;

        // Modal zum DOM hinzufügen
        const div = document.createElement('div');
        div.id = 'lesson-content-modal-wrapper';
        div.innerHTML = modalHtml;
        document.body.appendChild(div);
    },

    async saveLessonContent(event, entryId, date) {
        event.preventDefault();

        const data = {
            timetableEntryId: entryId,
            date: date,
            topic: document.getElementById('lc-topic').value,
            description: document.getElementById('lc-description').value,
            homework: document.getElementById('lc-homework').value,
            materials: document.getElementById('lc-materials').value
        };

        try {
            await API.timetable.saveContent(data);
            this.closeLessonContent();
            this.showToast('Stundeninhalt gespeichert');
        } catch (error) {
            this.showToast('Fehler beim Speichern', 'error');
        }
    },

    closeLessonContent() {
        const wrapper = document.getElementById('lesson-content-modal-wrapper');
        if (wrapper) wrapper.remove();
    },

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('visible'), 10);
        setTimeout(() => {
            toast.classList.remove('visible');
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    },

    openModal(id) {
        const modal = document.getElementById(`${id}-overlay`);
        if (modal) {
            modal.classList.add('visible');
        }
    },

    closeModal(id) {
        const modal = document.getElementById(`${id}-overlay`);
        if (modal) {
            modal.classList.remove('visible');
        }
    },

    async logout() {
        await Auth.logout();
        Router.navigate('/login');
    },

    selectDay(day) {
        this.currentDay = day;
        // Tabs aktualisieren
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.textContent.trim() === day);
        });
        // Stundenplan neu laden
        this.loadTimetableForDay(day);
    },

    // =====================================================
    // LOGIN PAGE
    // =====================================================

    renderLogin() {
        const content = `
            <div class="login-page">
                <div class="login-container">
                    <div class="login-logo">School Plan</div>
                    <h1 class="login-title">School Plan - <span class="highlight">Kids</span></h1>
                    <p class="login-subtitle">Dein digitaler Vertretungsplan</p>
                    
                    <div id="login-error" class="login-error hidden"></div>
                    
                    <form class="login-form" onsubmit="App.handleLogin(event)">
                        <div class="form-group">
                            <label class="form-label" for="email">E-Mail</label>
                            <input type="email" id="email" name="email" class="form-input" 
                                   placeholder="deine@email.de" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label" for="password">Passwort</label>
                            <input type="password" id="password" name="password" class="form-input" 
                                   placeholder="••••••••" required>
                        </div>
                        
                        <button type="submit" class="login-btn" id="login-btn">
                            Anmelden
                        </button>
                    </form>
                    
                    <div class="login-roles">
                        <span class="role-badge student">Schüler</span>
                        <span class="role-badge parent">Eltern</span>
                        <span class="role-badge teacher">Lehrer</span>
                        <span class="role-badge admin">Admin</span>
                    </div>

                    <div class="test-login-section">
                        <p class="test-login-label">Schnell-Login (Zufälliger Demo-Benutzer)</p>
                        <div class="test-login-buttons">
                            <button class="test-login-btn student" onclick="App.loginRandomUser('student')">
                                📚 Schüler (zufällig)
                            </button>
                            <button class="test-login-btn parent" onclick="App.loginRandomUser('parent')">
                                👨‍👩‍👧 Eltern (zufällig)
                            </button>
                            <button class="test-login-btn teacher" onclick="App.loginRandomUser('teacher')">
                                👩‍🏫 Lehrer (zufällig)
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        this.render(content, false);
    },

    fillTestLogin(email, password) {
        document.getElementById('email').value = email;
        document.getElementById('password').value = password;
        document.getElementById('login-error').classList.add('hidden');
    },

    async loginRandomUser(role) {
        const btn = event.target;
        const originalText = btn.innerHTML;
        
        try {
            btn.disabled = true;
            btn.textContent = 'Lädt...';

            // API aufrufen für zufälligen Benutzer
            const response = await fetch(`/api/auth/random-user/${role}`);
            const data = await response.json();

            if (!data.success) {
                alert('Fehler: ' + (data.error || 'Benutzer konnte nicht geladen werden'));
                btn.disabled = false;
                btn.innerHTML = originalText;
                return;
            }

            const user = data.user;
            const email = user.email;
            const password = 'test1234'; // Standard-Passwort für Demo-Benutzer

            // Direkt anmelden
            const loginResult = await Auth.login(email, password);

            if (loginResult.success) {
                Router.navigate('/');
            } else {
                alert('Anmeldung fehlgeschlagen: ' + (loginResult.error || 'Unbekannter Fehler'));
                btn.disabled = false;
                btn.innerHTML = originalText;
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Fehler beim Login: ' + error.message);
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    },

    async handleLogin(event) {
        event.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const btn = document.getElementById('login-btn');
        const errorDiv = document.getElementById('login-error');

        btn.disabled = true;
        btn.textContent = 'Anmelden...';
        errorDiv.classList.add('hidden');

        const result = await Auth.login(email, password);

        if (result.success) {
            Router.navigate('/');
        } else {
            errorDiv.textContent = result.error;
            errorDiv.classList.remove('hidden');
            btn.disabled = false;
            btn.textContent = 'Anmelden';
        }
    },

    // =====================================================
    // DASHBOARD
    // =====================================================

    async renderDashboard() {
        const role = Auth.getRole();
        const user = Auth.getUser();

        let dashboardContent = '';

        try {
            switch (role) {
                case 'student':
                    dashboardContent = await this.getStudentDashboard();
                    break;
                case 'parent':
                    dashboardContent = await this.getParentDashboard();
                    break;
                case 'teacher':
                    dashboardContent = await this.getTeacherDashboard();
                    break;
                case 'admin':
                    Router.navigate('/admin');
                    return;
                default:
                    dashboardContent = '<p>Willkommen!</p>';
            }
        } catch (error) {
            dashboardContent = `<p class="text-error">Fehler beim Laden: ${error.message}</p>`;
        }

        const content = `
            <h1 class="page-title">
                Hallo, ${user.firstName}!
            </h1>
            ${dashboardContent}
        `;

        this.render(content);
    },

    async getStudentDashboard() {
        this.selectedClassId = null;
        const [timetableRes, newsRes] = await Promise.all([
            API.timetable.getMy().catch(() => ({ timetable: {} })),
            API.news.getAll(null, 1).catch(() => ({ news: [] }))
        ]);

        const today = this.getTodayWeekday();
        const todayLessons = timetableRes.timetable[today] || [];

        return `
            ${Components.card('Dein Stundenplan heute', `
                ${Components.dayTabs(today)}
                <div id="timetable-container">
                    ${Components.timetable(todayLessons)}
                </div>
            `)}
            
            ${Components.latestNewsBanner(newsRes.news)}
        `;
    },

    async getParentDashboard() {
        const [childrenRes, newsRes, eventsRes] = await Promise.all([
            API.users.getChildren().catch(() => ({ children: [] })),
            API.news.getAll(null, 1).catch(() => ({ news: [] })),
            API.news.getEvents().catch(() => ({ events: [] }))
        ]);

        return `
            ${Components.card('Meine Kinder', Components.childrenCards(childrenRes.children))}
            
            ${eventsRes.events.length > 0 ? Components.card('Nächste Termine', `
                <div class="news-list">
                    ${eventsRes.events.slice(0, 3).map(e => `
                        <div class="news-item">
                            <div class="news-header">
                                <div class="news-title">${e.title}</div>
                                <div class="news-date">${new Date(e.event_date).toLocaleDateString('de-DE')}</div>
                            </div>
                            ${e.description ? `<p>${e.description}</p>` : ''}
                            ${e.location ? `<p class="text-muted">${e.location}</p>` : ''}
                        </div>
                    `).join('')}
                </div>
            `) : ''}
            
            ${Components.latestNewsBanner(newsRes.news)}
        `;
    },

    async getTeacherDashboard() {
        this.selectedClassId = null;
        const [timetableRes, newsRes] = await Promise.all([
            API.timetable.getMy().catch(() => ({ timetable: {} })),
            API.news.getAll(null, 1).catch(() => ({ news: [] }))
        ]);

        const today = this.getTodayWeekday();
        const todayLessons = timetableRes.timetable[today] || [];

        return `
            ${Components.card('Mein Stundenplan heute', `
                ${Components.dayTabs(today)}
                <div id="timetable-container">
                    ${Components.timetable(todayLessons)}
                </div>
            `)}
            
            ${Components.latestNewsBanner(newsRes.news)}
        `;
    },

    getTodayWeekday() {
        const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
        const today = days[new Date().getDay()];
        return ['Mo', 'Di', 'Mi', 'Do', 'Fr'].includes(today) ? today : 'Mo';
    },

    async loadTimetableForDay(day) {
        const container = document.getElementById('timetable-container');
        if (!container) return;

        container.innerHTML = '<p>Lädt...</p>';

        try {
            let res;
            if (this.selectedClassId) {
                res = await API.timetable.getForClass(this.selectedClassId);
            } else {
                res = await API.timetable.getMy();
            }
            const lessons = res.timetable[day] || [];
            container.innerHTML = Components.timetable(lessons);
        } catch (error) {
            container.innerHTML = `<p class="text-error">Fehler: ${error.message}</p>`;
        }
    },

    // =====================================================
    // NEWS
    // =====================================================

    async renderNews() {
        let newsContent = '';
        
        try {
            const res = await API.news.getAll(null, 50);
            newsContent = Components.newsList(res.news);
        } catch (error) {
            newsContent = `<p class="text-error">Fehler: ${error.message}</p>`;
        }

        this.render(`
            <h1 class="page-title">Neuigkeiten</h1>
            ${newsContent}
        `);
    },

    async renderCreateNews() {
        let classesOptions = [];
        
        try {
            const res = await API.classes.getMy();
            classesOptions = (res.classes || []).map(c => ({
                value: c.id,
                label: `Klasse ${c.name}`
            }));
        } catch (e) {}

        const content = `
            <h1 class="page-title">Ankündigung erstellen</h1>
            
            <div class="card">
                <form onsubmit="App.handleCreateNews(event)">
                    ${Components.formInput('title', 'Titel', 'text', true)}
                    
                    <div class="form-row">
                        <label class="form-label">Nachricht *</label>
                        <textarea id="content" name="content" class="form-input" rows="5" required></textarea>
                    </div>
                    
                    ${Components.formSelect('audience', 'Zielgruppe', [
                        { value: 'all', label: 'Alle' },
                        { value: 'students', label: 'Nur Schüler' },
                        { value: 'parents', label: 'Nur Eltern' },
                        { value: 'teachers', label: 'Nur Lehrer' },
                        { value: 'class', label: 'Nur bestimmte Klasse' },
                    ], true)}
                    
                    ${Components.formSelect('classId', 'Klasse (bei Klassenauswahl)', classesOptions)}
                    
                    ${Components.formSelect('priority', 'Priorität', [
                        { value: 'normal', label: 'Normal' },
                        { value: 'important', label: 'Wichtig' },
                        { value: 'urgent', label: 'Dringend' },
                    ])}
                    
                    <h3 class="mt-lg mb-md">Optional: Termin hinzufügen</h3>
                    ${Components.formInput('eventDate', 'Datum', 'date')}
                    ${Components.formInput('eventTime', 'Uhrzeit', 'time')}
                    ${Components.formInput('eventLocation', 'Ort', 'text')}
                    
                    <button type="submit" class="btn btn-success btn-block mt-lg">
                        Veröffentlichen
                    </button>
                </form>
            </div>
        `;

        this.render(content);
    },

    async handleCreateNews(event) {
        event.preventDefault();
        
        const formData = {
            title: document.getElementById('title').value,
            content: document.getElementById('content').value,
            audience: document.getElementById('audience').value,
            classId: document.getElementById('classId').value || null,
            priority: document.getElementById('priority').value || 'normal',
            eventDate: document.getElementById('eventDate').value || null,
            eventTime: document.getElementById('eventTime').value || null,
            eventLocation: document.getElementById('eventLocation').value || null,
        };

        try {
            await API.news.create(formData);
            alert('Ankündigung veröffentlicht!');
            Router.navigate('/news');
        } catch (error) {
            alert('Fehler: ' + error.message);
        }
    },

    // =====================================================
    // TIMETABLE
    // =====================================================

    async renderMyTimetable() {
        let timetableContent = '';
        this.selectedClassId = null;

        try {
            const res = await API.timetable.getMy();
            const today = this.getTodayWeekday();
            this.currentDay = today;
            
            timetableContent = `
                ${Components.dayTabs(today)}
                <div id="timetable-container">
                    ${Components.timetable(res.timetable[today] || [])}
                </div>
            `;
        } catch (error) {
            timetableContent = `<p class="text-error">Fehler: ${error.message}</p>`;
        }

        this.render(`
            <h1 class="page-title">Mein Stundenplan</h1>
            <div class="card">
                ${timetableContent}
            </div>
        `);
    },

    async renderClassTimetable(classId) {
        let timetableContent = '';
        let classInfo = '';

        try {
            const [timetableRes, classRes] = await Promise.all([
                API.timetable.getForClass(classId),
                API.classes.getOne(classId).catch(() => null)
            ]);
            
            const today = this.getTodayWeekday();
            this.currentDay = today;
            this.selectedClassId = classId;
            
            if (classRes?.class) {
                classInfo = `Klasse ${classRes.class.name}`;
            }

            timetableContent = `
                ${Components.dayTabs(today)}
                <div id="timetable-container">
                    ${Components.timetable(timetableRes.timetable[today] || [])}
                </div>
            `;
        } catch (error) {
            timetableContent = `<p class="text-error">Fehler: ${error.message}</p>`;
        }

        this.render(`
            <h1 class="page-title">Stundenplan ${classInfo}</h1>
            <div class="card">
                ${timetableContent}
            </div>
        `);
    },

    // =====================================================
    // PARENT PAGES
    // =====================================================

    async renderChildren() {
        let content = '';

        try {
            const res = await API.users.getChildren();
            content = Components.childrenCards(res.children);
        } catch (error) {
            content = `<p class="text-error">Fehler: ${error.message}</p>`;
        }

        this.render(`
            <h1 class="page-title">Meine Kinder</h1>
            ${content}
        `);
    },

    async renderEvents() {
        let content = '';

        try {
            const res = await API.news.getEvents();
            
            if (res.events && res.events.length > 0) {
                content = `
                    <div class="news-list">
                        ${res.events.map(e => `
                            <div class="news-item ${e.is_mandatory ? 'important' : ''}">
                                <div class="news-header">
                                    <div class="news-title">${e.title}</div>
                                    <div class="news-date">${new Date(e.event_date).toLocaleDateString('de-DE')}</div>
                                </div>
                                ${e.description ? `<p>${e.description}</p>` : ''}
                                <div class="news-event">
                                    ${e.start_time ? `<span>${e.start_time} Uhr</span>` : ''}
                                    ${e.location ? `<span>${e.location}</span>` : ''}
                                    ${e.class_name ? `<span>${e.class_name}</span>` : ''}
                                </div>
                                ${e.is_mandatory ? `<p class="text-warning mt-sm">Anwesenheit erforderlich</p>` : ''}
                            </div>
                        `).join('')}
                    </div>
                `;
            } else {
                content = Components.emptyState('', 'Keine Termine vorhanden');
            }
        } catch (error) {
            content = `<p class="text-error">Fehler: ${error.message}</p>`;
        }

        this.render(`
            <h1 class="page-title">Termine & Elternabende</h1>
            ${content}
        `);
    },

    async renderSickNote() {
        const role = Auth.getRole();
        let formContent = '';

        if (role === 'parent') {
            // Kinder laden für Auswahl
            try {
                const res = await API.users.getChildren();
                const childOptions = (res.children || []).map(c => ({
                    value: c.id,
                    label: `${c.first_name} ${c.last_name}`
                }));

                formContent = `
                    <form onsubmit="App.handleSickNote(event)" enctype="multipart/form-data">
                        ${Components.formSelect('studentId', 'Kind auswählen', childOptions, true)}
                        ${Components.formInput('startDate', 'Fehltag ab', 'date', true)}
                        ${Components.formInput('endDate', 'Fehltag bis (inkl.)', 'date', true)}
                        
                        <div class="form-row">
                            <label class="form-label">Grund (optional)</label>
                            <textarea id="reason" name="reason" class="form-input" rows="3" 
                                      placeholder="z.B. Erkältung (freiwillige Angabe)"></textarea>
                        </div>
                        
                        <div class="form-row">
                            <label class="form-label">Ärztliches Attest (optional)</label>
                            <input type="file" id="attestation" name="attestation" 
                                   class="form-input" accept=".pdf,.jpg,.jpeg,.png">
                        </div>
                        
                        <button type="submit" class="btn btn-success btn-block mt-lg">
                            Krankschreibung einreichen
                        </button>
                    </form>
                `;
            } catch (error) {
                formContent = `<p class="text-error">Fehler: ${error.message}</p>`;
            }
        } else if (role === 'teacher') {
            formContent = `
                <form onsubmit="App.handleTeacherSickNote(event)" enctype="multipart/form-data">
                    ${Components.formInput('startDate', 'Fehltag ab', 'date', true)}
                    ${Components.formInput('endDate', 'Fehltag bis (inkl.)', 'date', true)}
                    
                    <div class="form-row">
                        <label class="form-label">Grund (optional)</label>
                        <textarea id="reason" name="reason" class="form-input" rows="3"></textarea>
                    </div>
                    
                    <div class="form-row">
                        <label class="form-label">Ärztliches Attest</label>
                        <input type="file" id="attestation" name="attestation" 
                               class="form-input" accept=".pdf,.jpg,.jpeg,.png">
                    </div>
                    
                    <button type="submit" class="btn btn-success btn-block mt-lg">
                        Krankmeldung einreichen
                    </button>
                </form>
            `;
        }

        // Bisherige Krankmeldungen laden
        let historyContent = '';
        try {
            const res = await API.sickNotes.getMy();
            if (res.sickNotes && res.sickNotes.length > 0) {
                historyContent = Components.card('Meine Krankmeldungen', `
                    ${res.sickNotes.map(sn => `
                        <div class="flex justify-between items-center mb-md" style="padding: 10px; background: #f5f5f5; border-radius: 8px;">
                            <div>
                                ${sn.child_name ? `<strong>${sn.child_name}</strong><br>` : ''}
                                ${new Date(sn.start_date).toLocaleDateString('de-DE')} - ${new Date(sn.end_date).toLocaleDateString('de-DE')}
                            </div>
                            ${Components.badge(
                                sn.status === 'approved' ? 'Bestätigt' : 
                                sn.status === 'rejected' ? 'Abgelehnt' : 'Ausstehend',
                                sn.status
                            )}
                        </div>
                    `).join('')}
                `);
            }
        } catch (e) {}

        this.render(`
            <h1 class="page-title">Krankschreibung</h1>
            
            <div class="card">
                <p class="mb-lg text-muted">
                    Hinweis: Die Angabe eines Grundes ist freiwillig und dient nur zur Information.
                </p>
                ${formContent}
            </div>
            
            ${historyContent}
        `);
    },

    async handleSickNote(event) {
        event.preventDefault();

        const formData = new FormData();
        formData.append('studentId', document.getElementById('studentId').value);
        formData.append('startDate', document.getElementById('startDate').value);
        formData.append('endDate', document.getElementById('endDate').value);
        
        const reason = document.getElementById('reason').value;
        if (reason) formData.append('reason', reason);
        
        const file = document.getElementById('attestation').files[0];
        if (file) formData.append('attestation', file);

        try {
            await API.sickNotes.submitForStudent(formData);
            alert('Krankschreibung eingereicht!');
            this.renderSickNote();
        } catch (error) {
            alert('Fehler: ' + error.message);
        }
    },

    async handleTeacherSickNote(event) {
        event.preventDefault();

        const formData = new FormData();
        formData.append('startDate', document.getElementById('startDate').value);
        formData.append('endDate', document.getElementById('endDate').value);
        
        const reason = document.getElementById('reason').value;
        if (reason) formData.append('reason', reason);
        
        const file = document.getElementById('attestation').files[0];
        if (file) formData.append('attestation', file);

        try {
            await API.sickNotes.submitForTeacher(formData);
            alert('Krankmeldung eingereicht!');
            Router.navigate('/');
        } catch (error) {
            alert('Fehler: ' + error.message);
        }
    },

    // =====================================================
    // TEACHER PAGES
    // =====================================================

    async renderColleagues() {
        let content = '';

        try {
            const res = await API.users.getTeachers();
            
            content = `
                <div class="flex flex-wrap gap-md">
                    ${(res.teachers || []).map(t => `
                        <div class="card" style="flex: 1; min-width: 200px;">
                            <div class="flex items-center gap-md">
                                <span style="font-size: 40px;">${t.avatar_emoji || '👨‍🏫'}</span>
                                <div>
                                    <strong>${t.first_name} ${t.last_name}</strong>
                                    <br><small class="text-muted">${t.email}</small>
                                </div>
                            </div>
                            <a href="#/teacher/${t.id}/timetable" class="btn btn-secondary btn-block mt-md">
                                Stundenplan
                            </a>
                        </div>
                    `).join('')}
                </div>
            `;
        } catch (error) {
            content = `<p class="text-error">Fehler: ${error.message}</p>`;
        }

        this.render(`
            <h1 class="page-title">Kollegen</h1>
            ${content}
        `);
    },

    async renderSupervisions() {
        let content = '';

        try {
            const res = await API.timetable.getSupervisions();
            content = Components.supervisionsList(res.supervisions);
        } catch (error) {
            content = `<p class="text-error">Fehler: ${error.message}</p>`;
        }

        this.render(`
            <h1 class="page-title">Pausenaufsichten</h1>
            ${content}
        `);
    },

    async renderClassStudents(classId) {
        let content = '';

        try {
            const res = await API.classes.getOne(classId);
            const classInfo = res.class;
            const students = res.students || [];

            // Aktuelle Krankmeldungen laden
            let sickStudentIds = [];
            try {
                const sickRes = await API.sickNotes.getForClass(classId);
                sickStudentIds = (sickRes.sickNotes || []).map(sn => `${sn.first_name} ${sn.last_name}`);
            } catch (e) {}

            if (students.length > 0) {
                content = `
                    <div class="card">
                        <p class="text-muted mb-md">${students.length} Schüler in dieser Klasse</p>
                        <div class="student-list">
                            ${students.map(s => {
                                const fullName = `${s.first_name} ${s.last_name}`;
                                const isSick = sickStudentIds.includes(fullName);
                                return `
                                    <div class="flex items-center gap-md mb-sm" style="padding: 10px; background: ${isSick ? '#fff3e0' : '#f5f5f5'}; border-radius: 8px;${isSick ? ' border-left: 3px solid #ff9800;' : ''}">
                                        <span style="font-size: 28px;">${s.avatar_emoji || '👤'}</span>
                                        <div style="flex: 1;">
                                            <strong>${s.first_name} ${s.last_name}</strong>
                                        </div>
                                        ${isSick ? '<span style="color: #ff9800; font-size: 14px;">🤒 krank gemeldet</span>' : ''}
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                `;
            } else {
                content = Components.emptyState('', 'Keine Schüler in dieser Klasse');
            }

            this.render(`
                <div class="flex items-center gap-md mb-md">
                    <a href="#/classes" class="btn btn-secondary">&larr; Zurück</a>
                    <h1 class="page-title" style="margin: 0;">Klasse ${classInfo.name} — Schüler</h1>
                </div>
                ${content}
            `);
        } catch (error) {
            this.render(`
                <a href="#/classes" class="btn btn-secondary mb-md">&larr; Zurück</a>
                <p class="text-error">Fehler beim Laden: ${error.message}</p>
            `);
        }
    },

    async renderTeacherClasses() {
        let content = '';

        try {
            const res = await API.classes.getMy();
            
            if (res.classes && res.classes.length > 0) {
                content = `
                    <div class="flex flex-wrap gap-md">
                        ${res.classes.map(c => `
                            <div class="card" style="flex: 1; min-width: 250px;">
                                <h3>Klasse ${c.name}</h3>
                                <p class="text-muted">${c.subject || ''}</p>
                                <div class="flex gap-sm mt-md">
                                    <a href="#/timetable/${c.id}" class="btn btn-primary">Stundenplan</a>
                                    <a href="#/class/${c.id}/students" class="btn btn-secondary">Schüler</a>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
            } else {
                content = Components.emptyState('', 'Keine Klassen zugewiesen');
            }
        } catch (error) {
            content = `<p class="text-error">Fehler: ${error.message}</p>`;
        }

        this.render(`
            <h1 class="page-title">Meine Klassen</h1>
            ${content}
        `);
    },

    // =====================================================
    // ADMIN PAGES
    // =====================================================

    async renderAdminDashboard() {
        let content = '';

        try {
            const res = await API.admin.getDashboard();
            const stats = res.stats;

            content = `
                <div class="flex flex-wrap gap-md mb-lg">
                    <div class="card stat-card" style="flex: 1; min-width: 150px; text-align: center; cursor: pointer;" onclick="App.showUsersWithRole('student')">
                        <h2>${stats.users?.student || 0}</h2>
                        <p>Schüler</p>
                    </div>
                    <div class="card stat-card" style="flex: 1; min-width: 150px; text-align: center; cursor: pointer;" onclick="App.showUsersWithRole('parent')">
                        <h2>${stats.users?.parent || 0}</h2>
                        <p>Eltern</p>
                    </div>
                    <div class="card stat-card" style="flex: 1; min-width: 150px; text-align: center; cursor: pointer;" onclick="App.showUsersWithRole('teacher')">
                        <h2>${stats.users?.teacher || 0}</h2>
                        <p>Lehrer</p>
                    </div>
                    <div class="card stat-card" style="flex: 1; min-width: 150px; text-align: center; cursor: pointer;" onclick="Router.navigate('/admin/classes')">
                        <h2>${stats.classes || 0}</h2>
                        <p>Klassen</p>
                    </div>
                </div>
                
                ${stats.pendingSickNotes > 0 ? `
                    <div class="card" style="background: #fff3e0; border-left: 4px solid #ff9800;">
                        <h3>${stats.pendingSickNotes} offene Krankmeldungen</h3>
                        <a href="#/admin/sick-notes" class="btn btn-primary mt-md">Jetzt bearbeiten</a>
                    </div>
                ` : ''}
                
                ${stats.recentNews && stats.recentNews.length > 0 ? Components.card('Letzte Ankündigungen', `
                    ${stats.recentNews.map(n => `
                        <div class="mb-sm">
                            <strong>${n.title}</strong>
                            <span class="text-muted"> - ${new Date(n.created_at).toLocaleDateString('de-DE')}</span>
                        </div>
                    `).join('')}
                `) : ''}
            `;
        } catch (error) {
            content = `<p class="text-error">Fehler: ${error.message}</p>`;
        }

        this.render(`
            <h1 class="page-title">Admin Dashboard</h1>
            ${content}
        `);
    },

    adminUserRoleFilter: null,
    adminUserSearchQuery: '',

    showUsersWithRole(role) {
        this.adminUserRoleFilter = role;
        this.adminUserSearchQuery = '';
        Router.navigate('/admin/users');
    },

    filterUsersByRole(role) {
        this.adminUserRoleFilter = role;
        this.renderAdminUsers();
    },

    filterUsersBySearch(query) {
        this.adminUserSearchQuery = query.toLowerCase();
        // Nur die Liste aktualisieren, nicht die ganze Seite neu rendern
        this._updateAdminUserList();
    },

    _buildUserCards(users) {
        if (users.length === 0) {
            return Components.emptyState('', 'Keine Benutzer gefunden');
        }
        return users.map((u, idx) => {
            const created = new Date(u.created_at).toLocaleDateString('de-DE');
            return `
                <div class="admin-detail-card fade-in">
                    <div class="admin-detail-summary" onclick="App.toggleAdminDetail('user-${idx}')">
                        <div class="admin-detail-main">
                            <strong>${u.avatar_emoji || ''} ${u.first_name} ${u.last_name}</strong>
                            <span class="admin-detail-meta">${u.email} | ${Auth.getRoleDisplayName(u.role)} | ${u.is_active ? 'Aktiv' : 'Inaktiv'}</span>
                        </div>
                        <span class="admin-detail-arrow" id="arrow-user-${idx}">&#9654;</span>
                    </div>
                    <div class="admin-detail-content" id="detail-user-${idx}" style="display:none;">
                        <div class="admin-detail-grid">
                            <div class="admin-detail-field">
                                <span class="admin-detail-label">Vorname</span>
                                <span class="admin-detail-value">${u.first_name}</span>
                            </div>
                            <div class="admin-detail-field">
                                <span class="admin-detail-label">Nachname</span>
                                <span class="admin-detail-value">${u.last_name}</span>
                            </div>
                            <div class="admin-detail-field">
                                <span class="admin-detail-label">E-Mail</span>
                                <span class="admin-detail-value">${u.email}</span>
                            </div>
                            <div class="admin-detail-field">
                                <span class="admin-detail-label">Rolle</span>
                                <span class="admin-detail-value">${Auth.getRoleDisplayName(u.role)}</span>
                            </div>
                            <div class="admin-detail-field">
                                <span class="admin-detail-label">Status</span>
                                <span class="admin-detail-value">${u.is_active ? 'Aktiv' : 'Inaktiv'}</span>
                            </div>
                            <div class="admin-detail-field">
                                <span class="admin-detail-label">Registriert</span>
                                <span class="admin-detail-value">${created}</span>
                            </div>
                        </div>
                        <div class="admin-detail-actions mt-sm">
                            <button class="btn btn-secondary" onclick="event.stopPropagation(); App.editUser('${u.id}')">Bearbeiten</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    _filterCachedUsers() {
        const searchQuery = this.adminUserSearchQuery || '';
        let users = this._cachedAdminUsers || [];
        if (searchQuery) {
            users = users.filter(u => {
                const full = `${u.first_name} ${u.last_name} ${u.email}`.toLowerCase();
                return full.includes(searchQuery);
            });
        }
        return users;
    },

    _updateAdminUserList() {
        const listEl = document.getElementById('admin-user-list');
        if (!listEl) return;
        const users = this._filterCachedUsers();
        listEl.innerHTML = this._buildUserCards(users);
    },

    async renderAdminUsers() {
        let content = '';
        const activeRole = this.adminUserRoleFilter || null;
        const searchQuery = this.adminUserSearchQuery || '';

        try {
            const res = await API.admin.getUsers(activeRole);
            this._cachedAdminUsers = res.users || [];

            const users = this._filterCachedUsers();

            const roleLabels = [
                { key: null, label: 'Alle' },
                { key: 'student', label: 'Schüler' },
                { key: 'parent', label: 'Eltern' },
                { key: 'teacher', label: 'Lehrer' },
                { key: 'admin', label: 'Admins' }
            ];

            const userCards = this._buildUserCards(users);

            content = `
                <div class="role-filter-tabs mb-md">
                    ${roleLabels.map(r => `
                        <button class="role-filter-btn ${activeRole === r.key ? 'active' : ''}" 
                                onclick="App.filterUsersByRole(${r.key ? "'" + r.key + "'" : 'null'})">
                            ${r.label}
                        </button>
                    `).join('')}
                </div>
                <div class="flex justify-between items-center mb-lg gap-md">
                    <input type="text" class="form-input" id="admin-user-search" placeholder="Name oder E-Mail suchen..." 
                           value="${searchQuery}" 
                           oninput="App.filterUsersBySearch(this.value)"
                           style="max-width: 350px;">
                    <button class="btn btn-success" onclick="App.showCreateUserModal()">
                        Neuer Benutzer
                    </button>
                </div>
                <div class="admin-detail-list" id="admin-user-list">
                    ${userCards}
                </div>
            `;
        } catch (error) {
            content = `<p class="text-error">Fehler: ${error.message}</p>`;
        }

        this.render(`
            <h1 class="page-title">Benutzer verwalten</h1>
            ${content}
        `);
    },

    async renderAdminClasses() {
        let content = '';

        try {
            const res = await API.classes.getAll();
            
            const headers = ['Klasse', 'Stufe', 'Klassenlehrer', 'Schüler', 'Aktionen'];
            const rows = (res.classes || []).map(c => [
                c.name,
                `${c.grade_level}. Klasse`,
                c.class_teacher_name || '-',
                c.student_count || 0,
                `<a href="#/class/${c.id}/students" class="btn btn-secondary" style="margin-right:6px;">Schüler</a><a href="#/timetable/${c.id}" class="btn btn-secondary">Stundenplan</a>`
            ]);

            content = Components.table(headers, rows, 'Keine Klassen gefunden');
        } catch (error) {
            content = `<p class="text-error">Fehler: ${error.message}</p>`;
        }

        this.render(`
            <h1 class="page-title">Klassen verwalten</h1>
            <div class="card">
                ${content}
            </div>
        `);
    },

    async renderAdminTimetable() {
        let content = '';

        try {
            const [classesRes, subjectsRes, roomsRes] = await Promise.all([
                API.classes.getAll(),
                API.admin.getSubjects(),
                API.admin.getRooms()
            ]);

            content = `
                <p class="mb-lg">Wähle eine Klasse um den Stundenplan zu bearbeiten:</p>
                
                <div class="flex flex-wrap gap-md">
                    ${(classesRes.classes || []).map(c => `
                        <div class="card" style="flex: 1; min-width: 200px;">
                            <h3>${c.name}</h3>
                            <a href="#/admin/timetable/${c.id}" class="btn btn-primary btn-block mt-md">
                                Bearbeiten
                            </a>
                        </div>
                    `).join('')}
                </div>
            `;
        } catch (error) {
            content = `<p class="text-error">Fehler: ${error.message}</p>`;
        }

        this.render(`
            <h1 class="page-title">Stundenpläne verwalten</h1>
            ${content}
        `);
    },

    // Timetable Editor State
    timetableEditData: { entries: [], subjects: [], rooms: [], teachers: [], classId: null, className: '', weekMode: false, weekStart: null, substitutions: [] },

    getWeekDates(baseDate) {
        const d = new Date(baseDate);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
        const monday = new Date(d.setDate(diff));
        const dates = {};
        const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr'];
        WEEKDAYS.forEach((wd, i) => {
            const dt = new Date(monday);
            dt.setDate(monday.getDate() + i);
            dates[wd] = dt.toISOString().split('T')[0];
        });
        return dates;
    },

    formatWeekLabel(weekDates) {
        const mo = new Date(weekDates['Mo']).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
        const fr = new Date(weekDates['Fr']).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
        return `${mo} - ${fr}`;
    },

    async renderAdminTimetableEdit(classId) {
        const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr'];
        const WEEKDAY_NAMES = { Mo: 'Montag', Di: 'Dienstag', Mi: 'Mittwoch', Do: 'Donnerstag', Fr: 'Freitag' };
        const LESSON_TIMES = [
            { nr: 1, start: '08:00', end: '08:45' },
            { nr: 2, start: '08:50', end: '09:35' },
            { nr: 3, start: '09:55', end: '10:40' },
            { nr: 4, start: '10:45', end: '11:30' },
            { nr: 5, start: '11:35', end: '12:20' },
            { nr: 6, start: '12:25', end: '13:10' },
        ];

        let content = '';
        try {
            const weekMode = this.timetableEditData.weekMode || false;
            const weekStartDate = this.timetableEditData.weekStart || new Date().toISOString().split('T')[0];
            const weekDates = this.getWeekDates(weekStartDate);

            const [timetableRes, subjectsRes, roomsRes, teachersRes, classesRes] = await Promise.all([
                API.timetable.getForClass(classId),
                API.admin.getSubjects(),
                API.admin.getRooms(),
                API.admin.getUsers('teacher'),
                API.classes.getAll()
            ]);

            // Load substitutions if in week mode
            let substitutions = [];
            if (weekMode) {
                const subRes = await API.admin.getSubstitutions(classId, weekDates['Mo'], weekDates['Fr']);
                substitutions = subRes.substitutions || [];
            }

            const cls = (classesRes.classes || []).find(c => c.id === classId);
            const className = cls ? cls.name : 'Klasse';
            const timetable = timetableRes.timetable || {};
            const subjects = subjectsRes.subjects || [];
            const rooms = roomsRes.rooms || [];
            const teachers = (teachersRes.users || []).filter(u => u.role === 'teacher');

            this.timetableEditData = { entries: timetable, subjects, rooms, teachers, classId, className, weekMode, weekStart: weekStartDate, substitutions };

            const subjectOptions = subjects.map(s => `<option value="${s.id}">${s.icon || ''} ${s.name}</option>`).join('');
            const roomOptions = rooms.map(r => `<option value="${r.id}">${r.name}</option>`).join('');
            const teacherOptions = teachers.map(t => `<option value="${t.id}">${t.first_name} ${t.last_name}</option>`).join('');

            // Week navigation
            const weekLabel = this.formatWeekLabel(weekDates);

            const modeToggle = `
                <div class="week-mode-bar">
                    <div class="week-mode-tabs">
                        <button class="role-filter-btn ${!weekMode ? 'active' : ''}" onclick="App.switchTimetableMode(false)">Grundplan</button>
                        <button class="role-filter-btn ${weekMode ? 'active' : ''}" onclick="App.switchTimetableMode(true)">Wochenplanung</button>
                    </div>
                    ${weekMode ? `
                    <div class="week-nav">
                        <button class="btn btn-secondary btn-sm" onclick="App.shiftWeek(-1)">&#9664;</button>
                        <span class="week-label">${weekLabel}</span>
                        <button class="btn btn-secondary btn-sm" onclick="App.shiftWeek(1)">&#9654;</button>
                        <button class="btn btn-secondary btn-sm" onclick="App.goToCurrentWeek()" style="margin-left:4px;">Heute</button>
                    </div>` : ''}
                </div>
            `;

            // Build grid
            let gridHTML = `<div class="tt-edit-grid">`;
            gridHTML += `<div class="tt-edit-header-cell">Std.</div>`;
            WEEKDAYS.forEach(d => {
                let headerText = WEEKDAY_NAMES[d];
                if (weekMode) {
                    const dateStr = new Date(weekDates[d]).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
                    headerText += `<br><small>${dateStr}</small>`;
                }
                gridHTML += `<div class="tt-edit-header-cell">${headerText}</div>`;
            });

            LESSON_TIMES.forEach(lesson => {
                gridHTML += `<div class="tt-edit-time-cell">
                    <strong>${lesson.nr}.</strong><br>
                    <small>${lesson.start}<br>${lesson.end}</small>
                </div>`;

                WEEKDAYS.forEach(day => {
                    const entries = (timetable[day] || []).filter(e => e.lessonNumber === lesson.nr && e.type !== 'break');
                    const entry = entries[0];

                    if (weekMode) {
                        // In week mode: show substitutions overlaid on base entries
                        const sub = substitutions.find(s => s.weekday === day && s.lesson_number === lesson.nr);

                        if (entry) {
                            if (sub) {
                                // Substitution exists
                                if (sub.is_cancelled) {
                                    gridHTML += `
                                        <div class="tt-edit-cell filled sub-cancelled" onclick="App.editSubstitution('${sub.id}', '${entry.id}', '${day}', ${lesson.nr}, '${weekDates[day]}')">
                                            <div class="tt-cell-subject"><s>${entry.icon || ''} ${entry.shortName || entry.subject || ''}</s></div>
                                            <div class="tt-cell-detail sub-badge">Entfällt</div>
                                            ${sub.note_for_students ? `<div class="tt-cell-detail sub-note">${sub.note_for_students}</div>` : ''}
                                        </div>`;
                                } else {
                                    gridHTML += `
                                        <div class="tt-edit-cell filled sub-changed" onclick="App.editSubstitution('${sub.id}', '${entry.id}', '${day}', ${lesson.nr}, '${weekDates[day]}')">
                                            <div class="tt-cell-subject">${sub.substitute_subject || entry.icon || ''} ${sub.substitute_subject || entry.shortName || entry.subject || ''}</div>
                                            <div class="tt-cell-detail">${sub.substitute_teacher || entry.teacher ? (sub.substitute_teacher || entry.teacher).split(' ').pop() : ''}</div>
                                            <div class="tt-cell-detail">${sub.substitute_room || entry.room || ''}</div>
                                            <div class="tt-cell-detail sub-badge">Vertretung</div>
                                        </div>`;
                                }
                            } else {
                                // No substitution — show base entry, clickable to add one
                                gridHTML += `
                                    <div class="tt-edit-cell filled" onclick="App.addSubstitution('${entry.id}', '${day}', ${lesson.nr}, '${weekDates[day]}')">
                                        <div class="tt-cell-subject">${entry.icon || ''} ${entry.shortName || entry.subject || ''}</div>
                                        <div class="tt-cell-detail">${entry.teacher ? entry.teacher.split(' ').pop() : ''}</div>
                                        <div class="tt-cell-detail">${entry.room || ''}</div>
                                    </div>`;
                            }
                        } else {
                            gridHTML += `<div class="tt-edit-cell empty"></div>`;
                        }
                    } else {
                        // Base plan mode (original)
                        if (entry) {
                            gridHTML += `
                                <div class="tt-edit-cell filled" onclick="App.editTimetableEntry('${entry.id}', '${day}', ${lesson.nr})">
                                    <div class="tt-cell-subject">${entry.icon || ''} ${entry.shortName || entry.subject || ''}</div>
                                    <div class="tt-cell-detail">${entry.teacher ? entry.teacher.split(' ').pop() : ''}</div>
                                    <div class="tt-cell-detail">${entry.room || ''}</div>
                                </div>`;
                        } else {
                            gridHTML += `
                                <div class="tt-edit-cell empty" onclick="App.addTimetableEntry('${day}', ${lesson.nr}, '${lesson.start}', '${lesson.end}')">
                                    <span class="tt-cell-add">+</span>
                                </div>`;
                        }
                    }
                });
            });
            gridHTML += `</div>`;

            content = `
                <div class="flex" style="justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                    <h1 class="page-title" style="margin:0;">Stundenplan ${className}</h1>
                    <a href="#/admin/timetable" class="btn btn-secondary">Zurueck</a>
                </div>
                ${modeToggle}
                <p class="text-muted mt-sm mb-lg">${weekMode ? 'Klicke auf eine Stunde um eine Vertretung/Aenderung fuer diese Woche einzutragen.' : 'Klicke auf eine Zelle um den Grundplan zu bearbeiten.'}</p>
                ${gridHTML}
            `;

            // Base plan modal (only shown in base mode)
            if (!weekMode) {
                content += `
                    <div class="modal-overlay" id="tt-modal-overlay">
                        <div class="modal">
                            <div class="modal-header">
                                <h2 id="tt-modal-title">Stunde bearbeiten</h2>
                                <button class="modal-close" onclick="App.closeTTModal()">X</button>
                            </div>
                            <form id="tt-entry-form" onsubmit="App.saveTimetableEntry(event)">
                                <input type="hidden" id="tt-entry-id">
                                <input type="hidden" id="tt-entry-day">
                                <input type="hidden" id="tt-entry-lesson">
                                <div class="form-group">
                                    <label class="form-label">Fach</label>
                                    <select id="tt-subject" class="form-input" required>
                                        <option value="">-- Fach waehlen --</option>
                                        ${subjectOptions}
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Lehrer</label>
                                    <select id="tt-teacher" class="form-input">
                                        <option value="">-- Lehrer waehlen --</option>
                                        ${teacherOptions}
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Raum</label>
                                    <select id="tt-room" class="form-input">
                                        <option value="">-- Raum waehlen --</option>
                                        ${roomOptions}
                                    </select>
                                </div>
                                <div class="flex gap-sm" style="flex-wrap:wrap;">
                                    <div class="form-group" style="flex:1;">
                                        <label class="form-label">Von</label>
                                        <input type="time" id="tt-start" class="form-input" required>
                                    </div>
                                    <div class="form-group" style="flex:1;">
                                        <label class="form-label">Bis</label>
                                        <input type="time" id="tt-end" class="form-input" required>
                                    </div>
                                </div>
                                <div class="flex gap-sm mt-md">
                                    <button type="submit" class="btn btn-primary" style="flex:1;">Speichern</button>
                                    <button type="button" class="btn btn-secondary" onclick="App.closeTTModal()" style="flex:1;">Abbrechen</button>
                                </div>
                                <button type="button" class="btn btn-danger btn-block mt-md" id="tt-delete-btn" style="display:none;" onclick="App.deleteTimetableEntry()">
                                    Stunde loeschen
                                </button>
                            </form>
                        </div>
                    </div>
                `;
            }

            // Substitution modal (only in week mode)
            if (weekMode) {
                content += `
                    <div class="modal-overlay" id="sub-modal-overlay">
                        <div class="modal">
                            <div class="modal-header">
                                <h2 id="sub-modal-title">Vertretung / Aenderung</h2>
                                <button class="modal-close" onclick="App.closeSubModal()">X</button>
                            </div>
                            <form id="sub-entry-form" onsubmit="App.saveSubstitution(event)">
                                <input type="hidden" id="sub-id">
                                <input type="hidden" id="sub-entry-id">
                                <input type="hidden" id="sub-date">
                                <div class="form-group">
                                    <label class="form-label">
                                        <input type="checkbox" id="sub-cancelled"> Stunde faellt aus
                                    </label>
                                </div>
                                <div id="sub-fields">
                                    <div class="form-group">
                                        <label class="form-label">Vertretungslehrer</label>
                                        <select id="sub-teacher" class="form-input">
                                            <option value="">-- Kein Wechsel --</option>
                                            ${teacherOptions}
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">Vertretungsfach</label>
                                        <select id="sub-subject" class="form-input">
                                            <option value="">-- Kein Wechsel --</option>
                                            ${subjectOptions}
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">Vertretungsraum</label>
                                        <select id="sub-room" class="form-input">
                                            <option value="">-- Kein Wechsel --</option>
                                            ${roomOptions}
                                        </select>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Grund (intern)</label>
                                    <input type="text" id="sub-reason" class="form-input" placeholder="z.B. Lehrer krank">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Hinweis fuer Schueler</label>
                                    <input type="text" id="sub-note" class="form-input" placeholder="z.B. Bringt Malsachen mit">
                                </div>
                                <div class="flex gap-sm mt-md">
                                    <button type="submit" class="btn btn-primary" style="flex:1;">Speichern</button>
                                    <button type="button" class="btn btn-secondary" onclick="App.closeSubModal()" style="flex:1;">Abbrechen</button>
                                </div>
                                <button type="button" class="btn btn-danger btn-block mt-md" id="sub-delete-btn" style="display:none;" onclick="App.deleteSubstitution()">
                                    Vertretung loeschen
                                </button>
                            </form>
                        </div>
                    </div>
                `;
            }
        } catch (error) {
            content = `
                <a href="#/admin/timetable" class="btn btn-secondary mb-lg">Zurueck</a>
                <p class="text-error">Fehler beim Laden: ${error.message}</p>
            `;
        }

        this.render(content);

        // Bind cancelled checkbox toggle
        const cancelledCheckbox = document.getElementById('sub-cancelled');
        if (cancelledCheckbox) {
            cancelledCheckbox.addEventListener('change', () => {
                document.getElementById('sub-fields').style.display = cancelledCheckbox.checked ? 'none' : 'block';
            });
        }
    },

    switchTimetableMode(weekMode) {
        this.timetableEditData.weekMode = weekMode;
        if (weekMode && !this.timetableEditData.weekStart) {
            this.timetableEditData.weekStart = new Date().toISOString().split('T')[0];
        }
        this.renderAdminTimetableEdit(this.timetableEditData.classId);
    },

    shiftWeek(direction) {
        const current = new Date(this.timetableEditData.weekStart);
        current.setDate(current.getDate() + direction * 7);
        this.timetableEditData.weekStart = current.toISOString().split('T')[0];
        this.renderAdminTimetableEdit(this.timetableEditData.classId);
    },

    goToCurrentWeek() {
        this.timetableEditData.weekStart = new Date().toISOString().split('T')[0];
        this.renderAdminTimetableEdit(this.timetableEditData.classId);
    },

    openTTModal() {
        document.getElementById('tt-modal-overlay').classList.add('visible');
    },

    closeTTModal() {
        document.getElementById('tt-modal-overlay').classList.remove('visible');
    },

    addTimetableEntry(day, lessonNr, startTime, endTime) {
        document.getElementById('tt-modal-title').textContent = `Neue Stunde — ${day}, ${lessonNr}. Stunde`;
        document.getElementById('tt-entry-id').value = '';
        document.getElementById('tt-entry-day').value = day;
        document.getElementById('tt-entry-lesson').value = lessonNr;
        document.getElementById('tt-subject').value = '';
        document.getElementById('tt-teacher').value = '';
        document.getElementById('tt-room').value = '';
        document.getElementById('tt-start').value = startTime;
        document.getElementById('tt-end').value = endTime;
        document.getElementById('tt-delete-btn').style.display = 'none';
        this.openTTModal();
    },

    editTimetableEntry(entryId, day, lessonNr) {
        // Find the entry in stored data
        const dayEntries = this.timetableEditData.entries[day] || [];
        const entry = dayEntries.find(e => e.id === entryId);
        if (!entry) return;

        document.getElementById('tt-modal-title').textContent = `Stunde bearbeiten — ${day}, ${lessonNr}. Stunde`;
        document.getElementById('tt-entry-id').value = entryId;
        document.getElementById('tt-entry-day').value = day;
        document.getElementById('tt-entry-lesson').value = lessonNr;

        // Match subject by name
        const subj = this.timetableEditData.subjects.find(s => s.name === entry.subject || s.short_name === entry.shortName);
        document.getElementById('tt-subject').value = subj ? subj.id : '';

        // Match teacher by name
        const teacher = this.timetableEditData.teachers.find(t => `${t.first_name} ${t.last_name}` === entry.teacher);
        document.getElementById('tt-teacher').value = teacher ? teacher.id : '';

        // Match room by name
        const room = this.timetableEditData.rooms.find(r => r.name === entry.room);
        document.getElementById('tt-room').value = room ? room.id : '';

        document.getElementById('tt-start').value = entry.startTime ? entry.startTime.slice(0, 5) : '';
        document.getElementById('tt-end').value = entry.endTime ? entry.endTime.slice(0, 5) : '';
        document.getElementById('tt-delete-btn').style.display = 'block';
        this.openTTModal();
    },

    async saveTimetableEntry(event) {
        event.preventDefault();
        const entryId = document.getElementById('tt-entry-id').value;
        const data = {
            classId: this.timetableEditData.classId,
            weekday: document.getElementById('tt-entry-day').value,
            lessonNumber: parseInt(document.getElementById('tt-entry-lesson').value),
            subjectId: document.getElementById('tt-subject').value || null,
            teacherId: document.getElementById('tt-teacher').value || null,
            roomId: document.getElementById('tt-room').value || null,
            startTime: document.getElementById('tt-start').value,
            endTime: document.getElementById('tt-end').value,
            entryType: 'lesson',
        };

        try {
            if (entryId) {
                await API.admin.updateTimetableEntry(entryId, data);
            } else {
                await API.admin.createTimetableEntry(data);
            }
            this.closeTTModal();
            this.renderAdminTimetableEdit(this.timetableEditData.classId);
        } catch (error) {
            alert('Fehler: ' + error.message);
        }
    },

    async deleteTimetableEntry() {
        const entryId = document.getElementById('tt-entry-id').value;
        if (!entryId) return;
        if (!confirm('Diese Stunde wirklich loeschen?')) return;

        try {
            await API.admin.deleteTimetableEntry(entryId);
            this.closeTTModal();
            this.renderAdminTimetableEdit(this.timetableEditData.classId);
        } catch (error) {
            alert('Fehler: ' + error.message);
        }
    },

    // =====================================================
    // SUBSTITUTION (Week-based) helpers
    // =====================================================

    openSubModal() {
        document.getElementById('sub-modal-overlay').classList.add('visible');
    },

    closeSubModal() {
        document.getElementById('sub-modal-overlay').classList.remove('visible');
    },

    addSubstitution(entryId, day, lessonNr, date) {
        const WEEKDAY_NAMES = { Mo: 'Montag', Di: 'Dienstag', Mi: 'Mittwoch', Do: 'Donnerstag', Fr: 'Freitag' };
        const dateStr = new Date(date).toLocaleDateString('de-DE');
        document.getElementById('sub-modal-title').textContent = `Vertretung: ${WEEKDAY_NAMES[day]}, ${dateStr}, ${lessonNr}. Stunde`;
        document.getElementById('sub-id').value = '';
        document.getElementById('sub-entry-id').value = entryId;
        document.getElementById('sub-date').value = date;
        document.getElementById('sub-cancelled').checked = false;
        document.getElementById('sub-fields').style.display = 'block';
        document.getElementById('sub-teacher').value = '';
        document.getElementById('sub-subject').value = '';
        document.getElementById('sub-room').value = '';
        document.getElementById('sub-reason').value = '';
        document.getElementById('sub-note').value = '';
        document.getElementById('sub-delete-btn').style.display = 'none';
        this.openSubModal();
    },

    editSubstitution(subId, entryId, day, lessonNr, date) {
        const WEEKDAY_NAMES = { Mo: 'Montag', Di: 'Dienstag', Mi: 'Mittwoch', Do: 'Donnerstag', Fr: 'Freitag' };
        const dateStr = new Date(date).toLocaleDateString('de-DE');
        const sub = this.timetableEditData.substitutions.find(s => s.id === subId);
        if (!sub) return;

        document.getElementById('sub-modal-title').textContent = `Vertretung: ${WEEKDAY_NAMES[day]}, ${dateStr}, ${lessonNr}. Stunde`;
        document.getElementById('sub-id').value = subId;
        document.getElementById('sub-entry-id').value = entryId;
        document.getElementById('sub-date').value = date;
        document.getElementById('sub-cancelled').checked = sub.is_cancelled;
        document.getElementById('sub-fields').style.display = sub.is_cancelled ? 'none' : 'block';
        document.getElementById('sub-teacher').value = sub.substitute_teacher_id || '';
        document.getElementById('sub-subject').value = sub.substitute_subject_id || '';
        document.getElementById('sub-room').value = sub.substitute_room_id || '';
        document.getElementById('sub-reason').value = sub.reason || '';
        document.getElementById('sub-note').value = sub.note_for_students || '';
        document.getElementById('sub-delete-btn').style.display = 'block';
        this.openSubModal();
    },

    async saveSubstitution(event) {
        event.preventDefault();
        const subId = document.getElementById('sub-id').value;
        const data = {
            originalEntryId: document.getElementById('sub-entry-id').value,
            date: document.getElementById('sub-date').value,
            isCancelled: document.getElementById('sub-cancelled').checked,
            substituteTeacherId: document.getElementById('sub-teacher').value || null,
            substituteSubjectId: document.getElementById('sub-subject').value || null,
            substituteRoomId: document.getElementById('sub-room').value || null,
            reason: document.getElementById('sub-reason').value || null,
            noteForStudents: document.getElementById('sub-note').value || null,
        };

        try {
            if (subId) {
                await API.admin.updateSubstitution(subId, data);
            } else {
                await API.admin.createSubstitution(data);
            }
            this.closeSubModal();
            App.showToast('Vertretung gespeichert');
            this.renderAdminTimetableEdit(this.timetableEditData.classId);
        } catch (error) {
            alert('Fehler: ' + error.message);
        }
    },

    async deleteSubstitution() {
        const subId = document.getElementById('sub-id').value;
        if (!subId) return;
        if (!confirm('Vertretung wirklich loeschen?')) return;
        try {
            await API.admin.deleteSubstitution(subId);
            this.closeSubModal();
            App.showToast('Vertretung geloescht');
            this.renderAdminTimetableEdit(this.timetableEditData.classId);
        } catch (error) {
            alert('Fehler: ' + error.message);
        }
    },

    async renderAdminSickNotes() {
        let content = '';

        try {
            const res = await API.sickNotes.getForAdmin();
            const sickNotes = res.sickNotes || [];

            if (sickNotes.length === 0) {
                content = Components.emptyState('', 'Keine Krankmeldungen vorhanden');
            } else {
                content = sickNotes.map((sn, idx) => {
                    const startDate = new Date(sn.start_date).toLocaleDateString('de-DE');
                    const endDate = new Date(sn.end_date).toLocaleDateString('de-DE');
                    const createdAt = new Date(sn.created_at).toLocaleString('de-DE');
                    const statusLabel = sn.status === 'approved' ? 'Bestätigt' : sn.status === 'rejected' ? 'Abgelehnt' : 'Ausstehend';
                    const personType = sn.person_type === 'student' ? 'Schüler' : 'Lehrer';

                    return `
                        <div class="admin-detail-card fade-in">
                            <div class="admin-detail-summary" onclick="App.toggleAdminDetail('sn-${idx}')">
                                <div class="admin-detail-main">
                                    <strong>${sn.person_name}</strong>
                                    <span class="admin-detail-meta">${personType} | ${startDate} - ${endDate} | ${Components.badge(statusLabel, sn.status)}</span>
                                </div>
                                <span class="admin-detail-arrow" id="arrow-sn-${idx}">&#9654;</span>
                            </div>
                            <div class="admin-detail-content" id="detail-sn-${idx}" style="display:none;">
                                <div class="admin-detail-grid">
                                    <div class="admin-detail-field">
                                        <span class="admin-detail-label">Person</span>
                                        <span class="admin-detail-value">${sn.person_name} (${personType})</span>
                                    </div>
                                    <div class="admin-detail-field">
                                        <span class="admin-detail-label">Zeitraum</span>
                                        <span class="admin-detail-value">${startDate} - ${endDate}</span>
                                    </div>
                                    <div class="admin-detail-field">
                                        <span class="admin-detail-label">Eingereicht von</span>
                                        <span class="admin-detail-value">${sn.submitted_by_name || '-'}</span>
                                    </div>
                                    <div class="admin-detail-field">
                                        <span class="admin-detail-label">Eingereicht am</span>
                                        <span class="admin-detail-value">${createdAt}</span>
                                    </div>
                                    <div class="admin-detail-field">
                                        <span class="admin-detail-label">Grund</span>
                                        <span class="admin-detail-value">${sn.reason || 'Nicht angegeben'}</span>
                                    </div>
                                    <div class="admin-detail-field">
                                        <span class="admin-detail-label">Attest</span>
                                        <span class="admin-detail-value">${sn.attachment_path ? 'Vorhanden' : 'Keins'}</span>
                                    </div>
                                    <div class="admin-detail-field">
                                        <span class="admin-detail-label">Status</span>
                                        <span class="admin-detail-value">${Components.badge(statusLabel, sn.status)}</span>
                                    </div>
                                    ${sn.reviewed_by_name ? `
                                    <div class="admin-detail-field">
                                        <span class="admin-detail-label">Bearbeitet von</span>
                                        <span class="admin-detail-value">${sn.reviewed_by_name}</span>
                                    </div>` : ''}
                                    ${sn.reviewed_at ? `
                                    <div class="admin-detail-field">
                                        <span class="admin-detail-label">Bearbeitet am</span>
                                        <span class="admin-detail-value">${new Date(sn.reviewed_at).toLocaleString('de-DE')}</span>
                                    </div>` : ''}
                                    ${sn.admin_note ? `
                                    <div class="admin-detail-field">
                                        <span class="admin-detail-label">Admin-Notiz</span>
                                        <span class="admin-detail-value">${sn.admin_note}</span>
                                    </div>` : ''}
                                </div>
                                ${sn.status === 'pending' ? `
                                <div class="admin-detail-actions mt-sm">
                                    <div class="form-row mb-sm">
                                        <input type="text" id="admin-note-${sn.id}" class="form-input" placeholder="Admin-Notiz (optional)">
                                    </div>
                                    <button class="btn btn-success" onclick="event.stopPropagation(); App.reviewSickNote('${sn.id}', 'approved')">Bestätigen</button>
                                    <button class="btn btn-secondary" onclick="event.stopPropagation(); App.reviewSickNote('${sn.id}', 'rejected')">Ablehnen</button>
                                </div>` : ''}
                            </div>
                        </div>
                    `;
                }).join('');
            }
        } catch (error) {
            content = `<p class="text-error">Fehler: ${error.message}</p>`;
        }

        this.render(`
            <h1 class="page-title">Krankmeldungen</h1>
            <div class="admin-detail-list">
                ${content}
            </div>
        `);
    },

    async reviewSickNote(id, status) {
        if (!confirm(`Krankmeldung ${status === 'approved' ? 'bestätigen' : 'ablehnen'}?`)) return;

        const noteInput = document.getElementById(`admin-note-${id}`);
        const adminNote = noteInput ? noteInput.value : null;

        try {
            await API.sickNotes.review(id, status, adminNote);
            App.showToast('Status aktualisiert');
            this.renderAdminSickNotes();
        } catch (error) {
            alert('Fehler: ' + error.message);
        }
    },

    async renderAdminContents() {
        let content = '';

        try {
            const res = await API.admin.getLessonContents();
            const contents = res.contents || [];

            if (contents.length === 0) {
                content = Components.emptyState('', 'Keine Unterrichtsinhalte vorhanden');
            } else {
                content = contents.map((c, idx) => {
                    const date = new Date(c.date).toLocaleDateString('de-DE');

                    return `
                        <div class="admin-detail-card fade-in">
                            <div class="admin-detail-summary" onclick="App.toggleAdminDetail('lc-${idx}')">
                                <div class="admin-detail-main">
                                    <strong>${c.topic || 'Ohne Thema'}</strong>
                                    <span class="admin-detail-meta">${date} | ${c.class_name || '-'} | ${c.subject_name || '-'} | ${c.teacher_name || '-'}</span>
                                </div>
                                <span class="admin-detail-arrow" id="arrow-lc-${idx}">&#9654;</span>
                            </div>
                            <div class="admin-detail-content" id="detail-lc-${idx}" style="display:none;">
                                <div class="admin-detail-grid">
                                    <div class="admin-detail-field">
                                        <span class="admin-detail-label">Datum</span>
                                        <span class="admin-detail-value">${date}</span>
                                    </div>
                                    <div class="admin-detail-field">
                                        <span class="admin-detail-label">Klasse</span>
                                        <span class="admin-detail-value">${c.class_name || '-'}</span>
                                    </div>
                                    <div class="admin-detail-field">
                                        <span class="admin-detail-label">Fach</span>
                                        <span class="admin-detail-value">${c.subject_name || '-'}</span>
                                    </div>
                                    <div class="admin-detail-field">
                                        <span class="admin-detail-label">Stunde</span>
                                        <span class="admin-detail-value">${c.lesson_number || '-'}. Stunde</span>
                                    </div>
                                    <div class="admin-detail-field">
                                        <span class="admin-detail-label">Lehrer</span>
                                        <span class="admin-detail-value">${c.teacher_name || '-'}</span>
                                    </div>
                                    <div class="admin-detail-field">
                                        <span class="admin-detail-label">Thema</span>
                                        <span class="admin-detail-value">${c.topic || '-'}</span>
                                    </div>
                                </div>
                                ${c.description ? `
                                <div class="admin-detail-field mt-sm">
                                    <span class="admin-detail-label">Beschreibung</span>
                                    <div class="admin-detail-value admin-detail-text">${c.description.replace(/\n/g, '<br>')}</div>
                                </div>` : ''}
                                ${c.homework ? `
                                <div class="admin-detail-field mt-sm">
                                    <span class="admin-detail-label">Hausaufgaben</span>
                                    <div class="admin-detail-value admin-detail-text">${c.homework.replace(/\n/g, '<br>')}</div>
                                </div>` : ''}
                                ${c.materials ? `
                                <div class="admin-detail-field mt-sm">
                                    <span class="admin-detail-label">Materialien</span>
                                    <div class="admin-detail-value admin-detail-text">${c.materials.replace(/\n/g, '<br>')}</div>
                                </div>` : ''}
                            </div>
                        </div>
                    `;
                }).join('');
            }
        } catch (error) {
            content = `<p class="text-error">Fehler: ${error.message}</p>`;
        }

        this.render(`
            <h1 class="page-title">Unterrichtsinhalte</h1>
            <div class="admin-detail-list">
                ${content}
            </div>
        `);
    },

    // =====================================================
    // ADMIN: Ankündigungen, Detail-Toggle, News löschen
    // =====================================================

    async renderAdminNews() {
        let content = '';

        try {
            const res = await API.news.getAll(null, 200);
            const news = res.news || [];

            if (news.length === 0) {
                content = Components.emptyState('', 'Keine Ankündigungen vorhanden');
            } else {
                content = news.map((item, idx) => {
                    const date = new Date(item.published_at || item.created_at).toLocaleDateString('de-DE');
                    const audienceLabels = { 'all': 'Alle', 'students': 'Schüler', 'parents': 'Eltern', 'teachers': 'Lehrer', 'class': item.class_name ? 'Klasse ' + item.class_name : 'Klasse' };
                    const priorityLabels = { 'urgent': 'Dringend', 'important': 'Wichtig', 'normal': 'Normal' };

                    return `
                        <div class="admin-detail-card fade-in">
                            <div class="admin-detail-summary" onclick="App.toggleAdminDetail('news-${idx}')">
                                <div class="admin-detail-main">
                                    <strong>${item.title}</strong>
                                    <span class="admin-detail-meta">${date} | ${audienceLabels[item.audience] || item.audience} | ${priorityLabels[item.priority] || 'Normal'}${item.is_pinned ? ' | Angepinnt' : ''}</span>
                                </div>
                                <span class="admin-detail-arrow" id="arrow-news-${idx}">&#9654;</span>
                            </div>
                            <div class="admin-detail-content" id="detail-news-${idx}" style="display:none;">
                                <div class="admin-detail-grid">
                                    <div class="admin-detail-field">
                                        <span class="admin-detail-label">Autor</span>
                                        <span class="admin-detail-value">${item.author_name || '-'}</span>
                                    </div>
                                    <div class="admin-detail-field">
                                        <span class="admin-detail-label">Zielgruppe</span>
                                        <span class="admin-detail-value">${audienceLabels[item.audience] || item.audience}</span>
                                    </div>
                                    <div class="admin-detail-field">
                                        <span class="admin-detail-label">Priorität</span>
                                        <span class="admin-detail-value">${priorityLabels[item.priority] || 'Normal'}</span>
                                    </div>
                                    <div class="admin-detail-field">
                                        <span class="admin-detail-label">Angepinnt</span>
                                        <span class="admin-detail-value">${item.is_pinned ? 'Ja' : 'Nein'}</span>
                                    </div>
                                    ${item.class_name ? `
                                    <div class="admin-detail-field">
                                        <span class="admin-detail-label">Klasse</span>
                                        <span class="admin-detail-value">${item.class_name}</span>
                                    </div>` : ''}
                                    <div class="admin-detail-field">
                                        <span class="admin-detail-label">Veröffentlicht</span>
                                        <span class="admin-detail-value">${date}</span>
                                    </div>
                                    ${item.event_date ? `
                                    <div class="admin-detail-field">
                                        <span class="admin-detail-label">Termin</span>
                                        <span class="admin-detail-value">${new Date(item.event_date).toLocaleDateString('de-DE')}${item.event_time ? ' ' + item.event_time + ' Uhr' : ''}${item.event_location ? ' - ' + item.event_location : ''}</span>
                                    </div>` : ''}
                                </div>
                                <div class="admin-detail-field mt-sm">
                                    <span class="admin-detail-label">Inhalt</span>
                                    <div class="admin-detail-value admin-detail-text">${(item.content || '-').replace(/\n/g, '<br>')}</div>
                                </div>
                                <div class="admin-detail-actions mt-sm">
                                    <button class="btn btn-secondary" onclick="event.stopPropagation(); App.deleteNews('${item.id}')">Löschen</button>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        } catch (error) {
            content = `<p class="text-error">Fehler: ${error.message}</p>`;
        }

        this.render(`
            <h1 class="page-title">Ankündigungen verwalten</h1>
            <div class="flex justify-between items-center mb-lg">
                <div></div>
                <a href="#/news/create" class="btn btn-success">Neue Ankündigung</a>
            </div>
            <div class="admin-detail-list">
                ${content}
            </div>
        `);
    },

    async deleteNews(id) {
        if (!confirm('Ankündigung wirklich löschen?')) return;
        try {
            await API.news.delete(id);
            App.showToast('Ankündigung gelöscht');
            this.renderAdminNews();
        } catch (error) {
            alert('Fehler: ' + error.message);
        }
    },

    toggleAdminDetail(id) {
        const content = document.getElementById('detail-' + id);
        const arrow = document.getElementById('arrow-' + id);
        if (content) {
            const isVisible = content.style.display !== 'none';
            content.style.display = isVisible ? 'none' : 'block';
            if (arrow) {
                arrow.innerHTML = isVisible ? '&#9654;' : '&#9660;';
            }
        }
    },

    // =====================================================
    // PROFILE
    // =====================================================

    async renderProfile() {
        const user = Auth.getUser();

        const allowedEmojis = ['😊', '😄', '🌟', '🦊', '🐰', '🦁', '🐶', '🐱', '🦄', '🌈', '⭐', '🎨', '📚', '⚽', '🎵'];

        const content = `
            <h1 class="page-title">Mein Profil</h1>
            
            <div class="card">
                <div class="text-center mb-lg">
                    <div style="font-size: 80px;" id="current-avatar">${user.avatar || '😊'}</div>
                    <h2>${user.firstName} ${user.lastName}</h2>
                    <p class="text-muted">${Auth.getRoleDisplayName()} • ${user.schoolName}</p>
                </div>
                
                <h3 class="mb-md">Avatar ändern:</h3>
                <div class="flex flex-wrap gap-sm mb-lg">
                    ${allowedEmojis.map(e => `
                        <button class="btn ${e === user.avatar ? 'btn-primary' : 'btn-secondary'}" 
                                style="font-size: 24px; padding: 8px 12px;"
                                onclick="App.selectAvatar('${e}')">
                            ${e}
                        </button>
                    `).join('')}
                </div>
                
                <form onsubmit="App.updateProfile(event)">
                    ${Auth.getRole() === 'admin' ? `
                        ${Components.formInput('firstName', 'Vorname', 'text', true, user.firstName)}
                        ${Components.formInput('lastName', 'Nachname', 'text', true, user.lastName)}
                    ` : ''}
                    
                    <input type="hidden" id="avatarEmoji" value="${user.avatar || '😊'}">
                    
                    <button type="submit" class="btn btn-success btn-block mt-lg">
                        Speichern
                    </button>
                </form>
            </div>
            
            ${Auth.getRole() !== 'student' ? `
            <div class="card mt-lg">
                <h3 class="mb-md">Passwort ändern</h3>
                <form onsubmit="App.changePassword(event)">
                    ${Components.formInput('currentPassword', 'Aktuelles Passwort', 'password', true)}
                    ${Components.formInput('newPassword', 'Neues Passwort', 'password', true)}
                    ${Components.formInput('confirmPassword', 'Passwort bestätigen', 'password', true)}
                    
                    <button type="submit" class="btn btn-primary btn-block mt-lg">
                        Passwort ändern
                    </button>
                </form>
            </div>
        ` : ''}
        `;

        this.render(content);
    },

    selectAvatar(emoji) {
        document.getElementById('avatarEmoji').value = emoji;
        document.getElementById('current-avatar').textContent = emoji;
        
        // Button-Styling aktualisieren
        document.querySelectorAll('.card button').forEach(btn => {
            if (btn.textContent.trim() === emoji) {
                btn.classList.remove('btn-secondary');
                btn.classList.add('btn-primary');
            } else if (btn.style.fontSize === '24px') {
                btn.classList.remove('btn-primary');
                btn.classList.add('btn-secondary');
            }
        });
    },

    async updateProfile(event) {
        event.preventDefault();

        const data = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            avatarEmoji: document.getElementById('avatarEmoji').value,
        };

        try {
            await API.users.updateProfile(data);
            // Session neu laden
            await Auth.checkSession();
            alert('Profil aktualisiert!');
            this.renderProfile();
        } catch (error) {
            alert('Fehler: ' + error.message);
        }
    },

    async changePassword(event) {
        event.preventDefault();

        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (newPassword !== confirmPassword) {
            alert('Die Passwörter stimmen nicht überein!');
            return;
        }

        if (newPassword.length < 8) {
            alert('Das Passwort muss mindestens 8 Zeichen lang sein!');
            return;
        }

        try {
            await API.auth.changePassword(currentPassword, newPassword);
            alert('Passwort erfolgreich geändert!');
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmPassword').value = '';
        } catch (error) {
            alert('Fehler: ' + error.message);
        }
    },

    showCreateUserModal() {
        const overlay = document.createElement('div');
        overlay.className = 'admin-modal-overlay';
        overlay.id = 'create-user-modal';
        overlay.innerHTML = `
            <div class="admin-modal">
                <div class="admin-modal-header">
                    <h2>Neuer Benutzer</h2>
                    <button class="close-button" onclick="App.closeAdminModal('create-user-modal')">X</button>
                </div>
                <div class="admin-modal-body">
                    <form onsubmit="App.handleCreateUser(event)">
                        <div class="form-row">
                            <label class="form-label">E-Mail *</label>
                            <input type="email" id="create-email" class="form-input" required>
                        </div>
                        <div class="form-row">
                            <label class="form-label">Vorname *</label>
                            <input type="text" id="create-firstName" class="form-input" required>
                        </div>
                        <div class="form-row">
                            <label class="form-label">Nachname *</label>
                            <input type="text" id="create-lastName" class="form-input" required>
                        </div>
                        <div class="form-row">
                            <label class="form-label">Rolle *</label>
                            <select id="create-role" class="form-input" required>
                                <option value="student">Schüler</option>
                                <option value="parent">Eltern</option>
                                <option value="teacher">Lehrer</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div class="form-row">
                            <label class="form-label">Passwort * (min. 8 Zeichen)</label>
                            <input type="password" id="create-password" class="form-input" minlength="8" required>
                        </div>
                        <button type="submit" class="btn btn-success btn-block mt-md">Erstellen</button>
                    </form>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        setTimeout(() => overlay.classList.add('active'), 10);
    },

    async handleCreateUser(event) {
        event.preventDefault();
        try {
            await API.admin.createUser({
                email: document.getElementById('create-email').value,
                firstName: document.getElementById('create-firstName').value,
                lastName: document.getElementById('create-lastName').value,
                role: document.getElementById('create-role').value,
                password: document.getElementById('create-password').value,
            });
            App.showToast('Benutzer erstellt');
            this.closeAdminModal('create-user-modal');
            this.renderAdminUsers();
        } catch (error) {
            alert('Fehler: ' + error.message);
        }
    },

    async editUser(id) {
        try {
            const res = await API.admin.getUsers();
            const user = (res.users || []).find(u => u.id === id);
            if (!user) {
                alert('Benutzer nicht gefunden');
                return;
            }

            const overlay = document.createElement('div');
            overlay.className = 'admin-modal-overlay';
            overlay.id = 'edit-user-modal';
            overlay.innerHTML = `
                <div class="admin-modal">
                    <div class="admin-modal-header">
                        <h2>Benutzer bearbeiten</h2>
                        <button class="close-button" onclick="App.closeAdminModal('edit-user-modal')">X</button>
                    </div>
                    <div class="admin-modal-body">
                        <div class="admin-detail-grid mb-md">
                            <div class="admin-detail-field">
                                <span class="admin-detail-label">E-Mail</span>
                                <span class="admin-detail-value">${user.email}</span>
                            </div>
                            <div class="admin-detail-field">
                                <span class="admin-detail-label">Registriert am</span>
                                <span class="admin-detail-value">${new Date(user.created_at).toLocaleDateString('de-DE')}</span>
                            </div>
                        </div>
                        <form onsubmit="App.handleEditUser(event, '${id}')">
                            <div class="form-row">
                                <label class="form-label">Vorname</label>
                                <input type="text" id="edit-firstName" class="form-input" value="${user.first_name}" required>
                            </div>
                            <div class="form-row">
                                <label class="form-label">Nachname</label>
                                <input type="text" id="edit-lastName" class="form-input" value="${user.last_name}" required>
                            </div>
                            <div class="form-row">
                                <label class="form-label">Rolle</label>
                                <select id="edit-role" class="form-input">
                                    <option value="student" ${user.role === 'student' ? 'selected' : ''}>Schüler</option>
                                    <option value="parent" ${user.role === 'parent' ? 'selected' : ''}>Eltern</option>
                                    <option value="teacher" ${user.role === 'teacher' ? 'selected' : ''}>Lehrer</option>
                                    <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                                </select>
                            </div>
                            <div class="form-row">
                                <label class="form-label">
                                    <input type="checkbox" id="edit-isActive" ${user.is_active ? 'checked' : ''}> Aktiv
                                </label>
                            </div>
                            <button type="submit" class="btn btn-success btn-block mt-md">Speichern</button>
                        </form>
                        <hr class="mt-lg mb-md">
                        <h3 class="mb-sm">Passwort zurücksetzen</h3>
                        <div class="form-row">
                            <input type="password" id="reset-password" class="form-input" placeholder="Neues Passwort (min. 8 Zeichen)">
                        </div>
                        <button class="btn btn-secondary btn-block mt-sm" onclick="App.resetUserPassword('${id}')">Passwort zurücksetzen</button>
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);
            setTimeout(() => overlay.classList.add('active'), 10);
        } catch (error) {
            alert('Fehler: ' + error.message);
        }
    },

    closeAdminModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        }
    },

    async handleEditUser(event, id) {
        event.preventDefault();
        try {
            await API.admin.updateUser(id, {
                firstName: document.getElementById('edit-firstName').value,
                lastName: document.getElementById('edit-lastName').value,
                role: document.getElementById('edit-role').value,
                isActive: document.getElementById('edit-isActive').checked,
            });
            App.showToast('Benutzer aktualisiert');
            this.closeAdminModal('edit-user-modal');
            this.renderAdminUsers();
        } catch (error) {
            alert('Fehler: ' + error.message);
        }
    },

    async resetUserPassword(id) {
        const password = document.getElementById('reset-password').value;
        if (!password || password.length < 8) {
            alert('Passwort muss mindestens 8 Zeichen haben!');
            return;
        }
        if (!confirm('Passwort wirklich zurücksetzen?')) return;
        try {
            await API.admin.resetPassword(id, password);
            App.showToast('Passwort zurückgesetzt');
            this.closeAdminModal('edit-user-modal');
        } catch (error) {
            alert('Fehler: ' + error.message);
        }
    },
};

// =====================================================
// APP STARTEN
// =====================================================

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
