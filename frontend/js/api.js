/**
 * School Plan Kids - API Client
 * Zentrale Kommunikation mit dem Backend
 */

const API = {
    baseUrl: '/api',

    /**
     * Führt einen API-Aufruf durch
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            credentials: 'include', // Cookies mitsenden
            ...options,
        };

        // Body für POST/PUT Requests
        if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
            config.body = JSON.stringify(options.body);
        }

        // Für FormData (File Uploads)
        if (options.body instanceof FormData) {
            delete config.headers['Content-Type'];
            config.body = options.body;
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                // Bei 401 zur Login-Seite (aber nicht bei Logout selbst)
                if (response.status === 401 && !endpoint.includes('/logout')) {
                    Auth.user = null; // Nur lokalen Status löschen, keinen neuen Request
                    if (window.location.hash !== '#/login') {
                        window.location.hash = '#/login';
                    }
                }
                throw new Error(data.error || 'Ein Fehler ist aufgetreten');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // GET Request
    get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    },

    // POST Request
    post(endpoint, body) {
        return this.request(endpoint, { method: 'POST', body });
    },

    // PUT Request
    put(endpoint, body) {
        return this.request(endpoint, { method: 'PUT', body });
    },

    // DELETE Request
    delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    },

    // =====================================================
    // AUTH ENDPOINTS
    // =====================================================

    auth: {
        login(email, password) {
            return API.post('/auth/login', { email, password });
        },

        logout() {
            return API.post('/auth/logout');
        },

        me() {
            return API.get('/auth/me');
        },

        changePassword(currentPassword, newPassword) {
            return API.post('/auth/change-password', { currentPassword, newPassword });
        },
    },

    // =====================================================
    // USER ENDPOINTS
    // =====================================================

    users: {
        getProfile() {
            return API.get('/users/profile');
        },

        updateProfile(data) {
            return API.put('/users/profile', data);
        },

        getChildren() {
            return API.get('/users/children');
        },

        getTeachers() {
            return API.get('/users/teachers');
        },

        getStudents(classId) {
            return API.get(`/users/students/${classId}`);
        },
    },

    // =====================================================
    // TIMETABLE ENDPOINTS
    // =====================================================

    timetable: {
        getForClass(classId, weekday = null) {
            const params = weekday ? `?weekday=${weekday}` : '';
            return API.get(`/timetable/class/${classId}${params}`);
        },

        getForTeacher(teacherId) {
            return API.get(`/timetable/teacher/${teacherId}`);
        },

        getMy() {
            return API.get('/timetable/my');
        },

        getSubstitutions(date = null, classId = null) {
            const params = new URLSearchParams();
            if (date) params.append('date', date);
            if (classId) params.append('classId', classId);
            return API.get(`/timetable/substitutions?${params}`);
        },

        saveContent(data) {
            return API.post('/timetable/content', data);
        },

        getContent(entryId, date) {
            return API.get(`/timetable/content/${entryId}?date=${date}`);
        },

        getSupervisions(teacherId = null, weekday = null) {
            const params = new URLSearchParams();
            if (teacherId) params.append('teacherId', teacherId);
            if (weekday) params.append('weekday', weekday);
            return API.get(`/timetable/supervisions?${params}`);
        },
    },

    // =====================================================
    // NEWS ENDPOINTS
    // =====================================================

    news: {
        getAll(classId = null, limit = 20) {
            const params = new URLSearchParams();
            if (classId) params.append('classId', classId);
            params.append('limit', limit);
            return API.get(`/news?${params}`);
        },

        create(data) {
            return API.post('/news', data);
        },

        delete(id) {
            return API.delete(`/news/${id}`);
        },

        getEvents() {
            return API.get('/news/events');
        },

        createEvent(data) {
            return API.post('/news/events', data);
        },
    },

    // =====================================================
    // SICK NOTES ENDPOINTS
    // =====================================================

    sickNotes: {
        getMy() {
            return API.get('/sick-notes');
        },

        submitForStudent(formData) {
            return API.request('/sick-notes/student', {
                method: 'POST',
                body: formData,
            });
        },

        submitForTeacher(formData) {
            return API.request('/sick-notes/teacher', {
                method: 'POST',
                body: formData,
            });
        },

        getForAdmin(status = null, type = null) {
            const params = new URLSearchParams();
            if (status) params.append('status', status);
            if (type) params.append('type', type);
            return API.get(`/sick-notes/admin?${params}`);
        },

        review(id, status, adminNote = null) {
            return API.put(`/sick-notes/${id}/review`, { status, adminNote });
        },

        getForClass(classId) {
            return API.get(`/sick-notes/class/${classId}`);
        },
    },

    // =====================================================
    // CLASSES ENDPOINTS
    // =====================================================

    classes: {
        getAll() {
            return API.get('/classes');
        },

        getOne(id) {
            return API.get(`/classes/${id}`);
        },

        getMy() {
            return API.get('/classes/user/my');
        },

        create(data) {
            return API.post('/classes', data);
        },

        update(id, data) {
            return API.put(`/classes/${id}`, data);
        },

        addStudent(classId, studentId, schoolYear) {
            return API.post(`/classes/${classId}/students`, { studentId, schoolYear });
        },
    },

    // =====================================================
    // ADMIN ENDPOINTS
    // =====================================================

    admin: {
        getDashboard() {
            return API.get('/admin/dashboard');
        },

        getUsers(role = null, search = null) {
            const params = new URLSearchParams();
            if (role) params.append('role', role);
            if (search) params.append('search', search);
            return API.get(`/admin/users?${params}`);
        },

        createUser(data) {
            return API.post('/admin/users', data);
        },

        updateUser(id, data) {
            return API.put(`/admin/users/${id}`, data);
        },

        resetPassword(id, newPassword) {
            return API.put(`/admin/users/${id}/reset-password`, { newPassword });
        },

        getAllTimetable() {
            return API.get('/admin/timetable/all');
        },

        createTimetableEntry(data) {
            return API.post('/admin/timetable', data);
        },

        updateTimetableEntry(id, data) {
            return API.put(`/admin/timetable/${id}`, data);
        },

        deleteTimetableEntry(id) {
            return API.delete(`/admin/timetable/${id}`);
        },

        createSubstitution(data) {
            return API.post('/admin/substitution', data);
        },

        getLessonContents(classId = null, date = null) {
            const params = new URLSearchParams();
            if (classId) params.append('classId', classId);
            if (date) params.append('date', date);
            return API.get(`/admin/lesson-contents?${params}`);
        },

        getSubjects() {
            return API.get('/admin/subjects');
        },

        getRooms() {
            return API.get('/admin/rooms');
        },

        createParentStudent(parentId, studentId, relationship) {
            return API.post('/admin/parent-student', { parentId, studentId, relationship });
        },

        getAuditLog() {
            return API.get('/admin/audit-log');
        },
    },
};
