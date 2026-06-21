import { useState } from "react";
import { getMemories } from "../services/nexusApi";

export default function UsernameGate({ onConfirm }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    const username = name.trim();
    if (!username) return;
    setLoading(true);
    setError("");

    try {
      const memories = await getMemories(username);
      const isReturning = memories && memories.length > 0;
      onConfirm(username, isReturning);
    } catch {
      // backend not reachable — still allow entry as new user
      onConfirm(username, false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-nexus-bg">
      <div className="w-full max-w-sm px-6">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-xl bg-nexus-accent text-xl font-bold text-white">
            N
          </div>
          <h1 className="text-2xl font-semibold text-nexus-text">Welcome to Nexus AI</h1>
          <p className="mt-2 text-sm text-nexus-muted">Enter your username to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your username"
            className="w-full rounded-xl border border-nexus-border bg-nexus-surface px-4 py-3 text-sm text-nexus-text placeholder:text-nexus-muted outline-none focus:border-nexus-accent transition"
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full rounded-xl bg-nexus-accent py-3 text-sm font-medium text-white transition hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Checking..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
