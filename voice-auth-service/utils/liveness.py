import cv2
import mediapipe as mp
import numpy as np

mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(min_detection_confidence=0.5, min_tracking_confidence=0.5)

# Landmarks indices for EAR
LEFT_EYE = [362, 385, 387, 263, 373, 380]
RIGHT_EYE = [33, 160, 158, 133, 153, 144]

def calculate_ear(landmarks, eye_indices):
    """Calculate Eye Aspect Ratio (EAR)"""
    try:
        # Distance between vertical landmarks
        v1 = np.linalg.norm(np.array(landmarks[eye_indices[1]]) - np.array(landmarks[eye_indices[5]]))
        v2 = np.linalg.norm(np.array(landmarks[eye_indices[2]]) - np.array(landmarks[eye_indices[4]]))
        # Distance between horizontal landmarks
        h = np.linalg.norm(np.array(landmarks[eye_indices[0]]) - np.array(landmarks[eye_indices[3]]))
        return (v1 + v2) / (2.0 * h)
    except:
        return 0.0

def verify_liveness_action(image_bytes, expected_action):
    """
    Detect if the expected action is present in the static image.
    Note: For 'blink', we check if eyes are closed in this specific frame.
    For 'look_left/right', we check the head yaw.
    """
    nparr = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if image is None:
        return False, "Could not decode image"

    rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    results = face_mesh.process(rgb_image)

    if not results.multi_face_landmarks:
        return False, "No face detected for liveness check"

    landmarks = []
    for lm in results.multi_face_landmarks[0].landmark:
        landmarks.append([lm.x, lm.y, lm.z])

    if expected_action == "blink":
        left_ear = calculate_ear(landmarks, LEFT_EYE)
        right_ear = calculate_ear(landmarks, RIGHT_EYE)
        avg_ear = (left_ear + right_ear) / 2.0
        # If EAR is low, eyes are closed
        if avg_ear < 0.22:
            return True, "Blink detected"
        else:
            return False, f"Blink not detected (EAR: {avg_ear:.2f})"

    elif expected_action in ["look_left", "look_right"]:
        # Simple yaw estimation using landmarks 1 (nose tip), 33 (left eye corner), 263 (right eye corner)
        nose_tip = landmarks[1]
        left_eye = landmarks[33]
        right_eye = landmarks[263]
        
        # Calculate ratio of distances to determine yaw
        d_left = np.linalg.norm(np.array(nose_tip) - np.array(left_eye))
        d_right = np.linalg.norm(np.array(nose_tip) - np.array(right_eye))
        
        if expected_action == "look_left" and d_right > d_left * 1.8:
            return True, "Look left detected"
        if expected_action == "look_right" and d_left > d_right * 1.8:
            return True, "Look right detected"
            
        return False, f"Head turn not detected (Ratio: {d_left/d_right:.2f})"

    return True, "Action check skipped"
