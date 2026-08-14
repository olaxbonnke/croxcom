import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/AuthContext";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useLibrary, type LibraryItem } from "@/lib/LibraryContext";
import { Bookmark, Heart, Library, Sparkles, X, Copy, Check, Filter, Plus } from "lucide-react";

export const Route = createFileRoute("/library")({
  component: LibraryPage,
});

type Tab = "Main Library" | "My Library";

export function LibraryPage() {
  const { items, savedIds, toggleSave, isSaved, addItemToLibrary } = useLibrary();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<Tab>("Main Library");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Library Item form
  const [newTitle, setNewTitle] = useState("");
  const [newPrompt, setNewPrompt] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCategory, setNewCategory] = useState<LibraryItem["category"]>("UI/UX");
  const [newTags, setNewTags] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");

  const categories = ["All", "UI/UX", "Model Architecture", "AI Art", "Workflow"];

  const displayedItems = (
    activeTab === "Main Library" ? items : items.filter((item) => savedIds.includes(item.id))
  ).filter((item) => selectedCategory === "All" || item.category === selectedCategory);

  const handleCopyPrompt = (promptText: string) => {
    navigator.clipboard.writeText(promptText);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  return (
    <AppShell>
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 border-b border-border/70 bg-background/80 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Library className="h-5 w-5 text-primary" />
            <h1 className="font-semibold text-foreground text-lg">Library</h1>
          </div>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 font-mono text-xs font-semibold text-primary-foreground hover:opacity-90 transition-all cursor-pointer shadow-md shadow-primary/20 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Add to Library</span>
          </button>
        </div>
        <p className="font-mono text-xs text-muted-foreground mt-0.5">
          Curated visual prompts, architecture diagrams, and UI components for AI builders.
        </p>
      </div>

      {/* Main vs My Library Tabs (Instant indicator, zero animation) */}
      <div className="flex items-center border-b border-border/70 bg-card/20 px-4">
        {(["Main Library", "My Library"] as Tab[]).map((tab) => {
          const isActive = activeTab === tab;
          const count = tab === "Main Library" ? items.length : savedIds.length;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative py-3.5 px-5 font-mono text-xs font-semibold cursor-pointer ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{tab}</span>
                <span className="rounded-full bg-accent/60 px-2 py-0.2 text-[10px] text-foreground">
                  {count}
                </span>
              </div>
              {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
            </button>
          );
        })}
      </div>

      {/* Categories Filter Strip (Instant selection) */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-border/50 px-4 py-2.5 scrollbar-none bg-background">
        <Filter className="h-3.5 w-3.5 text-muted-foreground mr-1 shrink-0" />
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`font-mono text-xs px-3 py-1 rounded-full cursor-pointer shrink-0 ${
              selectedCategory === cat
                ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                : "bg-accent/40 text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Gallery Grid (Instant render with zero motion/animation) */}
      <div className="p-4 pb-24">
        {displayedItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedItems.map((item) => {
              const saved = isSaved(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="group relative cursor-pointer overflow-hidden rounded-xl border border-border/70 bg-card/40 hover:border-primary/60"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 flex flex-col justify-between p-3">
                      {/* Top Save button */}
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSave(item.id);
                          }}
                          className={`rounded-full p-2 backdrop-blur-md cursor-pointer ${
                            saved
                              ? "bg-primary text-primary-foreground"
                              : "bg-black/60 text-white hover:bg-black/80"
                          }`}
                        >
                          <Bookmark className="h-4 w-4 stroke-[2.5]" />
                        </button>
                      </div>

                      {/* Bottom info on hover */}
                      <div>
                        <span className="font-mono text-[10px] uppercase tracking-wider text-primary border border-primary/40 bg-black/60 px-2 py-0.5 rounded">
                          {item.category}
                        </span>
                        <h3 className="font-semibold text-white text-sm mt-1 line-clamp-1">
                          {item.title}
                        </h3>
                        <p className="font-mono text-[11px] text-zinc-300 line-clamp-1 mt-0.5">
                          {item.prompt}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="flex items-center justify-between p-3 bg-card/80 border-t border-border/50">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="h-6 w-6 rounded-md font-mono text-[10px] font-bold grid place-items-center shrink-0"
                        style={{ backgroundColor: item.author.avatarColor, color: "#0a0a0a" }}
                      >
                        {item.author.name[0]}
                      </div>
                      <span className="truncate font-mono text-xs text-muted-foreground">
                        @{item.author.handle}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
                      <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500/20" />
                      <span>{item.likes}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center font-mono text-sm text-muted-foreground flex flex-col items-center gap-3">
            <div>&gt; no items found in {activeTab.toLowerCase()}</div>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 font-mono text-xs font-semibold text-primary-foreground hover:opacity-90 transition-all cursor-pointer shadow-md shadow-primary/20"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>Add to Library</span>
            </button>
          </div>
        )}
      </div>

      {/* ── IMAGE INTERACTION MODAL (Instant display, zero animation) ── */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl border border-border/80 bg-background shadow-2xl flex flex-col lg:flex-row">
            {/* Close Button */}
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-3 right-3 z-30 rounded-full bg-black/70 p-2 text-white hover:bg-black cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* LEFT SIDE (Desktop) / TOP SIDE (Mobile): Full Image */}
            <div className="w-full lg:w-3/5 bg-black/90 flex items-center justify-center p-4 relative min-h-[260px] lg:min-h-[500px]">
              <img
                src={selectedItem.imageUrl}
                alt={selectedItem.title}
                className="max-h-[70vh] w-auto max-w-full rounded-lg object-contain shadow-2xl"
              />
            </div>

            {/* RIGHT SIDE (Desktop) / BOTTOM SIDE (Mobile): Prompt & Details */}
            <div className="w-full lg:w-2/5 p-5 sm:p-6 flex flex-col justify-between overflow-y-auto max-h-[50vh] lg:max-h-[85vh] bg-card/90 scrollbar-none border-t lg:border-t-0 lg:border-l border-border/70">
              <div>
                {/* Category & Save */}
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs uppercase tracking-wider text-primary border border-primary/30 bg-primary/10 px-2.5 py-1 rounded-md font-semibold">
                    {selectedItem.category}
                  </span>
                  <button
                    onClick={() => toggleSave(selectedItem.id)}
                    className={`flex items-center gap-2 font-mono text-xs rounded-lg px-3.5 py-1.5 cursor-pointer ${
                      isSaved(selectedItem.id)
                        ? "bg-primary text-primary-foreground font-semibold shadow-md"
                        : "border border-border bg-background text-foreground hover:border-primary"
                    }`}
                  >
                    <Bookmark className="h-4 w-4" />
                    <span>
                      {isSaved(selectedItem.id) ? "Saved in My Library" : "Save to My Library"}
                    </span>
                  </button>
                </div>

                {/* Title & Author */}
                <h2 className="text-xl font-bold text-foreground mb-3">{selectedItem.title}</h2>

                <Link
                  to="/profile/$handle"
                  params={{ handle: selectedItem.author.handle }}
                  onClick={() => setSelectedItem(null)}
                  className="flex items-center gap-3 p-2.5 rounded-lg border border-border/60 bg-accent/20 hover:bg-accent/50 mb-5"
                >
                  <div
                    className="h-9 w-9 rounded-md font-mono text-xs font-bold grid place-items-center shrink-0"
                    style={{ backgroundColor: selectedItem.author.avatarColor, color: "#0a0a0a" }}
                  >
                    {selectedItem.author.name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      {selectedItem.author.name}
                    </div>
                    <div className="font-mono text-xs text-muted-foreground">
                      @{selectedItem.author.handle}
                    </div>
                  </div>
                </Link>

                {/* Description */}
                <div className="mb-5">
                  <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-1">
                    # Overview
                  </h4>
                  <p className="text-sm text-foreground/90 leading-relaxed">
                    {selectedItem.description}
                  </p>
                </div>

                {/* Prompt Box */}
                <div className="mb-5 rounded-lg border border-border/80 bg-[#0a0a0c] p-3.5 shadow-inner">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs text-primary font-semibold flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Prompt Blueprint</span>
                    </span>
                    <button
                      onClick={() => handleCopyPrompt(selectedItem.prompt)}
                      className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground hover:text-primary cursor-pointer bg-accent/40 px-2 py-0.5 rounded"
                    >
                      {copiedPrompt ? (
                        <Check className="h-3 w-3 text-primary" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                      <span>{copiedPrompt ? "copied" : "copy prompt"}</span>
                    </button>
                  </div>
                  <p className="font-mono text-xs leading-relaxed text-emerald-400 select-all">
                    "{selectedItem.prompt}"
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {selectedItem.tags.map((t) => (
                    <span
                      key={t}
                      className="font-mono text-xs text-muted-foreground bg-accent/30 px-2 py-0.5 rounded border border-border/40"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SUBMIT PROMPT MODAL ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl border border-border/80 bg-background shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/70 px-5 py-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-foreground">Add to Library</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-full p-1.5 hover:bg-accent/60 cursor-pointer"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            {/* Form Body */}
            <div className="p-5 space-y-3.5 max-h-[70vh] overflow-y-auto scrollbar-none">
              <div>
                <label className="font-mono text-xs text-muted-foreground mb-1 block">Title *</label>
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Glassmorphism Card Layout"
                  className="w-full rounded-md border border-border bg-card/60 px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-mono text-xs text-muted-foreground mb-1 block">Prompt *</label>
                <textarea
                  value={newPrompt}
                  onChange={(e) => setNewPrompt(e.target.value)}
                  placeholder="The full AI prompt..."
                  rows={3}
                  className="w-full resize-none rounded-md border border-border bg-card/60 px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-mono text-xs text-muted-foreground mb-1 block">Description</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Brief description of what this prompt creates..."
                  rows={2}
                  className="w-full resize-none rounded-md border border-border bg-card/60 px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-mono text-xs text-muted-foreground mb-1 block">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as LibraryItem["category"])}
                  className="w-full rounded-md border border-border bg-card/60 px-3 py-2 font-mono text-sm text-foreground focus:border-primary/60 focus:outline-none"
                >
                  {categories.filter((c) => c !== "All").map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-mono text-xs text-muted-foreground mb-1 block">Image URL (optional)</label>
                <input
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://example.com/image.png"
                  className="w-full rounded-md border border-border bg-card/60 px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-mono text-xs text-muted-foreground mb-1 block">Tags (comma-separated)</label>
                <input
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="e.g. ui, glass, card"
                  className="w-full rounded-md border border-border bg-card/60 px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-border/70 px-5 py-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-md font-mono text-xs text-muted-foreground hover:text-foreground hover:bg-accent/40 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!newTitle.trim() || !newPrompt.trim()) return;
                  addItemToLibrary({
                    title: newTitle.trim(),
                    prompt: newPrompt.trim(),
                    description: newDesc.trim() || newTitle.trim(),
                    category: newCategory,
                    author: currentUser,
                    imageUrl: newImageUrl.trim() || `https://picsum.photos/seed/${Date.now()}/800/600`,
                    tags: newTags.split(",").map((t) => t.trim()).filter(Boolean),
                  });
                  setShowAddModal(false);
                  setNewTitle("");
                  setNewPrompt("");
                  setNewDesc("");
                  setNewTags("");
                  setNewImageUrl("");
                  setNewCategory("UI/UX");
                }}
                disabled={!newTitle.trim() || !newPrompt.trim()}
                className="px-5 py-2 rounded-md bg-primary font-mono text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50 cursor-pointer shadow-sm"
              >
                Add to Library
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
