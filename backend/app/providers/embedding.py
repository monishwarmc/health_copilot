import math

import requests

from app.core.config import settings


MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

HF_URL = (
    "https://router.huggingface.co/"
    f"hf-inference/models/{MODEL_NAME}/pipeline/feature-extraction"
)


def _mean_pool(
    token_embeddings: list[list[float]],
) -> list[float]:

    if not token_embeddings:
        raise ValueError(
            "Hugging Face returned empty token embeddings."
        )

    dimensions = len(token_embeddings[0])

    if dimensions == 0:
        raise ValueError(
            "Hugging Face returned zero-dimensional embeddings."
        )

    if any(len(token) != dimensions for token in token_embeddings):
        raise ValueError(
            "Hugging Face returned token embeddings with inconsistent dimensions."
        )

    embedding = []
    for index in range(dimensions):
        values = [float(token[index]) for token in token_embeddings]
        if not all(math.isfinite(value) for value in values):
            raise ValueError("Hugging Face returned a non-finite embedding value.")
        embedding.append(sum(values) / len(values))

    return embedding


def _normalize(
    embedding: list[float],
) -> list[float]:

    magnitude = math.sqrt(
        sum(
            value * value
            for value in embedding
        )
    )

    if magnitude == 0:
        raise ValueError("Hugging Face returned a zero-length embedding.")

    if not math.isfinite(magnitude):
        raise ValueError("Hugging Face returned a non-finite embedding.")

    return [
        value / magnitude
        for value in embedding
    ]


def generate_embedding(
    text: str,
) -> list[float]:

    if not text or not text.strip():
        raise ValueError(
            "Cannot generate embedding for empty text."
        )

    if not settings.HF_TOKEN:
        raise RuntimeError("HF_TOKEN is not configured.")

    headers = {
        "Authorization": (
            f"Bearer {settings.HF_TOKEN}"
        ),
        "Content-Type": "application/json",
    }

    payload = {
        "inputs": text,
    }

    try:
        response = requests.post(
            HF_URL,
            headers=headers,
            json=payload,
            timeout=(5, 30),
        )
        response.raise_for_status()
        data = response.json()
    except requests.RequestException as exc:
        raise RuntimeError("Hugging Face embedding request failed.") from exc
    except ValueError as exc:
        raise RuntimeError("Hugging Face returned invalid JSON.") from exc

    # ========================================================
    # CASE 1
    #
    # Single embedding:
    #
    # [
    #     0.12,
    #     -0.04,
    #     ...
    # ]
    #
    # ========================================================

    if (
        isinstance(data, list)
        and data
        and isinstance(data[0], (int, float))
    ):

        embedding = [
            float(value)
            for value in data
        ]

    # ========================================================
    # CASE 2
    #
    # Multiple/token embeddings:
    #
    # [
    #     [
    #         0.12,
    #         -0.04,
    #         ...
    #     ],
    #     [
    #         ...
    #     ]
    # ]
    #
    # ========================================================

    elif (
        isinstance(data, list)
        and data
        and isinstance(data[0], list)
        and data[0]
        and isinstance(data[0][0], (int, float))
    ):

        embedding = _mean_pool(
            [
                [
                    float(value)
                    for value in token
                ]
                for token in data
            ]
        )

    # ========================================================
    # CASE 3
    #
    # Batched token embeddings:
    #
    # [
    #     [
    #         [
    #             0.12,
    #             -0.04,
    #             ...
    #         ],
    #         ...
    #     ]
    # ]
    #
    # ========================================================

    elif (
        isinstance(data, list)
        and data
        and isinstance(data[0], list)
        and data[0]
        and isinstance(data[0][0], list)
    ):

        token_embeddings = data[0]

        embedding = _mean_pool(
            [
                [
                    float(value)
                    for value in token
                ]
                for token in token_embeddings
            ]
        )

    else:
        raise ValueError(
            "Unexpected Hugging Face embedding structure."
        )

    # ========================================================
    # NORMALIZE
    # ========================================================

    embedding = _normalize(
        embedding
    )

    # ========================================================
    # VALIDATE
    # ========================================================

    if len(embedding) != 384:

        raise ValueError(
            "Unexpected embedding dimension: "
            f"{len(embedding)}. "
            "Expected 384."
        )

    if not all(math.isfinite(value) for value in embedding):
        raise ValueError("Hugging Face returned a non-finite embedding.")

    return embedding
