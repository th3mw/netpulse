import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HelpTooltipProps {
  title?: string;
  content: React.ReactNode;
  formula?: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({
  title,
  content,
  formula,
  side = 'bottom',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }[side];

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex items-center select-none ${className}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        aria-label="Component help"
        className="p-1 rounded-md text-slate-400 hover:text-cyan-300 hover:bg-white/10 apple-press transition-colors focus:outline-none"
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
              type: 'spring',
              bounce: 0,
              duration: 0.2,
            }}
            className={`
              absolute z-50 w-64 p-3 rounded-xl
              bg-slate-900/95 border border-white/15
              shadow-2xl shadow-black/80 backdrop-blur-2xl
              text-left font-sans
              ${positionClasses}
            `}
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              {title && (
                <h5 className="text-xs font-semibold text-white tracking-tight leading-snug">
                  {title}
                </h5>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-0.5 rounded transition-colors -mr-1 -mt-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            <div className="text-[11px] text-slate-300 leading-relaxed font-normal">
              {content}
            </div>

            {formula && (
              <div className="mt-2 pt-1.5 border-t border-white/10 font-mono text-[10px] text-cyan-300 bg-white/5 px-2 py-1 rounded-md">
                <span className="text-slate-400 select-none">Math: </span>
                {formula}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
