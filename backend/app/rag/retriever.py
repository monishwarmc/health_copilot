from app.rag.chroma import collection
from app.providers.embedding import generate_embedding


def retrieve(
    query: str,
    n_results: int = 5,
):
    """
    Generate an embedding for the query and retrieve
    relevant documents from ChromaDB.

    Returns:
        chunks: list[str]
        sources: list[dict]
        distances: list[float]
    """

    # ========================================================
    # GENERATE QUERY EMBEDDING
    # ========================================================

    query_embedding = generate_embedding(
        query
    )

    # ========================================================
    # QUERY CHROMA
    # ========================================================

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=n_results,
    )

    # ========================================================
    # EXTRACT RESULTS
    # ========================================================

    chunks = (
        results.get("documents") or [[]]
    )[0]

    sources = (
        results.get("metadatas") or [[]]
    )[0]

    distances = (
        results.get("distances") or [[]]
    )[0]

    # ========================================================
    # SAFETY
    # ========================================================

    if not chunks:
        return [], [], []

    return (
        chunks,
        sources,
        distances,
    )