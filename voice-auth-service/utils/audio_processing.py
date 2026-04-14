import librosa
import numpy as np
import io
import soundfile as sf


def detect_synthetic_voice(y, sr):
    """
    Detect AI-generated/synthetic voices.
    Natural human speech has a specific spectral flatness profile. 
    Many neural vocoders (like waveglow/tacotron) leave subtle footprints 
    of 'spectral perfection' or repeated patterns.
    """
    flatness = librosa.feature.spectral_flatness(y=y)
    mean_flatness = np.mean(flatness)
    std_flatness = np.std(flatness)
    
    # Heuristic: Synthetic voices often have very low variance in flatness 
    # across frames compared to natural human prosody.
    # Also, extremely high flatness (near white noise) can indicate a failure in generation.
    is_synthetic = False
    if std_flatness < 0.005: # Unnaturally consistent spectral profile
        is_synthetic = True
    if mean_flatness > 0.1: # Too much high-frequency noise injection
        is_synthetic = True
        
    return is_synthetic, mean_flatness

def extract_features(file_bytes: bytes, sr: int = 16000, n_mfcc: int = 40) -> dict:
    """
    Enhanced extraction with deepfake/synthetic detection.
    Returns: { "embedding": np.ndarray, "is_synthetic": bool, "metadata": dict }
    """
    # ── Load audio ────────────────────────────────────────────
    try:
        y, orig_sr = sf.read(io.BytesIO(file_bytes))
        if len(y.shape) > 1:
            y = np.mean(y, axis=1).astype(np.float32)
        else:
            y = y.astype(np.float32)
        if orig_sr != sr:
            y = librosa.resample(y, orig_sr=orig_sr, target_sr=sr)
    except Exception:
        try:
            y, _ = librosa.load(io.BytesIO(file_bytes), sr=sr, mono=True)
        except Exception as e:
            raise ValueError(f"Invalid audio format or corrupted file: {e}")

    if len(y) == 0:
        raise ValueError("Audio recording is silent or empty. Please check your microphone.")

    # ── Pre-processing ────────────────────────────────────────
    y, _ = librosa.effects.trim(y, top_db=20)
    if len(y) < sr * 0.5:
        raise ValueError("Voice sample too short. Please speak clearly for at least 1-2 seconds.")
    y = librosa.util.normalize(y)

    # ── Synthetic Detection ───────────────────────────────────
    is_synthetic, score = detect_synthetic_voice(y, sr)

    # ── 1. MFCC & Deltas (80-dim) ─────────────────────────────
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=n_mfcc)
    mfcc_delta = librosa.feature.delta(mfcc)
    mfcc_combined = np.vstack([mfcc, mfcc_delta])
    mfcc_mean = np.mean(mfcc_combined, axis=1)
    mfcc_std = np.std(mfcc_combined, axis=1)

    # ── 2. Spectral Features (8-dim) ──────────────────────────
    centroid = librosa.feature.spectral_centroid(y=y, sr=sr)
    bandwidth = librosa.feature.spectral_bandwidth(y=y, sr=sr)
    rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)
    flatness = librosa.feature.spectral_flatness(y=y)
    zcr = librosa.feature.zero_crossing_rate(y=y)

    spectral_feats = np.concatenate([
        [np.mean(centroid), np.std(centroid)],
        [np.mean(bandwidth), np.std(bandwidth)],
        [np.mean(rolloff), np.std(rolloff)],
        [np.mean(flatness)],
        [np.mean(zcr)]
    ])

    # ── 3. Chroma STFT (24-dim) ───────────────────────────────
    chroma = librosa.feature.chroma_stft(y=y, sr=sr)
    chroma_mean = np.mean(chroma, axis=1)
    chroma_std = np.std(chroma, axis=1)

    # ── 4. Pitch (F0) Dynamics (4-dim) ────────────────────────
    f0, voiced_flag, voiced_probs = librosa.pyin(y, fmin=librosa.note_to_hz('C2'), fmax=librosa.note_to_hz('C7'), sr=sr)
    f0_voiced = f0[voiced_flag]
    if len(f0_voiced) > 0:
        pitch_feats = np.array([np.mean(f0_voiced), np.std(f0_voiced), np.median(f0_voiced), np.max(f0_voiced) - np.min(f0_voiced)])
    else:
        pitch_feats = np.zeros(4)

    # ── Concatenate into dense fingerprint (~116-dim) ──────────
    fingerprint = np.concatenate([mfcc_mean, mfcc_std, spectral_feats, chroma_mean, chroma_std, pitch_feats])
    
    # Simple L2 Normalization
    norm = np.linalg.norm(fingerprint)
    if norm > 0:
        fingerprint = fingerprint / norm
        
    return {
        "embedding": fingerprint,
        "is_synthetic": is_synthetic,
        "spectral_flatness": float(score)
    }

# Keep old name for backwards-compat
extract_mfcc = extract_features
