const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const { enrollVoice, verifyVoice, voiceLogin } = require('../controllers/voiceAuthController');

// Configure multer for memory storage (files go to buffer)
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit per file
    fileFilter: (req, file, cb) => {
        // Accept audio files only
        const allowedTypes = ['audio/wav', 'audio/wave', 'audio/mp3', 'audio/mpeg', 'audio/flac', 'audio/ogg', 'audio/x-m4a', 'audio/mp4', 'audio/x-wav'];
        if (allowedTypes.includes(file.mimetype) || file.originalname.match(/\.(wav|mp3|flac|ogg|m4a)$/i)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only audio files are allowed.'), false);
        }
    }
});

// Multiple file upload for enrollment (requires auth)
router.post('/enroll', protect, upload.array('files', 10), enrollVoice);

// Single file upload for verification (requires auth)
router.post('/verify', protect, upload.single('file'), verifyVoice);

// Voice-only login (no auth required)
router.post('/login', upload.single('file'), voiceLogin);

module.exports = router;