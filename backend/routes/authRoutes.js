const express = require('express');
const router = express.Router();
const { checkCredentials, setupPassword, finalizeSetup } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/check', checkCredentials); // Initiates standard or setup pipelines
router.post('/setup/password', protect, setupPassword);
router.post('/setup/finalize', protect, finalizeSetup);

module.exports = router;
