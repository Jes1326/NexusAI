import { apiClient } from "./client";

export async function sendChatMessage(message, userId) {
  const { data } = await apiClient.post("/chat", {
    message,
    user_id: userId || undefined
  });
  return data;
}

export async function getMemories(userId) {
  const { data } = await apiClient.get("/memories", {
    params: userId ? { user_id: userId } : undefined
  });
  return data;
}

export async function deleteMemory(memoryId, userId) {
  const { data } = await apiClient.delete(`/memories/${memoryId}`, {
    params: userId ? { user_id: userId } : undefined
  });
  return data;
}

export async function addMemories(memories, userId) {
  const { data } = await apiClient.post("/memories", {
    memories,
    user_id: userId || undefined
  });
  return data;
}

export async function ingestMemoryText(text, userId) {
  const { data } = await apiClient.post("/memories/ingest", {
    text,
    user_id: userId || undefined
  });
  return data;
}

export async function clearMemories(userId) {
  const { data } = await apiClient.post("/memories/clear", null, {
    params: userId ? { user_id: userId } : undefined
  });
  return data;
}

export async function getHistory(userId) {
  const { data } = await apiClient.get("/history", {
    params: userId ? { user_id: userId } : undefined
  });
  return data;
}

export async function clearHistory(userId) {
  const { data } = await apiClient.post("/history/clear", null, {
    params: userId ? { user_id: userId } : undefined
  });
  return data;
}

