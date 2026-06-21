export default function TypingAnimation() {
  return (
    <div className="flex w-fit items-center gap-1 rounded-lg bg-nexus-surface px-3 py-2">
      <span className="h-2 w-2 animate-pulse rounded-full bg-nexus-muted" />
      <span className="h-2 w-2 animate-pulse rounded-full bg-nexus-muted [animation-delay:120ms]" />
      <span className="h-2 w-2 animate-pulse rounded-full bg-nexus-muted [animation-delay:240ms]" />
    </div>
  );
}
