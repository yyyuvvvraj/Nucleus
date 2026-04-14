const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const BACKEND_URL = 'http://localhost:5001';
const TEST_IMAGE_PATH = 'C:\\Users\\hp\\.gemini\\antigravity\\brain\\8231b0d1-b4de-45a1-bdf6-5d6cafa08384\\test_face_snapshot_1775917087092.png';

async function runTest() {
    console.log('--- Face Enrollment Integration Test ---');
    
    try {
        // 1. Login as Admin to get a token
        console.log('Logging in as admin...');
        const loginRes = await axios.post(`${BACKEND_URL}/api/auth/check`, {
            email: 'admin@college.com',
            password: 'admin'
        });
        
        const token = loginRes.data.token;
        console.log('Login successful.');

        // 2. Test Face Enrollment
        console.log('Testing face enrollment...');
        const formData = new FormData();
        formData.append('file', fs.createReadStream(TEST_IMAGE_PATH));
        
        const enrollRes = await axios.post(`${BACKEND_URL}/api/auth/face/enroll`, formData, {
            headers: {
                ...formData.getHeaders(),
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('Enrollment Result:', enrollRes.data);
        if (enrollRes.data.success) {
            console.log('SUCCESS: Face enrolled successfully.');
        } else {
            console.log('FAILURE: Face enrollment returned success: false.');
        }

        // 3. Test Face Verification
        console.log('Testing face verification...');
        const verifyFormData = new FormData();
        verifyFormData.append('file', fs.createReadStream(TEST_IMAGE_PATH));
        
        // We need a temp token for multi-factor login to test verification properly, 
        // OR we can just use the admin token if the backend allows it for testing.
        // But the backend expects 'req.user' from the token.
        
        const verifyRes = await axios.post(`${BACKEND_URL}/api/auth/face/login-verify`, verifyFormData, {
            headers: {
                ...verifyFormData.getHeaders(),
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('Verification Result:', verifyRes.data);
        if (verifyRes.data.success) {
            console.log('SUCCESS: Face verified successfully.');
        } else {
            console.log('FAILURE: Face verification failed.');
        }

    } catch (error) {
        console.error('Test failed with error:', error.response?.data || error.message);
    }
}

runTest();
