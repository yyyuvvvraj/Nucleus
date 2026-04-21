const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    credits: { type: Number, required: true },
    faculty: { type: String },
    branch: { type: String, required: true },
    semester: { type: Number, required: true },
    description: { type: String },
    syllabus: { type: [String] } // List of topics
}, {
    timestamps: true
});

module.exports = mongoose.model('Course', courseSchema);
