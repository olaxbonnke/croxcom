import { useEffect, useState, useCallback } from "react";
import { X, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LightboxImage {
  url: string;
  alt?: string;
}

interface LightboxProps {
  // Support both single src (backwards compatibility) or array of images
  src?: string | null;
  alt?: string;
  images?: LightboxImage[];
  initialIndex?: number;
  onClose: () => void;
}

export function Lightbox({ src, alt = "Image preview", images, initialIndex = 0, onClose }: LightboxProps) {
  // Normalize image list
  const imageList: LightboxImage[] = images && images.length > 0
    ? images
    : src
    ? [{ url: src, alt }]
    : [];

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Sync index if initialIndex changes
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const activeImage = imageList[currentIndex];

  const goNext = useCallback(() => {
    if (currentIndex < imageList.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  }, [currentIndex, imageList.length]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  }, [currentIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };

    if (imageList.length > 0) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [imageList.length, onClose, goNext, goPrev]);

  if (imageList.length === 0 || !activeImage) return null;

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      goNext();
    } else if (distance < -minSwipeDistance) {
      goPrev();
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-2 sm:p-6 select-none"
    >
      {/* Top Bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white font-mono text-xs z-20">
        <div className="flex items-center gap-2">
          {imageList.length > 1 && (
            <span className="rounded bg-white/10 px-2 py-1 text-[11px] font-semibold tracking-wider text-white/90">
              {currentIndex + 1} / {imageList.length}
            </span>
          )}
          <span className="truncate opacity-75 max-w-xs sm:max-w-md hidden sm:inline">
            {activeImage.alt || `Image ${currentIndex + 1}`}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={activeImage.url}
            download
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white cursor-pointer"
            title="Download / Open original"
          >
            <Download className="h-4 w-4" />
          </a>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white cursor-pointer"
            title="Close viewer (Esc)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Navigation Buttons (Desktop) */}
      {imageList.length > 1 && currentIndex > 0 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            goPrev();
          }}
          className="absolute left-4 z-20 hidden sm:flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors border border-white/10 cursor-pointer"
          title="Previous image (Left Arrow)"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      {imageList.length > 1 && currentIndex < imageList.length - 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            goNext();
          }}
          className="absolute right-4 z-20 hidden sm:flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors border border-white/10 cursor-pointer"
          title="Next image (Right Arrow)"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      {/* Main Image Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative max-h-[85vh] max-w-[92vw] sm:max-w-[85vw] flex items-center justify-center overflow-hidden rounded-xl shadow-2xl border border-white/10"
      >
        <img
          key={activeImage.url}
          src={activeImage.url}
          alt={activeImage.alt || `Image ${currentIndex + 1}`}
          className="max-h-[85vh] max-w-full w-auto object-contain transition-opacity duration-150"
        />
      </div>

      {/* Bottom Dots Indicator for Multi-Image */}
      {imageList.length > 1 && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-5 left-0 right-0 flex justify-center gap-1.5 z-20"
        >
          {imageList.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentIndex(i)}
              className={cn(
                "h-2 rounded-full transition-all cursor-pointer",
                i === currentIndex
                  ? "w-6 bg-primary"
                  : "w-2 bg-white/40 hover:bg-white/70"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
