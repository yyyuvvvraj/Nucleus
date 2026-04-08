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
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 30000,
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
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: 'Face image file required' });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const formData = new FormData();
        formData.append('userId', userId.toString());
        formData.append('file', bufferToBlob(file), file.originalname || 'face.png');

        const result = await callFaceService('/face/enroll', formData);

        if (result.success) {
            user.face_enrolled = true;
            user.face_embeddings = result.embedding || [];
            user.face_threshold = result.threshold || 0.75;
            user.face_updated_at = new Date();
            await user.save();

            res.json({
                success: true,
                message: 'Face enrolled successfully',
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
        const userId = req.user.id;   // decoded from temp JWT
        const file = req.file;

        if (!file) return res.status(400).json({ message: 'Face image file required for verification' });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (!user.face_enrolled || !user.face_embeddings || user.face_embeddings.length === 0) {
            return res.status(400).json({ message: 'Face not enrolled. Please register again.' });
        }

        const formData = new FormData();
        formData.append('userId', user._id.toString());
        formData.append('file', bufferToBlob(file), file.originalname || 'login_face.png');
        formData.append('stored_embedding', JSON.stringify(user.face_embeddings));

        const result = await callFaceService('/face/verify', formData);

        if (result.authenticated) {
            res.json({
                success: true,
                message: 'Face verified successfully.',
                similarity_score: result.similarity_score,
                threshold_used: result.threshold_used,
            });
        } else {
            res.status(401).json({
                success: false,
                message: `Face mismatch (score: ${result.similarity_score?.toFixed(3)}, threshold: ${result.threshold_used?.toFixed(3)}). Access denied.`,
                similarity_score: result.similarity_score,
                threshold_used: result.threshold_used,
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { enrollFace, faceLoginVerify };
