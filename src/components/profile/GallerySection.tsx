/**
 * GallerySection — profile media gallery with dropdown + create gallery dialog.
 *
 * UX Behavior:
 * - If isCurrentUser = true: full edit/upload capabilities, create gallery, private/public filters.
 * - If isCurrentUser = false (dummy profile): ONLY view public images, NO upload/add buttons, NO edit/delete.
 */
import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  Globe,
  Image as ImageIcon,
  Lock,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Gallery = {
  id: string;
  name: string;
  description: string;
  privacy: "public" | "private";
  images: string[];
};

const DUMMY_PUBLIC_GALLERIES: Record<string, Gallery[]> = {
  default: [
    {
      id: "public-gal-1",
      name: "Public AI Art & Visuals",
      description: "Generative model outputs & dataset samples",
      privacy: "public",
      images: [
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
        "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80",
        "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80",
      ],
    },
    {
      id: "public-gal-2",
      name: "Model Schematics",
      description: "Architecture flow diagrams",
      privacy: "public",
      images: [
        "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80",
        "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80",
      ],
    },
  ],
};

function loadGalleries(): Gallery[] {
  try {
    const stored = localStorage.getItem("croxcom-galleries");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveGalleries(galleries: Gallery[]) {
  try {
    localStorage.setItem("croxcom-galleries", JSON.stringify(galleries));
  } catch {
    /* ignore */
  }
}

function loadPersonalImages(): string[] {
  try {
    const stored = localStorage.getItem("croxcom-personal-images");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function savePersonalImages(images: string[]) {
  try {
    localStorage.setItem("croxcom-personal-images", JSON.stringify(images));
  } catch {
    /* ignore */
  }
}

interface GallerySectionProps {
  isCurrentUser?: boolean;
  userHandle?: string;
}

export function GallerySection({ isCurrentUser = true, userHandle }: GallerySectionProps) {
  const [galleries, setGalleries] = useState<Gallery[]>(() => {
    if (!isCurrentUser) {
      return DUMMY_PUBLIC_GALLERIES.default;
    }
    return loadGalleries();
  });

  const [personalImages, setPersonalImages] = useState<string[]>(() => {
    if (!isCurrentUser) {
      return [
        "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80",
        "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80",
      ];
    }
    return loadPersonalImages();
  });

  const [activeGalleryId, setActiveGalleryId] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeGallery = galleries.find((g) => g.id === activeGalleryId) ?? null;

  // Persist galleries on change for current user only
  useEffect(() => {
    if (isCurrentUser) {
      saveGalleries(galleries);
    }
  }, [galleries, isCurrentUser]);

  // Persist personal images on change for current user only
  useEffect(() => {
    if (isCurrentUser) {
      savePersonalImages(personalImages);
    }
  }, [personalImages, isCurrentUser]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleUpload = (galleryId: string | null, files: FileList | null) => {
    if (!isCurrentUser || !files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const url = ev.target?.result as string;
        if (!url) return;
        if (galleryId === null) {
          setPersonalImages((prev) => [...prev, url]);
        } else {
          setGalleries((prev) =>
            prev.map((g) =>
              g.id === galleryId ? { ...g, images: [...g.images, url] } : g
            )
          );
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (galleryId: string | null, imgIdx: number) => {
    if (!isCurrentUser) return;
    if (galleryId === null) {
      setPersonalImages((prev) => prev.filter((_, i) => i !== imgIdx));
    } else {
      setGalleries((prev) =>
        prev.map((g) =>
          g.id === galleryId
            ? { ...g, images: g.images.filter((_, i) => i !== imgIdx) }
            : g
        )
      );
    }
  };

  const deleteGallery = (galleryId: string) => {
    if (!isCurrentUser) return;
    if (!window.confirm("Delete this gallery?")) return;
    setGalleries((prev) => prev.filter((g) => g.id !== galleryId));
    if (activeGalleryId === galleryId) setActiveGalleryId(null);
  };

  // Filter public galleries if viewing another user's profile
  const visibleGalleries = isCurrentUser
    ? galleries
    : galleries.filter((g) => g.privacy === "public");

  return (
    <div className="border-b border-border/70">
      {/* Gallery selector bar */}
      <div className="flex items-center justify-between px-4 py-3">
        <p className="font-mono text-xs text-muted-foreground">$ gallery --public-view</p>

        {/* Dropdown trigger */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-1.5 rounded-md border border-border/70 bg-card/60 px-3 py-1.5 font-mono text-xs text-foreground transition-colors hover:border-primary/40 hover:text-primary cursor-pointer"
          >
            <ImageIcon className="h-3.5 w-3.5" />
            <span>{activeGallery ? activeGallery.name : "Public Images"}</span>
            <ChevronDown
              className={cn("h-3 w-3 transition-transform", dropdownOpen && "rotate-180")}
            />
          </button>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full z-20 mt-1 w-52 overflow-hidden rounded-md border border-border/70 bg-background shadow-lg">
              <button
                onClick={() => {
                  setActiveGalleryId(null);
                  setDropdownOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent/60 cursor-pointer",
                  !activeGalleryId && "bg-accent/40 text-primary"
                )}
              >
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                {isCurrentUser ? "Personal Images" : "Public Images"}
              </button>

              {visibleGalleries.map((g) => (
                <button
                  key={g.id}
                  onClick={() => {
                    setActiveGalleryId(g.id);
                    setDropdownOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent/60 cursor-pointer",
                    activeGalleryId === g.id && "bg-accent/40 text-primary"
                  )}
                >
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1 truncate">{g.name}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {g.images.length}
                  </span>
                </button>
              ))}

              {isCurrentUser && (
                <>
                  <div className="my-1 border-t border-border/50" />
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      setShowCreateModal(true);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-primary transition-colors hover:bg-primary/10 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    Create New Gallery
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Gallery body */}
      <GalleryBody
        gallery={activeGallery}
        personalImages={personalImages}
        onUpload={(files) => handleUpload(activeGalleryId, files)}
        onRemoveImage={(idx) => removeImage(activeGalleryId, idx)}
        onDelete={isCurrentUser && activeGallery ? () => deleteGallery(activeGallery.id) : undefined}
        isPersonal={!activeGallery}
        isCurrentUser={isCurrentUser}
      />

      {/* Create gallery modal (Only available to current user) */}
      {isCurrentUser && showCreateModal && (
        <CreateGalleryModal
          onClose={() => setShowCreateModal(false)}
          onCreate={(data) => {
            const newGallery: Gallery = {
              id: `gallery-${Date.now()}`,
              ...data,
              images: [],
            };
            setGalleries((prev) => [...prev, newGallery]);
            setActiveGalleryId(newGallery.id);
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
}

// ─── Gallery body ─────────────────────────────────────────────────────────────

function GalleryBody({
  gallery,
  personalImages,
  onUpload,
  onRemoveImage,
  onDelete,
  isPersonal,
  isCurrentUser,
}: {
  gallery: Gallery | null;
  personalImages: string[];
  onUpload: (files: FileList | null) => void;
  onRemoveImage: (idx: number) => void;
  onDelete?: () => void;
  isPersonal: boolean;
  isCurrentUser: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const images = isPersonal ? personalImages : (gallery?.images ?? []);

  return (
    <div className="px-4 pb-4">
      {/* Gallery meta */}
      {gallery && (
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">{gallery.name}</p>
            {gallery.description && (
              <p className="text-xs text-muted-foreground">{gallery.description}</p>
            )}
            <span className="mt-0.5 inline-flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
              <Globe className="h-3 w-3" /> public
            </span>
          </div>
          {isCurrentUser && onDelete && (
            <button
              onClick={onDelete}
              className="rounded-md p-1.5 text-muted-foreground/50 transition-colors hover:bg-destructive/10 hover:text-destructive cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {/* Image grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
          {images.map((src, i) => (
            <div key={i} className="group relative">
              <img
                src={src}
                alt={`Image ${i + 1}`}
                className="aspect-square w-full rounded-md border border-border/50 object-cover"
              />
              {isCurrentUser && (
                <button
                  onClick={() => onRemoveImage(i)}
                  className="absolute right-1 top-1 hidden h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white group-hover:flex cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
          
          {/* Upload button inside grid (ONLY FOR CURRENT USER) */}
          {isCurrentUser && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-md border border-dashed border-border/60 text-muted-foreground/50 transition-colors hover:border-primary/40 hover:text-primary cursor-pointer"
            >
              <Plus className="h-5 w-5" />
              <span className="font-mono text-[10px]">add</span>
            </button>
          )}
        </div>
      ) : (
        /* Empty state */
        <div className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border/60 py-10">
          <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
          <p className="font-mono text-xs text-muted-foreground">
            &gt; no public images found in gallery
          </p>
        </div>
      )}

      {/* Hidden file input */}
      {isCurrentUser && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => onUpload(e.target.files)}
        />
      )}
    </div>
  );
}

// ─── Create gallery modal ─────────────────────────────────────────────────────

function CreateGalleryModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (data: { name: string; description: string; privacy: "public" | "private" }) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [privacy, setPrivacy] = useState<"public" | "private">("public");

  const submit = () => {
    if (!name.trim()) return;
    onCreate({ name: name.trim(), description: description.trim(), privacy });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm overflow-hidden rounded-lg border border-border/70 bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b border-border/50 bg-muted/10 px-4 py-2.5">
          <span className="font-mono text-[11px] text-primary font-semibold">
            $ gallery --create
          </span>
          <button
            onClick={onClose}
            className="text-muted-foreground/50 transition-colors hover:text-foreground cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="mb-1.5 block font-mono text-xs text-muted-foreground">
              name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My AI Projects"
              className="w-full rounded-md border border-border/70 bg-card/60 px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/60 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block font-mono text-xs text-muted-foreground">
              description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A short description..."
              rows={2}
              className="w-full resize-none rounded-md border border-border/70 bg-card/60 px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/60 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block font-mono text-xs text-muted-foreground">
              visibility
            </label>
            <div className="flex gap-2">
              {(["public", "private"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPrivacy(p)}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-2 rounded-md border py-2 font-mono text-xs transition-colors cursor-pointer",
                    privacy === p
                      ? "border-primary/60 bg-primary/10 text-primary font-semibold"
                      : "border-border/70 text-muted-foreground hover:border-border hover:text-foreground"
                  )}
                >
                  {p === "public" ? <Globe className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-md border border-border/70 py-2 font-mono text-xs text-muted-foreground transition-colors hover:border-border hover:text-foreground cursor-pointer"
            >
              cancel
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={!name.trim()}
              className="flex-1 rounded-md bg-primary py-2 font-mono text-xs text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer"
            >
              create gallery
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
