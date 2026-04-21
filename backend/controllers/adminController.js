const User = require('../models/User');
const Result = require('../models/Result');
const Attendance = require('../models/Attendance');
const Timetable = require('../models/Timetable');
const Course = require('../models/Course');
const MessMenu = require('../models/MessMenu');

const getStudents = async (req, res) => {
    try {
        const { branch, semester, batch } = req.query;
        const filter = { role: 'student' };
        if (branch) filter.branch = new RegExp(branch, 'i');
        if (semester) filter.semester = Number(semester);
        if (batch) filter.batch = new RegExp(batch, 'i');

        const students = await User.find(filter).select('-password -voice_embeddings -face_embeddings');
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addStudent = async (req, res) => {
    const { name, email, branch, semester, batch } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });
        
        const randomPassword = 'Xy@' + Math.floor(10000 + Math.random() * 90000);
        const enrollment_number = 'STU-' + Math.floor(10000 + Math.random() * 90000);

        const student = await User.create({
            name, email, password: randomPassword, enrollment_number,
            branch, semester, batch, role: 'student',
            isFirstLogin: true, initialPassword: randomPassword
        });

        res.status(201).json({
            message: 'Student generated successfully',
            email: student.email,
            enrollment_number: student.enrollment_number,
            generatedPassword: randomPassword,
            batch: student.batch
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addResult = async (req, res) => {
    const { userId, subject, marks, grade, credits } = req.body;
    try {
        const result = new Result({ userId, subject, marks, grade, credits });
        await result.save();
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addAttendance = async (req, res) => {
    const { userId, subject_name, total_classes, attended_classes } = req.body;
    try {
        const attendance = new Attendance({ userId, subject_name, total_classes, attended_classes });
        await attendance.save();
        res.status(201).json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addTimetable = async (req, res) => {
    const { day, time, subject, faculty, branch, semester } = req.body;
    try {
        const timetable = new Timetable({ day, time, subject, faculty, branch, semester });
        await timetable.save();
        res.status(201).json(timetable);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const bulkMarkAttendance = async (req, res) => {
    const { studentIds, subject_name, statusMap } = req.body;
    // statusMap: { [userId]: true/false }

    try {
        const results = [];
        for (const userId of studentIds) {
            let attendance = await Attendance.findOne({ userId, subject_name });
            
            if (!attendance) {
                attendance = new Attendance({ userId, subject_name, total_classes: 0, attended_classes: 0 });
            }

            attendance.total_classes += 1;
            if (statusMap[userId]) {
                attendance.attended_classes += 1;
            }
            
            await attendance.save();
            results.push(attendance);
        }
        res.json({ success: true, message: `Marked attendance for ${studentIds.length} students.`, data: results });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const reset2FA = async (req, res) => {
    try {
        const student = await User.findById(req.params.id);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        student.isTwoFactorEnabled = false;
        student.twoFactorSecret = undefined;
        await student.save();

        res.json({ success: true, message: '2FA reset successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const resetRegistration = async (req, res) => {
    try {
        const student = await User.findById(req.params.id);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        // Reset registration state
        student.isFirstLogin = true;
        
        // Clear Biometrics
        student.face_enrolled = false;
        student.face_embeddings = [];
        student.voice_enrolled = false;
        student.voice_embeddings = [];
        
        // Reset 2FA
        student.isTwoFactorEnabled = false;
        student.twoFactorSecret = undefined;

        // Restore initial password if we have it
        if (student.initialPassword) {
            student.password = student.initialPassword;
        }

        await student.save();

        res.json({ success: true, message: 'Student registration reset successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ── COURSE MANAGEMENT ──
const getCourses = async (req, res) => {
    try {
        const courses = await Course.find();
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addCourse = async (req, res) => {
    try {
        const course = new Course(req.body);
        await course.save();
        res.status(201).json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteCourse = async (req, res) => {
    try {
        await Course.findByIdAndDelete(req.params.id);
        res.json({ message: 'Course deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ── MESS MENU MANAGEMENT ──
const getMessMenu = async (req, res) => {
    try {
        const menu = await MessMenu.find();
        res.json(menu);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateMessMenu = async (req, res) => {
    try {
        console.log('UPDATING MESS MENU. Body:', req.body);
        const { day, breakfast, lunch, dinner, special } = req.body;
        
        if (!day) {
            console.error('Day is missing in request body');
            return res.status(400).json({ message: 'Day is required' });
        }

        let item = await MessMenu.findOne({ day });
        if (item) {
            item.breakfast = breakfast;
            item.lunch = lunch;
            item.dinner = dinner;
            item.special = special;
            await item.save();
        } else {
            item = new MessMenu({ day, breakfast, lunch, dinner, special });
            await item.save();
        }
        console.log('Mess menu successfully updated for:', day);
        res.json(item);
    } catch (error) {
        console.error('Error updating mess menu:', error);
        res.status(500).json({ message: error.message });
    }
};

// ── HOSTEL MANAGEMENT ──
const assignHostel = async (req, res) => {
    try {
        console.log('ASSIGNING HOSTEL. Body:', req.body);
        const { userId, hostelBlock, roomNumber, hostelFeePaid, messFeePaid } = req.body;
        
        if (!userId) {
            console.error('User ID is missing in hostel assignment');
            return res.status(400).json({ message: 'User ID is required' });
        }

        const student = await User.findById(userId);
        if (!student) {
            console.error('Student not found for ID:', userId);
            return res.status(404).json({ message: 'Student not found' });
        }

        student.hostelBlock = hostelBlock;
        student.roomNumber = roomNumber;
        student.hostelFeePaid = hostelFeePaid;
        student.messFeePaid = messFeePaid;
        await student.save();

        console.log('Hostel details successfully updated for student:', student.name);
        res.json({ success: true, message: 'Hostel details updated', student });
    } catch (error) {
        console.error('Error assigning hostel:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { 
    getStudents, 
    addStudent, 
    addResult, 
    addAttendance, 
    addTimetable, 
    bulkMarkAttendance,
    reset2FA,
    resetRegistration,
    getCourses,
    addCourse,
    deleteCourse,
    getMessMenu,
    updateMessMenu,
    assignHostel
};
