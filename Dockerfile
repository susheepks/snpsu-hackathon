FROM mcr.microsoft.com/playwright/python:v1.44.0-jammy

WORKDIR /app

# Copy requirements from the backend folder
COPY backend/requirements.txt .

# Install dependencies and python-multipart
RUN pip install --no-cache-dir -r requirements.txt python-multipart

# Copy the server files from the root
COPY server.py .
COPY transcribe_local.py .

# Create the user_data directory for Playwright
RUN mkdir -p /app/user_data

EXPOSE 8000

# Run the backend
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]
