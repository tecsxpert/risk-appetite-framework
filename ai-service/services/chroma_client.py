import chromadb
from sentence_transformers import SentenceTransformer
import os

# Pre-load model ONCE at startup — not inside the class
# This means model is ready before first request arrives
print("Loading sentence-transformers model at startup...")
_model = SentenceTransformer('all-MiniLM-L6-v2')
print("Model loaded successfully!")

class ChromaRAG:
    def __init__(self):
        # 1. Initialize Persistent ChromaDB Client
        self.client = chromadb.PersistentClient(path="./chroma_data")
        self.collection = self.client.get_or_create_collection(name="risk_knowledge")

        # 2. Reuse pre-loaded model — no reloading on each request
        self.model = _model

    def chunk_text(self, text, size=500, overlap=50):
        """
        Custom chunking logic: 500 characters with 50 character overlap.
        """
        chunks = []
        for i in range(0, len(text), size - overlap):
            chunk = text[i:i + size]
            chunks.append(chunk)
        return chunks

    def ingest_document(self, file_path):
        """
        Load, chunk, embed, and store.
        """
        if not os.path.exists(file_path):
            print(f"File not found: {file_path}")
            return

        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        chunks = self.chunk_text(content)
        embeddings = self.model.encode(chunks).tolist()

        ids = [f"{os.path.basename(file_path)}_{i}" for i in range(len(chunks))]
        self.collection.add(
            documents=chunks,
            embeddings=embeddings,
            ids=ids
        )
        print(f"Stored {len(chunks)} chunks from {file_path}")

# Initialize global client — model already loaded above
chroma_rag = ChromaRAG()