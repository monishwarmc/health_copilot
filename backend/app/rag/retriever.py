from app.rag.chroma import collection


def retrieve(
    query: str,
    n_results: int = 5,
):
    results = collection.query(
        query_texts=[query],
        n_results=n_results,
    )

    chunks = results["documents"][0] or []
    sources = results["metadatas"][0] or []
    distances = results["distances"][0] or []

    return chunks, sources, distances