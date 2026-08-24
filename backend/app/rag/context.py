from app.rag.retriever import retrieve


def build_rag_context(
    query: str,
    n_results: int = 1,
) -> str:
    """
    Retrieve relevant health knowledge and format it
    for the LLM context.
    """

    chunks, sources, distances = retrieve(
        query=query,
        n_results=n_results,
    )

    if not chunks:
        return (
            "No relevant health knowledge was found."
        )

    context_parts = []

    for index, (
        chunk,
        source,
        distance,
    ) in enumerate(
        zip(
            chunks,
            sources,
            distances,
        ),
        start=1,
    ):

        source_name = (
            source.get(
                "source",
                "Unknown",
            )
            if source
            else "Unknown"
        )

        context_parts.append(
            f"""
--- KNOWLEDGE RESULT {index} ---

Source:
{source_name}

Relevance distance:
{distance}

Content:
{chunk}
""".strip()
        )

    return "\n\n".join(
        context_parts
    )