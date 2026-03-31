# Setting Up Virtual Environment for Voice Auth Service

Due to macOS Python restrictions, you need to create a virtual environment.

## Option 1: Using venv (Recommended)

```bash
# Navigate to voice-auth-service directory
cd /Users/yyyuvvvraj/Developer/VS Code/Nucleus/Nucleus/voice-auth-service

# Create virtual environment
python3 -m venv venv

# Activate it
source venv/bin/activate

# Install requirements
pip install -r requirements.txt

# To deactivate when done
deactivate
```

## Option 2: Using pipx (if installed)

```bash
pipx install pipx  # if not already installed
pipx install -r requirements.txt
```

## Option 3: Using --break-system-packages (Not Recommended)

```bash
pip install --break-system-packages -r requirements.txt
```

## Running the Service

After setting up virtual environment:

```bash
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Testing the Service

```bash
# In another terminal
curl -X POST "http://localhost:8000/voice/enroll" \
  -F "userId=testuser" \
  -F "files=@path/to/sample1.wav" \
  -F "files=@path/to/sample2.wav"

curl -X POST "http://localhost:8000/voice/verify" \
  -F "userId=testuser" \
  -F "file=@path/to/test.wav"
```

## Important Notes

1. **Always activate the venv** before running/installing:
   ```bash
   source venv/bin/activate
   ```

2. **Never commit the venv directory** to git - it's already in .gitignore

3. **To update requirements** later:
   ```bash
   source venv/bin/activate
   pip install -r requirements.txt
   ```

4. **Check if venv is active**: Your prompt should show `(venv)` when activated