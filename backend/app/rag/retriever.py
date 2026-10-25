from app.providers.embedding import generate_embedding
from app.rag.chroma import collection


def retrieve(
    query: str,
    n_results: int = 5,
) -> tuple[list[str], list[dict], list[float | None]]:
    """Return aligned document text, source metadata, and distances."""
    normalized_query = query.strip()
    if not normalized_query:
        return [], [], []

    if n_results < 1:
        raise ValueError("n_results must be at least 1.")

    # Bound remote retrieval and avoid asking Chroma for more rows than exist.
    result_limit = min(n_results, 10)
    document_count = collection.count()
    if document_count < 1:
        return [], [], []
    result_limit = min(result_limit, document_count)

    query_embedding = generate_embedding(normalized_query)
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=result_limit,
        include=["documents", "metadatas", "distances"],
    )

    document_groups = results.get("documents") or []
    metadata_groups = results.get("metadatas") or []
    distance_groups = results.get("distances") or []

    chunks = document_groups[0] if document_groups else []
    sources = metadata_groups[0] if metadata_groups else []
    distances = distance_groups[0] if distance_groups else []

    valid_chunks: list[str] = []
    valid_sources: list[dict] = []
    valid_distances: list[float | None] = []

    for index, chunk in enumerate(chunks):
        if not isinstance(chunk, str) or not chunk.strip():
            continue

        source = sources[index] if index < len(sources) else None
        distance = distances[index] if index < len(distances) else None

        valid_chunks.append(chunk.strip())
        valid_sources.append(source if isinstance(source, dict) else {})

        try:
            numeric_distance = float(distance)
        except (TypeError, ValueError):
            numeric_distance = None

        valid_distances.append(
            numeric_distance
            if numeric_distance is not None and numeric_distance >= 0
            else None
        )

    return valid_chunks, valid_sources, valid_distances
