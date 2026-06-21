from pydantic import BaseModel, Field
from typing import List, Optional


class ChatRequest(BaseModel):
    message: str
    user_id: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    memories_searched: List[str] = Field(default_factory=list)
    memories_used: List[str] = Field(default_factory=list)
    memories_extracted: List[str] = Field(default_factory=list)
    pipeline_logs: List[str] = Field(default_factory=list)


class MemoryItem(BaseModel):
    id: str
    memory: str
    score: Optional[float] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class MemorySaveRequest(BaseModel):
    memories: List[str]
    user_id: Optional[str] = None


class MemoryIngestRequest(BaseModel):
    text: str
    user_id: Optional[str] = None


class HistoryItem(BaseModel):
    role: str
    content: str
