#!/usr/bin/env python3
"""
Generate synthetic test audio files for voice authentication testing.
Creates sine waves with varying frequencies to simulate different voices.
"""

import numpy as np
import soundfile as sf
import os
import random

def generate_voice_sample(filename, base_freq, duration=3.0, sr=16000):
    """
    Generate a synthetic voice-like audio sample.
    In reality, voice is much more complex, but this is just for testing the API pipeline.
    """
    t = np.linspace(0, duration, int(sr * duration))

    # Base tone (simulates fundamental frequency)
    audio = 0.5 * np.sin(2 * np.pi * base_freq * t)

    # Add harmonics (real voice has overtones)
    audio += 0.3 * np.sin(2 * np.pi * base_freq * 2 * t)  # 2nd harmonic
    audio += 0.1 * np.sin(2 * np.pi * base_freq * 3 * t)  # 3rd harmonic

    # Add slight vibrato (pitch variation)
    vibrato_rate = 5  # Hz
    vibrato_depth = 0.002
    vibrato = vibrato_depth * np.sin(2 * np.pi * vibrato_rate * t)
    audio_modulated = audio * (1 + vibrato)

    # Add some noise to simulate background
    noise_level = 0.02
    noise = np.random.normal(0, noise_level, len(audio_modulated))
    audio_with_noise = audio_modulated + noise

    # Normalize to prevent clipping
    audio_with_noise = audio_with_noise / np.max(np.abs(audio_with_noise))

    # Save to file
    sf.write(filename, audio_with_noise, sr)
    print(f"Created: {filename}")

def main():
    print("=" * 60)
    print("Test Audio Generator for Voice Authentication")
    print("=" * 60)

    # Create directory for test audio
    test_dir = "test_audio_files"
    if not os.path.exists(test_dir):
        os.makedirs(test_dir)

    print("\nGenerating test audio files...\n")

    # For User 1 (simulate one person's voice)
    print("Creating enrollment samples for 'user1':")
    base_freq_user1 = random.uniform(220, 240)  # Hz
    for i in range(1, 6):
        filename = os.path.join(test_dir, f"user1_sample{i}.wav")
        generate_voice_sample(filename, base_freq_user1 + random.uniform(-2, 2))

    # For User 2 (simulate another person)
    print("\nCreating enrollment samples for 'user2':")
    base_freq_user2 = random.uniform(300, 320)  # Hz (different pitch)
    for i in range(1, 6):
        filename = os.path.join(test_dir, f"user2_sample{i}.wav")
        generate_voice_sample(filename, base_freq_user2 + random.uniform(-2, 2))

    # Verification samples
    print("\nCreating verification samples:")
    filename1 = os.path.join(test_dir, "user1_verify.wav")
    generate_voice_sample(filename1, base_freq_user1 + random.uniform(-1, 1))

    filename2 = os.path.join(test_dir, "user2_verify.wav")
    generate_voice_sample(filename2, base_freq_user2 + random.uniform(-1, 1))

    # Impostor sample (different voice attempting verification)
    print("\nCreating impostor sample:")
    impostor_freq = random.uniform(400, 500)  # Very different
    filename_impostor = os.path.join(test_dir, "impostor_verify.wav")
    generate_voice_sample(filename_impostor, impostor_freq)

    print("\n" + "=" * 60)
    print(f"Generated {len(os.listdir(test_dir))} test audio files in '{test_dir}/'")
    print("\nFiles created:")
    for f in sorted(os.listdir(test_dir)):
        print(f"  - {f}")

    print("\nNext steps:")
    print("1. Run the test script: python test_api.py")
    print("2. Use these file paths when prompted")
    print("   Enrollment: test_audio_files/user1_sample*.wav")
    print("   Verification: test_audio_files/user1_verify.wav")
    print("=" * 60)

if __name__ == "__main__":
    main()