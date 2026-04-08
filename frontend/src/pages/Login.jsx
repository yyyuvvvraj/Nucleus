import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

/* ─────────────────────────────────────────
   Waveform visualizer component
───────────────────────────────────────── */
function Waveform({ isRecording, analyserRef }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    const draw = () => {
      animRef.current = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, W, H);

      if (isRecording && analyserRef.current) {
        const bufLen = analyserRef.current.frequencyBinCount;
        const data = new Uint8Array(bufLen);
        analyserRef.current.getByteTimeDomainData(data);

        ctx.lineWidth = 2;
        ctx.strokeStyle = '#a78bfa';
        ctx.shadowColor = '#7c3aed';
        ctx.shadowBlur = 8;
        ctx.beginPath();

        const sliceW = W / bufLen;
        let x = 0;
        for (let i = 0; i < bufLen; i++) {
          const v = data[i] / 128.0;
          const y = (v * H) / 2;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
          x += sliceW;
        }
        ctx.lineTo(W, H / 2);
        ctx.stroke();
      } else {
        // Idle flat line with subtle pulse
        const t = Date.now() / 800;
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(167, 139, 250, 0.35)';
        ctx.beginPath();
        for (let x = 0; x < W; x++) {
          const y = H / 2 + Math.sin(x / 35 + t) * 3;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [isRecording, analyserRef]);

  return (
    <canvas
      ref={canvasRef}
      width={340}
      height={60}
      style={{ width: '100%', borderRadius: '12px', background: 'rgba(139,92,246,0.06)' }}
    />
  );
}

/* ─────────────────────────────────────────
   Voice Recorder Widget
   Props:
     onRecordingComplete(blob) — called when user stops recording
     label — instruction text
     sampleIndex / totalSamples — for progress display
     disabled
───────────────────────────────────────── */

/** Encode a Float32Array of PCM samples into a 16-bit WAV Blob */
function encodeWAV(samples, sampleRate) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataLength = samples.length * 2; // 2 bytes per sample (int16)
  const buffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(buffer);

  const writeStr = (offset, str) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);           // PCM chunk size
  view.setUint16(20, 1, true);            // PCM format
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeStr(36, 'data');
  view.setUint32(40, dataLength, true);

  // Convert Float32 [-1, 1] → Int16
  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

/** Decode any browser-recorded audio (webm/ogg/mp4) to 16-bit WAV at 16 kHz */
async function decodeToWav(blob) {
  const TARGET_SR = 16000;
  const arrayBuffer = await blob.arrayBuffer();
  // Use a temporary AudioContext just for decoding
  const decodeCtx = new AudioContext();
  const decoded   = await decodeCtx.decodeAudioData(arrayBuffer);
  decodeCtx.close();

  // Resample to TARGET_SR using OfflineAudioContext
  const offlineCtx = new OfflineAudioContext(
    1,                                          // mono
    Math.ceil(decoded.duration * TARGET_SR),    // output frames
    TARGET_SR
  );
  const src = offlineCtx.createBufferSource();
  src.buffer = decoded;
  src.connect(offlineCtx.destination);
  src.start(0);
  const rendered = await offlineCtx.startRendering();
  const pcm      = rendered.getChannelData(0); // Float32Array mono
  return encodeWAV(pcm, TARGET_SR);            // returns Blob('audio/wav')
}

