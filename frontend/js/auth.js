/**
 * School Plan Kids - Authentifizierung
 * Verwaltung des Login-Status und Benutzerseession
 */

const Auth = {
    user: null,

    /**
     * Prüft ob Benutzer eingeloggt ist
     */
    isLoggedIn() {
        return this.user !== null;
    },

    /**
     * Gibt den aktuellen Benutzer zurück
     */
    getUser() {
        return this.user;
    },

    /**
     * Gibt die Rolle des Benutzers zurück
     */
    getRole() {
        return this.user?.role || null;
    },

    /**
     * Prüft ob Benutzer bestimmte Rolle hat
     */
    hasRole(...roles) {
        return roles.includes(this.getRole());
    },

    /**
     * Führt Login durch
     */
    async login(email, password) {
        try {
            const response = await API.auth.login(email, password);
            this.user = response.user;
            return { success: true, user: this.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    /**
     * Führt Logout durch
     */
    async logout() {
        try {
            await API.auth.logout();
        } catch (e) {
            // Ignorieren, auch bei Fehler ausloggen
        }
        this.user = null;
    },

    /**
     * Prüft aktuelle Session beim Server
     */
    async checkSession() {
        try {
            const response = await API.auth.me();
            this.user = response.user;
            return true;
        } catch (error) {
            this.user = null;
            return false;
        }
    },

    /**
     * Gibt Rollen-Displayname zurück
     */
    getRoleDisplayName(role = null) {
        const r = role || this.getRole();
        const names = {
            student: 'Schüler',
            parent: 'Eltern',
            teacher: 'Lehrer',
            admin: 'Administrator',
        };
        return names[r] || r;
    },

    /**
     * Gibt Rollen-Emoji zurück
     */
    getRoleEmoji(role = null) {
        const r = role || this.getRole();
        const emojis = {
            student: '',
            parent: '',
            teacher: '',
            admin: '',
        };
        return emojis[r] || '';
    },
};
