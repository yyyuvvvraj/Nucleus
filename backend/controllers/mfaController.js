const qrcode = require('qrcode');
const User = require('../models/User');
const speakeasy = require('speakeasy');

/**
 * MFA Controller - Using speakeasy (pure CommonJS, Vercel-compatible)
 * Replaces otplib which has ESM compatibility issues on Vercel Serverless.
 */

const setup2FA = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Generate secret
        const secretObj = speakeasy.generateSecret({
            name: `Nucleus Portal:${user.email}`,
            issuer: 'Nucleus Portal'
        });

        const secret = secretObj.base32;
        const otpauth = secretObj.otpauth_url;
        
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

        const sanitizedToken = String(token).trim();
        const sanitizedSecret = String(user.twoFactorSecret).trim();

        const isValid = speakeasy.totp.verify({
            secret: sanitizedSecret,
            encoding: 'base32',
            token: sanitizedToken,
            window: 2
        });

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
                _id: user._id,
                name: user.name,
                role: user.role
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

        const sanitizedToken = String(token).trim();
        const sanitizedSecret = String(user.twoFactorSecret).trim();

        const isValid = speakeasy.totp.verify({
            secret: sanitizedSecret,
            encoding: 'base32',
            token: sanitizedToken,
            window: 2
        });

        if (isValid) {
            const jwt = require('jsonwebtoken');
            const sessionToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
            
            res.json({
                success: true,
                token: sessionToken,
                _id: user._id,
                name: user.name,
                role: user.role
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
