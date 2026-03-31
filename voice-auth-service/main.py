from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import numpy as np

from utils.audio_processing import extract_mfcc
from utils.similarity import calculate_similarity

app = FastAPI(title="Voice Biometric Authentication API")

# Configure CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simulated in-memory database to avoid direct MongoDB coupling for this microservice.
# Format options:
# 1. Template approach: { "userId": [float, float, ...] } - single mean vector
# 2. Multi-sample approach: { "userId": [[float, ...], [float, ...], ...] } - multiple samples
# 3. Statistics approach: { "userId": { "mean": [float, ...], "std": [float, ...], "count": int } }
# In a real scenario, these embeddings would be returned to your MERN backend and saved in MongoDB.
db_embeddings = {}  # Will store multi-sample approach for better verification

def calculate_adaptive_threshold(embeddings_list):
    """
    Calculate adaptive threshold based on enrollment sample consistency.
    Returns threshold that balances false acceptance and rejection rates.
    """
    if len(embeddings_list) < 2:
        return 0.85  # Default fallback

    # Calculate pairwise similarities between enrollment samples
    similarities = []
    for i in range(len(embeddings_list)):
        for j in range(i+1, len(embeddings_list)):
            sim = calculate_similarity(np.array(embeddings_list[i]), np.array(embeddings_list[j]))
            similarities.append(sim)

    if not similarities:
        return 0.85

    mean_sim = np.mean(similarities)
    std_sim = np.std(similarities)

    # Set threshold at mean - 1*std (conservative) or mean - 2*std (more strict)
    # This assumes genuine matches should be above this threshold
    threshold = max(0.5, mean_sim - (1.5 * std_sim))  # Don't go too low
    return min(0.95, threshold)  # Don't go too high either

@app.post("/voice/enroll")
async def enroll_voice(
    userId: str = Form(...),
    files: List[UploadFile] = File(...)
):
    if not files or len(files) == 0:
        raise HTTPException(status_code=400, detail="No audio files provided.")

    embeddings = []

    for file in files:
        if file.filename == "":
            continue
        try:
            content = await file.read()
            mfcc_mean = extract_mfcc(content)  # This now returns enhanced features
            embeddings.append(mfcc_mean.tolist())
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error processing file {file.filename}: {str(e)}")

    if not embeddings:
         raise HTTPException(status_code=400, detail="Failed to extract features from any audio file.")

    # Store multiple samples for better verification
    db_embeddings[userId] = embeddings

    # Calculate and store adaptive threshold for this user
    threshold = calculate_adaptive_threshold(embeddings)

    return {
        "success": True,
        "message": f"Voice enrolled successfully with {len(files)} samples.",
        "userId": userId,
        "sample_count": len(embeddings),
        "adaptive_threshold": round(threshold, 4)
    }

@app.post("/voice/verify")
async def verify_voice(
    userId: str = Form(...),
    file: UploadFile = File(...)
):
    if userId not in db_embeddings:
        raise HTTPException(status_code=404, detail="User not found or not enrolled.")

    try:
        content = await file.read()
        new_embedding = extract_mfcc(content)
    except Exception as e:
         raise HTTPException(status_code=400, detail=f"Error processing file: {str(e)}")

    stored_embeddings = [np.array(emb) for emb in db_embeddings[userId]]

    # Calculate similarity with each stored sample and take the maximum
    similarities = []
    for stored_emb in stored_embeddings:
        sim = calculate_similarity(stored_emb, new_embedding)
        similarities.append(sim)

    max_similarity = max(similarities) if similarities else 0.0

    # Calculate adaptive threshold based on enrollment samples
    threshold = calculate_adaptive_threshold(db_embeddings[userId])
    is_authenticated = max_similarity > threshold

    return {
        "success": True,
        "userId": userId,
        "similarity_score": round(max_similarity, 4),
        "authenticated": bool(is_authenticated),
        "threshold_used": round(threshold, 4),
        "samples_compared": len(stored_embeddings)
    }
