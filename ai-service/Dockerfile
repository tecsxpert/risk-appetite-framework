# Use the exact Python version required by the tech stack 
FROM python:3.11-slim

# Set the working directory inside the container
WORKDIR /app

# Copy and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# AI service runs on port 5000 [cite: 13]
EXPOSE 5000

# Command to run the application
CMD ["python", "app.py"]