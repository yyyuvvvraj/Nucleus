const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const verifyUser = async () => {
    try {
        console.log('Connecting to:', process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Connected');

        const email = 'demo.student@college.com';
        const user = await User.findOne({ email });

        if (!user) {
            console.log('User not found! Creating it now...');
            const newUser = await User.create({
                name: 'Demo Student',
                email: email,
                password: 'demo123',
                enrollment_number: 'DEMO-STU-01',
                branch: 'Computer Science',
                semester: 6,
                role: 'student',
                isFirstLogin: false,
                voice_enrolled: true,
                face_enrolled: true
            });
            console.log('Created user:', newUser.email);
        } else {
            console.log('User found:', user.email);
            console.log('Updating password to demo123...');
            user.password = 'demo123';
            user.isFirstLogin = false;
            await user.save();
            console.log('Password updated and hashed.');
        }

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

verifyUser();
