import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function VoiceEnroll() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const animationRef = useRef(null);

  const [step, setStep] = useState('intro');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [samples, setSamples] = useState([]);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [error, setError] = useState(null);
  const [enrollmentResult, setEnrollmentResult] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('nucleusToken');
    const userStr = localStorage.getItem('nucleusUser');
    if (!token || !userStr) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(userStr));
  }, [navigate]);

  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      if (!analyserRef.current) return;

      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserRef.current.getByteFrequencyData(dataArray);

      const bars = 64;
      const step = Math.floor(bufferLength / bars);
      const barData = new Uint8Array(bars);
      for (let i = 0; i < bars; i++) {
        let sum = 0;
        for (let j = 0; j < step; j++) {
          sum += dataArray[i * step + j];
        }
        barData[i] = sum / step;
      }

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(59, 130, 246, 0.05)';
      ctx.fillRect(0, 0, width, height);

      const barWidth = width / bars;
      const gradient = ctx.createLinearGradient(0, height / 2, 0, 0);
      gradient.addColorStop(0, '#3b82f6');
      gradient.addColorStop(1, '#8b5cf6');

      ctx.fillStyle = gradient;
      for (let i = 0; i < bars; i++) {
        const barHeight = (barData[i] / 255) * (height / 2 - 10);
        const x = i * barWidth;
        const y = (height - barHeight) / 2;
        ctx.beginPath();
        ctx.roundRect(x + 2, y, barWidth - 4, barHeight, 4);
        ctx.fill();
      }
    };

    draw();
  }, []);

  useEffect(() => {
    if (isRecording) {
      drawWaveform();
    } else {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isRecording, drawWaveform]);

  const initAudioContext = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;
      return stream;
    } catch (err) {
      throw new Error('Microphone access denied. Please allow microphone access.');
    }
  };

  const startRecording = async () => {
    setError(null);
    try {
      const stream = await initAudioContext();
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setSamples(prev => [...prev, blob]);
        setIsRecording(false);
        setRecordingTime(0);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      const timer = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 5) {
            clearInterval(timer);
            mediaRecorder.stop();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      setError(err.message);
    }
  };

  const enrollVoice = async () => {
    setIsEnrolling(true);
    setError(null);

    try {
      const token = localStorage.getItem('nucleusToken');
      const userId = user?._id;

      if (!token || !userId) throw new Error('Authentication required');

      const formData = new FormData();
      samples.forEach((blob, idx) => {
        formData.append('files', blob, `sample${idx + 1}.wav`);
      });

      const response = await fetch(`${API_BASE_URL}/api/auth/voice/enroll`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Enrollment failed');

      setEnrollmentResult(data);
      setStep('success');
    } catch (err) {
      setError(err.message);
      setStep('error');
    } finally {
      setIsEnrolling(false);
    }
  };

  const resetEnrollment = () => {
    setStep('intro');
    setSamples([]);
    setEnrollmentResult(null);
    setError(null);
  };

  const handleNext = () => {
    if (samples.length >= 3) {
      setStep('processing');
      setTimeout(enrollVoice, 1000);
    } else {
      setError('Please record at least 3 voice samples.');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <span className="text-primary text-xs font-bold uppercase tracking-wider">Security</span>
          <h1 className="text-3xl font-bold text-on-surface mt-2">Voice ID Setup</h1>
          <p className="mt-2 text-on-surface-variant">Record voice samples for password-free login</p>
        </div>

        {user && (
          <div className="mb-6 flex justify-center">
            <div className="bg-surface-container-lowest rounded-full px-4 py-2 flex items-center gap-2 border border-outline-variant/20">
              <div className="w-6 h-6 rounded-full bg-secondary-fixed-dim flex items-center justify-center">
                <span className="text-xs font-bold text-on-secondary-fixed-variant">{user.name.charAt(0)}</span>
              </div>
              <span className="text-sm font-medium text-on-surface">{user.name}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-error-container border border-outline-variant/20 rounded-lg p-3 flex items-center gap-2">
            <span className="text-error text-sm">{error}</span>
          </div>
        )}

        {step === 'intro' && (
          <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/20">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">🎤</div>
              <h2 className="text-xl font-bold text-on-surface mb-2">Voice Authentication</h2>
              <p className="text-sm text-on-surface-variant mb-4">
                Add an extra layer of security with your voice. Record 3-5 samples now.
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setStep('enroll')}
                className="px-6 py-2 bg-primary text-on-primary font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                Start Setup
              </button>
            </div>
          </div>
        )}

        {step === 'enroll' && (
          <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/20">
            <div className="mb-4">
              <div className="flex justify-between text-xs text-on-surface-variant mb-2">
                <span>Progress</span>
                <span>{samples.length}/5 samples</span>
              </div>
              <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                <div
                  className="h-full bg-secondary transition-all duration-500"
                  style={{ width: `${Math.min((samples.length / 5) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="mb-6 rounded-lg overflow-hidden bg-surface-container border border-outline-variant/20">
              <canvas
                ref={canvasRef}
                width={800}
                height={160}
                className="w-full h-40"
              />
            </div>

            <div className="text-center mb-6">
              <button
                onClick={isRecording ? () => {} : startRecording}
                disabled={isRecording || samples.length >= 5}
                className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2 text-2xl transition-colors ${isRecording ? 'bg-error text-on-error-fixed' : 'bg-primary text-on-primary-fixed hover:bg-primary/90'} disabled:opacity-50`}
              >
                {isRecording ? '⏹' : '🎤'}
              </button>
              <p className="text-sm font-medium text-on-surface">
                {isRecording ? `Recording... ${formatTime(recordingTime)}` : samples.length >= 5 ? 'Maximum samples recorded' : 'Tap to record (3-5 seconds)'}
              </p>
            </div>

            {samples.length > 0 && (
              <div className="mb-6">
                <p className="text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wide">Samples</p>
                <div className="grid grid-cols-5 gap-2">
                  {samples.map((_, idx) => (
                    <div
                      key={idx}
                      className="relative rounded-lg bg-secondary-container p-3 aspect-square flex items-center justify-center border border-secondary"
                    >
                      <span className="text-lg text-on-secondary-container">{idx + 1}</span>
                      <button
                        onClick={() => setSamples(prev => prev.filter((_, i) => i !== idx))}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-error rounded-full flex items-center justify-center text-xs text-on-error"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  {[...Array(5 - samples.length)].map((_, idx) => (
                    <div
                      key={`empty-${idx}`}
                      className="rounded-lg border-2 border-dashed border-outline-variant bg-surface-container p-3 flex items-center justify-center aspect-square"
                    >
                      <span className="text-sm text-outline">{samples.length + idx + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-outline-variant/20">
              <button
                onClick={resetEnrollment}
                className="px-4 py-2 text-sm text-secondary hover:text-primary transition-colors"
              >
                Start Over
              </button>
              {samples.length >= 3 && (
                <button
                  onClick={handleNext}
                  disabled={isEnrolling}
                  className="px-6 py-2 bg-secondary text-on-secondary font-medium rounded-lg hover:bg-secondary/90 disabled:opacity-50 flex items-center gap-2"
                >
                  {isEnrolling ? 'Processing...' : 'Continue →'}
                </button>
              )}
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="bg-surface-container-lowest rounded-xl p-12 border border-outline-variant/20 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full border-4 border-secondary/30 border-t-secondary animate-spin"></div>
            <h2 className="text-xl font-bold text-on-surface mb-2">Enrolling...</h2>
            <p className="text-sm text-on-surface-variant">Please wait while we process your voice</p>
          </div>
        )}

        {step === 'success' && enrollmentResult && (
          <div className="bg-surface-container-lowest rounded-xl p-8 border border-secondary/30 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary-container flex items-center justify-center">
              <span className="text-3xl text-on-secondary-container">✓</span>
            </div>
            <h2 className="text-2xl font-bold text-secondary mb-2">Voice ID Activated</h2>
            <p className="text-sm text-on-surface-variant mb-6">
              Successfully enrolled with {enrollmentResult.sample_count} samples
            </p>
            <div className="bg-surface-container rounded-lg p-4 mb-6 max-w-sm mx-auto border border-outline-variant/20">
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Threshold</span>
                <span className="font-bold text-on-surface">{enrollmentResult.adaptive_threshold?.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2 bg-primary text-on-primary font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}

        {step === 'error' && (
          <div className="bg-error-container border border-outline-variant/20 rounded-xl p-8 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-error flex items-center justify-center">
              <span className="text-2xl text-on-error">✕</span>
            </div>
            <h2 className="text-xl font-bold text-error mb-2">Enrollment Failed</h2>
            <p className="text-sm text-on-surface-variant mb-6">{error}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={resetEnrollment}
                className="px-6 py-2 bg-primary text-on-primary font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}