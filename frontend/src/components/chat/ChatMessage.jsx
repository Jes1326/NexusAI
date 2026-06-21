import { parseMarkdown } from "../../utils/markdown";
import { cn } from "../../utils/cn";

function InlineText({ text }) {
  const parts = String(text).split(/(`[^`]+`)/g);
  return parts.map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={`${part}-${index}`} className="rounded bg-black/30 px-1.5 py-0.5 text-blue-100">
          {part.slice(1, -1)}
        </code>
      );
    }
    return <span key={`${part}-${index}`}>{part}</span>;
  });
}

export default function ChatMessage({ message }) {
  const isUser = message.role === "user";
  const blocks = parseMarkdown(message.content);

  return (
    <article className={cn("flex gap-3", isUser && "justify-end")}>
      {!isUser && (
        <div className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-nexus-accent text-sm font-semibold text-white">
          N
        </div>
      )}
      <div className={cn("max-w-3xl", isUser ? "order-first" : "")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-6",
            isUser
              ? "bg-nexus-accent text-white"
              : "border border-nexus-border bg-nexus-panel text-nexus-text"
          )}
        >
          <div className="space-y-3">
            {blocks.map((block, index) => {
              if (block.type === "code") {
                return (
                  <div key={index} className="overflow-hidden rounded-lg border border-nexus-border bg-black/30">
                    {block.language && (
                      <div className="border-b border-nexus-border px-3 py-1.5 text-xs text-nexus-muted">
                        {block.language}
                      </div>
                    )}
                    <pre className="overflow-x-auto p-3 text-xs leading-5 text-blue-100">
                      <code>{block.content}</code>
                    </pre>
                  </div>
                );
              }

              if (block.type === "list") {
                return (
                  <ul key={index} className="list-disc space-y-1 pl-5">
                    {block.items.map((item, itemIndex) => (
                      <li key={`${item}-${itemIndex}`}>
                        <InlineText text={item} />
                      </li>
                    ))}
                  </ul>
                );
              }

              return (
                <p key={index}>
                  <InlineText text={block.content} />
                </p>
              );
            })}
          </div>
        </div>

        {!isUser && (message.memoriesUsed?.length || message.agents?.length) ? (
          <div className="mt-2 grid gap-2 text-xs text-nexus-muted sm:grid-cols-2">
            {message.memoriesUsed?.length ? (
              <div className="rounded-lg border border-nexus-border bg-nexus-surface p-3">
                <p className="mb-2 font-medium text-nexus-text">Retrieved</p>
                <ul className="space-y-1">
                  {message.memoriesUsed.slice(0, 3).map((memory, index) => (
                    <li key={`${memory}-${index}`} className="line-clamp-2">
                      {memory}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {message.agents?.length ? (
              <div className="rounded-lg border border-nexus-border bg-nexus-surface p-3">
                <p className="mb-2 font-medium text-nexus-text">Agents</p>
                <div className="flex flex-wrap gap-1.5">
                  {message.agents.map((agent) => (
                    <span key={agent.name} className="rounded-full bg-white/5 px-2 py-1 text-emerald-300">
                      {agent.name}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}
