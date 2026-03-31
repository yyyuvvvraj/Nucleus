const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
    day: { type: String, required: true, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
    subject: { type: String, required: true },
    time: { type: String, required: true },
    faculty: { type: String, required: true },
    branch: { type: String, required: true },
    semester: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Timetable', timetableSchema);
