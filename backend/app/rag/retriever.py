from app.providers.embedding import (
    generate_embedding,
)

from app.rag.chroma import collection


def retrieve(
    query: str,
    n_results: int = 5,
):

    embedding = generate_embedding(
        query
    )

    results = collection.query(
        query_embeddings=[embedding],
        n_results=n_results,
    )

    return results