function VoiceRecorder({ onRecordingComplete, label, sampleIndex, totalSamples, disabled }) {
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | recording | converting | done
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const analyserRef = useRef(null);
  const audioCtxRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Set up analyser for waveform
      audioCtxRef.current = new AudioContext();
      const source = audioCtxRef.current.createMediaStreamSource(stream);
      const analyser = audioCtxRef.current.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      analyserRef.current = analyser;

      chunksRef.current = [];

      // Pick the first mimeType the browser actually supports
      const MIME_TYPES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/ogg', 'audio/mp4'];
      const mimeType = MIME_TYPES.find(t => MediaRecorder.isTypeSupported(t)) || '';

      const mr = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      mr.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        // setTimeout(0) lets the final ondataavailable event flush first
        setTimeout(async () => {
          try {
            setStatus('converting');
            const rawBlob = new Blob(chunksRef.current, { type: mimeType || 'audio/webm' });
            // Decode compressed audio → WAV PCM (what Python soundfile/librosa expect)
            const wavBlob = await decodeToWav(rawBlob);
            const wavFile = new File([wavBlob], `voice_${Date.now()}.wav`, { type: 'audio/wav' });
            onRecordingComplete(wavFile);
          } catch (convErr) {
            console.error('WAV conversion failed:', convErr);
            // Fallback: send raw blob as-is
            const rawFile = new File(chunksRef.current, `voice_${Date.now()}.webm`, { type: mimeType || 'audio/webm' });
            onRecordingComplete(rawFile);
          } finally {
            streamRef.current?.getTracks().forEach(t => t.stop());
            audioCtxRef.current?.close();
            setStatus('done');
            setIsRecording(false);
          }
        }, 0);
      };
      mr.start(100); // 100ms timeslice ensures chunks arrive before onstop
      mediaRecorderRef.current = mr;
      setIsRecording(true);
      setStatus('recording');
    } catch (err) {
      setStatus('idle');
      alert('Microphone access denied. Please allow microphone permission and try again.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const handleClick = () => {
    if (disabled) return;
    if (isRecording) stopRecording();
    else startRecording();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
      {totalSamples > 1 && (
        <div style={{ fontSize: '13px', color: 'rgba(167,139,250,0.8)', fontWeight: 500 }}>
          Sample {sampleIndex} of {totalSamples}
        </div>
      )}

      <Waveform isRecording={isRecording} analyserRef={analyserRef} />

      {/* Mic button */}
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || status === 'done' || status === 'converting'}
        style={{
          position: 'relative',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          border: 'none',
          cursor: disabled || status === 'done' || status === 'converting' ? 'default' : 'pointer',
          background: isRecording
            ? 'linear-gradient(135deg, #ef4444, #dc2626)'
            : status === 'done'
              ? 'linear-gradient(135deg, #10b981, #059669)'
              : status === 'converting'
                ? 'linear-gradient(135deg, #d97706, #b45309)'
                : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
          boxShadow: isRecording
            ? '0 0 0 8px rgba(239,68,68,0.2), 0 0 30px rgba(239,68,68,0.4)'
            : '0 0 20px rgba(124,58,237,0.4)',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Pulse rings when recording */}
        {isRecording && (
          <>
            <span style={{ position: 'absolute', inset: '-12px', borderRadius: '50%', border: '2px solid rgba(239,68,68,0.4)', animation: 'pulse-ring 1.2s ease-out infinite' }} />
            <span style={{ position: 'absolute', inset: '-24px', borderRadius: '50%', border: '2px solid rgba(239,68,68,0.2)', animation: 'pulse-ring 1.2s ease-out infinite 0.4s' }} />
          </>
        )}
        {status === 'done' ? (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : status === 'converting' ? (
          <span style={{ width: '28px', height: '28px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
        ) : (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="white" fill="none" strokeWidth="2" strokeLinecap="round" />
            <line x1="12" y1="19" x2="12" y2="23" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <line x1="8" y1="23" x2="16" y2="23" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )}
      </button>

      <p style={{ fontSize: '13px', color: 'rgba(203,213,225,0.7)', textAlign: 'center', margin: 0 }}>
        {status === 'done'
          ? '✓ Sample recorded'
          : status === 'converting'
            ? '⟳ Converting to WAV…'
            : isRecording
              ? 'Recording… tap to stop'
              : label || 'Tap mic to start recording'}
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────
   Step Progress Bar
───────────────────────────────────────── */
function StepBar({ steps, current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px' }}>
      {steps.map((label, i) => (
        <React.Fragment key={i}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flex: 1 }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: i < current
                ? 'linear-gradient(135deg,#10b981,#059669)'
                : i === current
                  ? 'linear-gradient(135deg,#7c3aed,#4f46e5)'
                  : 'rgba(255,255,255,0.08)',
              border: i === current ? '2px solid #a78bfa' : '2px solid transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: 700, color: 'white',
              transition: 'all 0.4s ease',
              boxShadow: i === current ? '0 0 12px rgba(167,139,250,0.5)' : 'none',
            }}>
              {i < current ? '✓' : i + 1}
            </div>
            <span style={{ fontSize: '10px', color: i === current ? '#a78bfa' : 'rgba(203,213,225,0.4)', whiteSpace: 'nowrap' }}>
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div style={{
              flex: 2, height: '2px', borderRadius: '2px', marginBottom: '16px',
              background: i < current
                ? 'linear-gradient(90deg,#10b981,#059669)'
                : 'rgba(255,255,255,0.08)',
              transition: 'background 0.4s ease',
            }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────
   Input field helper
───────────────────────────────────────── */
function Field({ label, type = 'text', value, onChange, placeholder, required, min, max }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'rgba(203,213,225,0.8)', marginBottom: '6px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
        style={{
          width: '100%', padding: '10px 14px', borderRadius: '10px',
          background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(167,139,250,0.25)',
          color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
          transition: 'border-color 0.2s ease',
        }}
        onFocus={e => e.target.style.borderColor = 'rgba(167,139,250,0.6)'}
        onBlur={e => e.target.style.borderColor = 'rgba(167,139,250,0.25)'}
      />
    </div>
  );
}

/* ─────────────────────────────────────────
   Error / Info banner
───────────────────────────────────────── */
function Banner({ type, message }) {
  if (!message) return null;
  const styles = {
    error: { background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', color: '#fca5a5' },
    success: { background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.35)', color: '#6ee7b7' },
    info: { background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.35)', color: '#a5b4fc' },
  };
  return (
    <div style={{ ...styles[type], borderRadius: '10px', padding: '10px 14px', fontSize: '13px', lineHeight: 1.5 }}>
      {message}
    </div>
  );
}

/* ─────────────────────────────────────────
   Verification Panel Component
───────────────────────────────────────── */
function VerificationPanel({ result }) {
  if (!result) return null;

  const { success, similarity_score, threshold_used, individual_scores } = result;
  // Ensure we have numbers to prevent NaN errors
  const score = (typeof similarity_score === 'number' ? similarity_score : 0) * 100;
  const threshold = (typeof threshold_used === 'number' ? threshold_used : 0) * 100;

  return (
    <div style={{
      marginTop: '16px',
      padding: '20px',
      borderRadius: '16px',
      background: 'rgba(0,0,0,0.2)',
      border: `1px solid ${success ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
      textAlign: 'center'
    }}>
      <h3 style={{ margin: '0 0 16px', fontSize: '15px', color: 'white' }}>
        Voice Comparison Analysis
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Main Gauge */}
        <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto' }}>
          <svg width="100" height="100" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
            <circle cx="50" cy="50" r="40" fill="none" 
              stroke={success ? "#10b981" : "#ef4444"} 
              strokeWidth="8" 
              strokeDasharray={`${(Math.max(0, score) / 100) * 251.2} 251.2`} 
              strokeDashoffset="0"
              transform="rotate(-90 50 50)"
              style={{ transition: 'stroke-dasharray 1s ease-out' }}
            />
          </svg>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'white' }}>{score.toFixed(0)}%</span>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>Match</div>
          </div>
        </div>
        
        {/* Threshold info */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '13px' }}>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.5)' }}>Threshold</div>
            <div style={{ color: 'white', fontWeight: 'bold' }}>{threshold.toFixed(1)}%</div>
          </div>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.5)' }}>Status</div>
            <div style={{ color: success ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>
              {success ? 'ACCEPTED' : 'REJECTED'}
            </div>
          </div>
        </div>

        {/* Per-sample breakdown */}
        {individual_scores && individual_scores.length > 0 && (
          <div style={{ marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px' }}>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>
              vs Enrolled Samples:
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {individual_scores.map((s, idx) => (
                <div key={idx} style={{ 
                  background: 'rgba(255,255,255,0.05)', 
                  padding: '4px 8px', borderRadius: '4px',
                  fontSize: '12px', color: 'white'
                }}>
                  #{idx + 1}: {(s * 100).toFixed(1)}%
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Main Login/Register page
───────────────────────────────────────── */
export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' | 'register'

  // --- SHARED STATE ---
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  // --- LOGIN STATE ---
  const [loginStep, setLoginStep] = useState(1); // 1: credentials, 2: voice
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginTempToken, setLoginTempToken] = useState('');
  const [loginVoiceBlob, setLoginVoiceBlob] = useState(null);
  const [authResult, setAuthResult] = useState(null);

  // --- REGISTER STATE ---
  const [regStep, setRegStep] = useState(1); // 1: credentials, 2: voice, 3: processing
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regEnrollment, setRegEnrollment] = useState('');
  const [regBranch, setRegBranch] = useState('');
  const [regSemester, setRegSemester] = useState('');
  const [regVoiceSamples, setRegVoiceSamples] = useState([]); // array of Blobs
  const [regToken, setRegToken] = useState(''); // JWT from register, used to call enroll
  const [regUserId, setRegUserId] = useState('');
  const [currentSample, setCurrentSample] = useState(1);
  const REQUIRED_SAMPLES = 3;

  const switchMode = (m) => {
    setMode(m);
    setError('');
    setInfo('');
    setLoginStep(1);
    setRegStep(1);
    setLoginVoiceBlob(null);
    setRegVoiceSamples([]);
    setCurrentSample(1);
    setAuthResult(null);
  };

  /* ── LOGIN: Step 1 — validate credentials ── */
  const handleLoginCredentials = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid credentials');
      setLoginTempToken(data.tempToken);
      setLoginStep(2);
      setInfo('Credentials verified! Now speak into your microphone to authenticate your voice.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ── LOGIN: Step 2 — verify voice ── */
  const handleLoginVoice = async () => {
    if (!loginVoiceBlob) { setError('Please record your voice first.'); return; }
    setError('');
    setLoading(true);
    setAuthResult(null);
    try {
      const formData = new FormData();
      // loginVoiceBlob is already a File (set in VoiceRecorder) — just append it
      formData.append('file', loginVoiceBlob);

      const res = await fetch(`${API_BASE_URL}/api/auth/voice/login-verify`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${loginTempToken}` },
        body: formData,
      });
      const data = await res.json();
      
      // We always have a result we can show, even if res is not ok (e.g. 401 unauthorized with similarity scores)
      if (data.similarity_score !== undefined) {
        setAuthResult(data);
      }

      if (!res.ok) throw new Error(data.message || 'Voice authentication failed');

      // Store full session token
      localStorage.setItem('nucleusToken', data.token);
      localStorage.setItem('nucleusUser', JSON.stringify({
        _id: data._id,
        name: data.name,
        email: data.email,
        enrollment_number: data.enrollment_number,
        branch: data.branch,
        semester: data.semester,
      }));
      
      // Delay navigation so user can see their similarity score
      setInfo('Voice verified! Redirecting to dashboard...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ── REGISTER: Step 1 — create account ── */
  const handleRegisterCredentials = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: regPassword,
          enrollment_number: regEnrollment,
          branch: regBranch,
          semester: parseInt(regSemester),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      setRegToken(data.token);
      setRegUserId(data._id);
      setRegStep(2);
      setInfo(`Account created! Now record ${REQUIRED_SAMPLES} voice samples so we can recognize you on future logins.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ── REGISTER: Step 2 — collect each voice sample ── */
  const handleRegSampleRecorded = (blob) => {
    setRegVoiceSamples(prev => [...prev, blob]);
  };

  const handleNextSample = () => {
    if (currentSample < REQUIRED_SAMPLES) {
      setCurrentSample(s => s + 1);
    }
  };

  /* ── REGISTER: Step 3 — enroll voice ── */
  const handleEnrollVoice = async () => {
    setError('');
    setLoading(true);
    setRegStep(3);
    try {
      const formData = new FormData();
      // Each element of regVoiceSamples is already a File from VoiceRecorder
      regVoiceSamples.forEach((file) => {
        formData.append('files', file);
      });

      const res = await fetch(`${API_BASE_URL}/api/auth/voice/enroll`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${regToken}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Voice enrollment failed');

      // Store session
      localStorage.setItem('nucleusToken', regToken);
      localStorage.setItem('nucleusUser', JSON.stringify({
        _id: regUserId,
        name: regName,
        email: regEmail,
        enrollment_number: regEnrollment,
        branch: regBranch,
        semester: regSemester,
      }));
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
      setRegStep(2);
    } finally {
      setLoading(false);
    }
  };

  /* ══════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════ */
  const isRegVoiceSampleReady = regVoiceSamples.length === currentSample;
  const allSamplesCollected = regVoiceSamples.length >= REQUIRED_SAMPLES;

  return (
    <div className="login-root">
      {/* Aurora background layers */}
      <div className="aurora-layer aurora-1" />
      <div className="aurora-layer aurora-2" />
      <div className="aurora-layer aurora-3" />
      <div className="aurora-noise" />

      <div className="login-card">
        {/* Logo mark */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '16px', margin: '0 auto 12px',
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(124,58,237,0.45)',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fillOpacity="0.5" />
              <path d="M12 6v6l4 2" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            </svg>
          </div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>
            Nucleus Portal
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'rgba(203,213,225,0.55)' }}>
            Secured with Voice Biometrics
          </p>
        </div>

        {/* Mode switcher */}
        {(mode === 'login' ? loginStep === 1 : regStep === 1) && (
          <div style={{
            display: 'flex', background: 'rgba(255,255,255,0.06)', borderRadius: '12px',
            padding: '4px', marginBottom: '24px', gap: '4px',
          }}>
            {['login', 'register'].map(m => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                style={{
                  flex: 1, padding: '8px', borderRadius: '9px', border: 'none', cursor: 'pointer',
                  fontWeight: 600, fontSize: '14px', transition: 'all 0.25s ease',
                  background: mode === m ? 'linear-gradient(135deg,#7c3aed,#4f46e5)' : 'transparent',
                  color: mode === m ? 'white' : 'rgba(203,213,225,0.5)',
                  boxShadow: mode === m ? '0 4px 12px rgba(124,58,237,0.35)' : 'none',
                }}
              >
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>
        )}

        {/* ─────── LOGIN FLOW ─────── */}
        {mode === 'login' && (
          <>
            <StepBar steps={['Credentials', 'Voice ID']} current={loginStep - 1} />

            {loginStep === 1 && (
              <form onSubmit={handleLoginCredentials} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Field label="Email" type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="you@university.edu" required />
                <Field label="Password" type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="••••••••" required />
                <Banner type="error" message={error} />
                <button type="submit" disabled={loading} className="primary-btn">
                  {loading ? <Spinner /> : 'Verify Credentials →'}
                </button>
              </form>
            )}

            {loginStep === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <Banner type="info" message={info} />
                <VoiceRecorder
                  label="Speak your passphrase or say anything — your voice is the key"
                  onRecordingComplete={(blob) => { setLoginVoiceBlob(blob); setInfo(''); setAuthResult(null); setError(''); }}
                />

                <VerificationPanel result={authResult} />

                {error && !authResult && <Banner type="error" message={error} />}
                
                <button
                  type="button"
                  onClick={handleLoginVoice}
                  disabled={!loginVoiceBlob || loading}
                  className="primary-btn"
                >
                  {loading ? <Spinner /> : '🔐 Authenticate with Voice'}
                </button>
                <button type="button" onClick={() => { setLoginStep(1); setError(''); setInfo(''); setLoginVoiceBlob(null); setAuthResult(null); }} className="ghost-btn">
                  ← Back to credentials
                </button>
              </div>
            )}
          </>
        )}

        {/* ─────── REGISTER FLOW ─────── */}
        {mode === 'register' && (
          <>
            <StepBar steps={['Account Info', 'Voice Samples', 'Complete']} current={regStep - 1} />

            {regStep === 1 && (
              <form onSubmit={handleRegisterCredentials} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <Field label="Full Name" value={regName} onChange={e => setRegName(e.target.value)} placeholder="Yuvraj Singh" required />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <Field label="Enrollment No." value={regEnrollment} onChange={e => setRegEnrollment(e.target.value)} placeholder="EN2024001" required />
                  <Field label="Semester" type="number" value={regSemester} onChange={e => setRegSemester(e.target.value)} placeholder="4" min="1" max="8" required />
                </div>
                <Field label="Branch" value={regBranch} onChange={e => setRegBranch(e.target.value)} placeholder="Computer Science" required />
                <Field label="Email" type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="you@university.edu" required />
                <Field label="Password" type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)} placeholder="Min 6 characters" required />
                <Banner type="error" message={error} />
                <button type="submit" disabled={loading} className="primary-btn">
                  {loading ? <Spinner /> : 'Create Account →'}
                </button>
              </form>
            )}

            {regStep === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <Banner type="info" message={info} />

                {/* Sample dots progress */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                  {Array.from({ length: REQUIRED_SAMPLES }, (_, i) => (
                    <div key={i} style={{
                      width: '10px', height: '10px', borderRadius: '50%',
                      background: i < regVoiceSamples.length
                        ? '#10b981'
                        : i === regVoiceSamples.length
                          ? '#7c3aed'
                          : 'rgba(255,255,255,0.12)',
                      transition: 'background 0.3s ease',
                      boxShadow: i === regVoiceSamples.length ? '0 0 8px #7c3aed' : 'none',
                    }} />
                  ))}
                </div>

                <VoiceRecorder
                  key={currentSample}  // remount per sample
                  sampleIndex={currentSample}
                  totalSamples={REQUIRED_SAMPLES}
                  label="Speak naturally — say your name, a phrase, or count to five"
                  onRecordingComplete={handleRegSampleRecorded}
                  disabled={regVoiceSamples.length >= currentSample}
                />

                <Banner type="error" message={error} />

                {/* "Next Sample" vs "Enroll Voice" button */}
                {isRegVoiceSampleReady && !allSamplesCollected && (
                  <button type="button" onClick={handleNextSample} className="primary-btn">
                    Next Sample ({currentSample + 1}/{REQUIRED_SAMPLES}) →
                  </button>
                )}

                {allSamplesCollected && (
                  <button type="button" onClick={handleEnrollVoice} disabled={loading} className="primary-btn enroll-btn">
                    {loading ? <Spinner /> : '🎤 Enroll Voice & Enter Portal'}
                  </button>
                )}

                <button type="button" onClick={() => { setRegStep(1); setError(''); setInfo(''); setRegVoiceSamples([]); setCurrentSample(1); }} className="ghost-btn">
                  ← Back
                </button>
              </div>
            )}

            {regStep === 3 && (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div className="processing-spinner" />
                <p style={{ color: 'rgba(203,213,225,0.7)', fontWeight: 500, marginTop: '16px' }}>
                  Enrolling your voiceprint…
                </p>
                <p style={{ color: 'rgba(203,213,225,0.4)', fontSize: '12px', marginTop: '4px' }}>
                  Extracting MFCC features and building your biometric profile
                </p>
                <Banner type="error" message={error} />
              </div>
            )}
          </>
        )}

        <p style={{ textAlign: 'center', fontSize: '11px', color: 'rgba(203,213,225,0.3)', marginTop: '24px', marginBottom: 0 }}>
          Your voice data is stored securely and never shared.
        </p>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <span style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
  );
}