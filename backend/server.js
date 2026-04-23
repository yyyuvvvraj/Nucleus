require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const voiceAuthRoutes = require('./routes/voiceAuthRoutes');
const faceAuthRoutes = require('./routes/faceAuthRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const timetableRoutes = require('./routes/timetableRoutes');
const resultRoutes = require('./routes/resultRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const adminRoutes = require('./routes/adminRoutes');
const hostelRoutes = require('./routes/hostelRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Connect DB
connectDB();

// Routes
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', service: 'backend' });
});

app.use('/api/auth', authRoutes);
app.use('/api/auth/voice', voiceAuthRoutes);
app.use('/api/auth/face', faceAuthRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/hostel', hostelRoutes);

// Root Endpoint
// 404 Handler
app.use((req, res, next) => {
    res.status(404).json({ message: `Route ${req.originalUrl} not found on this server` });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('SERVER ERROR:', err);
    res.status(err.status || 500).json({
        message: err.message || 'An internal server error occurred',
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Nucleus API Server running on port ${PORT}`));
