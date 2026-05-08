FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Remove any existing chroma data to start fresh in container
RUN rm -rf /app/chroma_data

EXPOSE 5000

CMD ["python", "app.py"]