const express = require('express');
const router = express.Router();
const { checkCredentials, setupPassword, finalizeSetup } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const { setup2FA, verifyAndEnable2FA, validate2FALogin, disable2FA } = require('../controllers/mfaController');

router.post('/check', checkCredentials); // Initiates standard or setup pipelines
router.post('/setup/password', protect, setupPassword);
router.post('/setup/finalize', protect, finalizeSetup);

// 2FA Routes
router.post('/2fa/setup', protect, setup2FA);
router.post('/2fa/verify-enable', protect, verifyAndEnable2FA);
router.post('/2fa/validate', validate2FALogin); // used in login flow
router.post('/2fa/disable', protect, disable2FA);

module.exports = router;
