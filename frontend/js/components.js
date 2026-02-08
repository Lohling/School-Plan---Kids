/**
 * School Plan Kids - UI Komponenten
 * Wiederverwendbare UI-Elemente
 */

const Components = {
    /**
     * Rendert den Header
     */
    header() {
        const user = Auth.getUser();
        if (!user) return '';

        return `
            <header class="header">
                <div class="menu-icon" onclick="App.toggleNav()">☰</div>
                <div class="header-logo">
                    <span class="emoji">🏫</span>
                    <span class="header-title">School Plan - <span class="highlight">Kids</span></span>
                </div>
                <div class="header-spacer"></div>
                <div class="header-user">
                    <div class="user-info">
                        <div class="user-name">${user.firstName} ${user.lastName}</div>
                        <div class="user-role">${Auth.getRoleDisplayName()}</div>
                    </div>
                    <div class="user-avatar" onclick="App.toggleNav()">${user.avatar || '😊'}</div>
                </div>
            </header>
        `;
    },

    /**
     * Rendert die Seitennavigation
     */
    sideNav() {
        const user = Auth.getUser();
        if (!user) return '';

        const navItems = this.getNavItems();

        return `
            <div class="nav-overlay" id="nav-overlay" onclick="App.closeNav()"></div>
            <nav class="side-nav" id="side-nav">
                <div class="nav-header">
                    <div class="nav-user">
                        <div class="nav-avatar">${user.avatar || '😊'}</div>
                        <div class="nav-user-info">
                            <h3>${user.firstName}</h3>
                            <p>${Auth.getRoleDisplayName()} • ${user.schoolName}</p>
                        </div>
                    </div>
                </div>
                <div class="nav-menu">
                    ${navItems.map(item => `
                        <a href="#${item.path}" class="nav-item ${Router.getCurrentPath() === item.path ? 'active' : ''}" onclick="App.closeNav()">
                            <span class="icon">${item.icon}</span>
                            <span>${item.label}</span>
                        </a>
                    `).join('')}
                </div>
                <div class="nav-footer">
                    <button class="logout-btn" onclick="App.logout()">
                        <span>🚪</span> Abmelden
                    </button>
                </div>
            </nav>
        `;
    },

    /**
     * Gibt Navigation basierend auf Rolle zurück
     */
    getNavItems() {
        const role = Auth.getRole();
        const items = [];

        // Gemeinsame Items
        items.push({ path: '/', icon: '🏠', label: 'Startseite' });

        switch (role) {
            case 'student':
                items.push({ path: '/timetable', icon: '📅', label: 'Mein Stundenplan' });
                items.push({ path: '/news', icon: '📢', label: 'Neuigkeiten' });
                break;

            case 'parent':
                items.push({ path: '/children', icon: '👧', label: 'Meine Kinder' });
                items.push({ path: '/news', icon: '📢', label: 'Neuigkeiten' });
                items.push({ path: '/events', icon: '📆', label: 'Termine' });
                items.push({ path: '/sick-note', icon: '🏥', label: 'Krankschreibung' });
                break;

            case 'teacher':
                items.push({ path: '/timetable', icon: '📅', label: 'Mein Stundenplan' });
                items.push({ path: '/colleagues', icon: '👥', label: 'Kollegen-Pläne' });
                items.push({ path: '/supervisions', icon: '👀', label: 'Pausenaufsichten' });
                items.push({ path: '/classes', icon: '🎓', label: 'Meine Klassen' });
                items.push({ path: '/news/create', icon: '📝', label: 'Ankündigung' });
                items.push({ path: '/sick-note', icon: '🏥', label: 'Krankschreibung' });
                break;

            case 'admin':
                items.push({ path: '/admin', icon: '⚙️', label: 'Dashboard' });
                items.push({ path: '/admin/users', icon: '👥', label: 'Benutzer' });
                items.push({ path: '/admin/classes', icon: '🎓', label: 'Klassen' });
                items.push({ path: '/admin/timetable', icon: '📅', label: 'Stundenpläne' });
                items.push({ path: '/admin/sick-notes', icon: '🏥', label: 'Krankmeldungen' });
                items.push({ path: '/admin/contents', icon: '📚', label: 'Unterrichtsinhalte' });
                items.push({ path: '/news/create', icon: '📝', label: 'Ankündigung' });
                break;
        }

        items.push({ path: '/profile', icon: '⚙️', label: 'Profil' });

        return items;
    },

    /**
     * Rendert Wochentags-Tabs
     */
    dayTabs(activeDay = 'Mo') {
        const days = ['Mo', 'Di', 'Mi', 'Do', 'Fr'];
        
        return `
            <div class="day-tabs">
                ${days.map(day => `
                    <button class="tab-btn ${day === activeDay ? 'active' : ''}" 
                            onclick="App.selectDay('${day}')">
                        ${day}
                    </button>
                `).join('')}
            </div>
        `;
    },

    /**
     * Rendert einen Stundenplan
     */
    timetable(entries = []) {
        if (!entries || entries.length === 0) {
            return this.emptyState('📅', 'Keine Stunden für diesen Tag');
        }

        return `
            <div class="timetable">
                ${entries.map(entry => this.lessonRow(entry)).join('')}
            </div>
        `;
    },

    /**
     * Rendert eine Stundenzeile
     */
    lessonRow(entry) {
        if (entry.type === 'break') {
            return `
                <div class="lesson-row">
                    <div class="lesson-time">Pause</div>
                    <div class="lesson-block break">
                        <span>☕ ${entry.subject || 'Pause'}</span>
                    </div>
                </div>
            `;
        }

        const subjectClass = this.getSubjectClass(entry.subject || entry.shortName);
        const hasSubstitution = entry.isSubstitution || entry.isVertretung;

        return `
            <div class="lesson-row fade-in">
                <div class="lesson-time">${entry.lessonNumber}. Std</div>
                <div class="lesson-block ${subjectClass}">
                    ${hasSubstitution ? '<div class="lesson-badge">V</div>' : ''}
                    <div class="lesson-subject">
                        ${entry.icon || ''} ${entry.subject}
                    </div>
                    <div class="lesson-details">
                        ${entry.teacher ? `👨‍🏫 ${entry.teacher}` : ''} 
                        ${entry.room ? `• 🚪 ${entry.room}` : ''}
                    </div>
                    ${entry.className ? `<div class="lesson-details">🎓 ${entry.className}</div>` : ''}
                </div>
            </div>
        `;
    },

    /**
     * Gibt CSS-Klasse für Fach zurück
     */
    getSubjectClass(subject) {
        if (!subject) return 'default';
        
        const s = subject.toLowerCase();
        if (s.includes('deutsch')) return 'deutsch';
        if (s.includes('math')) return 'mathe';
        if (s.includes('hsu') || s.includes('sachunterricht') || s.includes('heimat')) return 'hsu';
        if (s.includes('sport')) return 'sport';
        if (s.includes('musik')) return 'musik';
        if (s.includes('kunst')) return 'kunst';
        if (s.includes('relig') || s.includes('ethik')) return 'religion';
        if (s.includes('engl')) return 'englisch';
        return 'default';
    },

    /**
     * Rendert eine News-Liste
     */
    newsList(news = []) {
        if (!news || news.length === 0) {
            return this.emptyState('📢', 'Keine Neuigkeiten vorhanden');
        }

        return `
            <div class="news-list">
                ${news.map(item => this.newsItem(item)).join('')}
            </div>
        `;
    },

    /**
     * Rendert ein News-Item
     */
    newsItem(item) {
        const priorityClass = item.priority || 'normal';
        const date = new Date(item.published_at || item.created_at).toLocaleDateString('de-DE');

        return `
            <div class="news-item ${priorityClass} fade-in">
                <div class="news-header">
                    <div class="news-title">${item.title}</div>
                    <div class="news-date">${date}</div>
                </div>
                <div class="news-content">${(item.content || '').replace(/\\n/g, '<br>')}</div>
                ${item.event_date ? `
                    <div class="news-event">
                        <span>📆</span>
                        <span>${new Date(item.event_date).toLocaleDateString('de-DE')}</span>
                        ${item.event_time ? `<span>⏰ ${item.event_time}</span>` : ''}
                        ${item.event_location ? `<span>📍 ${item.event_location}</span>` : ''}
                    </div>
                ` : ''}
                ${item.class_name ? `<div class="text-muted mt-sm">🎓 ${item.class_name}</div>` : ''}
            </div>
        `;
    },

    /**
     * Rendert einen Empty State
     */
    emptyState(icon, message) {
        return `
            <div class="empty-state">
                <div class="icon">${icon}</div>
                <p>${message}</p>
            </div>
        `;
    },

    /**
     * Rendert eine Karte
     */
    card(title, content, icon = '') {
        return `
            <div class="card fade-in">
                ${title ? `
                    <div class="card-header">
                        <h2 class="card-title">
                            ${icon ? `<span class="icon">${icon}</span>` : ''}
                            ${title}
                        </h2>
                    </div>
                ` : ''}
                <div class="card-body">
                    ${content}
                </div>
            </div>
        `;
    },

    /**
     * Rendert ein Modal
     */
    modal(id, title, content) {
        return `
            <div class="modal-overlay" id="${id}-overlay" onclick="App.closeModal('${id}')">
                <div class="modal" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h2 class="modal-title">${title}</h2>
                        <button class="modal-close" onclick="App.closeModal('${id}')">×</button>
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Rendert ein Formular-Input
     */
    formInput(name, label, type = 'text', required = false, value = '') {
        return `
            <div class="form-row">
                <label class="form-label" for="${name}">${label}${required ? ' *' : ''}</label>
                <input type="${type}" id="${name}" name="${name}" 
                       class="form-input" ${required ? 'required' : ''} 
                       value="${value}">
            </div>
        `;
    },

    /**
     * Rendert ein Select
     */
    formSelect(name, label, options, required = false, selected = '') {
        return `
            <div class="form-row">
                <label class="form-label" for="${name}">${label}${required ? ' *' : ''}</label>
                <select id="${name}" name="${name}" class="form-input" ${required ? 'required' : ''}>
                    <option value="">Bitte wählen...</option>
                    ${options.map(opt => `
                        <option value="${opt.value}" ${opt.value === selected ? 'selected' : ''}>
                            ${opt.label}
                        </option>
                    `).join('')}
                </select>
            </div>
        `;
    },

    /**
     * Rendert eine Tabelle
     */
    table(headers, rows, emptyMessage = 'Keine Daten vorhanden') {
        if (!rows || rows.length === 0) {
            return this.emptyState('📋', emptyMessage);
        }

        return `
            <table class="data-table">
                <thead>
                    <tr>
                        ${headers.map(h => `<th>${h}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${rows.map(row => `
                        <tr>
                            ${row.map(cell => `<td>${cell}</td>`).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    },

    /**
     * Rendert ein Badge
     */
    badge(text, type = 'default') {
        return `<span class="badge badge-${type}">${text}</span>`;
    },

    /**
     * Rendert Kinder-Cards für Eltern
     */
    childrenCards(children = []) {
        if (!children || children.length === 0) {
            return this.emptyState('👧', 'Keine Kinder zugeordnet');
        }

        return `
            <div class="flex flex-wrap gap-md">
                ${children.map(child => `
                    <div class="card" style="flex: 1; min-width: 250px;">
                        <div class="flex items-center gap-md mb-md">
                            <span style="font-size: 48px;">${child.avatar_emoji || '😊'}</span>
                            <div>
                                <h3>${child.first_name} ${child.last_name}</h3>
                                <p class="text-muted">Klasse ${child.class_name || '-'}</p>
                            </div>
                        </div>
                        <a href="#/timetable/${child.class_id}" class="btn btn-primary btn-block">
                            📅 Stundenplan ansehen
                        </a>
                    </div>
                `).join('')}
            </div>
        `;
    },

    /**
     * Rendert Pausenaufsichten
     */
    supervisionsList(supervisions = []) {
        if (!supervisions || supervisions.length === 0) {
            return this.emptyState('👀', 'Keine Pausenaufsichten eingetragen');
        }

        const grouped = {};
        supervisions.forEach(s => {
            if (!grouped[s.weekday]) grouped[s.weekday] = [];
            grouped[s.weekday].push(s);
        });

        return Object.entries(grouped).map(([day, items]) => `
            <div class="card">
                <h3>${this.getDayName(day)}</h3>
                ${items.map(s => `
                    <div class="flex justify-between items-center mb-sm">
                        <span>${s.break_type === 'grosse_pause' ? '☕ Große Pause' : '🍎 Kleine Pause'}</span>
                        <span>${s.teacher_name}</span>
                        <span class="text-muted">${s.location || ''}</span>
                    </div>
                `).join('')}
            </div>
        `).join('');
    },

    /**
     * Gibt Tagesname zurück
     */
    getDayName(short) {
        const names = { Mo: 'Montag', Di: 'Dienstag', Mi: 'Mittwoch', Do: 'Donnerstag', Fr: 'Freitag' };
        return names[short] || short;
    },
};
