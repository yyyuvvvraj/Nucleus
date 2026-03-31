const express = require('express');
const router = express.Router();
const { getComplaints, addComplaint } = require('../controllers/complaintController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, addComplaint);
router.route('/:userId').get(protect, getComplaints);

module.exports = router;
