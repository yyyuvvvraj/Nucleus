const express = require('express');
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const { enrollFace, faceLoginVerify } = require('../controllers/faceAuthController');

const router = express.Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Face endpoints
router.post('/enroll', protect, upload.array('files', 5), enrollFace);
router.post('/login-verify', protect, upload.single('file'), faceLoginVerify);

module.exports = router;
