import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Check, Loader2, AlertCircle, Music, User, ArrowRight, RotateCcw, Sparkles } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function VoiceEnroll() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const animationRef = useRef(null);

  const [step, setStep] = useState('intro'); // 'intro', 'enroll', 'processing', 'success', 'error'
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [samples, setSamples] = useState([]);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [error, setError] = useState(null);
  const [enrollmentResult, setEnrollmentResult] = useState(null);
  const [waveformData, setWaveformData] = useState(new Uint8Array(0));
  const [user, setUser] = useState(null);

  // Check auth on mount
  useEffect(() => {
    const token = localStorage.getItem('nucleusToken');
    const userStr = localStorage.getItem('nucleusUser');
    if (!token || !userStr) {
      navigate('/');
      return;
    }
    setUser(JSON.parse(userStr));
  }, [navigate]);

  // Draw waveform
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

      // Downsample for visualization
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
      setWaveformData(barData);

      // Clear and draw
      ctx.fillStyle = 'rgba(99, 102, 241, 0.1)';
      ctx.fillRect(0, 0, width, height);

      const barWidth = width / bars;
      const gradient = ctx.createLinearGradient(0, height / 2, 0, 0);
      gradient.addColorStop(0, '#8b5cf6'); // violet
      gradient.addColorStop(0.5, '#3b82f6'); // blue
      gradient.addColorStop(1, '#06b6d4'); // cyan

      ctx.fillStyle = gradient;
      ctx.beginPath();
      for (let i = 0; i < bars; i++) {
        const barHeight = (barData[i] / 255) * (height / 2 - 10);
        const x = i * barWidth;
        const y = (height - barHeight) / 2;
        ctx.roundRect(x + 2, y, barWidth - 4, barHeight, 4);
      }
      ctx.fill();
    };

    draw();
  }, []);

  // Start waveform visualization
  useEffect(() => {
    if (isRecording) {
      drawWaveform();
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      // Clear canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRecording, drawWaveform]);

  // Initialize audio context for visualization
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
      console.error('Error accessing microphone:', err);
      throw new Error('Microphone access denied. Please allow microphone access to use voice enrollment.');
    }
  };

  // Start recording
  const startRecording = async () => {
    setError(null);
    try {
      const stream = await initAudioContext();
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setRecordedBlob(blob);
        setSamples(prev => [...prev, blob]);
        setIsRecording(false);
        setRecordingTime(0);
        // Stop tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Timer
      const timer = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 5) {
            clearInterval(timer);
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      setError(err.message);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  // Enroll voice samples with backend
  const enrollVoice = async () => {
    setIsEnrolling(true);
    setError(null);

    try {
      const token = localStorage.getItem('nucleusToken');
      const userId = user?._id;

      if (!token || !userId) {
        throw new Error('Authentication required');
      }

      const formData = new FormData();
      samples.forEach((blob, idx) => {
        formData.append('files', blob, `sample${idx + 1}.wav`);
      });

      const response = await fetch(`${API_BASE_URL}/api/auth/voice/enroll`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Enrollment failed');
      }

      setEnrollmentResult(data);
      setStep('success');
    } catch (err) {
      setError(err.message);
      setStep('error');
    } finally {
      setIsEnrolling(false);
    }
  };

  // Reset and start over
  const resetEnrollment = () => {
    setStep('intro');
    setSamples([]);
    setRecordedBlob(null);
    setEnrollmentResult(null);
    setError(null);
  };

  // Go to next step
  const handleNext = () => {
    if (samples.length >= 3) {
      setStep('processing');
      setTimeout(enrollVoice, 1000);
    } else {
      setError('Please record at least 3 voice samples for enrollment.');
    }
  };

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-purple-50/30 dark:from-slate-900 dark:via-indigo-950/30 dark:to-purple-950/20 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 mb-6 shadow-lg shadow-violet-500/30">
            <Music className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Voice ID Setup
          </h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
            Secure your account with voice authentication. Record 3-5 clear samples of your voice to enable password-free login.
          </p>
        </div>

        {/* User info card */}
        {user && (
          <div className="mb-8 flex items-center justify-center">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-4 px-6 shadow-xl border border-slate-200/50 dark:border-slate-700/50 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{user.name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{user.enrollment_number}</p>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3 animate-in slide-in-from-top fade-in duration-300">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-red-800 dark:text-red-200">Something went wrong</h4>
              <p className="text-red-600 dark:text-red-300 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Main Content */}
        {step === 'intro' && (
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 p-8 md:p-12 text-center animate-in zoom-in duration-500">
            <div className="max-w-lg mx-auto">
              <div className="mb-8 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-indigo-500/20 blur-3xl rounded-full"></div>
                <div className="relative w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 flex items-center justify-center border-4 border-white dark:border-slate-700 shadow-xl">
                  <Mic className="w-14 h-14 text-violet-600 dark:text-violet-400" />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-slate-900 dark:white mb-4">
                Ready to set up Voice ID?
              </h2>
              <p className="text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                You'll record 3-5 short audio samples. Find a quiet place and speak naturally. This will be used to verify your identity during login.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                {['Microphone access', 'Clear audio samples', 'Quick setup'].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setStep('enroll')}
                className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold text-white transition-all duration-200 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-full hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 hover:shadow-lg hover:shadow-violet-500/40 active:scale-95"
              >
                <span>Start Setup</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
              </button>
            </div>
          </div>
        )}

        {/* Enrollment Recording */}
        {step === 'enroll' && (
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 p-8 animate-in slide-in-from-bottom duration-500">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Record Your Voice
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                Sample {samples.length + 1} of 5 (minimum 3 required)
              </p>
            </div>

            {/* Progress bar */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-2">
                <span>Progress</span>
                <span>{samples.length}/5 samples</span>
              </div>
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-500"
                  style={{ width: `${Math.min((samples.length / 5) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Waveform Canvas */}
            <div className="relative mb-8 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 p-6 shadow-inner">
              <canvas
                ref={canvasRef}
                width={800}
                height={200}
                className="w-full h-48 rounded-xl"
              />
              {!isRecording && samples.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <p className="text-slate-400 text-sm">Waveform will appear here</p>
                </div>
              )}
            </div>

            {/* Recording timer */}
            <div className="text-center mb-8">
              <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${isRecording ? 'bg-red-100 dark:bg-red-900/30 animate-pulse' : 'bg-slate-100 dark:bg-slate-900/50'} transition-colors`}>
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isEnrolling}
                  className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 ${isRecording ? 'bg-red-500 hover:bg-red-600 scale-105' : 'bg-gradient-to-br from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg hover:shadow-violet-500/40'} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isRecording ? (
                    <MicOff className="w-8 h-8 text-white" />
                  ) : (
                    <Mic className="w-8 h-8 text-white" />
                  )}
                </button>
              </div>
              <p className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                {isRecording ? formatTime(recordingTime) : 'Tap to record'}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                {isRecording ? 'Recording... (5 seconds max)' : 'Record about 3-5 seconds of speech'}
              </p>
            </div>

            {/* Recorded samples list */}
            {samples.length > 0 && (
              <div className="mb-8 space-y-2">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Recorded samples:</p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {samples.map((_, idx) => (
                    <div
                      key={idx}
                      className="relative rounded-xl overflow-hidden border-2 border-green-400 bg-green-50 dark:bg-green-900/20 p-3 flex flex-col items-center justify-center aspect-square group"
                    >
                      <Check className="w-6 h-6 text-green-600 dark:text-green-400 mb-1" />
                      <span className="text-xs font-semibold text-green-700 dark:text-green-300">
                        Sample {idx + 1}
                      </span>
                      <button
                        onClick={() => {
                          setSamples(prev => prev.filter((_, i) => i !== idx));
                        }}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <span className="text-[10px] text-red-600 dark:text-red-300">✕</span>
                      </button>
                    </div>
                  ))}
                  {/* Empty slots */}
                  {[...Array(5 - samples.length)].map((_, idx) => (
                    <div
                      key={`empty-${idx}`}
                      className="rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/30 p-3 flex flex-col items-center justify-center aspect-sq"
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center mb-1">
                        <span className="text-slate-400 text-xs">{samples.length + idx + 1}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex justify-between items-center">
              <button
                onClick={resetEnrollment}
                className="px-6 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Start Over
              </button>

              <div className="flex gap-3">
                {samples.length >= 3 && (
                  <button
                    onClick={handleNext}
                    disabled={isEnrolling}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-full hover:from-emerald-600 hover:to-green-700 disabled:opacity-50 shadow-lg shadow-green-500/30 transition-all"
                  >
                    {isEnrolling ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Processing State */}
        {step === 'processing' && (
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 p-12 text-center animate-in zoom-in duration-300">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-violet-200 dark:border-violet-900/50"></div>
              <div className="absolute inset-0 rounded-full border-4 border-violet-500 border-t-transparent animate-spin"></div>
              <div className="absolute inset-2 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-violet-600 animate-spin" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
              Enrolling Voice...
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Analyzing voice patterns and creating your unique voiceprint.
            </p>
          </div>
        )}

        {/* Success State */}
        {step === 'success' && enrollmentResult && (
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-green-200/50 dark:border-green-800/50 p-12 text-center animate-in zoom-in duration-500">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-green-400 blur-3xl opacity-30 rounded-full"></div>
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-green-600 dark:text-green-400 mb-4">
              Voice ID Activated!
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6 max-w-md mx-auto">
              Your voice has been successfully enrolled. You can now log in using just your voice!
            </p>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 mb-8 max-w-sm mx-auto border border-green-200 dark:border-green-800">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500 dark:text-slate-400">Samples</p>
                  <p className="font-bold text-slate-900 dark:text-white">{enrollmentResult.sample_count}</p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400">Threshold</p>
                  <p className="font-bold text-slate-900 dark:text-white">{enrollmentResult.adaptive_threshold?.toFixed(2)}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={resetEnrollment}
                className="px-6 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-600 rounded-full hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
              >
                Add More Samples
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-full hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/30 transition-all flex items-center gap-2"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Error retry */}
        {step === 'error' && (
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-red-200/50 dark:border-red-800/50 p-12 text-center animate-in zoom-in duration-500">
            <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
              Enrollment Failed
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mb-8 max-w-md mx-auto">
              {error || 'An unknown error occurred during voice enrollment. Please try again.'}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={resetEnrollment}
                className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-full hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/30 transition-all flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Try Again
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2.5 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-full hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
              >
                Skip for Now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}