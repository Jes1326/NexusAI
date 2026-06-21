# Nexus AI

Nexus AI is a full-stack personal assistant that combines React + Vite frontend with a FastAPI backend, Ollama LLMs, and Mem0 long-term memory.

The assistant uses an agentic pipeline for durable user memory:
- memory retrieval and reranking
- response generation
- fact extraction from user messages
- memory reconciliation and memory consolidation

## What makes this project strong

- **Modular agent pipeline**: separate orchestrator, memory ranker, extractor, and reconciler agents.
- **Memory-driven personalization**: the system stores facts from user inputs and uses them to answer later questions.
- **FastAPI backend with Mem0 memory store**: reusable backend architecture for long-term memory.
- **Modern React frontend**: intuitive chat UI, memory viewer, and settings.
- **Designed for resume/portfolio**: a practical AI assistant implementation with agentic workflow and reusable components.

## Key features

- Chat with a personal AI assistant powered by Ollama.
- Automatic extraction of memory facts from conversation.
- Memory reranking to surface the most relevant context.
- Memory reconciliation to avoid duplicates and correct old facts.
- Memory browsing, search, and manual ingestion UI.
- User session handling via local storage and per-user memory.

## Architecture

- `backend/`
  - `app.py`: FastAPI service exposing chat, memory, and history APIs.
  - `agent.py`: LLM agent builder and prompt helpers.
  - `memory.py`: Mem0 adapter for saving, searching, and updating memories.
  - `history.py`: short-term chat history manager.
  - `config.py`: environment and agent prompt configuration.

- `frontend/`
  - React + Vite SPA with chat, memory, and settings pages.
  - Local user ID storage for multi-user sessions.
  - Axios API client for backend communication.

## Setup

### Backend

1. Navigate into backend directory:

```bash
cd backend
```

2. Create and activate a Python virtual environment:

```bash
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Create `backend/.env` using the example:

```env
MEM0_API_KEY="your_mem0_api_key_here"
OLLAMA_MODEL="llama3.2"
OLLAMA_HOST="http://localhost:11434"
MEM0_USER_ID="your_default_user_id"
```
4. (Optional) Configure the frontend API base URL by creating `frontend/.env` with:

```env
VITE_API_BASE_URL="http://localhost:8000/api"
```
5. Start the backend:

```bash
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend

1. Open a second terminal and navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open the app in the browser at the address shown by Vite.

## Usage

- Visit `/chat` to ask questions and chat with Nexus AI.
- Visit `/memory` to inspect and manage stored memories.
- Visit `/settings` to clear history or memories.

## Notes

- This project uses a local Ollama model host and Mem0 AI memory store.
- The in-memory conversation history is per session and not persisted across server restarts.

## Project improvements made

- Fixed frontend greeting persistence when loading history.
- Added `backend/.env.example` to document required environment variables.

## Why this is resume-worthy

- Demonstrates a complete AI system from UI to backend.
- Shows experience with prompt engineering and agent workflows.
- Implements persistent memory and personalization logic.
- Uses modern JavaScript tooling and Python production frameworks.
- Includes system integration across React, FastAPI, Ollama, and Mem0.
