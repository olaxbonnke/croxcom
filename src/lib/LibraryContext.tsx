import React, { createContext, useContext, useEffect, useState } from "react";
import { mockUsers, type MockUser } from "@/data/mock";
import { SHOW_DEMO_DATA } from "@/lib/config";

export type LibraryItem = {
  id: string;
  title: string;
  author: MockUser;
  imageUrl: string;
  prompt: string;
  description: string;
  category: "UI/UX" | "Model Architecture" | "AI Art" | "Workflow";
  tags: string[];
  likes: number;
};

export const INITIAL_LIBRARY_ITEMS: LibraryItem[] = SHOW_DEMO_DATA ? [
  {
    id: "lib-1",
    title: "Cyberpunk Terminal Dashboard",
    author: mockUsers[0],
    imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80",
    prompt:
      "Minimalist dark terminal dashboard UI, glowing cyan accents, telemetry graphs, glassmorphism layout, 8k resolution, UI design inspiration",
    description:
      "A dark-mode analytics console designed for GPU cluster monitoring and real-time LLM inference tracking.",
    category: "UI/UX",
    tags: ["Dashboard", "Glassmorphism", "GPU-Monitor", "Dark-Theme"],
    likes: 342,
  },
  {
    id: "lib-2",
    title: "Transformer Latent Space Viz",
    author: mockUsers[1],
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
    prompt:
      "3D vector embedding map, high-dimensional topological graph visualization, glowing nodes, dark background, octree rendering",
    description:
      "Visualizing 1536-dimensional embedding vectors using UMAP projection and interactive node clustering.",
    category: "Model Architecture",
    tags: ["Embeddings", "UMAP", "Latent-Space", "Visualization"],
    likes: 512,
  },
  {
    id: "lib-3",
    title: "Agentic DAG Execution Pipeline",
    author: mockUsers[2],
    imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80",
    prompt:
      "Complex node graph workflow diagram, AI agent task orchestration, cybernetic matrix aesthetics, clean schematic blueprint",
    description:
      "Multi-agent task decomposition flow diagram showing parallel sub-agent execution and safety gate validation.",
    category: "Workflow",
    tags: ["Agents", "DAG", "Orchestration", "Architecture"],
    likes: 289,
  },
  {
    id: "lib-4",
    title: "Neon Neural Network Nodes",
    author: mockUsers[3],
    imageUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80",
    prompt:
      "Abstract neural pathway connections, glowing neon synapses, deep learning matrix art, ultra detailed 4k rendering",
    description:
      "Generative artwork inspired by attention head weight distributions in multi-layer Transformers.",
    category: "AI Art",
    tags: ["Neural-Net", "Generative", "Attention", "Art"],
    likes: 670,
  },
  {
    id: "lib-5",
    title: "IDE Code Assistant Interface",
    author: mockUsers[0],
    imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
    prompt:
      "Modern developer code editor interface, dark syntax highlighting, inline AI diff suggestions, sleek monospace typography",
    description:
      "Clean UI concept for inline code refactoring and automatic test generation inside web IDEs.",
    category: "UI/UX",
    tags: ["IDE", "Code-Editor", "AI-Assistant", "DevTools"],
    likes: 421,
  },
  {
    id: "lib-6",
    title: "Distributed GPU Cluster Map",
    author: mockUsers[1],
    imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80",
    prompt:
      "Infographic diagram of distributed H100 GPU cluster topology, NVLink interconnect network, server rack schematic art",
    description:
      "Architectural reference for 1024x GPU cluster setup with InfiniBand fabric topology.",
    category: "Model Architecture",
    tags: ["GPU", "Infrastructure", "Hardware", "Cluster"],
    likes: 310,
  },
] : [];

const SAVED_ITEMS_KEY = "croxcom-saved-library-ids";

interface LibraryContextType {
  items: LibraryItem[];
  savedIds: string[];
  toggleSave: (id: string) => void;
  isSaved: (id: string) => boolean;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const [items] = useState<LibraryItem[]>(INITIAL_LIBRARY_ITEMS);
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(SAVED_ITEMS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      /* ignore */
    }
    return ["lib-1", "lib-4"]; // default saved for demo
  });

  useEffect(() => {
    try {
      localStorage.setItem(SAVED_ITEMS_KEY, JSON.stringify(savedIds));
    } catch {
      /* ignore */
    }
  }, [savedIds]);

  const toggleSave = (id: string) => {
    setSavedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const isSaved = (id: string) => savedIds.includes(id);

  return (
    <LibraryContext.Provider value={{ items, savedIds, toggleSave, isSaved }}>
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error("useLibrary must be used within a LibraryProvider");
  }
  return context;
}
