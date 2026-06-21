export default function LoadingIndicator({ label = "Thinking" }) {
  return (
    <div className="flex items-center gap-2 text-sm text-nexus-muted">
      <span>{label}</span>
      <span className="flex gap-1">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-nexus-muted [animation-delay:-0.2s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-nexus-muted [animation-delay:-0.1s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-nexus-muted" />
      </span>
    </div>
  );
}
