const User = require('../models/User');

const getStudentHostel = async (req, res) => {
    try {
        const student = await User.findById(req.user.id).select('name enrollment_number branch hostelBlock roomNumber hostelFeePaid messFeePaid');
        if (!student) return res.status(404).json({ message: 'User not found' });
        res.json(student);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllHostelDetails = async (req, res) => {
    try {
        // Only Wardens and Admins can see everyone
        const students = await User.find({ role: 'student' }).select('name enrollment_number branch semester hostelBlock roomNumber hostelFeePaid messFeePaid');
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getStudentHostel, getAllHostelDetails };
