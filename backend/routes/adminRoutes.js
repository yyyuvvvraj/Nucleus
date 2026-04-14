const express = require('express');
const router = express.Router();
const { 
  getStudents, 
  addStudent, 
  addResult, 
  addAttendance, 
  addTimetable, 
  bulkMarkAttendance,
  reset2FA,
  resetRegistration
} = require('../controllers/adminController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.route('/students').get(protect, authorizeRoles('admin', 'director', 'faculty', 'warden', 'recruiter'), getStudents);
router.route('/student').post(protect, authorizeRoles('admin', 'recruiter'), addStudent);
router.route('/student/:id/reset-2fa').put(protect, authorizeRoles('admin', 'recruiter'), reset2FA);
router.route('/student/:id/reset-registration').put(protect, authorizeRoles('admin', 'recruiter'), resetRegistration);
router.route('/result').post(protect, authorizeRoles('admin', 'faculty'), addResult);
router.route('/attendance').post(protect, authorizeRoles('admin', 'faculty'), addAttendance);
router.route('/attendance/bulk').post(protect, authorizeRoles('admin', 'faculty'), bulkMarkAttendance);
router.route('/timetable').post(protect, authorizeRoles('admin', 'director'), addTimetable);

module.exports = router;
