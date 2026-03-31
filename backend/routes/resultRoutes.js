const express = require('express');
const router = express.Router();
const { getResults } = require('../controllers/resultController');
const { protect } = require('../middleware/authMiddleware');

router.route('/:userId').get(protect, getResults);

module.exports = router;
