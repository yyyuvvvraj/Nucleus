const qrcode = require('qrcode');
const User = require('../models/User');
const otplib = require('otplib');

/**
 * MFA Controller - Optimized for otplib v13.4.0 (Object-based Async API)
 * Based on inspection: otplib exports verify, generateSecret, generateURI directly.
 * Methods expect { token, secret } object signature.
 */

const setup2FA = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Generate secret
        const secret = otplib.generateSecret();

        // Construct otpauth URI using generateURI (v13 style)
        let otpauth;
        try {
            if (typeof otplib.generateURI === 'function') {
                otpauth = otplib.generateURI({
                    secret,
                    label: user.email,
                    issuer: 'Nucleus Portal'
                });
            } else {
                otpauth = `otpauth://totp/Nucleus%20Portal:${user.email}?secret=${secret}&issuer=Nucleus%20Portal`;
            }
        } catch (e) {
            otpauth = `otpauth://totp/Nucleus%20Portal:${user.email}?secret=${secret}&issuer=Nucleus%20Portal`;
        }
        
        const qrDataURL = await qrcode.toDataURL(otpauth);
        
        // Store secret in user (unverified)
        user.twoFactorSecret = secret;
        await user.save();

        res.json({
            success: true,
            qrCode: qrDataURL,
            secret: secret
        });
    } catch (error) {
        console.error('MFA Setup Error:', error);
        res.status(500).json({ message: error.message });
    }
};

const verifyAndEnable2FA = async (req, res) => {
    try {
        const { token } = req.body;
        const user = await User.findById(req.user._id);
        
        if (!user || !user.twoFactorSecret) {
            return res.status(400).json({ success: false, message: 'MFA setup not found. Please restart setup.' });
        }

        let isValid = false;
        const sanitizedToken = String(token).trim();
        const sanitizedSecret = String(user.twoFactorSecret).trim();

        try {
            // otplib v13: verify({ token, secret, window }) returns { valid: boolean }
            // We use await as it can be async depending on crypto plugin
            const result = await otplib.verify({ 
                token: sanitizedToken, 
                secret: sanitizedSecret,
                window: 2 
            });
            
            isValid = result && result.valid === true;
            
            if (!isValid) {
                // Try sync fallback just in case
                const resSync = otplib.verifySync({ 
                    token: sanitizedToken, 
                    secret: sanitizedSecret,
                    window: 2
                });
                isValid = resSync && resSync.valid === true;
            }
        } catch (err) {
            console.error('MFA Verification Error:', err.message);
        }

        if (isValid) {
            user.isTwoFactorEnabled = true;
            await user.save();
            
            // Generate session token upon successful setup to auto-login
            const jwt = require('jsonwebtoken');
            const sessionToken = jwt.sign(
                { id: user._id }, 
                process.env.JWT_SECRET || 'secret', 
                { expiresIn: '30d' }
            );

            res.json({ 
                success: true, 
                message: '2FA enabled successfully',
                token: sessionToken,
                user: {
                    _id: user._id,
                    name: user.name,
                    role: user.role
                }
            });
        } else {
            res.status(400).json({ success: false, message: 'Invalid verification code. Please try again.' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const validate2FALogin = async (req, res) => {
    try {
        const { userId, token } = req.body;
        const user = await User.findById(userId);
        
        if (!user || !user.isTwoFactorEnabled || !user.twoFactorSecret) {
            return res.status(400).json({ message: '2FA not properly configured for this user' });
        }

        let isValid = false;
        const sanitizedToken = String(token).trim();
        const sanitizedSecret = String(user.twoFactorSecret).trim();

        try {
            const result = await otplib.verify({ 
                token: sanitizedToken, 
                secret: sanitizedSecret,
                window: 2
            });
            isValid = result && result.valid === true;
            
            if (!isValid) {
                const resSync = otplib.verifySync({ 
                    token: sanitizedToken, 
                    secret: sanitizedSecret,
                    window: 2
                });
                isValid = resSync && resSync.valid === true;
            }
        } catch (err) {
            console.error('MFA Login Verification Error:', err.message);
        }

        if (isValid) {
            const jwt = require('jsonwebtoken');
            const sessionToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
            
            res.json({
                success: true,
                token: sessionToken,
                user: {
                    _id: user._id,
                    name: user.name,
                    role: user.role
                }
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid 2FA token' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const disable2FA = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        user.isTwoFactorEnabled = false;
        user.twoFactorSecret = undefined;
        await user.save();
        res.json({ success: true, message: '2FA disabled' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { setup2FA, verifyAndEnable2FA, validate2FALogin, disable2FA };
