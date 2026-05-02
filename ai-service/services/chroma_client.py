import chromadb
from sentence_transformers import SentenceTransformer
import os

class ChromaRAG:
    def __init__(self):
        # 1. Initialize Persistent ChromaDB Client 
        self.client = chromadb.PersistentClient(path="./chroma_data")
        self.collection = self.client.get_or_create_collection(name="risk_knowledge")
        
        # 2. Load the Embedding Model 
        # Using a standard lightweight model from sentence-transformers
        self.model = SentenceTransformer('all-MiniLM-L6-v2')

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
        Day 5 core task: Load, chunk, embed, and store.
        """
        if not os.path.exists(file_path):
            print(f"File not found: {file_path}")
            return

        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # 3. Chunk the document 
        chunks = self.chunk_text(content)

        # 4. Generate Embeddings using sentence-transformers 
        embeddings = self.model.encode(chunks).tolist()
        
        # 5. Store in ChromaDB 
        ids = [f"{os.path.basename(file_path)}_{i}" for i in range(len(chunks))]
        self.collection.add(
            documents=chunks,
            embeddings=embeddings,
            ids=ids
        )
        print(f"Successfully stored {len(chunks)} chunks from {file_path}")

# Initialize the global client
chroma_rag = ChromaRAG()