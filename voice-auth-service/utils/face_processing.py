import numpy as np
import cv2
import io
from deepface import DeepFace

def extract_face_embedding(file_bytes: bytes, model_name="Facenet512") -> np.ndarray:
    """
    Load an image from bytes, detect the face, and extract a robust facial embedding.
    Using Facenet512 provides a 512-dimensional vector which differentiates faces securely.
    """
    # Convert bytes to a numpy array suitable for cv2
    nparr = np.frombuffer(file_bytes, np.uint8)
    
    # Decode image to numpy array representation
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img is None:
        raise ValueError("Invalid image format or corrupted file.")
        
    try:
        # DeepFace represent extracts the embedding vector.
        # We enforce detection so it throws an error if no face is found.
        # It handles alignment automatically.
        embedding_objs = DeepFace.represent(
            img_path=img, 
            model_name=model_name, 
            enforce_detection=True
        )
        
        if not embedding_objs:
            raise ValueError("No face detected in the image.")
            
        # Extract the embedding list for the primary detected face
        embedding = embedding_objs[0]["embedding"]
        return np.array(embedding)
        
    except ValueError as e:
        # Pass through specific errors from DeepFace (e.g. "Face could not be detected")
        if "Face could not be detected" in str(e):
            raise ValueError("Could not clearly detect a face. Please ensure good lighting and look directly at the camera.")
        raise ValueError(str(e))
    except Exception as e:
        raise ValueError(f"Face processing error: {str(e)}")
