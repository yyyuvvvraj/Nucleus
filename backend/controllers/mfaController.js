const { TOTP, ScureBase32Plugin, NobleCryptoPlugin } = require('otplib');
const qrcode = require('qrcode');
const User = require('../models/User');

// In otplib v13, we manually construct the authenticator instance with plugins
const authenticator = new TOTP({
    createDigest: NobleCryptoPlugin.createDigest,
    createRandomBytes: NobleCryptoPlugin.createRandomBytes,
    encoding: 'base32',
    keyDecoder: ScureBase32Plugin.keyDecoder,
    keyEncoder: ScureBase32Plugin.keyEncoder,
});

// Configure options
authenticator.options = { window: 1 }; // Allow 30s before/after for sync issues

const setup2FA = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const secret = authenticator.generateSecret();
        const otpauth = authenticator.keyuri(user.email, 'Nucleus Portal', secret);
        
        const qrDataURL = await qrcode.toDataURL(otpauth);
        
        // Temporarily store secret in user (unverified)
        user.twoFactorSecret = secret;
        await user.save();

        res.json({
            success: true,
            qrCode: qrDataURL,
            secret: secret // Provide manual entry fallback
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const verifyAndEnable2FA = async (req, res) => {
    try {
        const { token } = req.body;
        const user = await User.findById(req.user._id);
        
        const isValid = authenticator.check(token, user.twoFactorSecret);
        
        if (isValid) {
            user.isTwoFactorEnabled = true;
            await user.save();
            res.json({ success: true, message: '2FA enabled successfully' });
        } else {
            res.status(400).json({ success: false, message: 'Invalid TOTP token' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const validate2FALogin = async (req, res) => {
    try {
        const { userId, token } = req.body;
        const user = await User.findById(userId);
        if (!user || !user.isTwoFactorEnabled) {
            return res.status(400).json({ message: '2FA not enabled for this user' });
        }

        const isValid = authenticator.check(token, user.twoFactorSecret);
        
        if (isValid) {
            // Return full session token
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
