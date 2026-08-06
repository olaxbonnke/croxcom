/**
 * CodeBlock — shared IDE-style code snippet panel.
 *
 * Used by PostCard and PostDetail to render code media attachments
 * with line numbers, copy, and expand/minimize toggles.
 */
import { useState } from "react";

interface CodeBlockProps {
  code: string;
  language?: string;
  /** Whether the block starts minimized. Defaults to true. */
  defaultMinimized?: boolean;
}

export function CodeBlock({ code, language = "code", defaultMinimized = true }: CodeBlockProps) {
  const [isMinimized, setIsMinimized] = useState(defaultMinimized);
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const firstLine = code.split("\n")[0];

  return (
    <div className="flex flex-col overflow-hidden rounded-md border border-border/70 bg-[#0d0d0d] shadow-sm my-1">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-border/40 bg-muted/10 px-3 py-2">
        <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
          <span className="font-mono text-xs text-primary font-semibold flex items-center gap-1 shrink-0">
            <span className="text-muted-foreground">{">"}</span>prompt:
          </span>
          <span className="font-mono text-xs text-foreground/80 truncate">
            {firstLine ? `"${firstLine.slice(0, 50)}..."` : `snippet.${language}`}
          </span>
          <span className="font-mono text-[10px] text-muted-foreground/70 shrink-0">
            [{language}]
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopy}
            className="rounded bg-accent/40 px-2 py-0.5 font-mono text-[10px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground cursor-pointer"
          >
            {copied ? "✓ copied" : "copy code"}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized((prev) => !prev);
            }}
            className="font-mono text-[11px] text-primary hover:underline cursor-pointer"
          >
            {isMinimized ? "□ expand" : "_ minimize"}
          </button>
        </div>
      </div>

      {/* Code Body (only shown when NOT minimized) */}
      {!isMinimized && (
        <div className="flex bg-[#0a0a0c]">
          <div className="flex w-9 shrink-0 flex-col items-end border-r border-border/30 bg-muted/10 py-3 pr-2 font-mono text-[13px] text-muted-foreground/40 pointer-events-none select-none overflow-hidden">
            {Array.from({ length: code.split("\n").length }).map((_, i) => (
              <span key={i} className="leading-relaxed shrink-0">
                {i + 1}
              </span>
            ))}
          </div>
          <pre
            className="flex-1 overflow-x-auto p-3 font-mono text-[13px] leading-relaxed text-emerald-400 scrollbar-none"
            aria-label={`${language} code block`}
          >
            <code>{code}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
