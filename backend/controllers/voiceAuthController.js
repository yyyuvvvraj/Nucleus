const axios = require('axios');
const { Blob } = require('node:buffer');
const User = require('../models/User');

const VOICE_SERVICE_URL = process.env.VOICE_SERVICE_URL || 'http://localhost:8000';

const generateToken = (id) => {
    const jwt = require('jsonwebtoken');
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
};

/**
 * Convert a multer Buffer into a Node.js Blob so native FormData accepts it.
 * Node 18+ FormData.append() requires Blob | File | string — raw Buffer is rejected.
 */
const bufferToBlob = (fileObj) => {
    const mime = fileObj.mimetype || 'audio/wav';
    return new Blob([fileObj.buffer], { type: mime });
};

/** POST multipart/form-data to the Python voice service */
const callVoiceService = async (endpoint, formData) => {
    try {
        const response = await axios.post(`${VOICE_SERVICE_URL}${endpoint}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 30000,
        });
        return response.data;
    } catch (error) {
        console.error('Voice service error:', error.response?.data || error.message);
        throw new Error(error.response?.data?.detail || 'Voice service unavailable');
    }
};

// ─────────────────────────────────────────────────────────────
// ENROLL — Requires authentication (JWT from register step)
// ─────────────────────────────────────────────────────────────
const enrollVoice = async (req, res) => {
    try {
        const userId = req.user._id;
        const files  = req.files;

        if (!files || files.length === 0) {
            return res.status(400).json({ message: 'At least one audio file required' });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const formData = new FormData();
        formData.append('userId', userId.toString());
        files.forEach((file, i) => {
            formData.append('files', bufferToBlob(file), file.originalname || `sample_${i}.wav`);
        });

        const result = await callVoiceService('/voice/enroll', formData);

        if (result.success) {
            // Persist the actual MFCC embeddings returned by the Python service.
            // This makes verification stateless — we pass them back on every verify call.
            user.voice_enrolled  = true;
            user.voice_embeddings = result.embedding || [];   // <── critical: real data now
            user.voice_threshold  = result.adaptive_threshold || 0.80;
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
                    voice_threshold: user.voice_threshold,
                },
            });
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────
// VERIFY — Requires authentication (for /voice-enroll page)
// ─────────────────────────────────────────────────────────────
const verifyVoice = async (req, res) => {
    try {
        const userId = req.user._id;
        const file   = req.file;

        if (!file) return res.status(400).json({ message: 'Audio file required' });

        const user = await User.findById(userId);
        if (!user)               return res.status(404).json({ message: 'User not found' });
        if (!user.voice_enrolled) return res.status(400).json({ message: 'User has not enrolled voice' });

        const formData = new FormData();
        formData.append('userId', userId.toString());
        formData.append('file', bufferToBlob(file), file.originalname || `verify.wav`);
        // Pass stored embeddings from MongoDB → Python service is stateless
        formData.append('stored_embeddings', JSON.stringify(user.voice_embeddings));

        const result = await callVoiceService('/voice/verify', formData);

        res.json({
            success: true,
            authenticated: result.authenticated,
            similarity_score: result.similarity_score,
            threshold_used: result.threshold_used,
            user: { _id: user._id, name: user.name, voice_enrolled: user.voice_enrolled },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────
// VOICE-ONLY LOGIN (legacy endpoint — kept for compatibility)
// ─────────────────────────────────────────────────────────────
const voiceLogin = async (req, res) => {
    try {
        const { enrollment_number } = req.body;
        const file = req.file;

        if (!enrollment_number || !file) {
            return res.status(400).json({ message: 'Enrollment number and audio file required' });
        }

        const user = await User.findOne({ enrollment_number });
        if (!user)               return res.status(404).json({ message: 'User not found' });
        if (!user.voice_enrolled) return res.status(400).json({ message: 'User has not enrolled voice. Please enroll first.' });

        const formData = new FormData();
        formData.append('userId', user._id.toString());
        formData.append('file', bufferToBlob(file), file.originalname || `login.wav`);
        formData.append('stored_embeddings', JSON.stringify(user.voice_embeddings));

        const result = await callVoiceService('/voice/verify', formData);

        if (result.authenticated) {
            res.json({
                success: true,
                message: 'Voice authentication successful',
                user: {
                    _id: user._id, name: user.name, email: user.email,
                    enrollment_number: user.enrollment_number,
                    branch: user.branch, semester: user.semester,
                    role: user.role,
                },
                token: generateToken(user._id),
                similarity_score: result.similarity_score,
            });
        } else {
            res.status(401).json({
                success: false,
                message: `Voice does not match (similarity: ${result.similarity_score}, threshold: ${result.threshold_used}). Access denied.`,
                similarity_score: result.similarity_score,
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────
// VOICE-GATED LOGIN STEP 2 — accepts temp token from /api/auth/check
// ─────────────────────────────────────────────────────────────
const voiceLoginVerify = async (req, res) => {
    try {
        const userId = req.user.id;   // decoded from temp JWT by protect middleware
        const file   = req.file;

        if (!file) return res.status(400).json({ message: 'Audio file required for voice verification' });

        const user = await User.findById(userId);
        if (!user)               return res.status(404).json({ message: 'User not found' });
        if (!user.voice_enrolled) return res.status(400).json({ message: 'Voice not enrolled. Contact support.' });

        // Fail-fast if no embeddings stored (paranoia check)
        if (!user.voice_embeddings || user.voice_embeddings.length === 0) {
            return res.status(400).json({ message: 'No voice embeddings found. Please re-enroll.' });
        }

        const formData = new FormData();
        formData.append('userId', user._id.toString());
        formData.append('file', bufferToBlob(file), file.originalname || `login_verify.wav`);
        // Pass stored MongoDB embeddings → Python does not need in-memory state
        formData.append('stored_embeddings', JSON.stringify(user.voice_embeddings));

        const result = await callVoiceService('/voice/verify', formData);

        if (result.authenticated) {
            res.json({
                success: true,
                message: 'Voice verified. Login successful.',
                _id: user._id,
                name: user.name,
                email: user.email,
                enrollment_number: user.enrollment_number,
                branch: user.branch,
                semester: user.semester,
                role: user.role,
                token: generateToken(user._id),         // full 30-day session token
                similarity_score: result.similarity_score,
                threshold_used: result.threshold_used,
                individual_scores: result.individual_scores,
            });
        } else {
            res.status(401).json({
                success: false,
                message: `Voice does not match (score: ${result.similarity_score?.toFixed(3)}, threshold: ${result.threshold_used?.toFixed(3)}). Access denied.`,
                similarity_score: result.similarity_score,
                threshold_used: result.threshold_used,
                individual_scores: result.individual_scores,
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { enrollVoice, verifyVoice, voiceLogin, voiceLoginVerify };