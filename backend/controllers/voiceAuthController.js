const axios = require('axios');
const User = require('../models/User');

// Voice Auth Service URL (Python FastAPI service)
const VOICE_SERVICE_URL = process.env.VOICE_SERVICE_URL || 'http://localhost:8000';

// Generate JWT token (reuse from auth controller)
const generateToken = (id) => {
    const jwt = require('jsonwebtoken');
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d',
    });
};

// Helper to call voice service
const callVoiceService = async (endpoint, formData) => {
    try {
        const response = await axios.post(`${VOICE_SERVICE_URL}${endpoint}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            timeout: 30000 // 30 second timeout
        });
        return response.data;
    } catch (error) {
        console.error('Voice service error:', error.response?.data || error.message);
        throw new Error(error.response?.data?.detail || 'Voice service unavailable');
    }
};

// Enroll user's voice (requires authentication)
const enrollVoice = async (req, res) => {
    try {
        const userId = req.user._id; // Use authenticated user's ID
        const files = req.files;

        if (!files || files.length === 0) {
            return res.status(400).json({ message: 'At least one audio file required' });
        }

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prepare form data for voice service
        const formData = new FormData();
        formData.append('userId', userId.toString());
        files.forEach(file => {
            formData.append('files', file.buffer, {
                filename: file.originalname || `voice_${Date.now()}.wav`,
                contentType: file.mimetype
            });
        });

        // Call voice enrollment service
        const result = await callVoiceService('/voice/enroll', formData);

        if (result.success) {
            // Store voice embeddings in user record
            user.voice_enrolled = true;
            user.voice_embeddings = result.embedding || [];
            user.voice_threshold = result.adaptive_threshold || 0.85;
            user.voice_updated_at = new Date();
            await user.save();

            res.json({
                success: true,
                message: 'Voice enrolled successfully',
                sample_count: result.sample_count,
                adaptive_threshold: user.voice_threshold,
                user: {
                    _id: user._id,
                    name: user.name,
                    voice_enrolled: user.voice_enrolled,
                    voice_threshold: user.voice_threshold
                }
            });
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Verify voice (requires authentication)
const verifyVoice = async (req, res) => {
    try {
        const userId = req.user._id; // Use authenticated user's ID
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: 'Audio file required' });
        }

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.voice_enrolled) {
            return res.status(400).json({ message: 'User has not enrolled voice' });
        }

        // Prepare form data for voice service
        const formData = new FormData();
        formData.append('userId', userId.toString());
        formData.append('file', file.buffer, {
            filename: file.originalname || `verify_${Date.now()}.wav`,
            contentType: file.mimetype
        });

        // Call voice verification service
        const result = await callVoiceService('/voice/verify', formData);

        res.json({
            success: true,
            authenticated: result.authenticated,
            similarity_score: result.similarity_score,
            threshold_used: result.threshold_used,
            user: {
                _id: user._id,
                name: user.name,
                voice_enrolled: user.voice_enrolled
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Login with voice only (no password required)
const voiceLogin = async (req, res) => {
    try {
        const { enrollment_number } = req.body;
        const file = req.file;

        if (!enrollment_number || !file) {
            return res.status(400).json({ message: 'Enrollment number and audio file required' });
        }

        // Find user by enrollment number
        const user = await User.findOne({ enrollment_number });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.voice_enrolled) {
            return res.status(400).json({ message: 'User has not enrolled voice. Please enroll first.' });
        }

        // Prepare form data
        const formData = new FormData();
        formData.append('userId', user._id.toString());
        formData.append('file', file.buffer, {
            filename: file.originalname || `login_${Date.now()}.wav`,
            contentType: file.mimetype
        });

        // Call voice verification
        const result = await callVoiceService('/voice/verify', formData);

        if (result.authenticated) {
            res.json({
                success: true,
                message: 'Voice authentication successful',
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    enrollment_number: user.enrollment_number,
                    branch: user.branch,
                    semester: user.semester
                },
                token: generateToken(user._id),
                similarity_score: result.similarity_score
            });
        } else {
            res.status(401).json({
                success: false,
                message: 'Voice authentication failed. Please try again.',
                similarity_score: result.similarity_score
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    enrollVoice,
    verifyVoice,
    voiceLogin
};