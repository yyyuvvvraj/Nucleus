const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subject_name: { type: String, required: true },
    total_classes: { type: Number, required: true, default: 0 },
    attended_classes: { type: Number, required: true, default: 0 },
    percentage: { type: Number, default: 0 }
}, { timestamps: true });

attendanceSchema.pre('save', function(next) {
    if (this.total_classes > 0) {
        this.percentage = (this.attended_classes / this.total_classes) * 100;
    } else {
        this.percentage = 0;
    }
    next();
});

module.exports = mongoose.model('Attendance', attendanceSchema);
