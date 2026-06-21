import difflib
from typing import Any, Dict, List, Tuple
from mem0 import AsyncMemoryClient

from config import MEM0_API_KEY, USER_ID, MEMORY_SCORE_THRESHOLD, MEMORY_TOP_K


class MemoryManager:
    """Async wrapper around Mem0's AsyncMemoryClient."""

    def __init__(self, user_id: str = USER_ID) -> None:
        self._client = AsyncMemoryClient(api_key=MEM0_API_KEY)
        self.user_id = user_id

    def _extract_results(self, raw: Any) -> List[Dict[str, Any]]:
        if isinstance(raw, dict):
            return raw.get("results", [])
        return raw if isinstance(raw, list) else []

    def _normalize_entry(self, entry: Dict[str, Any]) -> Dict[str, Any]:
        memory_id = entry.get("id") or entry.get("uuid") or str(hash(entry.get("memory", "")))
        text = entry.get("memory") or entry.get("text") or ""
        score = float(entry.get("score", 0))
        created_at = entry.get("created_at") or entry.get("createdAt")
        updated_at = entry.get("updated_at") or entry.get("updatedAt")
        return {
            "id": str(memory_id),
            "memory": text,
            "score": score,
            "created_at": created_at,
            "updated_at": updated_at,
        }

    async def search(self, query: str, score_threshold: float = MEMORY_SCORE_THRESHOLD) -> List[str]:
        entries = await self.search_entries(query, score_threshold=score_threshold)
        return [entry["memory"] for entry in entries if entry["memory"]]

    async def search_entries(
        self,
        query: str,
        score_threshold: float = MEMORY_SCORE_THRESHOLD,
        limit: int = MEMORY_TOP_K,
    ) -> List[Dict[str, Any]]:
        try:
            raw = await self._client.search(
                query=query,
                filters={"user_id": self.user_id},
                limit=limit,
            )
            kept: List[Dict[str, Any]] = []
            for entry in self._extract_results(raw):
                normalized = self._normalize_entry(entry)
                if normalized["memory"] and normalized["score"] > score_threshold:
                    kept.append(normalized)
            return kept
        except Exception:
            return []

    def should_save(self, user_input: str, recent_user_messages: List[str], threshold: float = 0.85) -> Tuple[bool, str]:
        for past_msg in recent_user_messages:
            ratio = difflib.SequenceMatcher(
                None, user_input.lower().strip(), past_msg.lower().strip()
            ).ratio()
            if ratio >= threshold:
                return False, f"Question similar to recent message (similarity={ratio:.2f})"
        return True, "No duplicate question found — saving."

    async def save_memories(self, memories: List[str]) -> None:
        if not memories:
            return
        try:
            await self._client.add(
                messages=[{"role": "user", "content": memory} for memory in memories],
                user_id=self.user_id,
            )
        except Exception as e:
            print(f"Error saving memories: {e}")
            raise

    async def update_memory(self, memory_id: str, text: str) -> bool:
        try:
            await self._client.update(memory_id, text=text)
            return True
        except Exception as e:
            print(f"Error updating memory {memory_id}: {e}")
            return False

    async def clear_all_memories(self) -> None:
        try:
            await self._client.delete_all(user_id=self.user_id)
        except Exception as e:
            print(f"Error clearing memories: {e}")

    async def get_all_memories(self) -> List[dict]:
        try:
            all_memories = await self._client.get_all(filters={"user_id": self.user_id})
            if isinstance(all_memories, dict):
                return all_memories.get("results", [])
            return all_memories if isinstance(all_memories, list) else []
        except Exception as e:
            print(f"Error retrieving all memories: {e}")
            return []

    async def delete_memory(self, memory_id: str) -> bool:
        try:
            await self._client.delete(memory_id)
            return True
        except Exception as e:
            print(f"Error deleting memory {memory_id}: {e}")
            return False
