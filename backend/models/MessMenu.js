const mongoose = require('mongoose');

const messMenuSchema = new mongoose.Schema({
    day: { type: String, required: true, unique: true }, // e.g. 'Monday'
    breakfast: { type: String, required: true },
    lunch: { type: String, required: true },
    dinner: { type: String, required: true },
    special: { type: String }
}, {
    timestamps: true
});

module.exports = mongoose.model('MessMenu', messMenuSchema);
