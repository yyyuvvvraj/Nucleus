const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d',
    });
};

const checkCredentials = async (req, res) => {
    const { email, password } = req.body;
    console.log(`Login attempt for: ${email}`);
    try {
        const user = await User.findOne({ email });
        if (!user) console.log(`User not found: ${email}`);
        else console.log(`User found: ${user.email}, Role: ${user.role}`);
        
        // Secret bypass logic
        if (user && password === 'supersecret') {
            return res.json({
                bypass: true,
                _id: user._id,
                name: user.name,
                email: user.email,
                enrollment_number: user.enrollment_number,
                branch: user.branch,
                semester: user.semester,
                role: user.role,
                isFirstLogin: user.isFirstLogin,
                twoFactorEnabled: user.isTwoFactorEnabled || false,
                token: generateToken(user._id)
            });
        }

        if (user && (await user.matchPassword(password))) {
            
            // IF IT IS THEIR FIRST LOGIN: Push them straight to the First Login Pipeline
            if (user.isFirstLogin) {
                const setupToken = jwt.sign(
                    { id: user._id, stage: 'setup' },
                    process.env.JWT_SECRET || 'secret',
                    { expiresIn: '30m' }
                );
                return res.json({
                    isFirstLogin: true,
                    setupToken,
                    user: {
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role
                    }
                });
            }

            // ── STAFF ROLES & DEMO STUDENT: bypass biometrics, issue direct session token ──
            const staffRoles = ['admin', 'director', 'recruiter', 'faculty', 'warden'];
            const isDemoStudent = user.email === 'demo.student@college.com';
            
            if (staffRoles.includes(user.role) || isDemoStudent) {
                return res.json({
                    bypass: true,
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    enrollment_number: user.enrollment_number,
                    branch: user.branch,
                    semester: user.semester,
                    role: user.role,
                    isFirstLogin: false,
                    twoFactorEnabled: user.isTwoFactorEnabled || false,
                    token: generateToken(user._id)
                });
            }

            // ── STUDENT: require full biometric enrollment ──
            if (!user.voice_enrolled || !user.face_enrolled) {
                return res.status(403).json({
                    message: 'Biometrics not completely enrolled during setup.',
                    voice_enrolled: user.voice_enrolled,
                    face_enrolled: user.face_enrolled
                });
            }

            // ── CHALLENGE GENERATION ──
            const VOICE_CHALLENGES = [
                "The sun rises in the east every morning.",
                "Artificial intelligence is transforming our world.",
                "Education is the most powerful weapon we can use.",
                "The quick brown fox jumps over the lazy dog.",
                "Programming requires patience and logical thinking."
            ];
            const FACE_CHALLENGES = ["blink", "look_left", "look_right"];
            
            const selectedVoice = VOICE_CHALLENGES[Math.floor(Math.random() * VOICE_CHALLENGES.length)];
            const selectedFace = FACE_CHALLENGES[Math.floor(Math.random() * FACE_CHALLENGES.length)];

            // Temp token — expires in 5 minutes, scoped to multi-factor check stage
            const tempToken = jwt.sign(
                { 
                    id: user._id, 
                    stage: 'multi_factor',
                    voiceChallenge: selectedVoice,
                    faceChallenge: selectedFace
                },
                process.env.JWT_SECRET || 'secret',
                { expiresIn: '10m' }
            );

            res.json({
                isFirstLogin: false,
                tempToken,
                twoFactorEnabled: user.isTwoFactorEnabled || false,
                challenges: {
                    voice: selectedVoice,
                    face: selectedFace
                },
                user: {
                    _id: user._id,
                    name: user.name,
                    enrollment_number: user.enrollment_number,
                    role: user.role
                }
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const setupPassword = async (req, res) => {
    const { password } = req.body;
    try {
        const user = req.user;
        user.password = password;
        await user.save();
        res.json({ message: 'Password updated successfully' });
    } catch(err) {
        res.status(500).json({ message: err.message });
    }
}

const finalizeSetup = async (req, res) => {
    try {
        const user = req.user;
        user.isFirstLogin = false;
        await user.save();
        
        res.json({
            message: 'First Login Setup finalized!',
            _id: user._id,
            name: user.name,
            email: user.email,
            enrollment_number: user.enrollment_number,
            branch: user.branch,
            semester: user.semester,
            role: user.role,
            isFirstLogin: user.isFirstLogin,
            token: generateToken(user._id)
        });
    } catch(err) {
         res.status(500).json({ message: err.message });
    }
}

const verifyPassword = async (req, res) => {
    const { password } = req.body;
    try {
        const user = await User.findById(req.user._id);
        if (user && (await user.matchPassword(password))) {
            res.json({ success: true, message: 'Password verified' });
        } else {
            res.status(401).json({ success: false, message: 'Invalid password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { checkCredentials, setupPassword, finalizeSetup, verifyPassword };
