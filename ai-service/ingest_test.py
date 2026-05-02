from services.chroma_client import chroma_rag
import os
sample_doc = "docs/risk_knowledge.txt"

if __name__ == "__main__":
    if os.path.exists(sample_doc):
        chroma_rag.ingest_document(sample_doc)
    else:
        print("Please create a 'docs' folder and add a .txt file to test.")