const bcrypt = require('bcrypt');

async function generateAdminPassword() {
    // Starkes Admin-Passwort
    const adminPassword = 'SchoolPlan@2026!Secure';
    
    // Hash generieren
    const adminHash = await bcrypt.hash(adminPassword, 10);
    console.log('Admin-Passwort:', adminPassword);
    console.log('Admin-Hash:', adminHash);
    
    // Test
    const match = await bcrypt.compare(adminPassword, adminHash);
    console.log('Hash-Verifikation:', match);
}

generateAdminPassword();
