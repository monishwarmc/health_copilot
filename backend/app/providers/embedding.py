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

    embedding = [
        sum(
            float(token[i])
            for token in token_embeddings
        ) / len(token_embeddings)
        for i in range(dimensions)
    ]

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
        return embedding

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

    headers = {
        "Authorization": (
            f"Bearer {settings.HF_TOKEN}"
        ),
        "Content-Type": "application/json",
    }

    payload = {
        "inputs": text,
    }

    response = requests.post(
        HF_URL,
        headers=headers,
        json=payload,
        timeout=30,
    )

    response.raise_for_status()

    data = response.json()

    print(
        "\n========== HUGGING FACE EMBEDDING =========="
    )

    print(
        f"Response type: {type(data).__name__}"
    )

    if isinstance(data, list):
        print(
            f"Top-level length: {len(data)}"
        )

        if data:
            print(
                f"First element type: "
                f"{type(data[0]).__name__}"
            )

            if isinstance(data[0], list):
                print(
                    f"First nested length: "
                    f"{len(data[0])}"
                )

    print(
        "=============================================\n"
    )

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

        print(
            "Unexpected Hugging Face response:"
        )

        print(
            repr(data)
        )

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

    return embedding