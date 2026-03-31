#!/usr/bin/env python3
"""
Quick automated test of the voice authentication API.
Enrolls 'user1' and then verifies with both genuine and impostor samples.
"""

import requests
import os

BASE_URL = "http://localhost:8000"

def enroll_user(user_id, file_paths):
    """Enroll user with multiple voice samples"""
    print(f"\n{'='*60}")
    print(f"ENROLLING: {user_id}")
    print(f"Files: {len(file_paths)}")
    print(f"{'='*60}")

    files = [("files", open(f, "rb")) for f in file_paths]
    data = {"userId": user_id}

    try:
        resp = requests.post(f"{BASE_URL}/voice/enroll", files=files, data=data)
        print(f"Status: {resp.status_code}")
        result = resp.json()
        print(f"Response: {result}")
        return result.get("success", False)
    finally:
        for _, f in files:
            f.close()

def verify_user(user_id, file_path, expected_match=True):
    """Verify user with a voice sample"""
    print(f"\n{'='*60}")
    print(f"VERIFYING: {user_id}")
    print(f"File: {os.path.basename(file_path)}")
    print(f"Expected: {'MATCH' if expected_match else 'IMPOSTOR'}")
    print(f"{'='*60}")

    files = [("file", open(file_path, "rb"))]
    data = {"userId": user_id}

    try:
        resp = requests.post(f"{BASE_URL}/voice/verify", files=files, data=data)
        print(f"Status: {resp.status_code}")
        result = resp.json()
        print(f"Response: {result}")

        authenticated = result.get("authenticated", False)
        similarity = result.get("similarity_score", 0)

        print(f"\nResult:")
        print(f"  Authenticated: {authenticated}")
        print(f"  Similarity: {similarity:.4f}")
        print(f"  Threshold: {result.get('threshold_used', 'N/A')}")

        if expected_match:
            if authenticated:
                print("  ✓ CORRECT: Genuine user authenticated")
            else:
                print("  ✗ UNEXPECTED: Genuine user rejected")
        else:
            if not authenticated:
                print("  ✓ CORRECT: Impostor rejected")
            else:
                print("  ✗ UNEXPECTED: Impostor accepted")

        return authenticated == expected_match
    finally:
        files[0][1].close()

def main():
    test_dir = "test_audio_files"

    # Enrollment files for user1
    user1_files = [
        os.path.join(test_dir, f"user1_sample{i}.wav")
        for i in range(1, 6)
    ]

    # Check all files exist
    missing = [f for f in user1_files if not os.path.exists(f)]
    if missing:
        print(f"Error: Missing test files: {missing}")
        print("Run generate_test_audio.py first!")
        return

    # Step 1: Enroll user1
    success = enroll_user("user1", user1_files)
    if not success:
        print("Enrollment failed. Exiting.")
        return

    # Step 2: Verify user1 with genuine sample (should pass)
    verify_user("user1", os.path.join(test_dir, "user1_verify.wav"), expected_match=True)

    # Step 3: Verify user1 with impostor sample (should fail)
    verify_user("user1", os.path.join(test_dir, "impostor_verify.wav"), expected_match=False)

    # Step 4: Verify user2 (not enrolled, should fail)
    print(f"\n{'='*60}")
    print("TESTING: Unenrolled user 'user2'")
    print(f"{'='*60}")
    try:
        resp = requests.post(
            f"{BASE_URL}/voice/verify",
            files=[("file", open(os.path.join(test_dir, "user2_verify.wav"), "rb"))],
            data={"userId": "user2"}
        )
        print(f"Status: {resp.status_code}")
        print(f"Response: {resp.json()}")
    except Exception as e:
        print(f"Error: {e}")

    print("\n" + "="*60)
    print("QUICK TEST COMPLETE")
    print("="*60)

if __name__ == "__main__":
    # Check if server is running
    try:
        resp = requests.get(BASE_URL)
        print(f"Server is running at {BASE_URL}")
    except:
        print(f"ERROR: Server not reachable at {BASE_URL}")
        print("Please start the server first:")
        print("  cd voice-auth-service")
        print("  source venv/bin/activate")
        print("  uvicorn main:app --reload")
        sys.exit(1)

    main()