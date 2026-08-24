import chromadb

from app.core.config import settings


chroma_client = chromadb.CloudClient(
    api_key=settings.CHROMA_API_KEY,
    tenant=settings.CHROMA_TENANT,
    database=settings.CHROMA_DATABASE,
)


collection = chroma_client.get_collection(
    name="health_copilot_v4",
)