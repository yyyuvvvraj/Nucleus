import sys
import os
import io
import numpy as np

# Add the voice-auth-service directory to the path so we can import the utils
sys.path.append(os.path.join(os.getcwd(), 'voice-auth-service'))

from utils.audio_processing import extract_features

def test_extraction():
    print("Testing upgraded feature extraction...")
    
    # Create a dummy audio signal (sine wave)
    sr = 16000
    duration = 2.0
    t = np.linspace(0, duration, int(sr * duration))
    y = np.sin(2 * np.pi * 440 * t).astype(np.float32)
    
    # Mock file bytes
    # Since sf.read takes a file-like object, we'll use a real wav file if possible
    # or just mock the extraction logic if sf.read fails on raw sine bytes.
    # Actually, I'll just use one of the generated test files.
    
    test_file = 'voice-auth-service/test_audio_files/user1_sample1.wav'
    if not os.path.exists(test_file):
        print(f"Test file not found: {test_file}")
        return

    with open(test_file, 'rb') as f:
        file_bytes = f.read()
        
    try:
        fingerprint = extract_features(file_bytes)
        print(f"SUCCESS! Fingerprint shape: {fingerprint.shape}")
        print(f"Fingerprint sample (first 10): {fingerprint[:10]}")
        
    except Exception as e:
        print(f"FAILED: {str(e)}")

if __name__ == "__main__":
    test_extraction()
