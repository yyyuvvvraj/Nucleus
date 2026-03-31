const Attendance = require('../models/Attendance');

const getAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.find({ userId: req.params.userId || req.user._id });
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addAttendance = async (req, res) => {
    const { subject_name, total_classes, attended_classes } = req.body;
    
    try {
        const attendance = new Attendance({
            userId: req.user._id,
            subject_name,
            total_classes,
            attended_classes
        });
        
        const createdAttendance = await attendance.save();
        res.status(201).json(createdAttendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getAttendance, addAttendance };
