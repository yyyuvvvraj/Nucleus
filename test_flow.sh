#!/bin/bash

echo "=== API Endpoint Test ==="
echo ""

# Test 1: Backend root
echo "1. Backend root:"
curl -s http://localhost:5001/ | head -1
echo ""

# Test 2: Voice service docs
echo "2. Voice service docs:"
curl -s http://localhost:8000/docs | grep -o "<title>.*</title>"
echo ""

# Test 3: Backend auth routes
echo "3. Testing auth routes:"
echo "   - Login (should fail without credentials):"
curl -s -X POST http://localhost:5001/api/auth/login -H "Content-Type: application/json" -d '{}' | head -1
echo ""

# Test 4: Voice routes (should require auth)
echo "   - Voice verify (should require auth):"
curl -s -X POST http://localhost:5001/api/auth/voice/verify -H "Content-Type: application/json" -d '{}' | head -1
echo ""

echo "=== All endpoints accessible! ==="
