# Health Copilot — Backend

Backend service for **Health Copilot**, an AI-powered health and nutrition application.

The backend is built with **FastAPI** and provides REST APIs for authentication, user profiles, nutrition tracking, weight tracking, and an AI-powered health chat system using Retrieval-Augmented Generation (RAG).

---

## Features

- User registration and authentication
- Email verification
- Password reset
- JWT-based authentication
- User profile management
- Health and body-profile information
- Nutrition logging
- Nutrition history and tracking
- Weight tracking
- AI health assistant
- Conversation and message persistence
- Retrieval-Augmented Generation (RAG)
- Vector search using Chroma
- Sentence-transformer embeddings
- Gemini-powered response generation
- CORS support for the frontend
- PostgreSQL database
- SQLAlchemy ORM
- Alembic database migrations
- Structured application architecture
- Email templates for authentication workflows

---

## Tech Stack

### Backend

- Python
- FastAPI
- Uvicorn
- SQLAlchemy
- PostgreSQL
- Alembic
- Pydantic

### Authentication & Security

- JWT authentication
- Password hashing
- Email verification
- Password reset
- OAuth-related user fields

### AI / RAG

- Google Gemini API
- Chroma
- Sentence Transformers
- `all-MiniLM-L6-v2`
- Retrieval-Augmented Generation (RAG)

### Email

- HTML email templates
- Verification emails
- Password reset emails
- Welcome emails

---

## Project Structure

```text
backend/
├── alembic.ini
│
├── app/
│   │
│   ├── api/
│   │   ├── auth.py
│   │   ├── chat.py
│   │   ├── nutrition.py
│   │   ├── profile.py
│   │   └── weight.py
│   │
│   ├── core/
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── logging.py
│   │   └── security.py
│   │
│   ├── dependencies.py
│   │
│   ├── exceptions/
│   │   ├── auth.py
│   │   ├── base.py
│   │   ├── nutrition.py
│   │   └── weight.py
│   │
│   ├── models/
│   │   ├── chat.py
│   │   ├── enums.py
│   │   ├── nutrition.py
│   │   ├── user.py
│   │   └── weight.py
│   │
│   ├── providers/
│   │   └── nutrition.py
│   │
│   ├── rag/
│   │   ├── chroma.py
│   │   ├── context.py
│   │   ├── llm.py
│   │   └── retriever.py
│   │
│   ├── repositories/
│   │   ├── chat_repository.py
│   │   ├── nutrition_repository.py
│   │   ├── profile_repository.py
│   │   ├── user_repository.py
│   │   └── weight_repository.py
│   │
│   ├── schemas/
│   │   ├── auth.py
│   │   ├── chat.py
│   │   ├── nutrition.py
│   │   ├── profile.py
│   │   ├── user.py
│   │   └── weight.py
│   │
│   ├── services/
│   │   ├── auth_service.py
│   │   ├── chat_action_service.py
│   │   ├── chat_context_service.py
│   │   ├── chat_service.py
│   │   ├── email_service.py
│   │   ├── nutrition_service.py
│   │   ├── profile_service.py
│   │   └── weight_service.py
│   │
│   ├── templates/
│   │   └── emails/
│   │       ├── base.html
│   │       ├── reset_password.html
│   │       ├── verify_email.html
│   │       └── welcome.html
│   │
│   └── utils/
│       ├── datetime.py
│       ├── email.py
│       └── validators.py
│
├── requirements.txt
├── package.json
├── bun.lock
├── README.md
└── alembic/