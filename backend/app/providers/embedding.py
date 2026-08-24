import requests

from app.core.config import settings


MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

HF_URL = (
    "https://router.huggingface.co/"
    f"hf-inference/models/{MODEL_NAME}/pipeline/feature-extraction"
)


def get_embedding(text: str) -> list[float]:

    if not text or not text.strip():
        raise ValueError("Cannot create embedding from empty text.")

    headers = {
        "Authorization": f"Bearer {settings.HF_TOKEN}",
        "Content-Type": "application/json",
    }

    payload = {
        "inputs": text,
        "normalize": True,
    }

    response = requests.post(
        HF_URL,
        headers=headers,
        json=payload,
        timeout=30,
    )

    response.raise_for_status()

    data = response.json()

    # --------------------------------------------------------
    # HF feature-extraction returns token embeddings:
    #
    # [
    #     [
    #         [384 values],   # token 1
    #         [384 values],   # token 2
    #         ...
    #     ]
    # ]
    #
    # We need one 384-dimensional sentence embedding.
    # --------------------------------------------------------

    if not isinstance(data, list):
        raise ValueError(
            f"Unexpected embedding response from Hugging Face: "
            f"{type(data).__name__}"
        )

    if not data:
        raise ValueError(
            "Hugging Face returned an empty embedding response."
        )

    # Single sentence:
    #
    # data = [
    #     [token_embedding, token_embedding, ...]
    # ]
    #
    # Take the first sentence.
    token_embeddings = data[0]

    if not isinstance(token_embeddings, list):
        raise ValueError(
            "Unexpected Hugging Face embedding structure."
        )

    if not token_embeddings:
        raise ValueError(
            "Hugging Face returned no token embeddings."
        )

    # --------------------------------------------------------
    # If HF already returned a single vector
    # --------------------------------------------------------

    if isinstance(token_embeddings[0], (int, float)):

        embedding = [
            float(value)
            for value in token_embeddings
        ]

    # --------------------------------------------------------
    # Otherwise mean-pool token embeddings
    # --------------------------------------------------------

    else:

        dimensions = len(token_embeddings[0])

        embedding = [
            sum(
                float(token[i])
                for token in token_embeddings
            ) / len(token_embeddings)
            for i in range(dimensions)
        ]

    # --------------------------------------------------------
    # Validate MiniLM dimension
    # --------------------------------------------------------

    if len(embedding) != 384:
        raise ValueError(
            f"Unexpected embedding dimension: "
            f"{len(embedding)}. Expected 384."
        )

    return embedding