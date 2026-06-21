import AgentStatus from "./AgentStatus.jsx";

export default function RightPanel({ retrievedMemories = [], agents = [], open, onToggle }) {
  return (
    <aside
      className={`fixed inset-y-0 right-0 z-30 border-l border-nexus-border bg-nexus-bg transition-all duration-300 ${
        open ? "w-96" : "w-0 overflow-hidden border-l-0"
      }`}
    >
      <div className="h-full overflow-y-auto p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-nexus-muted">Context</p>
            <h2 className="text-sm font-semibold text-nexus-text">Nexus intelligence</h2>
          </div>
          <button
            type="button"
            onClick={onToggle}
            className="focus-ring rounded-md border border-nexus-border bg-nexus-surface px-2 py-1 text-xs text-nexus-muted"
          >
            Hide
          </button>
        </div>

        <div className="space-y-4">
          <section className="rounded-lg border border-nexus-border bg-nexus-panel p-4">
            <h3 className="mb-3 text-sm font-semibold">Active agents</h3>
            <AgentStatus agents={agents} />
          </section>
        </div>
      </div>
    </aside>
  );
}
