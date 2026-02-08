const bcrypt = require('bcrypt');

async function test() {
    const password = 'admin123';
    
    // Neuen Hash generieren
    const newHash = await bcrypt.hash(password, 10);
    console.log('Neuer Hash:', newHash);
    
    // Testen
    const match = await bcrypt.compare(password, newHash);
    console.log('Match mit neuem Hash:', match);
}

test();
