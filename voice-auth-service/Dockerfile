# Use Python 3.12 base image
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install system dependencies for librosa and opencv
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port (default FastAPI/Uvicorn is 8000)
EXPOSE 8000

# Start the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
