import librosa
import numpy as np
import io
import soundfile as sf
import noisereduce as nr

def extract_mcff(file_bytes: bytes, sr: int = 16000, n_mfcc: int = 13) -> np.ndarray:
    """
    Load audio from bytes, apply noise reduction, voice activity detection,
    resample, normalize, extract MFCC and delta features, and return the mean.
    """
    try:
        # Default load using soundfile
        y, orig_sr = sf.read(io.BytesIO(file_bytes))

        # Convert to mono if it's stereo
        if len(y.shape) > 1:
            y = np.mean(y, axis=1)

        # Resample
        if orig_sr != sr:
            y = librosa.resample(y, orig_sr=orig_sr, target_sr=sr)

    except Exception:
        # Fallback: Let librosa handle the file bytes directly
        try:
            y, orig_sr = librosa.load(io.BytesIO(file_bytes), sr=sr)
        except Exception as e:
            raise ValueError("Invalid audio format or corrupted file.")

    if len(y) == 0:
        raise ValueError("Audio file is empty or too short.")

    # 1. Noise reduction (using first 0.5 seconds as noise profile if available)
    noise_duration = min(0.5, len(y) / sr * 0.3)  # Use up to 0.5s or 30% of audio
    if len(y) > sr * 0.1:  # Only if we have enough audio
        noise_sample = y[:int(sr * noise_duration)]
        y = nr.reduce_noise(y=y, sr=sr, y_noise=noise_sample, stationary=False)

    # 2. Voice activity detection to remove silence
    # Use librosa's split to find non-silent intervals
    intervals = librosa.effects.split(y, top_db=20, frame_length=2048, hop_length=512)
    if len(intervals) > 0:
        # Concatenate non-silent parts
        voiced_parts = []
        for start, end in intervals:
            voiced_parts.append(y[start:end])
        if len(voiced_parts) > 0:
            y = np.concatenate(voiced_parts)
        # If all silence detected, fall back to original
        if len(y) == 0:
            y = librosa.util.normalize(y)
    else:
        # No voice activity detected, use original
        y = librosa.util.normalize(y)

    # 3. Normalize audio
    y = librosa.util.normalize(y)

    # 4. Extract MFCC features
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=n_mfcc)

    # 5. Extract delta and delta-delta features for richer representation
    mfcc_delta = librosa.feature.delta(mfcc)
    mfcc_delta2 = librosa.feature.delta(mfcc, order=2)

    # 6. Stack MFCC, delta, and delta-delta
    combined_features = np.vstack([mfcc, mfcc_delta, mfcc_delta2])

    # 7. Take mean across time axis to generate a 1D vector
    feature_mean = np.mean(combined_features, axis=1)

    return feature_mean
