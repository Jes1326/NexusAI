import asyncio
import json
import time
from typing import Any, Dict, List, Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from config import (
    USER_ID,
    BROAD_CONTEXT_QUERY,
    SYSTEM_PROMPT_ORCHESTRATOR,
    SYSTEM_PROMPT_RANKER,
    SYSTEM_PROMPT_EXTRACTOR,
    SYSTEM_PROMPT_RECONCILER,
)
from models import (
    ChatRequest,
    ChatResponse,
    HistoryItem,
    MemoryItem,
    MemorySaveRequest,
    MemoryIngestRequest,
)
from memory import MemoryManager
from history import HistoryManager
from agent import build_agent, build_prompt, run_agent, clean_response

app = FastAPI(
    title="Nexus AI API",
    description="Per-user memory chatbot with intelligent fact extraction and reconciliation.",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

history_manager = HistoryManager()
memory_managers: Dict[str, MemoryManager] = {}

orchestrator = build_agent("orchestrator", SYSTEM_PROMPT_ORCHESTRATOR)
memory_ranker = build_agent("memory_ranker", SYSTEM_PROMPT_RANKER)
memory_extractor = build_agent("memory_extractor", SYSTEM_PROMPT_EXTRACTOR)
memory_reconciler = build_agent("memory_reconciler", SYSTEM_PROMPT_RECONCILER)


def parse_json_list(raw_response: str, label: str) -> List[str]:
    cleaned = raw_response.strip()
    if cleaned.startswith("```"):
        lines = cleaned.split("\n")
        if lines[0].startswith("```json") or lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        cleaned = "\n".join(lines).strip()
    try:
        parsed = json.loads(cleaned)
        if isinstance(parsed, list):
            return [str(item) for item in parsed]
    except Exception as e:
        print(f"[DEBUG] {label} JSON parse exception: {e}. Raw: {raw_response}")
    return []


def parse_json_object(raw_response: str, label: str) -> Dict[str, Any]:
    cleaned = raw_response.strip()
    if cleaned.startswith("```"):
        lines = cleaned.split("\n")
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        cleaned = "\n".join(lines).strip()
    try:
        parsed = json.loads(cleaned)
        if isinstance(parsed, dict):
            return parsed
    except Exception as e:
        print(f"[DEBUG] {label} JSON parse exception: {e}. Raw: {raw_response}")
    return {}


def dedupe(items: List[str]) -> List[str]:
    seen = set()
    out = []
    for item in items:
        t = str(item).strip()
        if t and t.lower() not in seen:
            seen.add(t.lower())
            out.append(t)
    return out


def fallback_extraction(text: str) -> List[str]:
    fragments = [p.strip(" .") for p in text.replace("\n", ". ").split(".")]
    memories = []
    for f in fragments:
        if len(f) < 3:
            continue
        if f.lower().startswith(("what ", "why ", "how ", "can ", "could ", "please ")):
            continue
        memories.append(f if f.endswith(".") else f"{f}.")
    return dedupe(memories)


def get_mem_mgr(u_id: str) -> MemoryManager:
    if u_id not in memory_managers:
        memory_managers[u_id] = MemoryManager(u_id)
    return memory_managers[u_id]


def merge_memory_entries(*lists: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    seen_ids: set[str] = set()
    seen_text: set[str] = set()
    merged: List[Dict[str, Any]] = []
    for entries in lists:
        for entry in entries:
            text = entry.get("memory", "").strip()
            entry_id = entry.get("id", "")
            text_key = text.lower()
            if not text:
                continue
            if entry_id and entry_id in seen_ids:
                continue
            if text_key in seen_text:
                continue
            if entry_id:
                seen_ids.add(entry_id)
            seen_text.add(text_key)
            merged.append(entry)
    return merged


async def extract_facts(text: str) -> List[str]:
    try:
        extractor_out = await run_agent(memory_extractor, f"User Message:\n{text}")
        extracted = dedupe(parse_json_list(extractor_out, "memory_extractor"))
        if extracted:
            return extracted
    except Exception as e:
        print(f"[DEBUG] Extraction failed: {e}")
    return fallback_extraction(text)


async def reconcile_and_save(
    mem_mgr: MemoryManager,
    u_id: str,
    new_facts: List[str],
    pipeline_logs: List[str],
) -> Dict[str, int]:
    if not new_facts:
        return {"added": 0, "updated": 0, "skipped": 0}

    existing_entries: List[Dict[str, Any]] = []
    for fact in new_facts:
        hits = await mem_mgr.search_entries(fact, score_threshold=0.05, limit=5)
        existing_entries = merge_memory_entries(existing_entries, hits)

    broad_hits = await mem_mgr.search_entries(BROAD_CONTEXT_QUERY, score_threshold=0.05, limit=15)
    existing_entries = merge_memory_entries(existing_entries, broad_hits)

    existing_for_prompt = [
        {"id": e["id"], "memory": e["memory"]} for e in existing_entries[:20]
    ]
    reconciler_prompt = (
        "NEW FACTS:\n"
        + json.dumps(new_facts, indent=2)
        + "\n\nEXISTING MEMORIES:\n"
        + json.dumps(existing_for_prompt, indent=2)
    )

    stats = {"added": 0, "updated": 0, "skipped": 0}

    try:
        reconciler_out = await run_agent(memory_reconciler, reconciler_prompt)
        result = parse_json_object(reconciler_out, "memory_reconciler")
        actions = result.get("memory_actions", [])
    except Exception as e:
        pipeline_logs.append(f"Reconciler failed: {e} — falling back to add-all")
        actions = [{"action": "add", "text": fact} for fact in new_facts]

    if not actions:
        actions = [{"action": "add", "text": fact} for fact in new_facts]

    for action in actions:
        act = str(action.get("action", "add")).lower()
        text = str(action.get("text", "")).strip()
        if not text:
            continue
        if act == "skip":
            stats["skipped"] += 1
            continue
        if act == "update":
            memory_id = str(action.get("memory_id", "")).strip()
            if memory_id and await mem_mgr.update_memory(memory_id, text):
                stats["updated"] += 1
                continue
            await mem_mgr.save_memories([text])
            stats["added"] += 1
            continue
        await mem_mgr.save_memories([text])
        stats["added"] += 1

    pipeline_logs.append(
        f"Reconcile: +{stats['added']} updated {stats['updated']} skipped {stats['skipped']}"
    )
    return stats


async def ingest_text(
    text: str,
    u_id: str,
    mem_mgr: MemoryManager,
    pipeline_logs: Optional[List[str]] = None,
) -> Dict[str, Any]:
    logs = pipeline_logs if pipeline_logs is not None else []
    facts = await extract_facts(text)
    stats = await reconcile_and_save(mem_mgr, u_id, facts, logs)
    return {"facts": facts, **stats}


@app.get("/")
async def root():
    return {"status": "running"}


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "timestamp": time.time(), "default_user_id": USER_ID}


@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    pipeline_logs: List[str] = []
    start_time = time.time()

    user_input = request.message.strip()
    if not user_input:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    u_id = request.user_id or USER_ID
    mem_mgr = get_mem_mgr(u_id)
    chat_history = history_manager.for_user(u_id)

    pipeline_logs.append(f"Pipeline start for user: {u_id}")

    t0 = time.time()
    query_entries, context_entries = await asyncio.gather(
        mem_mgr.search_entries(user_input),
        mem_mgr.search_entries(BROAD_CONTEXT_QUERY),
    )
    memory_entries = merge_memory_entries(query_entries, context_entries)
    memories = [e["memory"] for e in memory_entries]
    pipeline_logs.append(
        f"Mem0 search: {time.time()-t0:.2f}s — {len(memories)} memories"
    )

    t0 = time.time()
    ranked_memories: List[str] = []
    if memories:
        try:
            ranker_out = await run_agent(
                memory_ranker,
                f"Question:\n{user_input}\n\nRetrieved Memories:\n" + "\n".join(memories),
            )
            ranked_memories = parse_json_list(ranker_out, "memory_ranker")
            if not ranked_memories:
                ranked_memories = memories
        except Exception as e:
            pipeline_logs.append(f"Reranking failed: {e}")
            ranked_memories = memories
    pipeline_logs.append(f"Reranking: {time.time()-t0:.2f}s — {len(ranked_memories)} selected")

    t0 = time.time()
    prompt = build_prompt(
        user_input=user_input,
        history_text=chat_history.format_for_prompt(),
        memories=ranked_memories,
    )
    try:
        raw_response = await run_agent(orchestrator, prompt)
        response_text = clean_response(raw_response)
    except Exception as e:
        pipeline_logs.append(f"Orchestrator failed: {e}")
        raise HTTPException(status_code=500, detail=f"Ollama Agent Error: {e}")
    pipeline_logs.append(f"Orchestrator: {time.time()-t0:.2f}s")

    t0 = time.time()
    extracted_memories: List[str] = []
    recent_user_msgs = [m["content"] for m in chat_history.get_window() if m["role"] == "user"]
    do_save, reason = mem_mgr.should_save(user_input, recent_user_msgs)
    pipeline_logs.append(f"Save check: {reason}")

    if do_save:
        try:
            extracted_memories = await extract_facts(user_input)
            if extracted_memories:
                await reconcile_and_save(mem_mgr, u_id, extracted_memories, pipeline_logs)
        except Exception as e:
            pipeline_logs.append(f"Extraction/reconcile failed: {e}")
    else:
        pipeline_logs.append("Skipped extraction (duplicate message)")

    pipeline_logs.append(f"Memory step: {time.time()-t0:.2f}s")

    chat_history.add_turn(user_input, response_text)
    pipeline_logs.append(f"Total: {time.time()-start_time:.2f}s")

    return ChatResponse(
        response=response_text,
        memories_searched=memories,
        memories_used=ranked_memories,
        memories_extracted=extracted_memories,
        pipeline_logs=pipeline_logs,
    )


@app.post("/api/memories/ingest")
async def ingest_memories(request: MemoryIngestRequest):
    text = request.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    u_id = request.user_id or USER_ID
    mem_mgr = get_mem_mgr(u_id)
    logs: List[str] = []
    result = await ingest_text(text, u_id, mem_mgr, logs)

    return {
        "message": (
            f"Processed {len(result['facts'])} facts "
            f"(+{result['added']}, updated {result['updated']}, skipped {result['skipped']})"
        ),
        "user_id": u_id,
        "facts": result["facts"],
        **{k: result[k] for k in ("added", "updated", "skipped")},
    }


@app.get("/api/memories", response_model=List[MemoryItem])
async def get_memories(user_id: Optional[str] = Query(None)):
    u_id = user_id or USER_ID
    mem_mgr = get_mem_mgr(u_id)
    raw_mems = await mem_mgr.get_all_memories()
    items = []
    for m in raw_mems:
        if isinstance(m, dict):
            normalized = mem_mgr._normalize_entry(m)
            if normalized["memory"]:
                items.append(
                    MemoryItem(
                        id=normalized["id"],
                        memory=normalized["memory"],
                        created_at=normalized.get("created_at"),
                        updated_at=normalized.get("updated_at"),
                    )
                )
    return items


@app.post("/api/memories/clear")
async def clear_all_memories(user_id: Optional[str] = Query(None)):
    u_id = user_id or USER_ID
    mem_mgr = get_mem_mgr(u_id)
    await mem_mgr.clear_all_memories()
    return {"message": "All memories cleared", "user_id": u_id}


@app.post("/api/memories")
async def save_manual_memories(request: MemorySaveRequest):
    u_id = request.user_id or USER_ID
    mem_mgr = get_mem_mgr(u_id)
    logs: List[str] = []
    await reconcile_and_save(mem_mgr, u_id, dedupe(request.memories), logs)
    return {"message": f"Processed {len(request.memories)} memories", "user_id": u_id}


@app.delete("/api/memories/{memory_id}")
async def delete_single_memory(memory_id: str, user_id: Optional[str] = Query(None)):
    u_id = user_id or USER_ID
    mem_mgr = get_mem_mgr(u_id)
    success = await mem_mgr.delete_memory(memory_id)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to delete memory")
    return {"message": f"Memory {memory_id} deleted"}


@app.get("/api/history", response_model=List[HistoryItem])
async def get_history_endpoint(user_id: Optional[str] = Query(None)):
    u_id = user_id or USER_ID
    win = history_manager.for_user(u_id).get_window()
    return [HistoryItem(role=m["role"], content=m["content"]) for m in win]


@app.post("/api/history/clear")
async def clear_history_endpoint(user_id: Optional[str] = Query(None)):
    u_id = user_id or USER_ID
    history_manager.clear_user(u_id)
    return {"message": "Chat history cleared", "user_id": u_id}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
