# Voice Sample Sources for Training & Testing

## For College Project Scope

### 1. **Self-Recording (Recommended for Enrollment)**
Since voice authentication is user-specific, each user needs their own voice samples:
- **Record 5-10 samples per user** (your classmates/friends as test users)
- **Use smartphone or laptop microphone** in quiet environment
- **Consistent phrase**: Have each user say the same passphrase (e.g., "My voice is my password")
- **Varied conditions**: Record at different times, with slight variations in tone/pitch

### 2. **Public Datasets for Impostor/Background Models**
To establish thresholds and test robustness:

#### 🎯 **Speaker Verification Specific**
- **VoxCeleb1 & VoxCeleb2**
  - Large-scale speaker identification dataset
  - [http://www.robots.ox.ac.uk/~vgg/data/voxceleb/](http://www.robots.ox.ac.uk/~vgg/data/voxceleb/)
  - Contains thousands of speakers - excellent for impostor models
  - Download format: `.wav` files from YouTube

#### 📚 **Clean Speech (for clean samples & augmentation)**
- **LibriSpeech**
  - [http://www.openslr.org/12](http://www.openslr.org/12)
  - Clean read speech from audiobooks
  - Good for testing with clean signals

- **Common Voice (Mozilla)**
  - [https://commonvoice.mozilla.org/en/datasets](https://commonvoice.mozilla.org/en/datasets)
  - Multilingual, diverse accents
  - Includes demographic metadata (age, gender, accent)

#### 🌧️ **Noise & Environment (for augmentation & robustness testing)**
- **ESC-50** (Environmental Sound Classification)
  - [https://github.com/karoldvl/ESC-50](https://github.com/karoldvl/ESC-50)
  - 2000 environmental sounds (rain, dog bark, vacuum cleaner, etc.)
  - Perfect for adding noise to test robustness

- **DEMAND** (Database for Multichannel Audio Recordings)
  - [https://zenodo.org/record/1227121](https://zenodo.org/record/1227121)
  - Real-world noise recordings (cafe, street, traffic, etc.)

### 3. **Synthetic/Augmentation Options (When Data is Limited)**

#### Audio Augmentation Techniques (Implement in Code):
```python
# Add to utils/audio_processing.py
import librosa
import numpy as np
import random

def augment_audio(y, sr):
    """Apply random augmentations to audio signal"""
    augmented = y.copy()

    # 1. Time stretching (change speed without pitch change)
    if random.random() > 0.5:
        rate = random.uniform(0.8, 1.25)
        augmented = librosa.effects.time_stretch(augmented, rate=rate)

    # 2. Pitch shifting
    if random.random() > 0.5:
        n_steps = random.uniform(-2, 2)  # +/- 2 semitones
        augmented = librosa.effects.pitch_shift(augmented, sr=sr, n_steps=n_steps)

    # 3. Add background noise
    if random.random() > 0.3:
        # Load noise from ESC-50 or generate synthetic
        noise_level = random.uniform(0.005, 0.02)
        noise = np.random.normal(0, noise_level, len(augmented))
        augmented = augmented + noise

    # 4. Volume change
    if random.random() > 0.5:
        gain = random.uniform(0.8, 1.2)
        augmented = augmented * gain

    return augmented
```

### 4. **Practical Collection Strategy for Your Project**

#### Phase 1: Basic Functionality (Week 1)
- Record 3-5 samples per team member (3-5 people total)
- Use these for enrollment and basic testing
- Focus on getting the pipeline working

#### Phase 2: Robustness Testing (Week 2)
- Download 10-20 noise samples from ESC-50
- Add noise to your recordings to test robustness
- Download 50 utterances from LibriSpeech as "impostor" tests

#### Phase 3: Improvement Implementation (Week 3-4)
- Implement noise reduction and VAD
- Test with augmented data
- Document improvement in EER (Equal Error Rate)

### 5. **Storage Recommendation**

Create a directory structure:
```
voice-auth-service/
├── data/
│   ├── enrollments/      # User-specific samples (NOT committed to git!)
│   │   ├── user1/
│   │   │   ├── sample1.wav
│   │   │   └── sample2.wav
│   │   └── user2/
│   ├── impostors/        # Public dataset samples for testing
│   │   ├── librispeech/
│   │   └── voxceleb/
│   └── noise/            # ESC-50, DEMAND, etc.
│       ├── esc50/
│       └── demand/
├── utils/
└── main.py
```

**Important**: Add `data/` to `.gitignore` since voice samples are personal data!

### 6. **Quick Start Commands**

To get LibriSpeech dev-clean (1 hour sample):
```bash
# From voice-auth-service directory
mkdir -p data/impostors/librispeech
cd data/impostors/librispeech
wget http://www.openslr.org/resources/12/dev-clean.tar.gz
tar -xzf dev-clean.tar.gz
```

To get ESC-50:
```bash
mkdir -p data/noise/esc50
cd data/noise/esc50
wget https://github.com/karoldvl/ESC-50/archive/master.zip
unzip master.zip
```

### 7. **Ethical & Privacy Notes**
- **Never commit real voice samples to git**
- Get consent if recording others
- For demo purposes, use synthetic voices or your own voice only
- Consider using voice conversion tools to create synthetic variations if needed