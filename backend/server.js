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

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect DB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth/voice', voiceAuthRoutes);
app.use('/api/auth/face', faceAuthRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);

// Root Endpoint
app.get('/', (req, res) => {
    res.send('Nucleus Student Portal API is running!');
});

const PORT = process.env.PORT || 5001; // Changed from 5000 to avoid conflict
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
