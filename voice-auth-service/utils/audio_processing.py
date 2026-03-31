import librosa
import numpy as np
import io
import soundfile as sf

def extract_mfcc(file_bytes: bytes, sr: int = 16000, n_mfcc: int = 13) -> np.ndarray:
    """
    Load audio from bytes, resample, normalize, extract MFCC, and return the mean.
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
        
    # Normalize audio
    y = librosa.util.normalize(y)
    
    # Extract MFCC features
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=n_mfcc)
    
    # Take mean across time axis to generate a 1D vector
    mfcc_mean = np.mean(mfcc, axis=1)
    
    return mfcc_mean
