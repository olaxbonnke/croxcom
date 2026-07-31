// Mock content for CroxCom Phase 1. Realistic AI-dev community material.

export type MockUser = {
  id: string;
  name: string;
  handle: string;
  avatarColor: string; // token-friendly hex used only for placeholder tile
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
  isPublic?: boolean; // defaults to true
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
  time: string; // relative label, e.g. "2h"
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
  kind: "like" | "repost" | "follow" | "mention" | "comment";
  actor: MockUser;
  time: string;
  read: boolean;
  excerpt?: string; // snippet of the post or comment
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

// ─── Users ────────────────────────────────────────────────────────────────────

export const mockUsers: MockUser[] = [
  {
    id: "u1",
    name: "Ada Okafor",
    handle: "ada.okafor",
    avatarColor: "#00ff9f",
    role: "ML Research @ Voxel",
    bio: "Interpretability, evals, and small models. Building tools that help you understand what your model actually knows.",
    followers: 4821,
    following: 312,
    posts: 247,
  },
  {
    id: "u2",
    name: "Miguel Sato",
    handle: "msato",
    avatarColor: "#7dd3fc",
    role: "Founding engineer",
    bio: "Shipping AI products from 0→1. Previously at Cohere, Anthropic. Open-source contributor.",
    followers: 2190,
    following: 198,
    posts: 133,
  },
  {
    id: "u3",
    name: "Priya Rangan",
    handle: "priya",
    avatarColor: "#f9a8a8",
    role: "RAG systems",
    bio: "Obsessed with retrieval quality. If your embeddings are great but your results aren't, I want to know why.",
    followers: 3405,
    following: 410,
    posts: 189,
  },
  {
    id: "u4",
    name: "Jonas Vogel",
    handle: "jvogel",
    avatarColor: "#c9a0dc",
    role: "Agents & tools",
    bio: "Agent frameworks are overhyped. The loop is not. Writing about minimal, composable tool-use patterns.",
    followers: 6230,
    following: 521,
    posts: 342,
  },
  {
    id: "u5",
    name: "Nia Bello",
    handle: "nia",
    avatarColor: "#fbbf24",
    role: "GPU infra",
    bio: "Squeezing every FLOP out of A100s. Quantization, kernels, serving. Sometimes I write about burnout.",
    followers: 8901,
    following: 230,
    posts: 421,
  },
  {
    id: "u6",
    name: "Kenji Tanaka",
    handle: "kenji",
    avatarColor: "#a8c0a0",
    role: "Fine-tuning",
    bio: "LoRA, DPO, SFT. Making 7B models punch above their weight. DMs open for fine-tuning questions.",
    followers: 1893,
    following: 287,
    posts: 98,
  },
];

// ─── Communities ──────────────────────────────────────────────────────────────

export const mockCommunities: MockCommunity[] = [
  {
    id: "c1",
    slug: "rag",
    name: "rag-systems",
    members: 12480,
    description: "Retrieval, indexing, and evaluation. The full stack for production RAG.",
    tags: ["retrieval", "embeddings", "reranking", "evals"],
    isPublic: true,
  },
  {
    id: "c2",
    slug: "evals",
    name: "evals",
    members: 8210,
    description: "Building trustworthy evaluations for language models.",
    tags: ["benchmarks", "llm-eval", "red-teaming"],
    isPublic: true,
  },
  {
    id: "c3",
    slug: "agents",
    name: "agents",
    members: 15390,
    description: "Tool-use, planning, and orchestration for autonomous AI agents.",
    tags: ["tool-use", "planning", "orchestration", "multi-agent"],
    isPublic: true,
  },
  {
    id: "c4",
    slug: "finetuning",
    name: "fine-tuning",
    members: 9120,
    description: "LoRA, DPO, and full-parameter training — adapting models to tasks.",
    tags: ["lora", "dpo", "sft", "rlhf"],
    isPublic: true,
  },
  {
    id: "c5",
    slug: "infra",
    name: "gpu-infra",
    members: 6540,
    description: "Kernels, quantization, and serving at scale.",
    tags: ["cuda", "quantization", "serving", "throughput"],
    isPublic: true,
  },
];

const [ada, miguel, priya, jonas, nia, kenji] = mockUsers;
const [rag, evals, agents, finetuning, infra] = mockCommunities;

// ─── Posts ────────────────────────────────────────────────────────────────────

export const mockPosts: MockPost[] = [
  {
    id: "p1",
    author: priya,
    community: rag,
    time: "34m",
    body:
      "Reranking > bigger embedding models, at least for our corpus. Swapping to a cross-encoder reranker cut hallucinated citations by ~41% on our internal eval set, while the embedding model stayed put.\n\nA short thread on what actually moved the needle:",
    tags: ["rag", "retrieval", "evals"],
    stats: { comments: 42, reposts: 18, likes: 312 },
    longForm: true,
  },
  {
    id: "p2",
    author: jonas,
    community: agents,
    time: "1h",
    body: "Small models with good tool selection outperform frontier models with poor tool selection. Tool choice is the whole game.",
    tags: ["agents", "tools"],
    stats: { comments: 21, reposts: 7, likes: 188 },
  },
  {
    id: "p3",
    author: nia,
    community: infra,
    time: "2h",
    body:
      "Quick GPU sanity check I run on every new box before benchmarks — catches thermal throttling, PCIe lane weirdness, and the classic 'wrong CUDA version' foot-gun.",
    tags: ["cuda", "infra"],
    media: {
      kind: "code",
      language: "bash",
      code: `# gpu-sanity.sh
nvidia-smi --query-gpu=name,pcie.link.gen.current,pcie.link.width.current,temperature.gpu --format=csv
python -c "import torch; print(torch.cuda.is_available(), torch.version.cuda, torch.cuda.get_device_name(0))"
python -c "import torch; a=torch.randn(8192,8192,device='cuda'); torch.cuda.synchronize(); print('ok')"`,
    },
    stats: { comments: 14, reposts: 33, likes: 402 },
  },
  {
    id: "p4",
    author: ada,
    time: "3h",
    body: "Attention pattern from a small interpretability probe I've been running this week. Layer 14, head 6 — clean induction behavior on repeated bigrams.",
    tags: ["interpretability"],
    media: {
      kind: "image",
      url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80",
      alt: "Abstract circuit-like visualization",
    },
    stats: { comments: 9, reposts: 12, likes: 227 },
  },
  {
    id: "p5",
    author: kenji,
    community: finetuning,
    time: "5h",
    body:
      "DPO vs SFT-then-DPO on a 7B for a customer-support task. Same data budget. TL;DR: SFT warmup still matters when the base model hasn't seen the domain.",
    tags: ["dpo", "sft", "training"],
    stats: { comments: 27, reposts: 9, likes: 154 },
  },
  {
    id: "p6",
    author: miguel,
    time: "7h",
    body: "Shipping a new agent playground next week — recording a walkthrough today. Four screenshots from the run:",
    media: {
      kind: "image-grid",
      images: [
        { url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80", alt: "Code on a dark screen" },
        { url: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&q=80", alt: "Terminal window" },
        { url: "https://images.unsplash.com/photo-1517134191118-9d595e4c8c2b?w=800&q=80", alt: "Graphs on a laptop" },
        { url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80", alt: "Developer at a desk" },
      ],
    },
    stats: { comments: 11, reposts: 4, likes: 96 },
  },
  {
    id: "p7",
    author: ada,
    community: evals,
    time: "9h",
    body:
      "PSA: your eval set is probably too easy. If your model scores >95% and shipping still surprises you, the eval isn't measuring what production hits. Log real traffic, sample the failures, promote them into the set.",
    tags: ["evals"],
    stats: { comments: 38, reposts: 22, likes: 511 },
  },
  {
    id: "p8",
    author: jonas,
    time: "12h",
    body: "Recorded a 6-min walkthrough of a minimal tool-calling loop in ~120 lines. No framework, just the API + a while loop.",
    media: {
      kind: "video",
      thumbnail: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&q=80",
      duration: "6:12",
      title: "A minimal tool-calling loop in 120 lines",
    },
    stats: { comments: 19, reposts: 15, likes: 264 },
  },
  {
    id: "p9",
    author: priya,
    community: rag,
    time: "1d",
    body: "Hybrid retrieval (BM25 + dense) still wins on our long-tail queries. Ratio matters more than most posts admit — we ended at 0.35 BM25 / 0.65 dense after a small sweep.",
    tags: ["rag", "hybrid"],
    stats: { comments: 16, reposts: 6, likes: 143 },
  },
  {
    id: "p10",
    author: nia,
    community: infra,
    time: "1d",
    body: "int8 KV cache + paged attention shaved ~28% off our p99 on a single A100 without measurable quality loss on our tasks. Numbers below.",
    tags: ["quantization", "serving"],
    stats: { comments: 12, reposts: 10, likes: 178 },
  },
];

// ─── Comments ─────────────────────────────────────────────────────────────────

export const mockComments: MockComment[] = [
  {
    id: "cm1",
    postId: "p1",
    author: ada,
    time: "28m",
    body: "Which cross-encoder did you end up using? We've been on ms-marco-MiniLM-L6-v2 but considering the larger variants.",
    likes: 14,
    replies: [
      {
        id: "cm1r1",
        postId: "p1",
        author: priya,
        time: "25m",
        body: "Started with MiniLM-L6, switched to L12 for the quality bump. Latency is fine at our scale — 80ms p95 on 100 candidates.",
        likes: 8,
      },
      {
        id: "cm1r2",
        postId: "p1",
        author: miguel,
        time: "20m",
        body: "Have you tried bge-reranker-large? Better on our domain-specific queries vs ms-marco variants.",
        likes: 5,
      },
    ],
  },
  {
    id: "cm2",
    postId: "p1",
    author: jonas,
    time: "22m",
    body: "The 41% drop in hallucinated citations is a huge signal. Did you isolate it as purely the reranker, or were there other changes in the same deploy?",
    likes: 21,
    replies: [
      {
        id: "cm2r1",
        postId: "p1",
        author: priya,
        time: "18m",
        body: "A/B tested cleanly — same embedding model, same chunking, only the reranker changed. We ran it for a week on 20% of traffic first.",
        likes: 19,
      },
    ],
  },
  {
    id: "cm3",
    postId: "p1",
    author: nia,
    time: "15m",
    body: "What's your latency overhead from the reranker? That's always the tradeoff I'm worried about when recommending this to teams.",
    likes: 9,
  },
  {
    id: "cm4",
    postId: "p1",
    author: kenji,
    time: "10m",
    body: "Makes sense — cross-encoders see the full context of query + doc together, so they can catch relevance signals that bi-encoders miss at retrieval time.",
    likes: 31,
  },
  {
    id: "cm5",
    postId: "p2",
    author: ada,
    time: "55m",
    body: "Completely agree. Spent 3 months trying to replace our tool router with a bigger model. Ultimately fixed it by writing clearer tool descriptions.",
    likes: 42,
  },
  {
    id: "cm6",
    postId: "p2",
    author: priya,
    time: "50m",
    body: "What's your current tool selection approach? Classifier, prompted LLM, or something else?",
    likes: 7,
    replies: [
      {
        id: "cm6r1",
        postId: "p2",
        author: jonas,
        time: "45m",
        body: "Prompted LLM with few-shot examples. We tried a dedicated classifier but the maintenance overhead wasn't worth it for our 12-tool surface.",
        likes: 18,
      },
    ],
  },
  {
    id: "cm7",
    postId: "p3",
    author: miguel,
    time: "1h 45m",
    body: "Saving this script. The PCIe check has caught problems for us twice already on cloud instances.",
    likes: 25,
  },
  {
    id: "cm8",
    postId: "p4",
    author: kenji,
    time: "2h 40m",
    body: "Beautiful induction pattern. Did you see this degrade at longer context lengths? Curious if the head behavior stays clean at 8k+ tokens.",
    likes: 13,
  },
  {
    id: "cm9",
    postId: "p7",
    author: miguel,
    time: "8h 20m",
    body: "This is the real talk. We had a 97% eval score and then got badly surprised by production edge cases. Promoted 40 real failures into the set and the score dropped to 84%. Much more honest now.",
    likes: 87,
  },
  {
    id: "cm10",
    postId: "p7",
    author: nia,
    time: "8h 10m",
    body: "Sampling from production traffic is underrated advice. Most eval sets are constructed from imagined inputs, not real distribution.",
    likes: 61,
  },
];

// ─── Notifications ────────────────────────────────────────────────────────────

export const mockNotifications: MockNotification[] = [
  {
    id: "n1",
    kind: "like",
    actor: ada,
    time: "2m",
    read: false,
    excerpt: "Reranking > bigger embedding models…",
    postId: "p1",
  },
  {
    id: "n2",
    kind: "repost",
    actor: jonas,
    time: "8m",
    read: false,
    excerpt: "Reranking > bigger embedding models…",
    postId: "p1",
  },
  {
    id: "n3",
    kind: "comment",
    actor: miguel,
    time: "15m",
    read: false,
    excerpt: "Have you tried bge-reranker-large?",
    postId: "p1",
  },
  {
    id: "n4",
    kind: "follow",
    actor: nia,
    time: "34m",
    read: false,
  },
  {
    id: "n5",
    kind: "mention",
    actor: kenji,
    time: "1h",
    read: true,
    excerpt: "Cross-encoders see the full context of query + doc together, so they can catch relevance signals…",
    postId: "p1",
  },
  {
    id: "n6",
    kind: "like",
    actor: miguel,
    time: "2h",
    read: true,
    excerpt: "Hybrid retrieval (BM25 + dense) still wins…",
    postId: "p9",
  },
  {
    id: "n7",
    kind: "repost",
    actor: ada,
    time: "3h",
    read: true,
    excerpt: "Hybrid retrieval (BM25 + dense) still wins…",
    postId: "p9",
  },
  {
    id: "n8",
    kind: "follow",
    actor: jonas,
    time: "5h",
    read: true,
  },
  {
    id: "n9",
    kind: "comment",
    actor: nia,
    time: "8h",
    read: true,
    excerpt: "What's your latency overhead from the reranker?",
    postId: "p1",
  },
  {
    id: "n10",
    kind: "like",
    actor: kenji,
    time: "1d",
    read: true,
    excerpt: "PSA: your eval set is probably too easy…",
    postId: "p7",
  },
];

// ─── Conversations / Messages ─────────────────────────────────────────────────

export const mockConversations: MockConversation[] = [
  {
    id: "conv1",
    participant: ada,
    lastMessage: "Let me know what you find on the reranker latency side.",
    lastTime: "14m",
    unread: 2,
    messages: [
      { id: "m1", senderId: "u1", body: "Hey! Loved your reranking post.", time: "1h" },
      { id: "m2", senderId: "me", body: "Thanks! The results surprised even us honestly.", time: "58m" },
      { id: "m3", senderId: "u1", body: "What reranker lib are you using under the hood? sentence-transformers?", time: "55m" },
      { id: "m4", senderId: "me", body: "Yes, sentence-transformers with bge-reranker-large. We wrapped it in a small FastAPI service.", time: "52m" },
      { id: "m5", senderId: "u1", body: "Nice. We're debating between that and a hosted reranking endpoint. The latency tradeoff is real.", time: "20m" },
      { id: "m6", senderId: "me", body: "Self-hosted is worth it once you're at scale. p95 was under 90ms for us on 100 candidates.", time: "18m" },
      { id: "m7", senderId: "u1", body: "Let me know what you find on the reranker latency side.", time: "14m" },
    ],
  },
  {
    id: "conv2",
    participant: jonas,
    lastMessage: "We should co-write something on minimal agent loops.",
    lastTime: "2h",
    unread: 0,
    messages: [
      { id: "m8", senderId: "u4", body: "Saw your post on hybrid retrieval. Solid numbers.", time: "3h" },
      { id: "m9", senderId: "me", body: "Thanks — took a while to tune the BM25/dense ratio properly.", time: "2h 50m" },
      { id: "m10", senderId: "u4", body: "Have you tried combining with graph-based retrieval at all?", time: "2h 30m" },
      { id: "m11", senderId: "me", body: "Not yet. What's your experience with it?", time: "2h 20m" },
      { id: "m12", senderId: "u4", body: "We should co-write something on minimal agent loops.", time: "2h" },
    ],
  },
  {
    id: "conv3",
    participant: miguel,
    lastMessage: "Happy to review the eval design before you ship.",
    lastTime: "1d",
    unread: 0,
    messages: [
      { id: "m13", senderId: "u2", body: "Working on a new eval suite for RAG. Mind if I bounce ideas?", time: "2d" },
      { id: "m14", senderId: "me", body: "Of course! What's the use case?", time: "1d 23h" },
      { id: "m15", senderId: "u2", body: "Customer support Q&A. Hard part is defining 'correct' for open-ended answers.", time: "1d 20h" },
      { id: "m16", senderId: "me", body: "LLM-as-judge with rubrics tends to work well for that. G-eval or prometheus-eval.", time: "1d 18h" },
      { id: "m17", senderId: "u2", body: "Happy to review the eval design before you ship.", time: "1d" },
    ],
  },
  {
    id: "conv4",
    participant: nia,
    lastMessage: "The A100 SXM is definitely worth it for long training runs.",
    lastTime: "3d",
    unread: 1,
    messages: [
      { id: "m18", senderId: "u5", body: "Quick question — A100 PCIe vs SXM for fine-tuning a 13B?", time: "3d 2h" },
      { id: "m19", senderId: "me", body: "How long are your training runs? SXM has way better interconnect.", time: "3d 1h" },
      { id: "m20", senderId: "u5", body: "About 6-8 hours per run, multi-GPU.", time: "3d 30m" },
      { id: "m21", senderId: "u5", body: "The A100 SXM is definitely worth it for long training runs.", time: "3d" },
    ],
  },
];

// ─── Trending ─────────────────────────────────────────────────────────────────

export const trending = [
  { topic: "quantization", posts: "2,341 posts" },
  { topic: "rag-evals", posts: "1,872 posts" },
  { topic: "tool-use", posts: "1,410 posts" },
  { topic: "small-models", posts: "988 posts" },
  { topic: "dpo", posts: "612 posts" },
];
