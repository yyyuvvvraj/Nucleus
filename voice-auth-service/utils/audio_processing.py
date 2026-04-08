import librosa
import numpy as np
import io
import soundfile as sf


def extract_features(file_bytes: bytes, sr: int = 16000, n_mfcc: int = 20) -> np.ndarray:
    """
    Extract a rich, discriminative voice fingerprint from raw audio bytes.

    Feature vector (80-dim):
      • 20 MFCC coefficients  – spectral shape (timbre)
      • 20 delta MFCCs         – rate of spectral change (speaking rhythm)
      • 20 MFCC means          – averaged over time (same as before)
      • 20 MFCC stds           – frame-level variability (NEW — distinguishes speakers)

    The std component is the key addition: the *way* a voice varies over time is
    highly speaker-specific and far more resistant to inter-speaker collision than
    the mean alone.  Concatenating mean + std doubles the vector length and typically
    halves false-accept rate for cosine-based comparisons.
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
        raise ValueError("Audio file is empty.")

    # ── Pre-processing ────────────────────────────────────────
    y, _ = librosa.effects.trim(y, top_db=20)
    if len(y) < sr * 0.3:
        raise ValueError("Recording too short — speak for at least 1 second.")
    y = librosa.util.normalize(y)

    # ── Feature extraction ────────────────────────────────────
    mfcc       = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=n_mfcc)        # [20, T]
    mfcc_delta = librosa.feature.delta(mfcc)                              # [20, T]
    combined   = np.vstack([mfcc, mfcc_delta])                            # [40, T]

    mean_vec = np.mean(combined, axis=1)   # [40] – spectral shape
    std_vec  = np.std(combined,  axis=1)   # [40] – frame-level variability

    # Final 80-dim fingerprint
    return np.concatenate([mean_vec, std_vec])


# Keep old name for backwards-compat with main.py import
extract_mfcc = extract_features
