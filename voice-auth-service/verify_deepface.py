from deepface import DeepFace
import numpy as np
import cv2
import os

def test_deepface():
    print("Testing DeepFace...")
    try:
        # Create a dummy image (black square)
        img = np.zeros((224, 224, 3), dtype=np.uint8)
        # DeepFace might fail on a black image if it enforces detection, 
        # but let's see if the library loads and the call works.
        try:
            objs = DeepFace.represent(img, model_name="Facenet512", enforce_detection=False)
            print("DeepFace.represent successful (enforce_detection=False)")
            print(f"Embedding size: {len(objs[0]['embedding'])}")
        except Exception as e:
            print(f"DeepFace.represent failed: {e}")
            
    except Exception as e:
        print(f"DeepFace load failed: {e}")

if __name__ == "__main__":
    test_deepface()
