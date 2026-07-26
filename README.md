# 🩺 HealthCopilot

An AI-powered health assistant that helps users manage their health through intelligent conversations, personalized recommendations, and health tracking.

HealthCopilot combines modern AI with a scalable full-stack architecture to provide a secure and personalized healthcare experience.

---

## Features

### Authentication

- Local Email & Password Authentication
- Google Sign-In
- JWT Authentication
- Email Verification
- Protected Routes
- User Profile

### AI Chat

- AI Health Assistant
- Conversation History
- Context-Aware Responses
- Health Guidance

### Health Tracking

- Weight Tracking
- Nutrition Tracking
- Workout Tracking
- User Profile Management

---

# Tech Stack

## Frontend

- Next.js (App Router)
- TypeScript
- Material UI
- React Hook Form
- Zod
- Axios

## Backend

- FastAPI
- SQLAlchemy
- PostgreSQL
- Alembic
- JWT Authentication
- Google OAuth
- Jinja2 Email Templates

## AI

- LangChain
- ChromaDB
- Sentence Transformers
- Ollama / LLM Support

---

# Project Structure

```
HealthCopilot/
│
├── frontend/          # Next.js Frontend
│
├── backend/           # FastAPI Backend
│
└── ai_healthcopilot/  # AI Modules & Vector Database
```

---

# Screenshots

> Screenshots will be added later.

---

# Getting Started

## Clone Repository

```bash
git clone https://github.com/<your-username>/health_copilot.git

cd health_copilot
```

---

# Backend Setup

```bash
cd backend

python -m venv .venv
```

Linux/macOS

```bash
source .venv/bin/activate
```

Windows

```bash
.venv\Scripts\activate
```

Install dependencies

```bash
pip install -r requirements.txt
```

Create a `.env`

```env
DATABASE_URL=

SECRET_KEY=

ALGORITHM=HS256

ACCESS_TOKEN_EXPIRE_MINUTES=30

GOOGLE_CLIENT_ID=

GOOGLE_CLIENT_SECRET=

SMTP_HOST=

SMTP_PORT=

SMTP_USERNAME=

SMTP_PASSWORD=

EMAIL_FROM=

FRONTEND_URL=http://localhost:3000
```

Run migrations

```bash
alembic upgrade head
```

Start server

```bash
uvicorn app.main:app --reload
```

Backend

```
http://localhost:8000
```

Swagger

```
http://localhost:8000/docs
```

---

# Frontend Setup

```bash
cd frontend

npm install
```

Create

```
.env.local
```

```env
NEXT_PUBLIC_API_URL=http://localhost:8000

NEXT_PUBLIC_GOOGLE_CLIENT_ID=
```

Run

```bash
npm run dev
```

Frontend

```
http://localhost:3000
```

---

# AI Module Setup

```bash
cd ai_healthcopilot

pip install -r requirements.txt
```

Configure your preferred LLM provider and embedding model before running the AI services.

---

# Authentication Flow

```
Register
    │
    ▼
Verification Email
    │
    ▼
Verify Email
    │
    ▼
Login
    │
    ▼
JWT Token
    │
    ▼
Protected APIs
```

---

# API Overview

## Authentication

```
POST   /auth/register
POST   /auth/login
POST   /auth/google
POST   /auth/verify-email
GET    /auth/me
```

---

# Development Roadmap

## Authentication

- ✅ Local Login
- ✅ Google Login
- ✅ Email Verification
- ⏳ Forgot Password
- ⏳ Reset Password
- ⏳ Refresh Token

---

## User

- ✅ Profile
- ⏳ Profile Image
- ⏳ Preferences

---

## AI

- ✅ AI Chat
- ⏳ Memory
- ⏳ Streaming Responses
- ⏳ Voice Chat

---

## Health

- ⏳ Weight Analytics
- ⏳ Nutrition Analysis
- ⏳ Workout Recommendations

---

# Architecture

```
Next.js
     │
     ▼
 FastAPI API
     │
     ▼
 Service Layer
     │
     ▼
 Repository Layer
     │
     ▼
 PostgreSQL
```

---

# Security

- JWT Authentication
- Password Hashing (bcrypt)
- Email Verification
- Google OAuth
- Protected Routes
- Request Validation
- SQLAlchemy ORM
- CORS Protection

---

# License

This project is licensed under the MIT License.

---

# Author

**Monishwar M C**

Mechanical Engineer → AI Engineer

GitHub:
https://github.com/monishwarmc

Portfolio:
https://monishwar-m-c.vercel.app