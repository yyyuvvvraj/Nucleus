"""
Quick test script for the Voice Auth microservice.
Run this from the voice-auth-service directory:
  python test_api.py
"""
import numpy as np
import soundfile as sf
import requests
import os

BASE_URL = "http://127.0.0.1:8000"

def generate_test_wav(filename, duration=2.0, freq=440, sr=16000):
    """Generate a simple sine-wave WAV file for testing."""
    t = np.linspace(0, duration, int(sr * duration), endpoint=False)
    # Add slight variation to simulate different voice samples
    variation = np.random.uniform(0.9, 1.1)
    wave = (np.sin(2 * np.pi * freq * variation * t) * 0.5).astype(np.float32)
    sf.write(filename, wave, sr)
    print(f"  Generated: {filename}")

print("=" * 50)
print("  Nucleus Voice Auth - API Test")
print("=" * 50)

# ── Step 1: Generate 5 enrollment audio files ──────────
print("\n[1] Generating test audio files...")
enroll_files = []
for i in range(5):
    fname = f"test_enroll_{i+1}.wav"
    generate_test_wav(fname, freq=300 + i * 10)  # Slight freq variation
    enroll_files.append(fname)

# ── Step 2: Enroll the user ────────────────────────────
print("\n[2] Enrolling user 'test_user_001'...")
files = [("files", (f, open(f, "rb"), "audio/wav")) for f in enroll_files]
data = {"userId": "test_user_001"}

response = requests.post(f"{BASE_URL}/voice/enroll", data=data, files=files)
for _, (_, fh, _) in files:
    fh.close()

if response.status_code == 200:
    result = response.json()
    print(f"  ✅ Enrollment SUCCESS")
    print(f"  Embedding length: {len(result['embedding'])} features")
else:
    print(f"  ❌ Enrollment FAILED: {response.text}")

# ── Step 3: Verify with a similar audio (should pass) ──
print("\n[3] Verifying with SIMILAR audio (should PASS)...")
generate_test_wav("test_verify_pass.wav", freq=305)  # Similar to enrollment
with open("test_verify_pass.wav", "rb") as f:
    response = requests.post(
        f"{BASE_URL}/voice/verify",
        data={"userId": "test_user_001"},
        files={"file": ("test_verify.wav", f, "audio/wav")}
    )
result = response.json()
print(f"  Similarity Score : {result['similarity_score']}")
print(f"  Authenticated    : {'✅ YES' if result['authenticated'] else '❌ NO'}")

# ── Step 4: Verify with a very different audio (should fail) ──
print("\n[4] Verifying with DIFFERENT audio (should FAIL)...")
generate_test_wav("test_verify_fail.wav", freq=999, duration=1.0)  # Very different
with open("test_verify_fail.wav", "rb") as f:
    response = requests.post(
        f"{BASE_URL}/voice/verify",
        data={"userId": "test_user_001"},
        files={"file": ("test_verify.wav", f, "audio/wav")}
    )
result = response.json()
print(f"  Similarity Score : {result['similarity_score']}")
print(f"  Authenticated    : {'✅ YES' if result['authenticated'] else '❌ NO'}")

# ── Cleanup ────────────────────────────────────────────
print("\n[5] Cleaning up temp files...")
for f in enroll_files + ["test_verify_pass.wav", "test_verify_fail.wav"]:
    if os.path.exists(f):
        os.remove(f)
        print(f"  Deleted: {f}")

print("\n" + "=" * 50)
print("  Test complete!")
print("=" * 50)
