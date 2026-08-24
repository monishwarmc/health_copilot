# 🩺 Health Copilot

> An AI-powered personal health and fitness assistant built with Next.js, FastAPI, PostgreSQL, RAG, and LLMs.

🌐 **Live Application:**  
https://health-copilot-rouge.vercel.app/

---

## Overview

Health Copilot is a full-stack AI health and fitness application designed to provide users with a personalized place to manage their health information, nutrition, weight, goals, and conversations with an AI health assistant.

The application combines traditional health-management features with an AI/RAG architecture.

Users can:

- Create an account using email/password
- Sign in using Google
- Verify their email
- Manage their personal health profile
- Track weight
- Manage nutrition information
- Chat with an AI health assistant
- Maintain multiple conversations
- Rename and delete conversations
- Review AI-proposed actions
- Explicitly confirm AI actions before execution
- Upload and crop profile pictures
- Manage account security

The project is built as two independent applications:

```text
Health Copilot
│
├── Frontend
│   └── Next.js + TypeScript + Material UI
│
└── Backend
    └── FastAPI + PostgreSQL + SQLAlchemy