const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const BACKEND_URL = 'http://localhost:5001';
const TEST_AUDIO_DIR = path.join(__dirname, '..', 'voice-auth-service', 'test_audio_files');

async function runTest() {
    console.log('--- Voice Enrollment Integration Test (Fix Verification) ---');
    
    try {
        // 1. Login as Admin
        console.log('Logging in as admin...');
        const loginRes = await axios.post(`${BACKEND_URL}/api/auth/check`, {
            email: 'admin@college.com',
            password: 'admin'
        });
        
        const token = loginRes.data.token;
        console.log('Login successful.');

        // 2. Test Voice Enrollment
        console.log('Testing voice enrollment with 3 samples...');
        const formData = new FormData();
        
        // Add 3 samples
        for (let i = 1; i <= 3; i++) {
            const filePath = path.join(TEST_AUDIO_DIR, `user1_sample${i}.wav`);
            formData.append('files', fs.createReadStream(filePath));
        }
        
        const enrollRes = await axios.post(`${BACKEND_URL}/api/auth/voice/enroll`, formData, {
            headers: {
                ...formData.getHeaders(),
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('Enrollment Result:', enrollRes.data);
        if (enrollRes.data.success) {
            console.log('SUCCESS: Voice enrolled successfully without "Service Unavailable" error.');
        } else {
            console.log('FAILURE: Voice enrollment returned success: false.');
        }

    } catch (error) {
        console.error('Test failed with error:', error.response?.data || error.message);
        if (error.message.includes('Voice service unavailable')) {
            console.log('STILL BUGGED: Received "Voice service unavailable" error.');
        }
    }
}

runTest();
