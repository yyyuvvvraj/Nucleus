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
        ctx.strokeStyle = '#ffffff';
        ctx.shadowColor = '#ffffff';
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
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
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
      style={{ width: '100%', borderRadius: '12px', background: 'rgba(255,255,255,0.06)' }}
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

/* ─────────────────────────────────────────
   Camera Capture Widget
───────────────────────────────────────── */
function CameraCapture({ onCaptureComplete, disabled }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [hasCaptured, setHasCaptured] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState('');

  const startCamera = async () => {
    // Stop any existing stream first
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError('Camera access denied or unavailable.');
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  const takePhoto = () => {
    if (!videoRef.current || disabled) return;
    const video = videoRef.current;
    
    // Ensure video has actual dimensions before drawing
    if (video.videoWidth === 0 || video.videoHeight === 0) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    
    // Draw flipped to match the mirrored video preview
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `face_${Date.now()}.png`, { type: 'image/png' });
      setPhoto(URL.createObjectURL(blob));
      setHasCaptured(true);
      // Stop stream after capture to save resources
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
      onCaptureComplete(file);
    }, 'image/png');
  };

  const retakePhoto = () => {
    setHasCaptured(false);
    setPhoto(null);
    setError('');
    onCaptureComplete(null);
    // Restart camera stream so the live feed comes back
    startCamera();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      {error && <Banner type="error" message={error} />}
      <div style={{ 
        position: 'relative', 
        width: '240px', 
        height: '240px', 
        borderRadius: '50%', 
        overflow: 'hidden',
        border: '4px solid rgba(255,255,255,0.2)',
        background: 'rgba(0,0,0,0.2)',
        boxShadow: hasCaptured ? '0 0 20px rgba(255,255,255,0.4)' : '0 0 20px rgba(255,255,255,0.1)'
      }}>
        {!hasCaptured ? (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} 
          />
        ) : (
          <img src={photo} alt="Captured Face" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
      </div>

      {!hasCaptured ? (
        <button
          type="button"
          onClick={takePhoto}
          disabled={disabled || !!error}
          style={{
            marginTop: '8px',
            padding: '10px 24px',
            borderRadius: '24px',
            border: 'none',
            background: '#ffffff',
            color: '#000000',
            fontWeight: 600,
            cursor: disabled || !!error ? 'not-allowed' : 'pointer',
            opacity: disabled || !!error ? 0.5 : 1
          }}
        >
          📸 Capture Photo
        </button>
      ) : (
        <button
          type="button"
          onClick={retakePhoto}
          disabled={disabled}
          className="ghost-btn"
        >
          Retake Photo
        </button>
      )}
    </div>
  );
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
                ? '#e4e4e7'
                : '#ffffff',
          boxShadow: isRecording
            ? '0 0 0 8px rgba(239,68,68,0.2), 0 0 30px rgba(239,68,68,0.4)'
            : 'auto',
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
          <span style={{ width: '28px', height: '28px', border: '3px solid rgba(0,0,0,0.3)', borderTopColor: 'black', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
        ) : (
          <svg width="32" height="32" viewBox="0 0 24 24" fill={isRecording ? "white" : "black"}>
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke={isRecording ? "white" : "black"} fill="none" strokeWidth="2" strokeLinecap="round" />
            <line x1="12" y1="19" x2="12" y2="23" stroke={isRecording ? "white" : "black"} strokeWidth="2" strokeLinecap="round" />
            <line x1="8" y1="23" x2="16" y2="23" stroke={isRecording ? "white" : "black"} strokeWidth="2" strokeLinecap="round" />
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
                  ? '#ffffff'
                  : 'rgba(255,255,255,0.08)',
              border: i === current ? '2px solid #ffffff' : '2px solid transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: 700, color: i === current ? 'black' : 'white',
              transition: 'all 0.4s ease',
              boxShadow: i === current ? '0 0 12px rgba(255,255,255,0.3)' : 'none',
            }}>
              {i < current ? '✓' : i + 1}
            </div>
            <span style={{ fontSize: '10px', color: i === current ? 'white' : 'rgba(203,213,225,0.4)', whiteSpace: 'nowrap' }}>
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
          background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
          color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
          transition: 'border-color 0.2s ease',
        }}
        onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.5)'}
        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
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
        Biometric Match Analysis
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

  // --- SHARED STATE ---
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  // --- LOGIN STATE ---
  const [loginStep, setLoginStep] = useState(1); // 1: credentials, 2: face, 3: voice, 4: TOTP
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginTempToken, setLoginTempToken] = useState('');
  const [loginFaceBlob, setLoginFaceBlob] = useState(null);
  const [faceAuthResult, setFaceAuthResult] = useState(null);
  const [loginVoiceBlob, setLoginVoiceBlob] = useState(null);
  const [authResult, setAuthResult] = useState(null);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [totpToken, setTotpToken] = useState('');
  const [mfaQrCode, setMfaQrCode] = useState('');
  const [mfaSecret, setMfaSecret] = useState('');
  const [mfaTriggeredByFace, setMfaTriggeredByFace] = useState(false);
  const [activeChallenges, setActiveChallenges] = useState({ face: '', voice: '' });

  // --- SETUP STATE (isFirstLogin === true) ---
  const [isSetup, setIsSetup] = useState(false);
  const [setupStep, setSetupStep] = useState(1); // 1: password, 2: face, 3: voice
  const [setupToken, setSetupToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [setupFaceBlobs, setSetupFaceBlobs] = useState([]);
  const [currentFaceAngle, setCurrentFaceAngle] = useState(0);
  const FACE_ANGLES = ['Center', 'Left', 'Right'];
  const [setupVoiceSamples, setSetupVoiceSamples] = useState([]);
  const [currentSample, setCurrentSample] = useState(1);
  const REQUIRED_SAMPLES = 3;

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
      
      if (data.bypass) {
        if (!data.twoFactorEnabled && data.role === 'student') {
          setLoginTempToken(data.token);
          setLoginStep(5);
          setInfo('Security Bypass used. However, MFA Setup is still required for your account.');
          handleInitiateMFASetup(data.token);
        } else {
          localStorage.setItem('nucleusToken', data.token);
          localStorage.setItem('nucleusUser', JSON.stringify(data));
          navigate('/app');
        }
        return;
      }

      if (data.isFirstLogin) {
        setSetupToken(data.setupToken);
        setIsSetup(true);
        setSetupStep(1);
        setInfo('Welcome! As part of your first login, please establish a secure password.');
      } else {
        setLoginTempToken(data.tempToken);
        setTwoFactorEnabled(data.twoFactorEnabled);
        if (data.challenges) {
          setActiveChallenges(data.challenges);
        }
        setLoginStep(2);
        setInfo('Credentials verified! Please complete the randomized liveness check.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ── LOGIN: Step 2 — verify face ── */
  const handleLoginFace = async () => {
    if (!loginFaceBlob) { setError('Please capture your face first.'); return; }
    setError(''); setLoading(true); setFaceAuthResult(null);
    try {
      const formData = new FormData(); formData.append('file', loginFaceBlob);
      const res = await fetch(`${API_BASE_URL}/api/auth/face/login-verify`, {
        method: 'POST', headers: { 'Authorization': `Bearer ${loginTempToken}` }, body: formData,
      });
      const data = await res.json();
      if (data.similarity_score !== undefined) setFaceAuthResult(data);
      if (!res.ok) throw new Error(data.message || 'Face authentication failed');

      if (data.mfaRequired) {
        setMfaTriggeredByFace(true);
      }

      setInfo('Face verified! Now speak into your microphone to verify your voice.');
      setTimeout(() => { setLoginStep(3); setInfo('Speak your passphrase or say anything.'); }, 2000);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  /* ── LOGIN: Step 3 — verify voice ── */
  const handleLoginVoice = async () => {
    if (!loginVoiceBlob) { setError('Please record your voice first.'); return; }
    setError(''); setLoading(true); setAuthResult(null);
    try {
      const formData = new FormData(); formData.append('file', loginVoiceBlob);
      const res = await fetch(`${API_BASE_URL}/api/auth/voice/login-verify`, {
        method: 'POST', headers: { 'Authorization': `Bearer ${loginTempToken}` }, body: formData,
      });
      const data = await res.json();
      if (data.similarity_score !== undefined) setAuthResult(data);
      if (!res.ok) throw new Error(data.message || 'Voice authentication failed');

      if (data.mfaRequired || mfaTriggeredByFace) {
        setInfo('Biometric match was weak or additional verification required. Enter 2FA Code.');
        setLoginStep(4);
      } else if (!twoFactorEnabled && data.role === 'student') {
        // Trigger MFA setup for students who haven't enabled it
        setLoginStep(5);
        setInfo('Security Upgrade: Please set up Two-Factor Authentication.');
        handleInitiateMFASetup(data.token); // Optional: if we want to pre-fetch QR
      } else {
        localStorage.setItem('nucleusToken', data.token);
        localStorage.setItem('nucleusUser', JSON.stringify(data));
        navigate('/app');
      }
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  /* ── LOGIN: Step 4 — verify TOTP ── */
  const handleLoginTOTP = async (e) => {
    e.preventDefault();
    if (totpToken.length !== 6) return setError('Invalid code');
    setError(''); setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/2fa/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: loginTempToken ? JSON.parse(atob(loginTempToken.split('.')[1])).id : '', token: totpToken })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'MFA validation failed');

      localStorage.setItem('nucleusToken', data.token);
      localStorage.setItem('nucleusUser', JSON.stringify(data));
      navigate('/app');
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  /* ── LOGIN: Step 5 — Setup MFA ── */
  const handleInitiateMFASetup = async (tempTokenOverride) => {
    const activeToken = tempTokenOverride || loginTempToken;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/auth/2fa/setup`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${activeToken}` }
      });
      const data = await res.json();
      console.log('MFA Setup Response:', data);
      
      if (res.ok) {
        setMfaQrCode(data.qrCode);
        setMfaSecret(data.secret);
      } else {
        setError(data.message || 'Failed to initialize MFA');
      }
    } catch (err) {
      console.error('MFA Setup Error:', err);
      setError('Could not connect to MFA service');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyMFASetup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/2fa/verify-enable`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${loginTempToken}` 
        },
        body: JSON.stringify({ token: totpToken })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'MFA verification failed');
      
      setInfo('MFA enabled! Redirecting...');
      
      // Auto-login using the token returned from verify-enable
      localStorage.setItem('nucleusToken', data.token);
      localStorage.setItem('nucleusUser', JSON.stringify(data.user || data));
      navigate('/app');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ── SETUP: Step 1 — change password ── */
  const handleSetupPassword = async (e) => {
    e.preventDefault();
    if(newPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setError(''); setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/setup/password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${setupToken}` },
        body: JSON.stringify({ password: newPassword })
      });
      if(!res.ok) throw new Error('Password reset failed');
      setSetupStep(2);
      setInfo('Password Updated! Now let\'s setup your biometric Face ID.');
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  /* ── SETUP: Step 2 — enroll face ── */
  const handleSetupFace = async () => {
    if (setupFaceBlobs.length < FACE_ANGLES.length) { 
        setError(`Please capture all ${FACE_ANGLES.length} angles.`); 
        return; 
    }
    setError(''); setLoading(true);
    try {
      const formData = new FormData(); 
      setupFaceBlobs.forEach(blob => formData.append('files', blob));
      
      const res = await fetch(`${API_BASE_URL}/api/auth/face/enroll`, {
        method: 'POST', headers: { 'Authorization': `Bearer ${setupToken}` }, body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Face enrollment failed');
      setSetupStep(3);
      setInfo(`Face enrolled! Now record ${REQUIRED_SAMPLES} voice samples.`);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  /* ── SETUP: Step 3 — enroll voice & finalize ── */
  const handleSetupVoiceFinalize = async () => {
    setError(''); setLoading(true);
    try {
      const formData = new FormData();
      setupVoiceSamples.forEach(file => formData.append('files', file));
      const res = await fetch(`${API_BASE_URL}/api/auth/voice/enroll`, {
        method: 'POST', headers: { 'Authorization': `Bearer ${setupToken}` }, body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Voice enrollment failed');

      // Finalize setup
      const fRes = await fetch(`${API_BASE_URL}/api/auth/setup/finalize`, {
        method: 'POST', headers: { 'Authorization': `Bearer ${setupToken}` }
      });
      const FinalData = await fRes.json();
      if(!fRes.ok) throw new Error('Failed to finalize setup');

      localStorage.setItem('nucleusToken', FinalData.token);
      localStorage.setItem('nucleusUser', JSON.stringify(FinalData));
      
      if (FinalData.role === 'student') {
        setIsSetup(false);
        setLoginStep(5);
        setLoginTempToken(FinalData.token);
        setInfo('Account setup successful! Final step: Set up Two-Factor Authentication.');
        handleInitiateMFASetup(FinalData.token);
      } else {
        navigate('/app');
      }
    } catch(err) { setError(err.message); } finally { setLoading(false); }
  };

  /* ══════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════ */
  const isSetupVoiceReady = setupVoiceSamples.length === currentSample;
  const allSetupSamplesCollected = setupVoiceSamples.length >= REQUIRED_SAMPLES;

  return (
    <div className="login-container-wrapper">
      <div className="sky-bg" />
      <div className="sun-ray" />
      <div className="penthouse-card">
        <div className="view-section">
          <div className="university-logo"><div className="dot" />Nucleus Portal</div>
          <div className="headline"><h1>Elevate your<br /><span>Academic</span> vision.</h1></div>
          <div className="campus-stats">
            <div><strong>Secure Session</strong><br />End-to-End Encrypted</div>
            <div><strong>Multi-Factor</strong><br />Biometrics Active</div>
          </div>
        </div>
        <div className="auth-section">

          {/* ─────── STANDARD LOGIN ─────── */}
          {!isSetup && (
            <>
              <StepBar steps={['Credentials', 'Face ID', 'Voice ID']} current={loginStep - 1} />
              
              {loginStep === 1 && (
                <form onSubmit={handleLoginCredentials} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <Field label="Email" type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="you@university.edu" required />
                  <Field label="Password" type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="••••••••" required />
                  <Banner type="error" message={error} />
                  <button type="submit" disabled={loading} className="primary-btn">
                    {loading ? <Spinner /> : 'Sign In →'}
                  </button>
                  <p style={{ textAlign: 'center', fontSize: '11px', color: 'rgba(203,213,225,0.4)', marginTop: '10px' }}>
                    Registration is disabled. Contact your Recruiter for access.
                  </p>
                </form>
              )}

              {loginStep === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <Banner type="info" message={info} />
                  
                  {activeChallenges.face && (
                    <div style={{ 
                      padding: '12px', 
                      background: 'rgba(99, 102, 241, 0.1)', 
                      borderRadius: '8px', 
                      border: '1px dashed #6366f1',
                      textAlign: 'center'
                    }}>
                      <p style={{ fontSize: '12px', color: '#818cf8', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>Liveness Challenge</p>
                      <h3 style={{ fontSize: '18px', color: 'white' }}>
                        {activeChallenges.face === 'blink' && '👁️ Blink Twice'}
                        {activeChallenges.face === 'look_left' && '⬅️ Look to the Left'}
                        {activeChallenges.face === 'look_right' && '➡️ Look to the Right'}
                      </h3>
                    </div>
                  )}

                  <CameraCapture onCaptureComplete={(b) => { setLoginFaceBlob(b); setInfo(''); setFaceAuthResult(null); setError(''); }} disabled={loading} />
                  <VerificationPanel result={faceAuthResult} />
                  {faceAuthResult && !faceAuthResult.liveness_verified && (
                    <Banner type="error" message={`Liveness Check Failed: ${faceAuthResult.liveness_message || 'Action matching the challenge not detected'}`} />
                  )}
                  {error && !faceAuthResult && <Banner type="error" message={error} />}
                  <button type="button" onClick={handleLoginFace} disabled={!loginFaceBlob || loading} className="primary-btn">
                    {loading ? <Spinner /> : '👤 Authenticate Face'}
                  </button>
                </div>
              )}

              {loginStep === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <Banner type="info" message={info} />

                  {activeChallenges.voice && (
                    <div style={{ 
                      padding: '12px', 
                      background: 'rgba(16, 185, 129, 0.1)', 
                      borderRadius: '8px', 
                      border: '1px dashed #10b981',
                      textAlign: 'center'
                    }}>
                      <p style={{ fontSize: '12px', color: '#34d399', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>Voice Challenge</p>
                      <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>Please speak the following sentence clearly:</p>
                      <h3 style={{ fontSize: '16px', color: 'white', fontStyle: 'italic' }}>
                        "{activeChallenges.voice}"
                      </h3>
                    </div>
                  )}

                  <VoiceRecorder label="Record Challenge Response" onRecordingComplete={(b) => { setLoginVoiceBlob(b); setInfo(''); setAuthResult(null); setError(''); }} />
                  <VerificationPanel result={authResult} />
                  {authResult?.security_alerts?.stt_mismatch && (
                    <Banner type="error" message={`Verification Failed: Spoken text does not match the challenge. (Detected: "${authResult.transcription || 'unknown'}")`} />
                  )}
                  {authResult?.security_alerts?.synthetic_voice && <Banner type="error" message="WARNING: Synthetic/AI-generated voice patterns detected. Verification rejected." />}
                  {error && !authResult && <Banner type="error" message={error} />}
                  <button type="button" onClick={handleLoginVoice} disabled={!loginVoiceBlob || loading} className="primary-btn">
                    {loading ? <Spinner /> : '🔐 Authenticate with Voice'}
                  </button>
                </div>
              )}

              {loginStep === 4 && (
                <form onSubmit={handleLoginTOTP} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#6366f1', marginBottom: '12px' }}>key</span>
                    <h2 style={{ fontSize: '18px', color: 'white', marginBottom: '4px' }}>Two-Factor Authentication</h2>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>Enter the 6-digit code from your authenticator app.</p>
                  </div>
                  <Banner type="info" message={info} />
                  <Field label="Security Code" type="text" value={totpToken} onChange={e => setTotpToken(e.target.value.replace(/\D/g,'').slice(0,6))} placeholder="000000" required />
                  <Banner type="error" message={error} />
                  <button type="submit" disabled={loading} className="primary-btn">
                    {loading ? <Spinner /> : 'Verify & Login →'}
                  </button>
                </form>
              )}
              
              {loginStep === 5 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
                  <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                    <h2 style={{ fontSize: '20px', color: 'white', fontWeight: 600 }}>Secure Your Account</h2>
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>
                      Scan this QR code with Google Authenticator or Authy to enable Two-Factor Authentication.
                    </p>
                  </div>

                  {mfaQrCode ? (
                    <div style={{ 
                      padding: '16px', 
                      background: 'white', 
                      borderRadius: '16px', 
                      boxShadow: '0 0 30px rgba(99, 102, 241, 0.3)' 
                    }}>
                      <img src={mfaQrCode} alt="MFA QR Code" style={{ width: '180px', height: '180px', display: 'block' }} />
                    </div>
                  ) : (
                    <div style={{ width: '180px', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '16px' }}>
                      <Spinner />
                    </div>
                  )}

                  <div style={{ width: '100%', textAlign: 'left' }}>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '12px', textAlign: 'center' }}>
                      Can't scan? Use code: <code style={{ color: 'white', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>{mfaSecret}</code>
                    </p>
                    <form onSubmit={handleVerifyMFASetup} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <Field 
                        label="Verification Code" 
                        type="text" 
                        value={totpToken} 
                        onChange={e => setTotpToken(e.target.value.replace(/\D/g,'').slice(0,6))} 
                        placeholder="000000" 
                        required 
                      />
                      <Banner type="error" message={error} />
                      <button type="submit" disabled={loading || !totpToken} className="primary-btn">
                        {loading ? <Spinner /> : '🚀 Enable & Finalize Login'}
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ─────── SETUP / FIRST LOGIN ─────── */}
          {isSetup && (
            <>
              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '12px', background: 'white', color: 'black', padding: '4px 10px', borderRadius: '10px', fontWeight: 'bold' }}>SYSTEM SETUP REQUIRED</span>
              </div>
              <StepBar steps={['Override Password', 'Face Profile', 'Voice Baseline']} current={setupStep - 1} />

              {setupStep === 1 && (
                <form onSubmit={handleSetupPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <Banner type="info" message={info} />
                  <Field label="New Password Override" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Minimum 6 characters" required />
                  <Banner type="error" message={error} />
                  <button type="submit" disabled={loading} className="primary-btn">
                    {loading ? <Spinner /> : 'Update Password →'}
                  </button>
                </form>
              )}

              {setupStep === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <Banner type="info" message={info || `Angle ${currentFaceAngle + 1}/${FACE_ANGLES.length}: Look ${FACE_ANGLES[currentFaceAngle]}`} />
                  
                  {/* Angle indicators */}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                    {FACE_ANGLES.map((angle, i) => (
                      <div key={i} style={{ 
                        flex: 1, height: '4px', borderRadius: '2px',
                        background: i < setupFaceBlobs.length ? '#10b981' : i === currentFaceAngle ? '#ffffff' : 'rgba(255,255,255,0.1)'
                      }} />
                    ))}
                  </div>

                  <CameraCapture 
                    key={currentFaceAngle}
                    onCaptureComplete={(b) => { 
                        if (b) {
                            setSetupFaceBlobs(p => [...p, b]);
                            setInfo('');
                            setError('');
                        }
                    }} 
                    disabled={loading || setupFaceBlobs.length > currentFaceAngle} 
                  />
                  
                  <Banner type="error" message={error} />

                  {setupFaceBlobs.length === currentFaceAngle + 1 && currentFaceAngle < FACE_ANGLES.length - 1 && (
                    <button type="button" onClick={() => setCurrentFaceAngle(prev => prev + 1)} className="primary-btn">
                      Next Angle: {FACE_ANGLES[currentFaceAngle + 1]} →
                    </button>
                  )}

                  {setupFaceBlobs.length === FACE_ANGLES.length && (
                    <button type="button" onClick={handleSetupFace} disabled={loading} className="primary-btn">
                      {loading ? <Spinner /> : '👤 Enroll Multi-Angle Profile'}
                    </button>
                  )}
                </div>
              )}

              {setupStep === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <Banner type="info" message={info} />
                  
                  {/* Sample dots progress */}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                    {Array.from({ length: REQUIRED_SAMPLES }, (_, i) => (
                      <div key={i} style={{ width: '10px', height: '10px', borderRadius: '50%', background: i < setupVoiceSamples.length ? '#10b981' : i === setupVoiceSamples.length ? '#ffffff' : 'rgba(255,255,255,0.12)' }} />
                    ))}
                  </div>

                  <VoiceRecorder key={currentSample} sampleIndex={currentSample} totalSamples={REQUIRED_SAMPLES} label="Speak naturally to construct baseline" onRecordingComplete={b => setSetupVoiceSamples(p => [...p, b])} disabled={setupVoiceSamples.length >= currentSample} />
                  <Banner type="error" message={error} />

                  {isSetupVoiceReady && !allSetupSamplesCollected && (
                    <button type="button" onClick={() => setCurrentSample(s => s + 1)} className="primary-btn">
                      Next Sample ({currentSample + 1}/{REQUIRED_SAMPLES}) →
                    </button>
                  )}

                  {allSetupSamplesCollected && (
                    <button type="button" onClick={handleSetupVoiceFinalize} disabled={loading} className="primary-btn">
                      {loading ? <Spinner /> : '🎤 Enroll & Finalize Setup'}
                    </button>
                  )}
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <span style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
  );
}