const express = require('express');
const router = express.Router();
const { getAttendance, addAttendance } = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, addAttendance);
router.route('/:userId').get(protect, getAttendance);

module.exports = router;
