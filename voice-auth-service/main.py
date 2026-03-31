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
# Format: { "userId": [float, float, ...] }
# In a real scenario, these embeddings would be returned to your MERN backend and saved in MongoDB.
db_embeddings = {}

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
            mfcc_mean = extract_mfcc(content)
            embeddings.append(mfcc_mean)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error processing file {file.filename}: {str(e)}")
            
    if not embeddings:
         raise HTTPException(status_code=400, detail="Failed to extract features from any audio file.")
         
    # Generate final voice embedding via mean aggregation
    final_embedding = np.mean(embeddings, axis=0)
    
    # Save the aggregated vector permanently (in DB). No raw audio is saved.
    db_embeddings[userId] = final_embedding.tolist()
    
    return {
        "success": True,
        "message": "Voice enrolled successfully.",
        "userId": userId,
        "embedding": db_embeddings[userId]
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
         
    stored_embedding = np.array(db_embeddings[userId])
    
    # Calculate Cosine Similarity
    similarity = calculate_similarity(stored_embedding, new_embedding)
    
    # Check against the matching threshold
    threshold = 0.85
    is_authenticated = similarity > threshold
    
    return {
        "success": True,
        "userId": userId,
        "similarity_score": round(similarity, 4),
        "authenticated": bool(is_authenticated) # Ensuring a native Python boolean is returned
    }
