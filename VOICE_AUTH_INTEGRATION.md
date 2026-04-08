# Voice Authentication Integration Guide

## Overview
This document explains how to use the newly integrated voice authentication system in your Nucleus Student Portal.

---

## 🏗️ Architecture

```
Frontend (React)
    ↓ HTTPS requests with JWT
Backend (Node.js + Express) on :5001
    ↓ HTTP proxy (axios)
Voice Auth Service (Python FastAPI) on :8000
```

- **Frontend**: Beautiful Gen-Z styled voice enrollment UI at `/voice-enroll`
- **Backend**: Routes that handle file uploads and proxy to Python service
- **Voice Service**: Processes audio, extracts MFCC features, verifies identity

---

## ✅ What Was Built

### 1. **Backend Enhancements**
- New `voiceAuthController.js` (handles enrollment, verification, voice-login)
- New `voiceAuthRoutes.js` with multer for file uploads
- Updated `User` model with voice fields:
  - `voice_enrolled` (boolean)
  - `voice_embeddings` (array of MFCC vectors)
  - `voice_threshold` (personalized threshold)
  - `voice_updated_at` (timestamp)

### 2. **Frontend Feature**
- **`/voice-enroll`** page with:
  - Real-time audio waveform visualization
  - Recording with animated microphone button
  - Progress tracking (3-5 samples required)
  - Adaptive threshold display
  - Success celebration with confetti effect
  - Fully responsive, accessible

### 3. **Integration Points**
- Sidebar now has "Voice ID" link
- Authorization headers automatically included
- User info pulled from localStorage

---

## 🚀 Quick Start

### Step 1: Start the Services

**Terminal 1: Python Voice Auth Service** (already running on :8000)
```bash
cd voice-auth-service
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2: Node.js Backend**
```bash
cd backend
npm start   # or npm run dev
```
Server runs on **http://localhost:5001**

**Terminal 3: Frontend**
```bash
cd frontend
npm install   # if not done
npm run dev   # or npm run build && npm run preview
```
Frontend runs on **http://localhost:5173** (Vite default)

### Step 2: Create a Test User

You need a user in the database and a JWT token.

**Option A: Using cURL**
```bash
# Register a new user
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Yuvraj",
    "email": "yuvraj@example.com",
    "password": "test123",
    "enrollment_number": "EN2024001",
    "branch": "Computer Science",
    "semester": 4
  }'

# Login to get token
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "yuvraj@example.com",
    "password": "test123"
  }'
```

Copy the `token` from the response.

**Option B: Use Postman/Insomnia** – same endpoints.

### Step 3: Store Token in Frontend

Open browser console on your frontend (http://localhost:5173) and run:

```javascript
localStorage.setItem('nucleusToken', 'YOUR_JWT_TOKEN_HERE');
localStorage.setItem('nucleusUser', JSON.stringify({
  _id: "USER_ID_FROM_DB",
  name: "Yuvraj",
  enrollment_number: "EN2024001"
}));
```

Replace `YOUR_JWT_TOKEN_HERE` with the actual token from the login response.
Replace `USER_ID_FROM_DB` with the `_id` from the response.

Alternatively, you can create a simple login UI that does this automatically.

### Step 4: Use Voice Enrollment

1. Navigate to **http://localhost:5173/voice-enroll**
2. You should see the "Voice ID Setup" page
3. Click **Start Setup**
4. Record at least 3 samples:
   - Tap the microphone button to start recording
   - Speak naturally (3-5 seconds)
   - The waveform visualizes your voice in real-time
   - Tap again to stop (or auto-stops after 5s)
5. After 3+ samples, "Continue" button appears
6. Click **Continue** → Processing…
7. See success screen with your adaptive threshold

---

## 🔐 Using Voice for Login

After enrollment, you can log in using voice only:

```bash
curl -X POST http://localhost:5001/api/auth/voice/login \
  -F "enrollment_number=EN2024001" \
  -F "file=@/path/to/voice_sample.wav"
```

The response will contain a JWT token just like password login.

**Frontend usage:**
- Create a "Login with Voice" button on the login page
- Record audio (or upload file) → POST to `/api/auth/voice/login`
- On success, store returned token and navigate to dashboard

---

## 🔧 API Reference

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth/voice/enroll` | POST | Required | Enroll voice samples (multipart/form-data) |
| `/api/auth/voice/verify` | POST | Required | Verify a voice sample against enrolled data |
| `/api/auth/voice/login` | POST | No | Login with voice using enrollment number |

