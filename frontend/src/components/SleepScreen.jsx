import React, { useState, useRef, useEffect } from 'react';
import { Lock, Unlock, Mic, Key, AlertCircle } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

/* ─────────────────────────────────────────
   Waveform visualizer component (Shared from Login)
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
      style={{ width: '100%', borderRadius: '12px', background: 'rgba(255,255,255,0.06)', marginTop: '16px' }}
    />
  );
}

/* ─────────────────────────────────────────
   Voice Helpers (Shared from Login)
───────────────────────────────────────── */
function encodeWAV(samples, sampleRate) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataLength = samples.length * 2;
  const buffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(buffer);
  const writeStr = (o, s) => { for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i)); };
  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeStr(36, 'data');
  view.setUint32(40, dataLength, true);
  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }
  return new Blob([buffer], { type: 'audio/wav' });
}

async function decodeToWav(blob) {
  const TARGET_SR = 16000;
  const arrayBuffer = await blob.arrayBuffer();
  const decodeCtx = new AudioContext();
  const decoded = await decodeCtx.decodeAudioData(arrayBuffer);
  decodeCtx.close();
  const offlineCtx = new OfflineAudioContext(1, Math.ceil(decoded.duration * TARGET_SR), TARGET_SR);
  const src = offlineCtx.createBufferSource();
  src.buffer = decoded;
  src.connect(offlineCtx.destination);
  src.start(0);
  const rendered = await offlineCtx.startRendering();
  const pcm = rendered.getChannelData(0);
  return encodeWAV(pcm, TARGET_SR);
}

/* ─────────────────────────────────────────
   Main SleepScreen Component
───────────────────────────────────────── */
const SleepScreen = ({ onUnlock }) => {
  const user = JSON.parse(localStorage.getItem('nucleusUser') || '{}');
  const token = localStorage.getItem('nucleusToken');
  
  const [authMode, setAuthMode] = useState(null); // 'password' | 'voice'
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState('idle'); // idle | recording | verifying

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const analyserRef = useRef(null);
  const audioCtxRef = useRef(null);

  const handlePasswordUnlock = async (e) => {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/verify-password`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid password');
      onUnlock();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      audioCtxRef.current = new AudioContext();
      const source = audioCtxRef.current.createMediaStreamSource(stream);
      const analyser = audioCtxRef.current.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      analyserRef.current = analyser;
      chunksRef.current = [];

      const MIME_TYPES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];
      const mimeType = MIME_TYPES.find(t => MediaRecorder.isTypeSupported(t)) || '';
      const mr = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      
      mr.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = async () => {
        setVoiceStatus('verifying');
        try {
          const rawBlob = new Blob(chunksRef.current, { type: mimeType || 'audio/webm' });
          const wavBlob = await decodeToWav(rawBlob);
          const wavFile = new File([wavBlob], `voice_unlock_${Date.now()}.wav`, { type: 'audio/wav' });

          const formData = new FormData();
          formData.append('file', wavFile);

          const res = await fetch(`${API_BASE_URL}/api/auth/voice/verify`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData,
          });
          const data = await res.json();
          if (data.authenticated) {
            onUnlock();
          } else {
            setError('Voice identity could not be verified.');
            setVoiceStatus('idle');
          }
        } catch (err) {
          setError('Voice verification failed.');
          setVoiceStatus('idle');
        } finally {
          streamRef.current?.getTracks().forEach(t => t.stop());
          audioCtxRef.current?.close();
        }
      };

      mr.start(100);
      mediaRecorderRef.current = mr;
      setIsRecording(true);
      setVoiceStatus('recording');
    } catch (err) {
      setError('Microphone access denied.');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(9, 9, 11, 0.85)',
      backdropFilter: 'blur(20px)',
      animation: 'fade-in 0.5s ease-out'
    }}>
      <div className="glass-card zoom-in" style={{
        width: '420px',
        padding: '40px',
        textAlign: 'center',
        background: 'rgba(18, 18, 18, 0.7)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '32px',
        boxShadow: '0 40px 100px rgba(0,0,0,0.5)'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <Lock size={32} color="white" />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 600, color: 'white', margin: '0 0 8px' }}>Session Locked</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Welcome back, {user.name || 'User'}</p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            padding: '12px',
            borderRadius: '12px',
            color: '#fca5a5',
            fontSize: '13px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {!authMode ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button className="primary-btn" onClick={() => setAuthMode('password')}>
              <Key size={18} /> Unlock with Password
            </button>
            <button className="ghost-btn" onClick={() => setAuthMode('voice')}>
              <Mic size={18} /> Unlock with Voice
            </button>
          </div>
        ) : authMode === 'password' ? (
          <form onSubmit={handlePasswordUnlock}>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'white',
                fontSize: '15px',
                outline: 'none',
                marginBottom: '16px'
              }}
            />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" className="primary-btn" disabled={loading} style={{ flex: 1 }}>
                {loading ? 'Unlocking...' : 'Unlock'}
              </button>
              <button type="button" className="ghost-btn" onClick={() => setAuthMode(null)} style={{ flex: 0.4 }}>
                Back
              </button>
            </div>
          </form>
        ) : (
          <div>
            <Waveform isRecording={isRecording} analyserRef={analyserRef} />
            <div style={{ marginTop: '24px', position: 'relative' }}>
              <button
                onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                disabled={voiceStatus === 'verifying'}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  border: 'none',
                  cursor: voiceStatus === 'verifying' ? 'default' : 'pointer',
                  background: isRecording ? '#ef4444' : '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  transition: 'all 0.3s ease',
                  boxShadow: isRecording ? '0 0 30px rgba(239,68,68,0.4)' : 'none'
                }}
              >
                {voiceStatus === 'verifying' ? (
                  <div className="processing-spinner" style={{ width: '24px', height: '24px' }} />
                ) : (
                  <Mic size={32} color={isRecording ? 'white' : 'black'} />
                )}
              </button>
              <p style={{ marginTop: '16px', color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
                {isRecording ? 'Listening... click to verify' : voiceStatus === 'verifying' ? 'Verifying identity...' : 'Click to start recording'}
              </p>
            </div>
            <button className="ghost-btn" onClick={() => { setAuthMode(null); stopVoiceRecording(); }} style={{ marginTop: '12px' }}>
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SleepScreen;
