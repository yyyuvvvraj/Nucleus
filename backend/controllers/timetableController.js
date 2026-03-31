const Timetable = require('../models/Timetable');

const getTimetable = async (req, res) => {
    try {
        const timetable = await Timetable.find({});
        res.json(timetable);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getTodayTimetable = async (req, res) => {
    try {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const today = days[new Date().getDay()];
        const timetable = await Timetable.find({ day: today });
        res.json(timetable);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getTimetable, getTodayTimetable };
