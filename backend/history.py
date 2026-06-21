import difflib
from collections import deque
from typing import Dict, List, Tuple

from config import MAX_HISTORY_TURNS

DEDUP_THRESHOLD: float = 0.85


class ChatHistory:
    """Sliding window of recent conversation turns for one user."""

    def __init__(self, max_turns: int = MAX_HISTORY_TURNS) -> None:
        self._window: deque[Dict[str, str]] = deque(maxlen=max_turns * 2)

    def _similarity(self, a: str, b: str) -> float:
        return difflib.SequenceMatcher(None, a.lower().strip(), b.lower().strip()).ratio()

    def is_duplicate(self, content: str, role: str) -> Tuple[bool, float]:
        best: float = 0.0
        for msg in self._window:
            if msg["role"] == role:
                score = self._similarity(content, msg["content"])
                if score > best:
                    best = score
        return best >= DEDUP_THRESHOLD, best

    def add_turn(self, user_content: str, assistant_content: str) -> bool:
        dupe, _score = self.is_duplicate(user_content, "user")
        if dupe:
            return False
        self._window.append({"role": "user", "content": user_content})
        self._window.append({"role": "assistant", "content": assistant_content})
        return True

    def get_window(self) -> List[Dict[str, str]]:
        return list(self._window)

    def format_for_prompt(self) -> str:
        if not self._window:
            return ""
        return "\n".join(
            f"{msg['role'].capitalize()}: {msg['content']}"
            for msg in self._window
        )

    def clear(self) -> None:
        self._window.clear()

    def __len__(self) -> int:
        return len(self._window)


class HistoryManager:
    """Per-user chat history store."""

    def __init__(self, max_turns: int = MAX_HISTORY_TURNS) -> None:
        self._max_turns = max_turns
        self._histories: Dict[str, ChatHistory] = {}

    def for_user(self, user_id: str) -> ChatHistory:
        if user_id not in self._histories:
            self._histories[user_id] = ChatHistory(self._max_turns)
        return self._histories[user_id]

    def clear_user(self, user_id: str) -> None:
        if user_id in self._histories:
            self._histories[user_id].clear()
