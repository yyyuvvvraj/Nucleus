from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import numpy as np
import json

from utils.audio_processing import extract_mfcc
from utils.similarity import calculate_similarity

app = FastAPI(title="Voice Biometric Authentication API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory fallback for the enroll→verify same-session path.
# The MERN backend now also persists embeddings in MongoDB and passes them
# back on verify, so this service is effectively stateless across restarts.
db_embeddings = {}


def calculate_adaptive_threshold(embeddings_list):
    """
    Compute a conservative similarity threshold from enrollment samples.
    Uses mean - 1.0*std, clamped to [0.75, 0.95].
    The higher minimum (0.75 vs old 0.50) prevents random audio from passing.
    """
    if len(embeddings_list) < 2:
        return 0.80  # single-sample default — strict

    similarities = []
    for i in range(len(embeddings_list)):
        for j in range(i + 1, len(embeddings_list)):
            sim = calculate_similarity(
                np.array(embeddings_list[i]), np.array(embeddings_list[j])
            )
            similarities.append(sim)

    if not similarities:
        return 0.80

    mean_sim = float(np.mean(similarities))
    std_sim  = float(np.std(similarities))

    # Conservative: require at least 75% of the intra-enrollment similarity
    threshold = mean_sim - (1.0 * std_sim)
    return float(np.clip(threshold, 0.75, 0.95))


@app.post("/voice/enroll")
async def enroll_voice(
    userId: str = Form(...),
    files: List[UploadFile] = File(...),
):
    if not files:
        raise HTTPException(status_code=400, detail="No audio files provided.")

    embeddings = []
    for file in files:
        if not file.filename:
            continue
        try:
            content = await file.read()
            mfcc_mean = extract_mfcc(content)
            embeddings.append(mfcc_mean.tolist())
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Error processing file {file.filename}: {str(e)}"
            )

    if not embeddings:
        raise HTTPException(
            status_code=400,
            detail="Failed to extract features from any audio file."
        )

    # Store in-memory for same-session fallback
    db_embeddings[userId] = embeddings

    threshold = calculate_adaptive_threshold(embeddings)

    return {
        "success": True,
        "message": f"Voice enrolled successfully with {len(embeddings)} samples.",
        "userId": userId,
        "sample_count": len(embeddings),
        "adaptive_threshold": round(threshold, 4),
        # Return the raw embeddings so the MERN backend can persist them in MongoDB.
        # This makes the voice service stateless across restarts.
        "embedding": embeddings,
    }


@app.post("/voice/verify")
async def verify_voice(
    userId: str = Form(...),
    file: UploadFile = File(...),
    stored_embeddings: Optional[str] = Form(None),  # JSON from MongoDB (preferred)
):
    """
    Verify a voice sample against enrolled embeddings.

    Priority:
      1. Use `stored_embeddings` (JSON string from MongoDB) if provided.
      2. Fall back to in-memory db_embeddings (same-session only).
    """
    # --- Resolve stored embeddings ---
    resolved_embeddings = None

    if stored_embeddings:
        try:
            parsed = json.loads(stored_embeddings)
            if parsed and isinstance(parsed, list) and len(parsed) > 0:
                resolved_embeddings = parsed
        except Exception:
            pass  # malformed JSON — fall through to in-memory

    if resolved_embeddings is None:
        if userId not in db_embeddings:
            raise HTTPException(
                status_code=404,
                detail="User not found or not enrolled. Voice data missing — please re-enroll."
            )
        resolved_embeddings = db_embeddings[userId]

    # --- Extract features from the submitted audio ---
    try:
        content = await file.read()
        new_embedding = extract_mfcc(content)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing file: {str(e)}")

    # --- Compare against every stored sample, keep max similarity ---
    stored_np = [np.array(emb) for emb in resolved_embeddings]
    similarities = [calculate_similarity(s, new_embedding) for s in stored_np]
    max_similarity = max(similarities) if similarities else 0.0

    # --- Adaptive threshold ---
    threshold = calculate_adaptive_threshold(resolved_embeddings)
    is_authenticated = max_similarity >= threshold

    return {
        "success": True,
        "userId": userId,
        "similarity_score": round(max_similarity, 4),
        "authenticated": bool(is_authenticated),
        "threshold_used": round(threshold, 4),
        "samples_compared": len(stored_np),
        "individual_scores": [round(float(s), 4) for s in similarities]
    }
