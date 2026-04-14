const express = require('express');
const router = express.Router();
const { getStudents, addStudent, addResult, addAttendance, addTimetable, bulkMarkAttendance } = require('../controllers/adminController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.route('/students').get(protect, authorizeRoles('admin', 'director', 'faculty', 'warden', 'recruiter'), getStudents);
router.route('/student').post(protect, authorizeRoles('admin', 'recruiter'), addStudent);
router.route('/result').post(protect, authorizeRoles('admin', 'faculty'), addResult);
router.route('/attendance').post(protect, authorizeRoles('admin', 'faculty'), addAttendance);
router.route('/attendance/bulk').post(protect, authorizeRoles('admin', 'faculty'), bulkMarkAttendance);
router.route('/timetable').post(protect, authorizeRoles('admin', 'director'), addTimetable);

module.exports = router;
