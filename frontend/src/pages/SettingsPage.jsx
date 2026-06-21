import { API_BASE_URL } from "../services/client";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { clearHistory, clearMemories } from "../services/nexusApi";
import { useState } from "react";

export default function SettingsPage({ userId = "" }) {
  const [streamingReady, setStreamingReady] = useLocalStorage("nexus:streaming-ready", true);
  const [rightPanel, setRightPanel] = useLocalStorage("nexus:right-panel", true);
  const [status, setStatus] = useState("");

  async function runAction(action, successMessage, eventName) {
    setStatus("");
    try {
      await action();
      setStatus(successMessage);
      if (eventName) {
        window.dispatchEvent(new CustomEvent(eventName));
      }
    } catch {
      setStatus("Action failed. Check the backend connection.");
    }
  }

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-7">
          <p className="text-xs uppercase tracking-wide text-nexus-muted">Workspace</p>
          <h1 className="mt-1 text-2xl font-semibold text-nexus-text">Settings</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-nexus-muted">
            Configure the frontend shell and manage local assistant state.
          </p>
        </header>

        {status && (
          <div className="mb-5 rounded-lg border border-nexus-border bg-nexus-panel px-4 py-3 text-sm text-nexus-muted">
            {status}
          </div>
        )}

        <section className="space-y-4 rounded-lg border border-nexus-border bg-nexus-panel p-5">
          <SettingRow
            title="API base URL"
            description={API_BASE_URL}
            control={<span className="rounded-md bg-nexus-surface px-3 py-1.5 text-xs text-nexus-muted">Vite env</span>}
          />
          <SettingRow
            title="Streaming-ready UI"
            description="Keep chat states prepared for token streaming when the backend exposes it."
            control={<Toggle enabled={streamingReady} onChange={setStreamingReady} />}
          />
          <SettingRow
            title="Right context panel"
            description="Show retrieved memories and active agents on desktop."
            control={<Toggle enabled={rightPanel} onChange={setRightPanel} />}
          />
        </section>

        <section className="mt-5 rounded-lg border border-nexus-border bg-nexus-panel p-5">
          <h2 className="text-base font-semibold text-nexus-text">Data controls</h2>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => runAction(() => clearHistory(userId), "Conversation history cleared.", "nexus:new-chat")}
              className="focus-ring rounded-lg border border-nexus-border bg-nexus-surface px-4 py-2 text-sm text-nexus-muted transition hover:text-nexus-text"
            >
              Clear History
            </button>
            <button
              type="button"
              onClick={() => runAction(() => clearMemories(userId), "All memories cleared.", "nexus:memories-cleared")}
              className="focus-ring rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-200 transition hover:bg-red-500/20"
            >
              Clear Memories
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function SettingRow({ title, description, control }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-nexus-border bg-nexus-surface p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-sm font-medium text-nexus-text">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-nexus-muted">{description}</p>
      </div>
      {control}
    </div>
  );
}

function Toggle({ enabled, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`focus-ring relative h-7 w-12 rounded-full transition ${
        enabled ? "bg-nexus-accent" : "bg-nexus-border"
      }`}
      aria-pressed={enabled}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
          enabled ? "left-6" : "left-1"
        }`}
      />
    </button>
  );
}
