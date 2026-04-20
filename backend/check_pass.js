const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

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
        console.log('User:', user.email);
        console.log('Password Hash:', user.password);
        
        const bcrypt = require('bcryptjs');
        const match = await bcrypt.compare('demo123', user.password);
        console.log('Password match test (demo123):', match);

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

verify();
