import os
import sys

# Set API key before importing app modules
os.environ.setdefault('GROQ_API_KEY', os.getenv('GROQ_API_KEY', 'dummy-key-for-seeding'))

from services.chroma_client import chroma_rag

def seed_documents():
    docs_folder = os.path.join(os.path.dirname(__file__), 'docs')

    if not os.path.exists(docs_folder):
        print("docs/ folder not found!")
        return

    files = [f for f in os.listdir(docs_folder) if f.endswith('.txt')]

    if not files:
        print("No .txt files found in docs/ folder!")
        return

    print(f"Found {len(files)} documents to ingest...")

    for filename in files:
        file_path = os.path.join(docs_folder, filename)
        print(f"Ingesting: {filename}")
        chroma_rag.ingest_document(file_path)

    # Verify ingestion
    count = chroma_rag.collection.count()
    print(f"\nChromaDB now contains {count} chunks total")
    print("Seeding complete!")

if __name__ == '__main__':
    seed_documents()