const axios = require('axios');
const { Blob } = require('node:buffer');
const User = require('../models/User');

const VOICE_SERVICE_URL = process.env.VOICE_SERVICE_URL || 'http://localhost:8000';

const bufferToBlob = (fileObj) => {
    const mime = fileObj.mimetype || 'image/png';
    return new Blob([fileObj.buffer], { type: mime });
};

const callFaceService = async (endpoint, formData) => {
    try {
        const response = await axios.post(`${VOICE_SERVICE_URL}${endpoint}`, formData, {
            // Reduced timeout for better UX during service failures
            timeout: 60000,
        });
        return response.data;
    } catch (error) {
        console.error('Face service error:', error.response?.data || error.message);
        throw new Error(error.response?.data?.detail || 'Face service unavailable');
    }
};

const enrollFace = async (req, res) => {
    try {
        const userId = req.user._id;
        const files = req.files; // Expected to be an array from upload.array('files')

        if (!files || files.length === 0) {
            return res.status(400).json({ message: 'Face image files (multiple angles) required' });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const formData = new FormData();
        formData.append('userId', userId.toString());
        
        // Append all files to the 'files' field for the Python service
        files.forEach(file => {
            formData.append('files', bufferToBlob(file), file.originalname || 'face.png');
        });

        const result = await callFaceService('/face/enroll', formData);

        if (result.success) {
            user.face_enrolled = true;
            // Python now returns an 'embeddings' (plural) list or a robust single embedding
            // We'll store what Python gives us (usually the averaged result or the list)
            user.face_embeddings = result.embedding || result.embeddings || [];
            user.face_threshold = result.threshold || 0.70;
            user.face_updated_at = new Date();
            await user.save();

            res.json({
                success: true,
                message: result.message || 'Face profile enrolled successfully',
                embedding_dim: result.embedding_dim,
                user: {
                    _id: user._id,
                    name: user.name,
                    face_enrolled: user.face_enrolled,
                },
            });
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const faceLoginVerify = async (req, res) => {
    try {
        const userId = req.user._id;
        const file = req.file;

        if (!file) return res.status(400).json({ message: 'Face image required' });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (!user.face_enrolled || !user.face_embeddings || user.face_embeddings.length === 0) {
            return res.status(400).json({ message: 'Face profile missing.' });
        }

        const formData = new FormData();
        formData.append('userId', user._id.toString());
        formData.append('file', bufferToBlob(file), file.originalname || 'login_face.png');
        // Pass flat embedding vector — Python endpoint expects 'stored_embedding' (singular)
        formData.append('stored_embedding', JSON.stringify(user.face_embeddings));
        
        // Pass the expected action for liveness detection
        if (req.user.faceChallenge) {
            formData.append('expected_action', req.user.faceChallenge);
        }

        const result = await callFaceService('/face/verify', formData);

        if (result.authenticated) {
            // Conditional MFA logic: random challenge OR weak match (0.80 - 0.85)
            const isWeakMatch = result.similarity_score >= 0.80 && result.similarity_score <= 0.85;
            const randomChallenge = Math.random() < 0.5; // 50% chance
            const mfaRequired = user.isTwoFactorEnabled && (isWeakMatch || randomChallenge);

            res.json({
                success: true,
                message: mfaRequired ? 'Face verified. MFA challenge triggered.' : 'Face verified successfully.',
                similarity_score: result.similarity_score,
                threshold_used: result.threshold_used,
                mfaRequired: mfaRequired
            });
        } else {
            res.status(401).json({
                success: false,
                message: `Face mismatch (score: ${result.similarity_score?.toFixed?.(3) ?? result.similarity_score}, threshold: ${result.threshold_used}). Access denied.`,
                similarity_score: result.similarity_score
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { enrollFace, faceLoginVerify };
