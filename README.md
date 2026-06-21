# Nexus AI

An agentic AI assistant with long-term memory that remembers user information, updates outdated facts, and delivers personalized responses using FastAPI, React, Ollama, and Mem0.

The system remembers user information, retrieves relevant memories, updates outdated facts, and delivers context-aware responses using an agentic memory pipeline.

---

## Features

- Personalized AI conversations
- Long-term memory with Mem0
- Memory retrieval and reranking
- Fact extraction from conversations
- Memory reconciliation and conflict resolution
- Multi-user support
- Modern React chat interface
- Memory management dashboard
- FastAPI REST APIs

---

## Architecture

User
   │
   ▼
React Frontend
   │
   ▼
FastAPI Backend
   │
   ▼
Agent Pipeline
   ├── Memory Retrieval
   ├── Response Generation
   ├── Fact Extraction
   └── Memory Reconciliation
          │
          ▼
        Mem0
          │
          ▼
       Ollama

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, Vite, Tailwind CSS |
| Backend | FastAPI |
| LLM | Ollama |
| Memory | Mem0 |
| Language | Python |
| API | REST API |

---

## Architecture

```text
User
  │
React Frontend
  │
FastAPI Backend
  │
Agent Pipeline
  ├── Memory Retrieval
  ├── Memory Reranking
  ├── Response Generation
  ├── Fact Extraction
  └── Memory Reconciliation
  │
Mem0 + Ollama
```

---

## Agent Workflow

1. User sends a message.
2. Relevant memories are retrieved.
3. Memories are reranked.
4. The assistant generates a response.
5. New facts are extracted.
6. Conflicting memories are reconciled.
7. Updated memories are stored.

---

## Memory Reconciliation

The reconciliation agent helps maintain accurate memories by:

- Removing duplicate memories
- Updating outdated facts
- Merging similar information
- Resolving conflicting facts
- Maintaining a clean memory store

---

## Project Structure

```text
NexusAI/
│
├── backend/
│   ├── app.py
│   ├── agent.py
│   ├── memory.py
│   ├── history.py
│   └── config.py
│
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── services/
│   └── layouts/
│
└── README.md
```

---

## Installation

### Backend

```bash
cd backend

python -m venv venv

# Windows
venv\Scripts\activate

pip install -r requirements.txt

uvicorn app:app --reload
```

### Frontend

```bash
cd frontend

npm install

npm run dev
```

---

## Environment Variables

Create a `.env` file:

```env
MEM0_API_KEY=your_key
OLLAMA_MODEL=llama3.2
OLLAMA_HOST=http://localhost:11434
MEM0_USER_ID=default_user
```

---

## Future Improvements

- RAG integration
- Vector databases
- LangChain orchestration
- Multi-modal memory
- Memory confidence scoring
- LangGraph workflows

---

## Why This Project?

Nexus AI demonstrates:

- AI agent workflows
- Long-term memory systems
- Personalized AI assistants
- Memory conflict resolution
- Full-stack AI application development
- Modern React and FastAPI architecture

---

## Author

**Jeswanth**

AI Engineer | Python | FastAPI | React | AI Applications
