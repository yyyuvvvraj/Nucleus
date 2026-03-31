#!/usr/bin/env python3
"""
Enroll Yuvraj's voice samples and run verification tests.
"""

import requests
import os

BASE_URL = "http://localhost:8000"

def enroll_from_folder(user_id, folder_path, pattern="Yuvraj*.wav"):
    """Enroll user with all matching files in folder"""
    import glob
    files = sorted(glob.glob(os.path.join(folder_path, pattern)))
    if not files:
        print(f"No files found matching {pattern} in {folder_path}")
        return None

    print(f"Found {len(files)} files: {[os.path.basename(f) for f in files]}")

    files_data = [("files", open(f, "rb")) for f in files]
    data = {"userId": user_id}

    try:
        resp = requests.post(f"{BASE_URL}/voice/enroll", files=files_data, data=data)
        print(f"\nEnrollment Status: {resp.status_code}")
        print(f"Response: {resp.json()}")
        return resp.json()
    finally:
        for _, f in files_data:
            f.close()

def verify_with_file(user_id, file_path):
    """Verify user with a specific file"""
    print(f"\nVerifying with {os.path.basename(file_path)}:")
    with open(file_path, "rb") as f:
        resp = requests.post(f"{BASE_URL}/voice/verify",
                           files=[("file", f)],
                           data={"userId": user_id})
    print(f"Status: {resp.status_code}")
    result = resp.json()
    print(f"Response: {result}")
    return result

def main():
    folder = "."  # current directory (voice-auth-service)
    user_id = "Yuvraj"

    # Step 1: Enroll
    print("="*60)
    print("ENROLLMENT")
    print("="*60)
    enroll_result = enroll_from_folder(user_id, folder, "Yuvraj*.wav")

    if not enroll_result or not enroll_result.get("success"):
        print("Enrollment failed. Exiting.")
        return

    # Step 2: Test verification with each sample
    print("\n" + "="*60)
    print("VERIFICATION TESTS")
    print("="*60)

    import glob
    files = sorted(glob.glob(os.path.join(folder, "Yuvraj*.wav")))

    for file_path in files:
        result = verify_with_file(user_id, file_path)
        authenticated = result.get("authenticated", False)
        similarity = result.get("similarity_score", 0)
        status = "✓ PASS" if authenticated else "✗ FAIL"
        print(f"  {status} - Similarity: {similarity:.4f}")

    # Step 3: Summary
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    print(f"Enrolled user '{user_id}' with {len(files)} samples")
    print(f"Adaptive threshold: {enroll_result.get('adaptive_threshold')}")
    print("All verification tests completed.")

if __name__ == "__main__":
    # Check server health
    try:
        resp = requests.get(BASE_URL)
        print(f"✓ Server is up at {BASE_URL}\n")
    except:
        print(f"✗ ERROR: Server not running at {BASE_URL}")
        print("  Start it with: uvicorn main:app --reload")
        exit(1)

    main()