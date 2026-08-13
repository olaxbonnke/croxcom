// Types and Empty Defaults for CroxCom. Fake demo data has been purged.

export type MockUser = {
  id: string;
  name: string;
  handle: string;
  avatarColor: string;
  bio?: string;
  role?: string;
  followers?: number;
  following?: number;
  posts?: number;
  avatar?: string;
  banner?: string;
};

export type MockCommunity = {
  id: string;
  slug: string;
  name: string;
  members: number;
  description: string;
  tags?: string[];
  isPublic?: boolean;
};

export type MediaImage = { kind: "image"; url: string; alt: string };
export type MediaImageGrid = { kind: "image-grid"; images: { url: string; alt: string }[] };
export type MediaVideo = { kind: "video"; thumbnail: string; duration: string; title: string };
export type MediaCode = { kind: "code"; language: string; code: string };

export type PostMedia = MediaImage | MediaImageGrid | MediaVideo | MediaCode;

export type MockPost = {
  id: string;
  author: MockUser;
  community?: MockCommunity;
  time: string;
  body: string;
  tags?: string[];
  media?: PostMedia | PostMedia[];
  stats: { comments: number; reposts: number; likes: number };
  longForm?: boolean;
};

export type MockComment = {
  id: string;
  postId: string;
  author: MockUser;
  time: string;
  body: string;
  likes: number;
  replies?: MockComment[];
};

export type MockNotification = {
  id: string;
  kind: "like" | "repost" | "follow" | "mention" | "comment" | "post";
  actor: MockUser;
  time: string;
  read: boolean;
  excerpt?: string;
  postId?: string;
};

export type MockMessage = {
  id: string;
  senderId: string;
  body: string;
  time: string;
};

export type MockConversation = {
  id: string;
  participant: MockUser;
  lastMessage: string;
  lastTime: string;
  unread: number;
  messages: MockMessage[];
};

// ─── Empty Defaults (Fake Personas Purged) ───────────────────────────────────

export const mockUsers: MockUser[] = [];

export const mockCommunities: MockCommunity[] = [
  {
    id: "c1",
    slug: "rag",
    name: "rag-systems",
    members: 0,
    description: "Retrieval, indexing, and evaluation. The full stack for production RAG.",
    tags: ["retrieval", "embeddings", "reranking", "evals"],
    isPublic: true,
  },
  {
    id: "c2",
    slug: "evals",
    name: "evals",
    members: 0,
    description: "Building trustworthy evaluations for language models.",
    tags: ["benchmarks", "llm-eval", "red-teaming"],
    isPublic: true,
  },
  {
    id: "c3",
    slug: "agents",
    name: "agents",
    members: 0,
    description: "Tool-use, planning, and orchestration for autonomous AI agents.",
    tags: ["tool-use", "planning", "orchestration", "multi-agent"],
    isPublic: true,
  },
  {
    id: "c4",
    slug: "finetuning",
    name: "fine-tuning",
    members: 0,
    description: "LoRA, DPO, and full-parameter training — adapting models to tasks.",
    tags: ["lora", "dpo", "sft", "rlhf"],
    isPublic: true,
  },
  {
    id: "c5",
    slug: "infra",
    name: "gpu-infra",
    members: 0,
    description: "Kernels, quantization, and serving at scale.",
    tags: ["cuda", "quantization", "serving", "throughput"],
    isPublic: true,
  },
];

export const mockPosts: MockPost[] = [];
export const mockComments: MockComment[] = [];
export const mockNotifications: MockNotification[] = [];
export const mockConversations: MockConversation[] = [];
export const trending: { topic: string; posts: string }[] = [];
