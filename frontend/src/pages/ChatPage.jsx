import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ChatInput from "../components/chat/ChatInput.jsx";
import ChatMessage from "../components/chat/ChatMessage.jsx";
import TypingAnimation from "../components/chat/TypingAnimation.jsx";
import { getHistory, sendChatMessage } from "../services/nexusApi";

const welcomeMessage = {
  id: "welcome",
  role: "assistant",
  content: "Welcome to Nexus AI. I remember what you tell me and use it to give personalized answers.",
  agents: [
    { name: "Orchestrator", status: "idle" },
    { name: "Memory Ranker", status: "idle" },
    { name: "Memory Extractor", status: "idle" },
    { name: "Memory Reconciler", status: "idle" },
  ],
};

export default function ChatPage({ userId, greeting }) {
  const initialMessage = useMemo(
    () => (greeting ? { ...welcomeMessage, id: "welcome", content: greeting } : welcomeMessage),
    [greeting]
  );
  const [messages, setMessages] = useState([initialMessage]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.scrollTo({
      top: scrollContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  const loadHistory = useCallback(async () => {
    if (!userId) return;
    try {
      const history = await getHistory(userId);
      if (history?.length) {
        setMessages([
          welcomeMessage,
          ...history.map((item, index) => ({
            id: `history-${index}`,
            role: item.role === "assistant" ? "assistant" : "user",
            content: item.content,
          })),
        ]);
      } else {
        setMessages([initialMessage]);
      }
    } catch {
      setError("Backend is not reachable yet. Start FastAPI on port 8000 to enable live chat.");
    }
  }, [userId, initialMessage]);

  useEffect(() => {
    loadHistory();
    const reset = () => { setMessages([initialMessage]); setError(""); };
    window.addEventListener("nexus:new-chat", reset);
    return () => window.removeEventListener("nexus:new-chat", reset);
  }, [loadHistory, initialMessage, userId]);

  async function handleSubmit(content) {
    setMessages((current) => [...current, { id: crypto.randomUUID(), role: "user", content }]);
    setLoading(true);
    setError("");

    try {
      const result = await sendChatMessage(content, userId || undefined);
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: result.response,
          memoriesSearched: result.memories_searched || [],
          memoriesUsed: result.memories_used || [],
          memoriesExtracted: result.memories_extracted || [],
          pipelineLogs: result.pipeline_logs || [],
          agents: [
            { name: "Orchestrator", status: "done" },
            { name: "Memory Ranker", status: "done" },
            { name: "Memory Extractor", status: "done" },
            { name: "Memory Reconciler", status: "done" },
          ],
        },
      ]);
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Nexus AI could not complete this request.");
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "I could not reach the agent pipeline. Check that the backend, Ollama, and Mem0 configuration are running.",
          agents: [
            { name: "Orchestrator", status: "error" },
            { name: "Memory Ranker", status: "error" },
            { name: "Memory Extractor", status: "error" },
            { name: "Memory Reconciler", status: "error" },
          ],
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <section className="flex min-w-0 flex-1 flex-col h-full">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-nexus-border px-4 py-4 sm:px-6 bg-nexus-bg">
          <div>
            <p className="text-xs uppercase tracking-wide text-nexus-muted">Agentic memory chat</p>
            <h1 className="text-lg font-semibold text-nexus-text">Nexus AI</h1>
          </div>
        </header>

        {error && (
          <div className="mx-4 mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200 sm:mx-6">
            {error}
          </div>
        )}

        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
          <div className="mx-auto max-w-3xl space-y-6">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-nexus-accent text-sm font-semibold text-white">
                  N
                </div>
                <TypingAnimation />
              </div>
            )}
          </div>
        </div>

        <ChatInput onSubmit={handleSubmit} disabled={loading} />
      </section>
    </div>
  );
}
