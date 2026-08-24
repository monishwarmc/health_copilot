import chromadb

from chromadb.utils.embedding_functions import (
    SentenceTransformerEmbeddingFunction
)

from app.core.config import settings


chroma_client = chromadb.CloudClient(
    api_key=settings.CHROMA_API_KEY,
    tenant=settings.CHROMA_TENANT,
    database=settings.CHROMA_DATABASE,
)


embedding_function = SentenceTransformerEmbeddingFunction(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)


collection = chroma_client.get_collection(
    name="health_copilot_v4",
)