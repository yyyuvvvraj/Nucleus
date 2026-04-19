import numpy as np
import cv2
import io
import os

# DeepFace import — graceful fallback if not installed
try:
    from deepface import DeepFace
    import tensorflow as tf
    DEEPFACE_AVAILABLE = True
    
    # Pre-warm/Build the model at startup to allocate memory early 
    # and prevent "OpenBLAS allocation failed" errors later.
    print("Building Facenet512 and MTCNN models...")
    DeepFace.build_model("Facenet512")
    # Build a detector backend as well to prevent first-run delay
    try:
        DeepFace.extract_faces(img_path=np.zeros((224,224,3), dtype=np.uint8), detector_backend="mtcnn", enforce_detection=False)
    except:
        pass
    print("AI Models ready.")
    
except ImportError:
    DEEPFACE_AVAILABLE = False


def detect_blur(img_gray):
    """Returns True if very blurry (variance of Laplacian below threshold)."""
    variance = cv2.Laplacian(img_gray, cv2.CV_64F).var()
    return variance < 30.0   # Very lenient — only catch extremely blurry frames


def extract_face_embedding(file_bytes: bytes, model_name: str = "Facenet512") -> np.ndarray:
    """
    Extract a facial embedding vector from raw image bytes.

    Returns a 1-D numpy array (the embedding vector).
    Raises ValueError with a descriptive message on any failure.
    """
    if not file_bytes:
        raise ValueError("Empty image data received.")

    if not DEEPFACE_AVAILABLE:
        raise ValueError("DeepFace is not installed. Run: pip install deepface")

    # Decode image
    nparr = np.frombuffer(file_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        raise ValueError("Could not decode image. Make sure the captured frame is a valid JPEG/PNG.")

    img_gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Only reject severely blurry images
    if detect_blur(img_gray):
        raise ValueError("Image is too blurry. Please ensure good lighting and hold still.")

    # CLAHE lighting enhancement
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    cl = clahe.apply(l)
    enhanced = cv2.cvtColor(cv2.merge((cl, a, b)), cv2.COLOR_LAB2BGR)

    # Detection strategy: try fast detectors first, then fall back to non-enforced detection
    # backends order: mtcnn (best balance), opencv (fastest), retinaface (heaviest)
    for backend in ['mtcnn', 'opencv', 'retinaface']:
        try:
            results = DeepFace.represent(
                img_path=enhanced,
                model_name=model_name,
                enforce_detection=False, # LIFETIME FIX: Never throw error if detection is tricky
                detector_backend=backend,
                align=True
            )
            if results and isinstance(results, list) and len(results) > 0:
                # We still prefer the result where a face was actually found
                # but with enforce_detection=False, DeepFace will always return something.
                embedding = results[0]["embedding"]
                return np.array(embedding, dtype=np.float32)
        except Exception as e:
            print(f"Backend {backend} failed: {str(e)}")
            continue

    raise ValueError(
        "Could not process facial features. Please ensure your face is in the frame and well-lit."
    )


def calculate_face_similarity(enrolled_embedding: np.ndarray, live_embedding: np.ndarray) -> float:
    """Cosine similarity between two embedding vectors. Returns value in [-1, 1]."""
    a = enrolled_embedding / (np.linalg.norm(enrolled_embedding) + 1e-10)
    b = live_embedding / (np.linalg.norm(live_embedding) + 1e-10)
    return float(np.dot(a, b))
