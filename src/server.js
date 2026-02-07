// ===== SIMPLE EXPRESS SERVER =====
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/timetable', (req, res) => {
    res.json({ 
        message: 'Timetable data endpoint',
        classes: ['2a', '3b', '3c', '4c']
    });
});

app.post('/api/sick-note', (req, res) => {
    const { childName, startDate, endDate } = req.body;
    
    if (!childName || !startDate || !endDate) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // In production, save to database
    console.log(`Sick note submitted for ${childName}: ${startDate} - ${endDate}`);
    
    res.json({ 
        success: true, 
        message: 'Sick note submitted successfully',
        id: Math.random().toString(36).substr(2, 9)
    });
});

app.post('/api/substitution', (req, res) => {
    const { date, class: className, lesson, teacher } = req.body;
    
    console.log(`Substitution registered: ${className} on ${date}`);
    
    res.json({ 
        success: true, 
        message: 'Substitution registered'
    });
});

// Serve main pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/login.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

// 404 Handler
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '../public/login.html'));
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`School Plan server running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
