const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true },
    marks: { type: Number, required: true },
    grade: { type: String, required: true },
    credits: { type: Number, required: true, default: 3 }
}, { timestamps: true });

module.exports = mongoose.model('Result', resultSchema);
