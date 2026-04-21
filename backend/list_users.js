const mongoose = require('mongoose');
const User = require('./models/User');

const check = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://mongodb:27017/nucleus');
        console.log('Connected to DB');
        const users = await User.find({}, 'email role enrollment_number');
        console.log('Users found:', JSON.stringify(users, null, 2));
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

check();
