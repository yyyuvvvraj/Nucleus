from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import numpy as np
import json
import os

from utils.audio_processing import extract_mfcc, transcribe_audio, verify_text_match
from utils.face_processing import extract_face_embedding, calculate_face_similarity
from utils.similarity import calculate_similarity
from utils.liveness import verify_liveness_action

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


@app.get("/health")
async def health():
    return {"status": "ok", "service": "voice-service"}


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
    synthetic_detected = False
    
    for file in files:
        if not file.filename:
            continue
        try:
            content = await file.read()
            result = extract_mfcc(content)
            embeddings.append(result["embedding"].tolist())
            if result["is_synthetic"]:
                synthetic_detected = True
        except Exception as e:
            print(f"ERROR in /voice/enroll for user {userId}: {str(e)}")
            raise HTTPException(
                status_code=400,
                detail=f"Error processing file {file.filename}: {str(e)}"
            )

    if not embeddings:
        raise HTTPException(status_code=400, detail="Failed to extract features.")

    # Store in-memory for same-session fallback
    db_embeddings[userId] = embeddings
    threshold = calculate_adaptive_threshold(embeddings)

    return {
        "success": True,
        "message": "Voice enrolled successfully.",
        "userId": userId,
        "sample_count": len(embeddings),
        "adaptive_threshold": round(threshold, 4),
        "embedding": embeddings,
        "security_check": {
            "synthetic_voice_detected": synthetic_detected
        }
    }


@app.post("/voice/verify")
async def verify_voice(
    userId: str = Form(...),
    file: UploadFile = File(...),
    stored_embeddings: Optional[str] = Form(None),
    expected_text: Optional[str] = Form(None),
):
    resolved_embeddings = None
    if stored_embeddings:
        try:
            parsed = json.loads(stored_embeddings)
            if parsed and isinstance(parsed, list) and len(parsed) > 0:
                resolved_embeddings = parsed
        except Exception:
            pass

    if resolved_embeddings is None:
        if userId not in db_embeddings:
            raise HTTPException(status_code=404, detail="User not found.")
        resolved_embeddings = db_embeddings[userId]

    try:
        content = await file.read()
        result = extract_mfcc(content)
        new_embedding = result["embedding"]
        is_synthetic = result["is_synthetic"]
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    stored_np = [np.array(emb) for emb in resolved_embeddings]
    
    if stored_np and stored_np[0].shape != new_embedding.shape:
        raise HTTPException(status_code=400, detail="Voice ID out of date. Please re-enroll.")

    similarities = [calculate_similarity(s, new_embedding) for s in stored_np]
    max_similarity = max(similarities) if similarities else 0.0
    threshold = calculate_adaptive_threshold(resolved_embeddings)
    
    # Security Policy: Synthetic voice instantly fails verification
    is_authenticated = (max_similarity >= threshold) and not is_synthetic

    # Content verification
    stt_verified = True
    transcription = ""
    if expected_text:
        transcription = transcribe_audio(content)
        stt_verified = verify_text_match(expected_text, transcription)
        if not stt_verified:
            is_authenticated = False

    return {
        "success": True,
        "userId": userId,
        "similarity_score": round(max_similarity, 4),
        "authenticated": bool(is_authenticated),
        "threshold_used": round(threshold, 4),
        "security_alerts": {
            "synthetic_voice": is_synthetic,
            "stt_mismatch": not stt_verified
        },
        "individual_scores": [round(float(s), 4) for s in similarities],
        "transcription": transcription,
        "expected_text": expected_text
    }


@app.post("/face/enroll")
async def enroll_face(
    userId: str = Form(...),
    files: List[UploadFile] = File(...),
):
    """
    Enroll a face: extract embeddings from multiple images (different angles)
    and return the averaged vector to be stored in MongoDB.
    """
    if not files:
        raise HTTPException(status_code=400, detail="No images provided.")

    os.makedirs("face_images", exist_ok=True)
    embeddings = []

    for file in files:
        try:
            content = await file.read()
            if not content:
                continue

            # Save each angle for reference
            clean_filename = file.filename.replace(" ", "_") if file.filename else "face.jpg"
            save_path = f"face_images/{userId}_{clean_filename}"
            with open(save_path, "wb") as f:
                f.write(content)

            # Extract embedding (now returns plain np.ndarray)
            emb = extract_face_embedding(content, model_name="Facenet512")
            embeddings.append(emb)
        except Exception as e:
            # If one angle fails but others pass, we might still proceed,
            # but usually it's better to fail fast for enrollment.
            raise HTTPException(status_code=400, detail=f"Error processing {file.filename}: {str(e)}")

    if not embeddings:
        raise HTTPException(status_code=400, detail="Failed to extract features from any image.")

    # Average the embeddings for a robust profile
    averaged_embedding = np.mean(embeddings, axis=0)
    
    # Normalize the averaged vector
    averaged_embedding = averaged_embedding / (np.linalg.norm(averaged_embedding) + 1e-10)

    return {
        "success": True,
        "message": f"Face enrolled successfully with {len(embeddings)} angles.",
        "userId": userId,
        "embedding": averaged_embedding.tolist(),
        "embedding_dim": int(averaged_embedding.shape[0]),
        "threshold": 0.70
    }


@app.post("/face/verify")
async def verify_face(
    userId: str = Form(...),
    file: UploadFile = File(...),
    stored_embedding: str = Form(...),   # JSON array (flat vector) from MongoDB
    expected_action: Optional[str] = Form(None),
):
    """
    Verify a live face snapshot against the enrolled facial embedding.
    """
    try:
        enrolled_emb = np.array(json.loads(stored_embedding), dtype=np.float32)
        if enrolled_emb.size == 0:
            raise HTTPException(status_code=400, detail="Stored embedding is empty. Please re-enroll your face.")

        content = await file.read()
        if not content:
            raise HTTPException(status_code=400, detail="No image data received for verification.")

        # extract_face_embedding returns a plain np.ndarray
        live_emb = extract_face_embedding(content, model_name="Facenet512")

        # Cosine similarity via the dedicated helper
        similarity = calculate_face_similarity(enrolled_emb, live_emb)

        threshold = 0.70   # Slightly relaxed from 0.75 to handle lighting/angle variation
        is_authenticated = similarity >= threshold

        # Liveness check (optional — skipped if no expected_action provided)
        liveness_verified = True
        liveness_msg = "Liveness check skipped (no challenge)"
        if expected_action:
            liveness_verified, liveness_msg = verify_liveness_action(content, expected_action)
            if not liveness_verified:
                is_authenticated = False

        return {
            "success": True,
            "userId": userId,
            "similarity_score": round(float(similarity), 4),
            "authenticated": bool(is_authenticated),
            "threshold_used": threshold,
            "liveness_verified": liveness_verified,
            "liveness_message": liveness_msg,
            "expected_action": expected_action or "none"
        }
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error during face verification: {str(e)}")



