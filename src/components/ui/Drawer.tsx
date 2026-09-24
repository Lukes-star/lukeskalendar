import { ReactNode, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  width?: string;
}

export function Drawer({ open, onClose, children, title, width = 'max-w-md' }: DrawerProps) {
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm anim-fade-in"
        onClick={onClose}
      />
      <div
        className={`absolute right-0 top-0 h-full w-full ${width} bg-bg-card border-l border-border shadow-modal flex flex-col anim-slide-in-right touch-pan-y`}
        onTouchStart={(event) => {
          const touch = event.touches[0];
          touchStart.current = touch ? { x: touch.clientX, y: touch.clientY } : null;
        }}
        onTouchEnd={(event) => {
          const start = touchStart.current;
          const touch = event.changedTouches[0];
          touchStart.current = null;
          if (!start || !touch) return;
          const deltaX = touch.clientX - start.x;
          const deltaY = touch.clientY - start.y;
          if (deltaX < -70 && Math.abs(deltaX) > Math.abs(deltaY) * 1.25) onClose();
        }}
      >
        <div className="sm:hidden absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-text-tertiary/40 z-10" aria-hidden="true" />
        {title && (
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border-subtle">
            <h2 className="text-lg font-extrabold text-text-primary tracking-tight">{title}</h2>
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary transition-colors p-1.5 rounded-lg hover:bg-bg-secondary"
            >
              <X size={18} />
            </button>
          </div>
        )}
        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}
