import { ExternalLink, Globe } from "lucide-react";

type LinkMetaData = {
  url: string;
  domain: string;
  title: string;
  description: string;
  imageUrl?: string;
};

// Known mock link previews for rich rendering in demo
const MOCK_LINK_PREVIEWS: Record<string, LinkMetaData> = {
  "techcrunch.com": {
    url: "https://techcrunch.com",
    domain: "techcrunch.com",
    title: "OpenAI GPT-5 Architecture & Dynamic Routing",
    description: "Deep dive into dynamic model routing, long context windows, and hallucination reduction strategies.",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
  },
  "deepmind.google": {
    url: "https://deepmind.google",
    domain: "deepmind.google",
    title: "Gemini 2.0 Ultra Technical Report & Evals",
    description: "Full benchmark breakdown across 24 reasoning, multimodal, and code generation test suites.",
    imageUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80",
  },
  "github.com": {
    url: "https://github.com",
    domain: "github.com",
    title: "Minimal Agent Loop Reference Implementation",
    description: "Zero-dependency 120-line tool-use loop written in Python. Star and fork on GitHub.",
    imageUrl: "https://images.unsplash.com/photo-1618401471353-b98aedd04e11?w=800&q=80",
  },
  "arxiv.org": {
    url: "https://arxiv.org",
    domain: "arxiv.org",
    title: "Constitutional AI 2.0: Automated Critique Evals",
    description: "Scalable oversight methods using AI feedback for alignment at 10x lower cost.",
    imageUrl: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&q=80",
  },
};

export function extractUrl(text: string): string | null {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const match = text.match(urlRegex);
  if (!match) return null;
  // Strip trailing punctuation (such as '.', ',', '!', '?', ')', ']', ';', ':', '"', "'")
  const cleaned = match[0].replace(/[.,!?);:"']+$/, "");
  return cleaned || null;
}

export function LinkPreviewCard({ url }: { url: string }) {
  const cleanUrl = url.replace(/[.,!?);:"']+$/, "");
  let domain = "";
  try {
    domain = new URL(cleanUrl).hostname.replace(/^www\./, "").replace(/\.$/, "");
  } catch {
    domain = cleanUrl
      .replace(/^https?:\/\//, "")
      .split("/")[0]
      .replace(/^www\./, "")
      .replace(/[.,!?);:"']+$/, "");
  }

  const meta = MOCK_LINK_PREVIEWS[domain] || {
    url: cleanUrl,
    domain,
    title: `Reference link from ${domain}`,
    description: `Click to visit external link: ${cleanUrl}`,
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
  };

  return (
    <a
      href={meta.url}
      target="_blank"
      rel="noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="group mt-3 flex flex-col overflow-hidden rounded-lg border border-border/70 bg-card/60 transition-all hover:border-primary/50 hover:bg-card sm:flex-row shadow-sm"
    >
      {meta.imageUrl && (
        <div className="h-32 w-full shrink-0 overflow-hidden sm:h-auto sm:w-36">
          <img
            src={meta.imageUrl}
            alt={meta.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col justify-between p-3">
        <div>
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
            <Globe className="h-3 w-3 text-primary" />
            <span className="truncate">{meta.domain}</span>
          </div>
          <h4 className="mt-1 text-sm font-medium text-foreground transition-colors group-hover:text-primary leading-snug">
            {meta.title}
          </h4>
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {meta.description}
          </p>
        </div>
        <div className="mt-2 flex items-center gap-1 font-mono text-[10px] text-primary opacity-0 transition-opacity group-hover:opacity-100">
          <span>Visit link</span>
          <ExternalLink className="h-3 w-3" />
        </div>
      </div>
    </a>
  );
}
