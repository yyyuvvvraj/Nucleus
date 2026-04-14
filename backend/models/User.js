const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    enrollment_number: { type: String, required: true, unique: true },
    branch: { type: String }, // Optional for non-student roles
    semester: { type: Number }, // Optional for non-student roles
    // Role & Setup pipeline
    role: { type: String, enum: ['admin', 'director', 'faculty', 'warden', 'recruiter', 'student'], default: 'student' },
    isFirstLogin: { type: Boolean, default: true },
    initialPassword: { type: String }, // Plain-text stored only for recruiter visibility
    batch: { type: String }, // e.g. '2024-2028'
    // Voice authentication fields
    voice_enrolled: { type: Boolean, default: false },
    voice_embeddings: { type: [[Number]], default: [] }, // Array of MFCC feature vectors
    voice_threshold: { type: Number, default: 0.85 },
    voice_updated_at: { type: Date },
    // Face authentication fields
    face_enrolled: { type: Boolean, default: false },
    face_embeddings: { type: [[Number]], default: [] }, // Array of vectors for multi-angle support
    face_threshold: { type: Number, default: 0.75 },
    face_updated_at: { type: Date },
    // Multi-factor authentication
    twoFactorSecret: { type: String },
    isTwoFactorEnabled: { type: Boolean, default: false }
}, {
    timestamps: true
});

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
