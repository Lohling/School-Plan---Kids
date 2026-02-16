const db = require('./src/config/database');

async function updateAdminPassword() {
    try {
        const newAdminPassword = 'SchoolPlan@2026!Secure';
        const newHash = '$2b$10$gvB6UJo0LLOVFjfp4XlP5ur/qbCpT/P9zOCDSb.S6yXfjsQ45BMBm';
        
        // Update admin password
        const result = await db.query(
            'UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING id, email, first_name',
            [newHash, 'admin@schule.de']
        );
        
        if (result.rows.length > 0) {
            const admin = result.rows[0];
            console.log('✓ Admin-Passwort erfolgreich aktualisiert');
            console.log(`  E-Mail: ${admin.email}`);
            console.log(`  Name: ${admin.first_name}`);
            console.log(`  Neues Passwort: ${newAdminPassword}`);
        } else {
            console.log('✗ Admin-Benutzer nicht gefunden');
        }
        process.exit(0);
    } catch (error) {
        console.error('Fehler beim Aktualisieren des Admin-Passworts:', error.message);
        process.exit(1);
    }
}

updateAdminPassword();
