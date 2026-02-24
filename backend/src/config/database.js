/**
 * Datenbank-Konfiguration und Verbindungspool
 */

const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'schoolplan',
    user: process.env.DB_USER || 'schoolplan_user',
    password: process.env.DB_PASSWORD || 'secure_password_123',
    max: 50,                          // Erhöht für gleichzeitige Schüler-Anmeldungen
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,    // 5s statt 2s, damit Warteschlange abgebaut werden kann
});

// Verbindungstest
pool.on('connect', () => {
    console.log('📦 Datenbankverbindung hergestellt');
});

pool.on('error', (err) => {
    console.error('❌ Datenbankfehler:', err);
});

/**
 * Führt eine SQL-Abfrage aus
 * @param {string} text - SQL Query
 * @param {Array} params - Parameter
 * @returns {Promise} Query Result
 */
const query = async (text, params) => {
    const start = Date.now();
    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;
        
        // Logging in Development
        if (process.env.NODE_ENV !== 'production') {
            console.log('Query:', { text: text.substring(0, 100), duration: `${duration}ms`, rows: result.rowCount });
        }
        
        return result;
    } catch (error) {
        console.error('Query Error:', error);
        throw error;
    }
};

/**
 * Holt eine einzelne Zeile
 */
const getOne = async (text, params) => {
    const result = await query(text, params);
    return result.rows[0] || null;
};

/**
 * Holt mehrere Zeilen
 */
const getMany = async (text, params) => {
    const result = await query(text, params);
    return result.rows;
};

module.exports = {
    pool,
    query,
    getOne,
    getMany,
};
