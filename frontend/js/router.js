/**
 * School Plan Kids - Router
 * Client-seitiges Routing basierend auf Hash
 */

const Router = {
    routes: {},
    currentRoute: null,

    /**
     * Registriert eine Route
     */
    register(path, handler, options = {}) {
        this.routes[path] = { handler, ...options };
    },

    /**
     * Navigiert zu einer Route
     */
    navigate(path) {
        window.location.hash = `#${path}`;
    },

    /**
     * Gibt aktuelle Route zurück
     */
    getCurrentPath() {
        return window.location.hash.slice(1) || '/';
    },

    /**
     * Prüft Route und führt Handler aus
     */
    async handleRoute() {
        const path = this.getCurrentPath();
        const route = this.findRoute(path);

        if (!route) {
            this.navigate('/');
            return;
        }

        // Auth-Check
        if (route.requiresAuth && !Auth.isLoggedIn()) {
            this.navigate('/login');
            return;
        }

        // Rollen-Check
        if (route.roles && !Auth.hasRole(...route.roles)) {
            this.navigate('/');
            return;
        }

        // Redirect wenn eingeloggt
        if (route.guestOnly && Auth.isLoggedIn()) {
            this.navigate('/');
            return;
        }

        this.currentRoute = path;

        // Handler ausführen
        const params = this.extractParams(path, route.path);
        await route.handler(params);
    },

    /**
     * Findet passende Route (mit Wildcard-Support)
     */
    findRoute(path) {
        // Exakte Übereinstimmung
        if (this.routes[path]) {
            return { ...this.routes[path], path };
        }

        // Pattern matching (z.B. /class/:id)
        for (const [routePath, route] of Object.entries(this.routes)) {
            if (this.matchPath(routePath, path)) {
                return { ...route, path: routePath };
            }
        }

        return null;
    },

    /**
     * Prüft ob Pfad einem Pattern entspricht
     */
    matchPath(pattern, path) {
        const patternParts = pattern.split('/');
        const pathParts = path.split('/');

        if (patternParts.length !== pathParts.length) {
            return false;
        }

        return patternParts.every((part, i) => {
            return part.startsWith(':') || part === pathParts[i];
        });
    },

    /**
     * Extrahiert Parameter aus URL
     */
    extractParams(path, pattern) {
        const patternParts = pattern.split('/');
        const pathParts = path.split('/');
        const params = {};

        patternParts.forEach((part, i) => {
            if (part.startsWith(':')) {
                params[part.slice(1)] = pathParts[i];
            }
        });

        return params;
    },

    /**
     * Initialisiert Router
     */
    init() {
        window.addEventListener('hashchange', () => this.handleRoute());
        
        // Initiale Route
        if (!window.location.hash) {
            window.location.hash = '#/';
        }
        
        this.handleRoute();
    },
};
