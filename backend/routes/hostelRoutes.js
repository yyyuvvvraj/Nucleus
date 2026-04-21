const express = require('express');
const router = express.Router();
const { getStudentHostel, getAllHostelDetails } = require('../controllers/hostelController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/my', protect, getStudentHostel);
router.get('/all', protect, authorizeRoles('admin', 'warden'), getAllHostelDetails);

module.exports = router;
