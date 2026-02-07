// ===== USER DATABASE (Mock) =====
const USER_DATABASE = {
    schueler1: {
        password: 'password123',
        type: 'schueler',
        name: 'Max Mustermann',
        class: '2a'
    },
    schueler2: {
        password: 'password123',
        type: 'schueler',
        name: 'Anna Schmidt',
        class: '3b'
    },
    eltern1: {
        password: 'password123',
        type: 'eltern',
        name: 'Petra Schmidt',
        children: ['Max Mustermann', 'Anna Schmidt']
    },
    lehrer1: {
        password: 'password123',
        type: 'lehrer',
        name: 'Frau Bauer',
        classes: ['2a', '3b', '4c']
    },
    admin: {
        password: 'admin123',
        type: 'admin',
        name: 'Administrator',
        permissions: ['all']
    }
};

// ===== LOGIN FORM HANDLING =====
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const usertype = document.getElementById('usertype').value;

        // Validate credentials
        const user = USER_DATABASE[username];

        if (!user) {
            showError('Benutzer nicht gefunden!');
            return;
        }

        if (user.password !== password) {
            showError('Passwort ungültig!');
            return;
        }

        if (user.type !== usertype) {
            showError('Benutzertyp stimmt nicht überein!');
            return;
        }

        // Login successful
        // Store user data in session storage
        sessionStorage.setItem('user', JSON.stringify({
            username: username,
            type: usertype,
            name: user.name,
            ...user
        }));

        // Redirect to dashboard based on user type
        window.location.href = `dashboard.html?type=${usertype}`;
    });

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
        setTimeout(() => {
            errorMessage.classList.add('hidden');
        }, 5000);
    }
});
