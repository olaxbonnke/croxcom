import { useState, KeyboardEvent } from "react";
import { Send } from "lucide-react";

interface MessageInputProps {
  onSend: (body: string) => void;
}

export function MessageInput({ onSend }: MessageInputProps) {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (text.trim()) {
      onSend(text.trim());
      setText("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-end gap-2 border-t border-border/70 bg-background/95 px-4 py-3 backdrop-blur-md">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="> type a message..."
        rows={1}
        className="w-full resize-none rounded-md border border-border bg-card/60 px-3 py-2 font-mono text-[14px] text-foreground transition-colors placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none"
        style={{
          minHeight: "42px",
          maxHeight: "120px",
          fieldSizing: "content"
        } as React.CSSProperties}
      />
      <button
        onClick={handleSend}
        disabled={!text.trim()}
        className="flex h-[42px] shrink-0 items-center justify-center rounded-md bg-primary px-4 py-2 font-mono text-sm text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        <Send className="h-4 w-4" />
      </button>
    </div>
  );
}
