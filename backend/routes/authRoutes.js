const express = require('express');
const router = express.Router();
const { registerUser, loginUser, checkCredentials } = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/check', checkCredentials); // Step 1 of voice-gated login: validates creds, returns temp token

module.exports = router;

