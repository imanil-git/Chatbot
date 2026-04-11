# Antigravity AI Chatbot

A production-ready full-stack AI chatbot built with LangChain, React, Node.js, and MongoDB. Feature-based frontend and MVC backend architectures.

## Architecture Notes

### Frontend
- React 18 with Vite
- Tailwind CSS
- Feature slice architecture prioritizing modularity
- Streaming tokens using SSE implementation
- Complete dark mode by default with ultra-premium styling

### Backend
- Node.js & Express
- MVC Architecture separating routes, controllers, services, chains, and models
- LangChain's `ConversationChain` wrapped with GPT-4
- Memory tracked per session via MongoDB `Session.model`
- Streaming integration to frontend

## Initial Setup & Bootstrapping

1. Copy `.env.example` to `.env` and fill in your variables:

```bash
cp .env.example .env
```
*(In the resulting .env, insert your valid OPENAI_API_KEY!)*

### Running with Docker Compose (Recommended)

1. Ensure Docker is running.
2. Build and start services:

```bash
docker-compose up --build -d
```
The application will be available at:
- Web UI: http://localhost:80 (or localhost:3000 depending on NGINX flow)
- API endpoint: http://localhost:4000/api

### Running Locally (Without Docker)

You will need MongoDB running locally on port 27017 or use a MongoDB Atlas URI in your .env.

**Backend Setup:**
```bash
cd backend
npm install
npm run dev
```

**Frontend Setup:**
```bash
cd frontend
npm install
npm run dev
```
