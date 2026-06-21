import { useRef, useState } from "react";

export default function ChatInput({ onSubmit, disabled }) {
  const [value, setValue] = useState("");
  const textareaRef = useRef(null);

  function submit() {
    const message = value.trim();
    if (!message || disabled) return;
    onSubmit(message);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "48px";
    }
  }

  function resize(event) {
    setValue(event.target.value);
    event.target.style.height = "48px";
    event.target.style.height = `${Math.min(event.target.scrollHeight, 180)}px`;
  }

  return (
    <div className="border-t border-nexus-border bg-nexus-bg/95 px-4 py-4 backdrop-blur sticky bottom-0">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-end gap-3 rounded-xl border border-nexus-border bg-nexus-panel p-2 shadow-soft">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={resize}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                submit();
              }
            }}
            placeholder="Ask Nexus AI anything..."
            rows={1}
            disabled={disabled}
            className="min-h-12 flex-1 resize-none bg-transparent px-3 py-3 text-sm leading-6 text-nexus-text placeholder:text-nexus-muted focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
          />
          <button
            type="button"
            onClick={submit}
            disabled={disabled || !value.trim()}
            className="focus-ring mb-0.5 h-11 rounded-lg bg-nexus-accent px-4 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
