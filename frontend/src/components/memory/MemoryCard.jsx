export default function MemoryCard({ memory, onDelete }) {
  const text = memory.memory || memory.text || "";
  const category = inferCategory(text);

  return (
    <article className="rounded-lg border border-nexus-border bg-nexus-panel p-4 transition hover:border-nexus-accent/60">
      <div className="mb-3 flex items-start justify-between gap-4">
        <span className="rounded-full bg-nexus-accentSoft px-2.5 py-1 text-xs font-medium text-blue-200">
          {category}
        </span>
        <button
          type="button"
          onClick={() => onDelete(memory.id)}
          className="focus-ring rounded-md px-2 py-1 text-xs text-nexus-muted transition hover:bg-red-500/10 hover:text-red-300"
        >
          Delete
        </button>
      </div>
      <p className="text-sm leading-6 text-nexus-text">{text}</p>
      <div className="mt-4 flex flex-wrap gap-3 text-xs text-nexus-muted">
        <span>Created: {formatDate(memory.created_at || memory.createdDate)}</span>
        <span>Updated: {formatDate(memory.updated_at || memory.updatedDate)}</span>
      </div>
    </article>
  );
}

function inferCategory(text) {
  const value = text.toLowerCase();
  if (value.includes("name") || value.includes("live") || value.includes("location")) return "Personal";
  if (value.includes("work") || value.includes("career") || value.includes("company")) return "Career";
  if (value.includes("skill") || value.includes("learn") || value.includes("build")) return "Skills";
  if (value.includes("like") || value.includes("prefer") || value.includes("enjoy")) return "Preference";
  return "Memory";
}

function formatDate(value) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
