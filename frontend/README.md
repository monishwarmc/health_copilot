# Health Copilot — Frontend

Health Copilot is an AI-powered personal health management application built with **Next.js**.

The frontend provides the user interface for authentication, health tracking, nutrition logging, profile management, and AI-powered health conversations.

---

## Features

### Authentication

- User registration
- User login
- Google authentication
- Email verification
- Forgot password
- Password reset
- Protected routes
- Public route handling
- Authentication state management

### Dashboard

The dashboard provides access to the main Health Copilot features:

- Health overview
- AI Chat
- Nutrition
- Weight tracking
- User profile

### AI Chat

The chat interface allows users to interact with the Health Copilot AI.

Features include:

- Chat interface
- Conversation history
- Message rendering
- Chat input
- AI action proposals
- Confirmation-based actions
- Profile updates through chat
- Weight actions through chat
- Nutrition actions through chat

AI actions require user confirmation before modifying health data.

### Nutrition

The nutrition section provides functionality for:

- Viewing nutrition records
- Adding nutrition data
- Managing logged food
- Viewing nutritional information

### Weight Tracking

The weight section provides:

- Add weight measurements
- Weight history
- Weight statistics
- Weight chart visualization

### Profile

Users can manage their health profile, including:

- Personal information
- Profile picture
- Health-related information
- Diet preferences
- Goals
- Activity level

The profile image workflow includes image cropping before upload.

---

# Tech Stack

- **Next.js**
- **React**
- **TypeScript**
- **Material UI**
- **Next.js App Router**
- **Bun / npm**
- **Cloudinary** for profile image handling
- REST API integration with the Health Copilot backend

---

# Project Structure

```text
frontend/
│
├── app/
│   ├── api/
│   │
│   ├── (auth)/
│   │   ├── check-email/
│   │   ├── forgot-password/
│   │   ├── login/
│   │   ├── register/
│   │   ├── reset-password/
│   │   └── verify-email/
│   │
│   ├── (dashboard)/
│   │   ├── chat/
│   │   ├── dashboard/
│   │   ├── nutrition/
│   │   ├── profile/
│   │   └── weight/
│   │
│   ├── globals.css
│   ├── layout.tsx
│   ├── not-found.tsx
│   └── page.tsx
│
├── components/
│   ├── auth/
│   │   ├── ProtectedRoute.tsx
│   │   └── PublicRoute.tsx
│   │
│   ├── chat/
│   │   ├── ChatHistory.tsx
│   │   ├── ChatInput.tsx
│   │   └── ChatMessage.tsx
│   │
│   ├── forms/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   │
│   ├── layout/
│   │   ├── DashboardLayout.tsx
│   │   ├── Navbar.tsx
│   │   └── Sidebar.tsx
│   │
│   ├── profile/
│   │   ├── cropImage.ts
│   │   └── ProfileImageCropper.tsx
│   │
│   ├── ui/
│   │   ├── AuthCard.tsx
│   │   ├── FormTextField.tsx
│   │   ├── GoogleButton.tsx
│   │   ├── Loading.tsx
│   │   ├── Logo.tsx
│   │   ├── PasswordField.tsx
│   │   ├── ThemeProvider.tsx
│   │   └── UnderConstruction.tsx
│   │
│   └── weight/
│       ├── AddWeightForm.tsx
│       ├── WeightChart.tsx
│       └── WeightStatsCard.tsx
│
├── context/
│   └── AuthContext.tsx
│
├── hooks/
│
├── lib/
│   ├── api.ts
│   ├── auth.ts
│   ├── error.ts
│   └── utils.ts
│
├── schemas/
│   └── auth.schema.ts
│
├── services/
│   ├── auth.service.ts
│   ├── chat.service.ts
│   ├── cloudinary.service.ts
│   ├── nutrition.service.ts
│   ├── profile.service.ts
│   └── weight.service.ts
│
├── types/
│   ├── auth.ts
│   ├── chat.ts
│   ├── google.d.ts
│   ├── user.ts
│   └── weight.ts
│
├── public/
│   └── assets/
│       ├── logo.png
│       └── Under-construction.png
│
├── next.config.ts
├── package.json
├── tsconfig.json
├── eslint.config.mjs
└── README.md