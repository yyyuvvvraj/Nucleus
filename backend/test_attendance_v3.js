const axios = require('axios');

const BACKEND_URL = 'http://localhost:5001';

async function runTest() {
    console.log('--- Attendance Bulk Marking Integration Test ---');
    
    try {
        // 1. Login as Admin
        console.log('Logging in as admin...');
        const loginRes = await axios.post(`${BACKEND_URL}/api/auth/check`, {
            email: 'admin@college.com',
            password: 'admin'
        });
        
        const token = loginRes.data.token;
        console.log('Login successful.');

        // 2. Get some student IDs
        console.log('Fetching students...');
        const studentsRes = await axios.get(`${BACKEND_URL}/api/admin/students`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const studentIds = studentsRes.data.map(s => s._id);
        console.log(`Found ${studentIds.length} students.`);

        if (studentIds.length === 0) {
            console.log('No students found to test attendance.');
            return;
        }

        // 3. Mark Bulk Attendance for "Advanced Algorithms"
        console.log('Marking bulk attendance...');
        const statusMap = {};
        studentIds.forEach((id, index) => {
            statusMap[id] = index % 2 === 0; // Alternating present/absent
        });

        const bulkRes = await axios.post(`${BACKEND_URL}/api/admin/attendance/bulk`, {
            studentIds,
            subject_name: 'Advanced Algorithms',
            statusMap
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('Bulk Marking Result:', bulkRes.data.message);

        // 4. Verify for the first student
        const testUserId = studentIds[0];
        console.log(`Verifying attendance for student ${testUserId}...`);
        const verifyRes = await axios.get(`${BACKEND_URL}/api/attendance/${testUserId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        const record = verifyRes.data.find(r => r.subject_name === 'Advanced Algorithms');
        console.log('Record found:', record);
        if (record && record.total_classes > 0) {
            console.log('SUCCESS: Attendance record created/updated successfully.');
        } else {
            console.log('FAILURE: Attendance record not found or totals are 0.');
        }

    } catch (error) {
        console.error('Test failed with error:', error.response?.data || error.message);
    }
}

runTest();
