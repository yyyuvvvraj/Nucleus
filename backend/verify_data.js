const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Attendance = require('./models/Attendance');
const Result = require('./models/Result');
const Timetable = require('./models/Timetable');

dotenv.config();

const verify = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/nucleus');
        console.log('Connected to DB');

        const user = await User.findOne({ email: 'demo.student@college.com' });
        if (!user) {
            console.log('Demo user not found');
            process.exit(1);
        }
        console.log('User ID:', user._id);

        const attendance = await Attendance.find({ userId: user._id });
        console.log('Attendance count:', attendance.length);

        const results = await Result.find({ userId: user._id });
        console.log('Results count:', results.length);

        const timetable = await Timetable.find({ 
            branch: user.branch,
            semester: user.semester
        });
        console.log('Timetable count:', timetable.length);

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

verify();
