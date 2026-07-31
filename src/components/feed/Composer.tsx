/**
 * Post Composer component for CroxCom.
 *
 * UX Behavior:
 * - User types main text in the main textarea.
 * - Clicking the IDE button opens a SEPARATE IDE code section BELOW the main text (does not move main text).
 * - Image upload is in the main area (FileReader with preview thumbnails & removal).
 * - If code is present in the IDE section, submitting attaches it as a code media block.
 * - Pure code/prompt posts: user can type in the IDE section (with or without main text).
 */
import { motion, AnimatePresence } from "framer-motion";
import { Code, Globe, Hash, Image as ImageIcon, Lock, Users, X, ChevronDown } from "lucide-react";
import { useMemo, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { PostMedia } from "@/data/mock";

type Privacy = "public" | "followers" | "private";

const PRIVACY_OPTIONS: { value: Privacy; label: string; icon: typeof Globe; hint: string }[] = [
  { value: "public", label: "Public", icon: Globe, hint: "Anyone on CroxCom" },
  { value: "followers", label: "Followers", icon: Users, hint: "People who follow you" },
  { value: "private", label: "Only me", icon: Lock, hint: "Draft — nobody else" },
];

const LANGUAGES = ["typescript", "python", "javascript", "bash", "sql", "json", "html", "rust", "go", "cpp"];

const MAX = 500;

export function Composer({
  onSubmit,
  placeholder = "what are you building or thinking about?",
  compact = false,
}: {
  onSubmit?: (post: {
    body: string;
    tags: string[];
    privacy: Privacy;
    imageDataUrls: string[];
    media?: PostMedia | PostMedia[];
  }) => void;
  placeholder?: string;
  compact?: boolean;
}) {
  const [value, setValue] = useState("");
  const [codeValue, setCodeValue] = useState("");
  const [language, setLanguage] = useState("typescript");
  const [privacy, setPrivacy] = useState<Privacy>("public");
  const [focused, setFocused] = useState(false);

  // Separate IDE section state
  const [isIdeOpen, setIsIdeOpen] = useState(false);
  const [isIdeMinimized, setIsIdeMinimized] = useState(false);

  // Images in main area
  const [images, setImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const tags = useMemo(() => extractTags(value), [value]);
  const remaining = MAX - value.length;
  const canPost = (value.trim().length > 0 || codeValue.trim().length > 0 || images.length > 0) && remaining >= 0;

  const closeIde = () => {
    setIsIdeOpen(false);
    setIsIdeMinimized(false);
    setCodeValue("");
    setLanguage("typescript");
  };

  const submit = () => {
    if (!canPost) return;

    // Determine media blocks (both code and images can exist simultaneously)
    const mediaItems: PostMedia[] = [];

    if (images.length === 1) {
      mediaItems.push({ kind: "image", url: images[0], alt: "Attached image" });
    } else if (images.length > 1) {
      mediaItems.push({
        kind: "image-grid",
        images: images.map((url, i) => ({ url, alt: `Image ${i + 1}` })),
      });
    }

    if (codeValue.trim().length > 0) {
      mediaItems.push({ kind: "code", language, code: codeValue.trim() });
    }

    const media: PostMedia | PostMedia[] | undefined =
      mediaItems.length === 0
        ? undefined
        : mediaItems.length === 1
        ? mediaItems[0]
        : mediaItems;

    onSubmit?.({
      body: value.trim() || (codeValue.trim() ? `[Shared ${language} snippet]` : ""),
      tags,
      privacy,
      imageDataUrls: images,
      media,
    });

    // Reset
    setValue("");
    setCodeValue("");
    setLanguage("typescript");
    setImages([]);
    setFocused(false);
    setIsIdeOpen(false);
    setIsIdeMinimized(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const url = ev.target?.result as string;
        setImages((prev) => [...prev, url]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const toggleIde = () => {
    if (!isIdeOpen) {
      setIsIdeOpen(true);
      setIsIdeMinimized(false);
    } else {
      closeIde();
    }
  };

  const PrivacyIcon = PRIVACY_OPTIONS.find((p) => p.value === privacy)?.icon ?? Globe;

  return (
    <motion.section
      layout
      className={cn(
        "border-b border-border/70 bg-card/40 backdrop-blur-sm transition-all",
        compact ? "p-3" : "px-4 py-4 sm:px-5"
      )}
      aria-label="New post"
    >
      {/* Terminal breadcrumb */}
      {!compact && (
        <div className="mb-2 flex items-center gap-2 font-mono text-xs text-muted-foreground">
          <span className="text-primary">~/croxcom</span>
          <span>$</span>
          <span>create-post</span>
          <span className="text-primary">{">"}</span>
        </div>
      )}

      <div className="flex gap-3">
        {/* Avatar tile */}
        <div
          aria-hidden
          className="mt-0.5 hidden h-9 w-9 shrink-0 place-items-center rounded-md font-mono text-xs sm:grid"
          style={{ background: "#00ff9f", color: "#0a0a0a" }}
        >
          you
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          {/* Main text area */}
          <div
            className={cn(
              "flex flex-col overflow-hidden rounded-md transition-all",
              focused
                ? "border border-border/70 bg-background/60 ring-1 ring-primary/20"
                : "border border-transparent"
            )}
          >
            <textarea
              id="composer-body"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={placeholder}
              rows={focused || value ? 3 : 2}
              className="w-full resize-none bg-transparent p-2.5 font-mono text-[14px] leading-relaxed text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
            />
          </div>

          {/* Image previews (Main Area) */}
          {images.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {images.map((src, i) => (
                <div key={i} className="relative group">
                  <img
                    src={src}
                    alt={`Upload ${i + 1}`}
                    className="h-20 w-20 rounded-md border border-border/70 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute -right-1.5 -top-1.5 hidden h-5 w-5 items-center justify-center rounded-full bg-destructive text-white group-hover:flex"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Separate IDE Code Section BELOW Main Text */}
          <AnimatePresence>
            {isIdeOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: 8 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="flex flex-col overflow-hidden rounded-md border border-border/80 bg-[#0c0c0e] shadow-md"
              >
                {/* IDE Title Bar — Prompt Box replacing colored dots */}
                <div className="flex items-center justify-between border-b border-border/50 bg-muted/30 px-3 py-2">
                  <div className="flex items-center gap-2 flex-1 mr-2">
                    <span className="font-mono text-xs text-primary font-semibold flex items-center gap-1.5 shrink-0">
                      <span className="text-muted-foreground">{">"}</span>prompt:
                    </span>
                    <input
                      type="text"
                      placeholder="e.g. Write a python script for RAG evaluation..."
                      className="w-full max-w-xs rounded bg-background/50 border border-border/60 px-2 py-0.5 font-mono text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none scrollbar-none"
                    />
                    <span className="font-mono text-[11px] text-muted-foreground shrink-0 hidden sm:inline">
                      snippet.{language}
                    </span>

                    {/* Language selector */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="flex items-center gap-1 rounded bg-accent/40 px-2 py-0.5 font-mono text-[10px] text-primary transition-colors hover:bg-accent cursor-pointer shrink-0"
                        >
                          <span>{language}</span>
                          <ChevronDown className="h-3 w-3" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="w-36 p-1 bg-card border-border">
                        <div className="max-h-40 overflow-y-auto space-y-0.5 scrollbar-none">
                          {LANGUAGES.map((lang) => (
                            <button
                              key={lang}
                              type="button"
                              onClick={() => setLanguage(lang)}
                              className={cn(
                                "flex w-full items-center px-2 py-1 font-mono text-xs rounded text-left transition-colors hover:bg-accent",
                                language === lang && "bg-accent text-primary font-bold"
                              )}
                            >
                              {lang}
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* IDE Controls */}
                  <div className="flex items-center gap-3 shrink-0">
                    {!isIdeMinimized ? (
                      <button
                        type="button"
                        onClick={() => setIsIdeMinimized(true)}
                        className="font-mono text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      >
                        _ minimize
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsIdeMinimized(false)}
                        className="font-mono text-[11px] text-primary hover:text-foreground transition-colors cursor-pointer"
                      >
                        □ restore
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={closeIde}
                      className="font-mono text-[11px] text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                    >
                      × close
                    </button>
                  </div>
                </div>

                {/* IDE Textarea with Line Numbers */}
                {!isIdeMinimized && (
                  <div className="flex bg-[#0a0a0c]">
                    <div
                      ref={lineNumbersRef}
                      className="flex w-9 shrink-0 flex-col items-end border-r border-border/30 bg-muted/10 py-3 pr-2 font-mono text-[13px] text-muted-foreground/40 pointer-events-none select-none overflow-hidden scrollbar-none"
                    >
                      {Array.from({ length: Math.max(6, codeValue.split("\n").length) }).map((_, i) => (
                        <span key={i} className="leading-relaxed shrink-0">
                          {i + 1}
                        </span>
                      ))}
                    </div>

                    <textarea
                      value={codeValue}
                      onChange={(e) => setCodeValue(e.target.value)}
                      onScroll={(e) => {
                        if (lineNumbersRef.current) {
                          lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
                        }
                      }}
                      placeholder={`// paste or write your ${language} code here...`}
                      rows={Math.max(6, Math.min(14, codeValue.split("\n").length))}
                      wrap="off"
                      className="w-full resize-none bg-transparent p-3 font-mono text-[13px] leading-relaxed text-emerald-400 placeholder:text-muted-foreground/40 focus:outline-none overflow-x-auto whitespace-pre scrollbar-none"
                    />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tags preview */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {tags.map((t) => (
                <span key={t} className="font-mono text-xs text-primary">
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* Toolbar */}
          <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/40 pt-2">
            <div className="flex items-center gap-1 text-muted-foreground">
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />

              <ToolButton
                label="Attach image"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="h-4 w-4" />
              </ToolButton>

              <ToolButton
                label="Add tag"
                onClick={() =>
                  setValue((v) => (v.endsWith(" ") || v === "" ? `${v}#` : `${v} #`))
                }
              >
                <Hash className="h-4 w-4" />
              </ToolButton>

              {/* IDE Code Button */}
              <ToolButton
                label="Toggle Code IDE"
                onClick={toggleIde}
                active={isIdeOpen}
              >
                <Code className="h-4 w-4" />
              </ToolButton>

              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    aria-label="Change privacy"
                    className="ml-1 flex items-center gap-1 rounded-md px-2 py-1 font-mono text-xs transition-colors hover:bg-accent/60 hover:text-foreground cursor-pointer"
                  >
                    <PrivacyIcon className="h-3.5 w-3.5" />
                    <span className="capitalize">{privacy}</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-52 p-1 bg-card border-border">
                  {PRIVACY_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setPrivacy(opt.value)}
                        className={cn(
                          "flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-accent cursor-pointer",
                          privacy === opt.value && "bg-accent/60"
                        )}
                      >
                        <Icon className="mt-0.5 h-4 w-4 text-muted-foreground" />
                        <span className="min-w-0">
                          <span className="block text-sm text-foreground">{opt.label}</span>
                          <span className="block text-xs text-muted-foreground">{opt.hint}</span>
                        </span>
                      </button>
                    );
                  })}
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center gap-3">
              <span
                aria-live="polite"
                className={cn(
                  "font-mono text-xs tabular-nums",
                  remaining < 0
                    ? "text-destructive"
                    : remaining < 60
                      ? "text-primary"
                      : "text-muted-foreground"
                )}
              >
                {remaining}
              </span>
              <Button
                type="button"
                onClick={submit}
                disabled={!canPost}
                className="h-8.5 rounded-md px-4 font-mono text-sm cursor-pointer"
              >
                post
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function ToolButton({
  children,
  label,
  onClick,
  active,
}: {
  children: ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "rounded-md p-1.5 transition-colors hover:bg-accent/60 hover:text-primary cursor-pointer",
        active && "text-primary bg-primary/10"
      )}
    >
      {children}
    </button>
  );
}

function extractTags(text: string): string[] {
  const set = new Set<string>();
  const re = /#([a-zA-Z][a-zA-Z0-9_-]{0,32})/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) set.add(m[1].toLowerCase());
  return Array.from(set);
}
