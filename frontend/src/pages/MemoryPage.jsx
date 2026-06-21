import { useEffect, useMemo, useState } from "react";
import LoadingIndicator from "../components/chat/LoadingIndicator.jsx";
import MemoryCard from "../components/memory/MemoryCard.jsx";
import { deleteMemory, getMemories, ingestMemoryText } from "../services/nexusApi";

const filters = ["All", "Personal", "Career", "Skills", "Preference", "Memory"];

export default function MemoryPage({ userId = "" }) {
  const [memories, setMemories] = useState([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [newMemory, setNewMemory] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadMemories() {
    setLoading(true);
    setError("");
    try {
      const data = await getMemories(userId);
      setMemories(data || []);
    } catch {
      setError("Could not load memories. Confirm the backend is running.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMemories();
    const refresh = () => loadMemories();
    window.addEventListener("nexus:memories-cleared", refresh);
    return () => window.removeEventListener("nexus:memories-cleared", refresh);
  }, [userId]);

  const visibleMemories = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return memories.filter((memory) => {
      const text = (memory.memory || "").toLowerCase();
      const matchesQuery = !normalizedQuery || text.includes(normalizedQuery);
      const matchesFilter = filter === "All" || inferCategory(text) === filter;
      return matchesQuery && matchesFilter;
    });
  }, [filter, memories, query]);

  async function handleDelete(id) {
    const previous = memories;
    setMemories((current) => current.filter((memory) => memory.id !== id));
    try {
      await deleteMemory(id, userId);
    } catch {
      setMemories(previous);
      setError("Delete failed. The memory may already be gone.");
    }
  }

  async function handleAdd(event) {
    event.preventDefault();
    const value = newMemory.trim();
    if (!value) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const result = await ingestMemoryText(value, userId);
      setNewMemory("");
      await loadMemories();
      setSuccess(result.message || "Memories saved.");
    } catch {
      setError("Could not extract and save memories from that information.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-nexus-muted">Long-term context</p>
            <h1 className="mt-1 text-2xl font-semibold text-nexus-text">Memory</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-nexus-muted">
              Review, search, and manage the durable facts Nexus AI can use for personalization.
            </p>
          </div>
          <button
            type="button"
            onClick={loadMemories}
            className="focus-ring rounded-lg border border-nexus-border bg-nexus-surface px-4 py-2 text-sm text-nexus-muted transition hover:text-nexus-text"
          >
            Refresh
          </button>
        </header>

        <form onSubmit={handleAdd} className="mb-5 rounded-lg border border-nexus-border bg-nexus-panel p-4">
          <div className="flex flex-col gap-3">
            <textarea
              value={newMemory}
              onChange={(event) => setNewMemory(event.target.value)}
              placeholder="Paste complete user information here. Example: My name is Jeswanth. I live in Bangalore. I am learning React, DevOps, LangChain, and AI Engineering. I want to become an AI Engineer."
              rows={4}
              className="focus-ring min-h-28 resize-y rounded-lg border border-nexus-border bg-nexus-surface px-3 py-3 text-sm leading-6 text-nexus-text placeholder:text-nexus-muted"
            />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-5 text-nexus-muted">
                Nexus will extract individual memories and store them in Mem0.
              </p>
              <button
                type="submit"
                disabled={saving || !newMemory.trim()}
                className="focus-ring rounded-lg bg-nexus-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Processing" : "Extract & Save"}
              </button>
            </div>
          </div>
        </form>

        <div className="mb-5 grid gap-3 md:grid-cols-[1fr_auto]">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search memory..."
            className="focus-ring h-11 rounded-lg border border-nexus-border bg-nexus-panel px-3 text-sm text-nexus-text placeholder:text-nexus-muted"
          />
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="focus-ring h-11 rounded-lg border border-nexus-border bg-nexus-panel px-3 text-sm text-nexus-text"
          >
            {filters.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>

        {error && (
          <div className="mb-5 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {success}
          </div>
        )}

        {loading ? (
          <div className="rounded-lg border border-nexus-border bg-nexus-panel p-6">
            <LoadingIndicator label="Loading memories" />
          </div>
        ) : visibleMemories.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleMemories.map((memory) => (
              <MemoryCard key={memory.id} memory={memory} onDelete={handleDelete} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-nexus-border bg-nexus-panel p-10 text-center">
            <p className="text-sm text-nexus-muted">No memories match this view.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function inferCategory(text) {
  if (text.includes("name") || text.includes("live") || text.includes("location")) return "Personal";
  if (text.includes("work") || text.includes("career") || text.includes("company")) return "Career";
  if (text.includes("skill") || text.includes("learn") || text.includes("build")) return "Skills";
  if (text.includes("like") || text.includes("prefer") || text.includes("enjoy")) return "Preference";
  return "Memory";
}
