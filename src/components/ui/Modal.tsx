import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  maxWidth?: string;
}

export function Modal({ open, onClose, children, title, maxWidth = 'max-w-lg' }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm anim-fade-in"
        onClick={onClose}
      />
      <div
        className={`relative w-full ${maxWidth} bg-bg-card border border-border rounded-3xl sm:rounded-2xl shadow-modal max-h-[85vh] sm:max-h-[90vh] mb-14 sm:mb-0 overflow-hidden flex flex-col anim-slide-up`}
      >
        <div className="sm:hidden flex justify-center pt-2.5 pb-1 flex-shrink-0">
          <div className="w-10 h-1.5 rounded-full bg-border" />
        </div>
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
            <h2 className="text-lg font-extrabold text-text-primary tracking-tight">{title}</h2>
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary transition-colors p-1 rounded-lg hover:bg-bg-secondary"
            >
              <X size={18} />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
