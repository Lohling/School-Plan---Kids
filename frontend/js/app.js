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
                    <div class="login-logo">🏫</div>
                    <h1 class="login-title">School Plan - <span class="highlight">Kids</span></h1>
                    <p class="login-subtitle">Dein digitaler Vertretungsplan</p>
                    
                    <div id="login-error" class="login-error hidden"></div>
                    
                    <form class="login-form" onsubmit="App.handleLogin(event)">
                        <div class="form-group">
                            <label class="form-label" for="email">📧 E-Mail</label>
                            <input type="email" id="email" name="email" class="form-input" 
                                   placeholder="deine@email.de" required>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label" for="password">🔒 Passwort</label>
                            <input type="password" id="password" name="password" class="form-input" 
                                   placeholder="••••••••" required>
                        </div>
                        
                        <button type="submit" class="login-btn" id="login-btn">
                            Anmelden 🚀
                        </button>
                    </form>
                    
                    <div class="login-roles">
                        <span class="role-badge student">📚 Schüler</span>
                        <span class="role-badge parent">👨‍👩‍👧 Eltern</span>
                        <span class="role-badge teacher">👨‍🏫 Lehrer</span>
                        <span class="role-badge admin">⚙️ Admin</span>
                    </div>
                </div>
            </div>
        `;
        this.render(content, false);
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
            btn.textContent = 'Anmelden 🚀';
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
                <span class="icon">👋</span>
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
            API.news.getAll(null, 5).catch(() => ({ news: [] }))
        ]);

        const today = this.getTodayWeekday();
        const todayLessons = timetableRes.timetable[today] || [];

        return `
            ${Components.card('📅 Dein Stundenplan heute', `
                ${Components.dayTabs(today)}
                <div id="timetable-container">
                    ${Components.timetable(todayLessons)}
                </div>
            `)}
            
            ${Components.card('📢 Neuigkeiten', Components.newsList(newsRes.news))}
        `;
    },

    async getParentDashboard() {
        const [childrenRes, newsRes, eventsRes] = await Promise.all([
            API.users.getChildren().catch(() => ({ children: [] })),
            API.news.getAll(null, 5).catch(() => ({ news: [] })),
            API.news.getEvents().catch(() => ({ events: [] }))
        ]);

        return `
            ${Components.card('👧 Meine Kinder', Components.childrenCards(childrenRes.children))}
            
            ${Components.card('📢 Neuigkeiten', Components.newsList(newsRes.news))}
            
            ${eventsRes.events.length > 0 ? Components.card('📆 Nächste Termine', `
                <div class="news-list">
                    ${eventsRes.events.slice(0, 3).map(e => `
                        <div class="news-item">
                            <div class="news-header">
                                <div class="news-title">${e.title}</div>
                                <div class="news-date">${new Date(e.event_date).toLocaleDateString('de-DE')}</div>
                            </div>
                            ${e.description ? `<p>${e.description}</p>` : ''}
                            ${e.location ? `<p class="text-muted">📍 ${e.location}</p>` : ''}
                        </div>
                    `).join('')}
                </div>
            `) : ''}
        `;
    },

    async getTeacherDashboard() {
        this.selectedClassId = null;
        const [timetableRes, supervisionsRes, newsRes] = await Promise.all([
            API.timetable.getMy().catch(() => ({ timetable: {} })),
            API.timetable.getSupervisions(Auth.getUser().id).catch(() => ({ supervisions: [] })),
            API.news.getAll(null, 5).catch(() => ({ news: [] }))
        ]);

        const today = this.getTodayWeekday();
        const todayLessons = timetableRes.timetable[today] || [];
        const todaySupervisions = (supervisionsRes.supervisions || []).filter(s => s.weekday === today);

        return `
            ${Components.card('📅 Mein Stundenplan heute', `
                ${Components.dayTabs(today)}
                <div id="timetable-container">
                    ${Components.timetable(todayLessons)}
                </div>
            `)}
            
            ${todaySupervisions.length > 0 ? Components.card('👀 Pausenaufsicht heute', `
                ${todaySupervisions.map(s => `
                    <div class="flex justify-between items-center mb-sm">
                        <span>${s.break_type === 'grosse_pause' ? '☕ Große Pause' : '🍎 Kleine Pause'}</span>
                        <span>📍 ${s.location || 'Schulhof'}</span>
                    </div>
                `).join('')}
            `) : ''}
            
            ${Components.card('📢 Neuigkeiten', Components.newsList(newsRes.news))}
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
            <h1 class="page-title"><span class="icon">📢</span> Neuigkeiten</h1>
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
            <h1 class="page-title"><span class="icon">📝</span> Ankündigung erstellen</h1>
            
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
                        { value: 'normal', label: '🔵 Normal' },
                        { value: 'important', label: '🟡 Wichtig' },
                        { value: 'urgent', label: '🔴 Dringend' },
                    ])}
                    
                    <h3 class="mt-lg mb-md">Optional: Termin hinzufügen</h3>
                    ${Components.formInput('eventDate', 'Datum', 'date')}
                    ${Components.formInput('eventTime', 'Uhrzeit', 'time')}
                    ${Components.formInput('eventLocation', 'Ort', 'text')}
                    
                    <button type="submit" class="btn btn-success btn-block mt-lg">
                        ✅ Veröffentlichen
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
            alert('✅ Ankündigung veröffentlicht!');
            Router.navigate('/news');
        } catch (error) {
            alert('❌ Fehler: ' + error.message);
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
            <h1 class="page-title"><span class="icon">📅</span> Mein Stundenplan</h1>
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
            <h1 class="page-title"><span class="icon">📅</span> Stundenplan ${classInfo}</h1>
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
            <h1 class="page-title"><span class="icon">👧</span> Meine Kinder</h1>
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
                                    ${e.start_time ? `<span>⏰ ${e.start_time}</span>` : ''}
                                    ${e.location ? `<span>📍 ${e.location}</span>` : ''}
                                    ${e.class_name ? `<span>🎓 ${e.class_name}</span>` : ''}
                                </div>
                                ${e.is_mandatory ? `<p class="text-warning mt-sm">⚠️ Anwesenheit erforderlich</p>` : ''}
                            </div>
                        `).join('')}
                    </div>
                `;
            } else {
                content = Components.emptyState('📆', 'Keine Termine vorhanden');
            }
        } catch (error) {
            content = `<p class="text-error">Fehler: ${error.message}</p>`;
        }

        this.render(`
            <h1 class="page-title"><span class="icon">📆</span> Termine & Elternabende</h1>
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
                            ✅ Krankschreibung einreichen
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
                        ✅ Krankmeldung einreichen
                    </button>
                </form>
            `;
        }

        // Bisherige Krankmeldungen laden
        let historyContent = '';
        try {
            const res = await API.sickNotes.getMy();
            if (res.sickNotes && res.sickNotes.length > 0) {
                historyContent = Components.card('📋 Meine Krankmeldungen', `
                    ${res.sickNotes.map(sn => `
                        <div class="flex justify-between items-center mb-md" style="padding: 10px; background: #f5f5f5; border-radius: 8px;">
                            <div>
                                ${sn.child_name ? `<strong>${sn.child_name}</strong><br>` : ''}
                                ${new Date(sn.start_date).toLocaleDateString('de-DE')} - ${new Date(sn.end_date).toLocaleDateString('de-DE')}
                            </div>
                            ${Components.badge(
                                sn.status === 'approved' ? '✅ Bestätigt' : 
                                sn.status === 'rejected' ? '❌ Abgelehnt' : '⏳ Ausstehend',
                                sn.status
                            )}
                        </div>
                    `).join('')}
                `);
            }
        } catch (e) {}

        this.render(`
            <h1 class="page-title"><span class="icon">🏥</span> Krankschreibung</h1>
            
            <div class="card">
                <p class="mb-lg text-muted">
                    ℹ️ Hinweis: Die Angabe eines Grundes ist freiwillig und dient nur zur Information.
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
            alert('✅ Krankschreibung eingereicht!');
            this.renderSickNote();
        } catch (error) {
            alert('❌ Fehler: ' + error.message);
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
            alert('✅ Krankmeldung eingereicht!');
            Router.navigate('/');
        } catch (error) {
            alert('❌ Fehler: ' + error.message);
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
                                📅 Stundenplan
                            </a>
                        </div>
                    `).join('')}
                </div>
            `;
        } catch (error) {
            content = `<p class="text-error">Fehler: ${error.message}</p>`;
        }

        this.render(`
            <h1 class="page-title"><span class="icon">👥</span> Kollegen</h1>
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
            <h1 class="page-title"><span class="icon">👀</span> Pausenaufsichten</h1>
            ${content}
        `);
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
                                <h3>🎓 Klasse ${c.name}</h3>
                                <p class="text-muted">${c.subject || ''}</p>
                                <div class="flex gap-sm mt-md">
                                    <a href="#/timetable/${c.id}" class="btn btn-primary">📅 Stundenplan</a>
                                    <a href="#/class/${c.id}/students" class="btn btn-secondary">👥 Schüler</a>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
            } else {
                content = Components.emptyState('🎓', 'Keine Klassen zugewiesen');
            }
        } catch (error) {
            content = `<p class="text-error">Fehler: ${error.message}</p>`;
        }

        this.render(`
            <h1 class="page-title"><span class="icon">🎓</span> Meine Klassen</h1>
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
                    <div class="card" style="flex: 1; min-width: 150px; text-align: center;">
                        <div style="font-size: 40px;">📚</div>
                        <h2>${stats.users?.student || 0}</h2>
                        <p>Schüler</p>
                    </div>
                    <div class="card" style="flex: 1; min-width: 150px; text-align: center;">
                        <div style="font-size: 40px;">👨‍👩‍👧</div>
                        <h2>${stats.users?.parent || 0}</h2>
                        <p>Eltern</p>
                    </div>
                    <div class="card" style="flex: 1; min-width: 150px; text-align: center;">
                        <div style="font-size: 40px;">👨‍🏫</div>
                        <h2>${stats.users?.teacher || 0}</h2>
                        <p>Lehrer</p>
                    </div>
                    <div class="card" style="flex: 1; min-width: 150px; text-align: center;">
                        <div style="font-size: 40px;">🎓</div>
                        <h2>${stats.classes || 0}</h2>
                        <p>Klassen</p>
                    </div>
                </div>
                
                ${stats.pendingSickNotes > 0 ? `
                    <div class="card" style="background: #fff3e0; border-left: 4px solid #ff9800;">
                        <h3>⚠️ ${stats.pendingSickNotes} offene Krankmeldungen</h3>
                        <a href="#/admin/sick-notes" class="btn btn-primary mt-md">Jetzt bearbeiten</a>
                    </div>
                ` : ''}
                
                ${stats.recentNews && stats.recentNews.length > 0 ? Components.card('📢 Letzte Ankündigungen', `
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
            <h1 class="page-title"><span class="icon">⚙️</span> Admin Dashboard</h1>
            ${content}
        `);
    },

    async renderAdminUsers() {
        let content = '';

        try {
            const res = await API.admin.getUsers();
            
            const headers = ['Avatar', 'Name', 'E-Mail', 'Rolle', 'Status', 'Aktionen'];
            const rows = (res.users || []).map(u => [
                u.avatar_emoji || '👤',
                `${u.first_name} ${u.last_name}`,
                u.email,
                Auth.getRoleDisplayName(u.role),
                u.is_active ? '✅ Aktiv' : '❌ Inaktiv',
                `<button class="btn btn-secondary" onclick="App.editUser('${u.id}')">✏️</button>`
            ]);

            content = `
                <div class="flex justify-between items-center mb-lg">
                    <div></div>
                    <button class="btn btn-success" onclick="App.showCreateUserModal()">
                        ➕ Neuer Benutzer
                    </button>
                </div>
                ${Components.table(headers, rows, 'Keine Benutzer gefunden')}
            `;
        } catch (error) {
            content = `<p class="text-error">Fehler: ${error.message}</p>`;
        }

        this.render(`
            <h1 class="page-title"><span class="icon">👥</span> Benutzer verwalten</h1>
            <div class="card">
                ${content}
            </div>
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
                `<a href="#/timetable/${c.id}" class="btn btn-secondary">📅</a>`
            ]);

            content = Components.table(headers, rows, 'Keine Klassen gefunden');
        } catch (error) {
            content = `<p class="text-error">Fehler: ${error.message}</p>`;
        }

        this.render(`
            <h1 class="page-title"><span class="icon">🎓</span> Klassen verwalten</h1>
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
                            <h3>🎓 ${c.name}</h3>
                            <a href="#/admin/timetable/${c.id}" class="btn btn-primary btn-block mt-md">
                                ✏️ Bearbeiten
                            </a>
                        </div>
                    `).join('')}
                </div>
            `;
        } catch (error) {
            content = `<p class="text-error">Fehler: ${error.message}</p>`;
        }

        this.render(`
            <h1 class="page-title"><span class="icon">📅</span> Stundenpläne verwalten</h1>
            ${content}
        `);
    },

    async renderAdminSickNotes() {
        let content = '';

        try {
            const res = await API.sickNotes.getForAdmin();
            
            const headers = ['Person', 'Typ', 'Zeitraum', 'Eingereicht von', 'Status', 'Aktionen'];
            const rows = (res.sickNotes || []).map(sn => [
                sn.person_name,
                sn.person_type === 'student' ? '📚 Schüler' : '👨‍🏫 Lehrer',
                `${new Date(sn.start_date).toLocaleDateString('de-DE')} - ${new Date(sn.end_date).toLocaleDateString('de-DE')}`,
                sn.submitted_by_name,
                Components.badge(
                    sn.status === 'approved' ? '✅ Bestätigt' : 
                    sn.status === 'rejected' ? '❌ Abgelehnt' : '⏳ Ausstehend',
                    sn.status
                ),
                sn.status === 'pending' ? `
                    <button class="btn btn-success" onclick="App.reviewSickNote('${sn.id}', 'approved')">✅</button>
                    <button class="btn btn-secondary" onclick="App.reviewSickNote('${sn.id}', 'rejected')">❌</button>
                ` : (sn.reviewed_by_name ? `Bearbeitet von ${sn.reviewed_by_name}` : '')
            ]);

            content = Components.table(headers, rows, 'Keine Krankmeldungen vorhanden');
        } catch (error) {
            content = `<p class="text-error">Fehler: ${error.message}</p>`;
        }

        this.render(`
            <h1 class="page-title"><span class="icon">🏥</span> Krankmeldungen</h1>
            <div class="card">
                ${content}
            </div>
        `);
    },

    async reviewSickNote(id, status) {
        if (!confirm(`Krankmeldung ${status === 'approved' ? 'bestätigen' : 'ablehnen'}?`)) return;

        try {
            await API.sickNotes.review(id, status);
            alert('✅ Status aktualisiert!');
            this.renderAdminSickNotes();
        } catch (error) {
            alert('❌ Fehler: ' + error.message);
        }
    },

    async renderAdminContents() {
        let content = '';

        try {
            const res = await API.admin.getLessonContents();
            
            const headers = ['Datum', 'Klasse', 'Fach', 'Thema', 'Lehrer'];
            const rows = (res.contents || []).map(c => [
                new Date(c.date).toLocaleDateString('de-DE'),
                c.class_name,
                c.subject_name || '-',
                c.topic || '-',
                c.teacher_name || '-'
            ]);

            content = Components.table(headers, rows, 'Keine Unterrichtsinhalte vorhanden');
        } catch (error) {
            content = `<p class="text-error">Fehler: ${error.message}</p>`;
        }

        this.render(`
            <h1 class="page-title"><span class="icon">📚</span> Unterrichtsinhalte</h1>
            <div class="card">
                ${content}
            </div>
        `);
    },

    // =====================================================
    // PROFILE
    // =====================================================

    async renderProfile() {
        const user = Auth.getUser();

        const allowedEmojis = ['😊', '😄', '🌟', '🦊', '🐰', '🦁', '🐶', '🐱', '🦄', '🌈', '⭐', '🎨', '📚', '⚽', '🎵'];

        const content = `
            <h1 class="page-title"><span class="icon">⚙️</span> Mein Profil</h1>
            
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
                    ${Components.formInput('firstName', 'Vorname', 'text', true, user.firstName)}
                    ${Components.formInput('lastName', 'Nachname', 'text', true, user.lastName)}
                    
                    <input type="hidden" id="avatarEmoji" value="${user.avatar || '😊'}">
                    
                    <button type="submit" class="btn btn-success btn-block mt-lg">
                        💾 Speichern
                    </button>
                </form>
            </div>
            
            <div class="card mt-lg">
                <h3 class="mb-md">🔒 Passwort ändern</h3>
                <form onsubmit="App.changePassword(event)">
                    ${Components.formInput('currentPassword', 'Aktuelles Passwort', 'password', true)}
                    ${Components.formInput('newPassword', 'Neues Passwort', 'password', true)}
                    ${Components.formInput('confirmPassword', 'Passwort bestätigen', 'password', true)}
                    
                    <button type="submit" class="btn btn-primary btn-block mt-lg">
                        🔐 Passwort ändern
                    </button>
                </form>
            </div>
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
            alert('✅ Profil aktualisiert!');
            this.renderProfile();
        } catch (error) {
            alert('❌ Fehler: ' + error.message);
        }
    },

    async changePassword(event) {
        event.preventDefault();

        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (newPassword !== confirmPassword) {
            alert('❌ Die Passwörter stimmen nicht überein!');
            return;
        }

        if (newPassword.length < 8) {
            alert('❌ Das Passwort muss mindestens 8 Zeichen lang sein!');
            return;
        }

        try {
            await API.auth.changePassword(currentPassword, newPassword);
            alert('✅ Passwort erfolgreich geändert!');
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmPassword').value = '';
        } catch (error) {
            alert('❌ Fehler: ' + error.message);
        }
    },

    showCreateUserModal() {
        // Einfacher Prompt für Demo - in Produktion ein Modal
        const email = prompt('E-Mail:');
        if (!email) return;
        
        const firstName = prompt('Vorname:');
        if (!firstName) return;
        
        const lastName = prompt('Nachname:');
        if (!lastName) return;
        
        const role = prompt('Rolle (student/parent/teacher/admin):');
        if (!['student', 'parent', 'teacher', 'admin'].includes(role)) {
            alert('Ungültige Rolle!');
            return;
        }
        
        const password = prompt('Passwort (min. 8 Zeichen):');
        if (!password || password.length < 8) {
            alert('Passwort muss mindestens 8 Zeichen haben!');
            return;
        }

        this.createUser({ email, firstName, lastName, role, password });
    },

    async createUser(data) {
        try {
            await API.admin.createUser(data);
            alert('✅ Benutzer erstellt!');
            this.renderAdminUsers();
        } catch (error) {
            alert('❌ Fehler: ' + error.message);
        }
    },

    async editUser(id) {
        alert('Bearbeiten-Modal würde hier öffnen für Benutzer: ' + id);
    },
};

// =====================================================
// APP STARTEN
// =====================================================

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
