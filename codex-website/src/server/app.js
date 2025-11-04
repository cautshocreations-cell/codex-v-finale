const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const regulationsRoutes = require('./routes/regulations');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, '../client')));

// Health check endpoint pour Railway
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// API Routes
app.use('/api/regulations', regulationsRoutes);
app.use('/api/admin', adminRoutes);

// Servir index.html pour toutes les autres routes (SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Codex RP Server running on port ${PORT}`);
    console.log(`📱 Frontend: http://localhost:${PORT}`);
    console.log(`🔧 API: http://localhost:${PORT}/api`);
    console.log(`❤️  Health: http://localhost:${PORT}/health`);
});