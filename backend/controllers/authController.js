const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d',
    });
};

// Issues a short-lived temp token after validating credentials only.
// Voice verification must pass before a full session token is granted.
const checkCredentials = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && (await user.matchPassword(password))) {
            if (!user.voice_enrolled) {
                return res.status(403).json({
                    message: 'Voice not enrolled. Please register again.',
                    voice_enrolled: false,
                });
            }
            // Temp token — expires in 5 minutes, scoped to voice-check stage
            const tempToken = jwt.sign(
                { id: user._id, stage: 'voice_check' },
                process.env.JWT_SECRET || 'secret',
                { expiresIn: '5m' }
            );
            res.json({
                tempToken,
                user: {
                    _id: user._id,
                    name: user.name,
                    enrollment_number: user.enrollment_number,
                    voice_enrolled: user.voice_enrolled,
                }
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const registerUser = async (req, res) => {
    const { name, email, password, enrollment_number, branch, semester } = req.body;
    
    try {
        const userExists = await User.findOne({ email });
        
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }
        
        const user = await User.create({
            name, email, password, enrollment_number, branch, semester
        });
        
        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                enrollment_number: user.enrollment_number,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const user = await User.findOne({ email });
        
        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                enrollment_number: user.enrollment_number,
                branch: user.branch,
                semester: user.semester,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, loginUser, checkCredentials };

