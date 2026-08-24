import httpx

from app.core.config import settings


MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

HF_URL = (
    "https://router.huggingface.co/"
    "hf-inference/models/"
    f"{MODEL_NAME}/pipeline/feature-extraction"
)


def generate_embedding(text: str) -> list[float]:

    if not text.strip():
        raise ValueError(
            "Cannot generate embedding for empty text."
        )

    headers = {
        "Authorization": (
            f"Bearer {settings.HF_TOKEN}"
        ),
        "Content-Type": "application/json",
    }

    payload = {
        "inputs": text,
    }

    response = httpx.post(
        HF_URL,
        headers=headers,
        json=payload,
        timeout=60.0,
    )

    response.raise_for_status()

    embedding = response.json()

    # Hugging Face may return a token-level
    # feature matrix. Convert it to a sentence
    # embedding using mean pooling.

    if (
        isinstance(embedding, list)
        and embedding
        and isinstance(embedding[0], list)
    ):

        # Already sentence-level vector
        if isinstance(
            embedding[0][0],
            (int, float),
        ):

            # Determine whether this is:
            # [384]
            # or
            # [tokens][384]

            if len(embedding) == 1:
                return embedding[0]

            # Mean pooling
            dimensions = len(
                embedding[0]
            )

            pooled = [
                sum(
                    token[i]
                    for token in embedding
                )
                / len(embedding)
                for i in range(dimensions)
            ]

            return pooled

    raise ValueError(
        "Unexpected embedding response from Hugging Face."
    )