// ===== AUTHENTICATION MANAGEMENT =====
function checkAuth() {
    const user = sessionStorage.getItem('user');
    if (!user) {
        window.location.href = 'login.html';
        return null;
    }
    return JSON.parse(user);
}

function logout() {
    sessionStorage.removeItem('user');
    window.location.href = 'login.html';
}

// ===== INITIALIZE AUTH =====
document.addEventListener('DOMContentLoaded', () => {
    const user = checkAuth();
    if (!user) return;

    // Show appropriate dashboard
    const viewId = `${user.type}-view`;
    const viewElement = document.getElementById(viewId);
    if (viewElement) {
        viewElement.classList.remove('hidden');
    }

    // Setup logout buttons
    const logoutButtons = document.querySelectorAll('[id^="logout-btn-"]');
    logoutButtons.forEach(btn => {
        btn.addEventListener('click', logout);
    });

    // Setup user names
    const userNameElements = document.querySelectorAll('[id$="-name"]');
    userNameElements.forEach(el => {
        el.textContent = user.name;
    });
});
