import { useEffect } from "react";
import { X, ZoomIn, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LightboxProps {
  src: string | null;
  alt?: string;
  onClose: () => void;
}

export function Lightbox({ src, alt = "Image preview", onClose }: LightboxProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (src) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [src, onClose]);

  return (
    <AnimatePresence>
      {src && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
        >
          {/* Top toolbar */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white font-mono text-xs z-10">
            <span className="truncate opacity-75 max-w-xs">{alt}</span>
            <div className="flex items-center gap-3">
              <a
                href={src}
                download
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white cursor-pointer"
                title="Open original image"
              >
                <Download className="h-4 w-4" />
              </a>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white cursor-pointer"
                title="Close lightbox (Esc)"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Centered image */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[85vh] max-w-[90vw] overflow-hidden rounded-lg shadow-2xl border border-white/10"
          >
            <img
              src={src}
              alt={alt}
              className="max-h-[85vh] max-w-[90vw] object-contain"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
