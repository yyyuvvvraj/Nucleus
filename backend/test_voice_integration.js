#!/usr/bin/env node

/**
 * Complete Voice Authentication Integration Test
 * Tests: Register → Login → Enroll Voice → Verify Voice
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BACKEND_URL = 'http://localhost:5001';
const VOICE_SERVICE_URL = 'http://localhost:8000';
const PROJECT_ROOT = path.join(__dirname, '..'); // Go up one level from backend/

// Test user data
const testUser = {
  name: 'Yuvraj Test',
  email: 'yuvraj.test@example.com',
  password: 'Test@123456',
  enrollment_number: 'EN20248888',
  branch: 'Computer Science',
  semester: 4
};

// Helper to log with style
const log = {
  info: (msg) => console.log(`\x1b[36mℹ\x1b[0m ${msg}`),
  success: (msg) => console.log(`\x1b[32m✓\x1b[0m ${msg}`),
  error: (msg) => console.log(`\x1b[31m✗\x1b[0m ${msg}`),
  step: (msg) => console.log(`\n\x1b[33m▶\x1b[0m ${msg}`)
};

async function testRegistration() {
  log.step('Testing User Registration');

  try {
    const response = await axios.post(`${BACKEND_URL}/api/auth/register`, testUser);
    log.success(`User registered: ${response.data.name} (ID: ${response.data._id})`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 400 && error.response.data.message === 'User already exists') {
      log.info('User already exists, proceeding to login...');
      return null;
    }
    throw error;
  }
}

async function testLogin() {
  log.step('Testing User Login');

  try {
    const response = await axios.post(`${BACKEND_URL}/api/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    log.success(`Login successful! Token: ${response.data.token.substring(0, 20)}...`);
    return response.data;
  } catch (error) {
    log.error(`Login failed: ${error.response?.data?.message || error.message}`);
    throw error;
  }
}

async function testVoiceEnroll(token, userId) {
  log.step('Testing Voice Enrollment');

  // Find Yuvraj*.wav files
  const voiceDir = path.join(PROJECT_ROOT, 'voice-auth-service');
  const files = fs.readdirSync(voiceDir).filter(f => f.startsWith('Yuvraj') && f.endsWith('.wav'));

  if (files.length < 3) {
    log.error(`Need at least 3 voice samples. Found ${files.length}`);
    return null;
  }

  log.info(`Found ${files.length} voice samples: ${files.slice(0, 3).join(', ')}...`);

  const formData = new FormData();
  files.forEach(file => {
    const filePath = path.join(voiceDir, file);
    const fileBuffer = fs.readFileSync(filePath);
    formData.append('files', fileBuffer, {
      filename: file,
      contentType: 'audio/wav'
    });
  });

  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/auth/voice/enroll`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${token}`
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
    );

    const data = response.data;
    log.success(`Voice enrolled successfully!`);
    console.log('  Details:', {
      sample_count: data.sample_count,
      adaptive_threshold: data.adaptive_threshold,
      voice_enrolled: data.user.voice_enrolled
    });

    return data;
  } catch (error) {
    log.error(`Voice enrollment failed: ${error.response?.data?.message || error.message}`);
    if (error.response?.data) console.error('Full error:', JSON.stringify(error.response.data, null, 2));
    throw error;
  }
}

async function testVoiceVerify(token, userId) {
  log.step('Testing Voice Verification');

  const voiceDir = path.join(PROJECT_ROOT, 'voice-auth-service');
  const testFile = path.join(voiceDir, 'Yuvraj1.wav');

  if (!fs.existsSync(testFile)) {
    log.error(`Test file not found: ${testFile}`);
    return null;
  }

  const formData = new FormData();
  const fileBuffer = fs.readFileSync(testFile);
  formData.append('file', fileBuffer, {
    filename: 'test.wav',
    contentType: 'audio/wav'
  });

  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/auth/voice/verify`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${token}`
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
    );

    const data = response.data;
    if (data.authenticated) {
      log.success(`Voice verified! Similarity: ${data.similarity_score.toFixed(4)} (threshold: ${data.threshold_used})`);
    } else {
      log.error(`Voice verification failed: similarity ${data.similarity_score} < threshold ${data.threshold_used}`);
    }
    return data;
  } catch (error) {
    log.error(`Voice verify failed: ${error.response?.data?.message || error.message}`);
    throw error;
  }
}

async function testVoiceLogin() {
  log.step('Testing Voice-Only Login');

  const voiceDir = path.join(PROJECT_ROOT, 'voice-auth-service');
  const testFile = path.join(voiceDir, 'Yuvraj1.wav');

  if (!fs.existsSync(testFile)) {
    log.error(`Test file not found: ${testFile}`);
    return null;
  }

  const formData = new FormData();
  formData.append('enrollment_number', testUser.enrollment_number);
  const fileBuffer = fs.readFileSync(testFile);
  formData.append('file', fileBuffer, {
    filename: 'test.wav',
    contentType: 'audio/wav'
  });

  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/auth/voice/login`,
      formData,
      {
        headers: {
          ...formData.getHeaders()
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
    );

    const data = response.data;
    log.success(`Voice login successful!`);
    console.log('  User:', data.user.name);
    console.log('  Token:', data.token.substring(0, 20) + '...');
    console.log('  Similarity:', data.similarity_score.toFixed(4));
    return data;
  } catch (error) {
    log.error(`Voice login failed: ${error.response?.data?.message || error.message}`);
    throw error;
  }
}

async function runFullTest() {
  console.log('\n\x1b[1m=== Voice Authentication Integration Test ===\x1b[0m\n');

  try {
    // Test 1: Register
    const regResult = await testRegistration();

    // Test 2: Login
    const loginResult = await testLogin();
    const token = loginResult.token;
    const userId = loginResult._id; // Login returns _id directly, not wrapped in user

    console.log(`Using user ID: ${userId}`);

    // Test 3: Voice Enrollment
    const enrollResult = await testVoiceEnroll(token, userId);

    // Test 4: Voice Verify (authenticated)
    await testVoiceVerify(token, userId);

    // Test 5: Voice Login (unauthenticated endpoint)
    await testVoiceLogin();

    console.log('\n\x1b[32m=== All Tests Passed! ✓ ===\x1b[0m\n');

  } catch (error) {
    console.error('\n\x1b[31m=== Test Failed ===\x1b[0m');
    console.error(`Error: ${error.message}`);
    if (error.response) {
      console.error('Response:', error.response.status, error.response.data);
    }
    process.exit(1);
  }
}

// Check prerequisites
console.log('\x1b[34mPrerequisites Check:\x1b[0m');
console.log(`  Backend: ${BACKEND_URL}`);
console.log(`  Voice Service: ${VOICE_SERVICE_URL}`);
console.log(`  Voice Samples: voice-auth-service/Yuvraj*.wav\n`);

runFullTest().catch(console.error);