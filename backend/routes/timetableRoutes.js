const express = require('express');
const router = express.Router();
const { getTimetable, getTodayTimetable } = require('../controllers/timetableController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getTimetable);
router.route('/today').get(protect, getTodayTimetable);

module.exports = router;
