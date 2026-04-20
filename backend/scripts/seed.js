const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Result = require('../models/Result');
const Timetable = require('../models/Timetable');

dotenv.config(); // Loads .env from the current working directory

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/nucleus', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Connected for Seeding');

        // Wipe all collections, including users for the RBAC reset
        await User.deleteMany();
        await Attendance.deleteMany();
        await Result.deleteMany();
        await Timetable.deleteMany();

        console.log('Cleared existing Users, Attendance, Result, Timetable data!');

        // Seed Core Roles
        const coreUsers = [
            { name: 'System Admin', email: 'admin@college.com', password: 'admin', enrollment_number: 'ADM-01', role: 'admin', isFirstLogin: false },
            { name: 'Area Director', email: 'director@college.com', password: 'admin', enrollment_number: 'DIR-01', role: 'director', isFirstLogin: false },
            { name: 'Admissions Recruiter', email: 'recruiter@college.com', password: 'admin', enrollment_number: 'REC-01', role: 'recruiter', isFirstLogin: false },
            { name: 'Senior Faculty', email: 'faculty@college.com', password: 'admin', enrollment_number: 'FAC-01', role: 'faculty', isFirstLogin: false },
            { name: 'Hostel Warden', email: 'warden@college.com', password: 'admin', enrollment_number: 'WAR-01', role: 'warden', isFirstLogin: false },
            { name: 'Test Student', email: 'student@college.com', password: 'admin', enrollment_number: 'STU-01', branch: 'Computer Science', semester: 4, role: 'student', isFirstLogin: false },
            { name: 'Demo Student', email: 'demo.student@college.com', password: 'demo123', enrollment_number: 'DEMO-STU-01', branch: 'Computer Science', semester: 6, role: 'student', isFirstLogin: false, voice_enrolled: true, face_enrolled: true }
        ];

        const createdUsers = [];
        for (const u of coreUsers) {
            createdUsers.push(await User.create(u));
        }
        console.log('Seeded the 6 core hierarchical roles with hashed passwords.');

        const studentUser = createdUsers.find(u => u.role === 'student');
        const userId = studentUser._id;
        const branch = studentUser.branch;
        const semester = studentUser.semester;

        // --- Seed Timetable ---
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        const subjects = ['Data Structures', 'Operating Systems', 'Database Systems', 'Computer Networks'];
        const times = ['09:00 - 10:30', '11:00 - 12:30', '14:00 - 15:30'];

        const timetables = [];
        days.forEach(day => {
            times.forEach((time, index) => {
                timetables.push({
                    day,
                    time,
                    subject: subjects[index % subjects.length],
                    faculty: `Prof. Seed ${index}`,
                    branch: branch,
                    semester: semester
                });
            });
        });
        await Timetable.insertMany(timetables);

        // --- Seed Attendance ---
        const attendances = [
            { userId, subject_name: 'Data Structures', total_classes: 40, attended_classes: 36, percentage: (36/40)*100 },
            { userId, subject_name: 'Operating Systems', total_classes: 38, attended_classes: 30, percentage: (30/38)*100 },
            { userId, subject_name: 'Database Systems', total_classes: 42, attended_classes: 39, percentage: (39/42)*100 },
            { userId, subject_name: 'Computer Networks', total_classes: 40, attended_classes: 34, percentage: (34/40)*100 }
        ];
        await Attendance.insertMany(attendances);

        // --- Seed Results ---
        const results = [
            { userId, subject: 'Data Structures', marks: 85, grade: 'A', credits: 4 },
            { userId, subject: 'Operating Systems', marks: 78, grade: 'B+', credits: 4 },
            { userId, subject: 'Database Systems', marks: 92, grade: 'A+', credits: 4 },
            { userId, subject: 'Computer Networks', marks: 81, grade: 'A', credits: 4 }
        ];
        await Result.insertMany(results);

        console.log('Successfully seeded dynamic data!');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedDatabase();
