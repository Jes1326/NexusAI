import { cn } from "../../utils/cn";

export default function AgentStatus({ agents = [], compact = false }) {
  const items = agents.length
    ? agents
    : [
        { name: "Orchestrator", status: "idle" },
        { name: "Memory Ranker", status: "idle" },
        { name: "Memory Extractor", status: "idle" }
      ];

  return (
    <div className={cn("space-y-2", compact && "space-y-1.5")}>
      {items.map((agent) => (
        <div
          key={agent.name}
          className="flex items-center justify-between gap-3 rounded-lg border border-nexus-border bg-nexus-surface px-3 py-2"
        >
          <span className="truncate text-sm text-nexus-text">{agent.name}</span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs capitalize",
              agent.status === "active" && "bg-nexus-accentSoft text-blue-200",
              agent.status === "done" && "bg-emerald-500/10 text-emerald-300",
              agent.status === "idle" && "bg-white/5 text-nexus-muted",
              agent.status === "error" && "bg-red-500/10 text-red-300"
            )}
          >
            {agent.status}
          </span>
        </div>
      ))}
    </div>
  );
}