**Request format for `/enroll`:**
- Form data:
  - `files`: multiple audio files (wav, mp3, flac, etc.)

**Request format for `/verify`:**
- Form data:
  - `file`: single audio file
  - (user ID from JWT token)

**Request format for `/login`:**
- Form data:
  - `enrollment_number`: string
  - `file`: audio file

**Response for `/enroll`:**
```json
{
  "success": true,
  "message": "Voice enrolled successfully with 5 samples.",
  "sample_count": 5,
  "adaptive_threshold": 0.92,
  "user": {
    "_id": "...",
    "name": "...",
    "voice_enrolled": true
  }
}
```

---

## 🧪 Testing the Integration

### Test 1: Verify Endpoint is Reachable
```bash
# Should return "Not authorized, no token"
curl -X POST http://localhost:5001/api/auth/voice/verify -H "Content-Type: application/json" -d '{}'
```

### Test 2: Enroll with Real Voice
After you have a token, use Postman to POST to `/api/auth/voice/enroll` with:
- Header: `Authorization: Bearer YOUR_TOKEN`
- Form: 3-5 audio files
- Expected: success with `sample_count` and `adaptive_threshold`

### Test 3: Verify Your Voice
```bash
curl -X POST http://localhost:5001/api/auth/voice/verify \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@sample.wav"
```

### Test 4: Voice Login
```bash
curl -X POST http://localhost:5001/api/auth/voice/login \
  -F "enrollment_number=EN2024001" \
  -F "file=@sample.wav"
```

---

## ⚙️ Configuration

### Environment Variables

**Backend (.env in `/backend`):**
```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/nucleus
JWT_SECRET=your_super_secret_key_here
VOICE_SERVICE_URL=http://localhost:8000
```

**Frontend (.env in `/frontend`):**
```env
VITE_API_URL=http://localhost:5001
```

---

## 🎨 Customization

### Changing Colors
The VoiceEnroll component uses these gradient colors:
- Primary: `from-violet-600 via-purple-600 to-indigo-600`
- Success: `from-green-400 to-emerald-500`
- You can edit the `className` values to match your brand.

### Animation Speed
Adjust `duration-500`, `animate-pulse`, etc. in the component.

### Minimum Samples
Change `if (samples.length >= 3)` to require more or fewer.

---

## 🐛 Troubleshooting

**"Microphone access denied"**
- Ensure you're on HTTPS or localhost
- Check browser permissions
- Try a different browser

**"Voice service unavailable"**
- Confirm Python service is running on port 8000
- Check `VOICE_SERVICE_URL` in backend .env
- Test: `curl http://localhost:8000/docs` should show FastAPI docs

**"Not authorized, no token"**
- Ensure you've set `nucleusToken` in localStorage
- Verify token is still valid (not expired)
- Check backend logs for exact error

**"User not found" or "User has not enrolled voice"**
- Make sure you're enrolled (check DB: `db.users.find({_id: ...})`)
- Ensure you're using the same user ID in token

**CORS errors**
- Backend already has CORS enabled for all origins
- If issues, check that requests are to `localhost:5001` not another port

---

## 📊 Database Schema Update

If you already have users in MongoDB, you may need to add the new voice fields:

```javascript
// In MongoDB shell or Compass
db.users.updateMany(
  {},
  {
    $set: {
      voice_enrolled: false,
      voice_embeddings: [],
      voice_threshold: 0.85,
      voice_updated_at: null
    }
  }
)
```

---

## 🎯 Next Steps

1. **Integrate Voice Login into Login Page**: Add a "Login with Voice" button that redirects to a voice capture page.
2. **Add 2FA Flow**: Use voice as a second factor after password.
3. **User Profile Page**: Show voice enrollment status and allow re-enrollment.
4. **Admin Dashboard**: View which users have voice enabled.
5. **Enhanced Security**: Add anti-spoofing detection, liveness checks.

---

## 📚 Resources

- **Voice Service Docs**: See `voice-auth-service/README.md` (create if needed)
- **FastAPI Endpoints**: http://localhost:8000/docs (when service running)
- **Backend API**: http://localhost:5001 (root message)

---

Enjoy your secure, password-free voice authentication system! 🎤✨