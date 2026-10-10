import React, { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { HelpCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HelpTooltipProps {
  title?: string;
  content: React.ReactNode;
  formula?: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

interface Coords {
  top: number;
  left: number;
  actualSide: 'top' | 'bottom' | 'left' | 'right';
}

const TOOLTIP_WIDTH = 270;
const VIEWPORT_PADDING = 12;
const OFFSET = 8;

export const HelpTooltip: React.FC<HelpTooltipProps> = ({
  title,
  content,
  formula,
  side = 'bottom',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<Coords | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const triggerRect = triggerRef.current.getBoundingClientRect();

    // If trigger scrolled off screen, close
    if (
      triggerRect.bottom < 0 ||
      triggerRect.top > window.innerHeight ||
      triggerRect.right < 0 ||
      triggerRect.left > window.innerWidth
    ) {
      setIsOpen(false);
      return;
    }

    const tooltipEl = tooltipRef.current;
    const tooltipHeight = tooltipEl ? tooltipEl.offsetHeight : 140;
    const tooltipWidth = tooltipEl ? tooltipEl.offsetWidth : TOOLTIP_WIDTH;

    let targetTop = 0;
    let targetLeft = 0;
    let actualSide = side;

    if (side === 'bottom') {
      const fitsBottom = triggerRect.bottom + OFFSET + tooltipHeight <= window.innerHeight - VIEWPORT_PADDING;
      if (fitsBottom || triggerRect.top - OFFSET - tooltipHeight < VIEWPORT_PADDING) {
        targetTop = triggerRect.bottom + OFFSET;
        actualSide = 'bottom';
      } else {
        targetTop = triggerRect.top - OFFSET - tooltipHeight;
        actualSide = 'top';
      }
      targetLeft = triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2;
    } else if (side === 'top') {
      const fitsTop = triggerRect.top - OFFSET - tooltipHeight >= VIEWPORT_PADDING;
      if (fitsTop || triggerRect.bottom + OFFSET + tooltipHeight > window.innerHeight - VIEWPORT_PADDING) {
        targetTop = triggerRect.top - OFFSET - tooltipHeight;
        actualSide = 'top';
      } else {
        targetTop = triggerRect.bottom + OFFSET;
        actualSide = 'bottom';
      }
      targetLeft = triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2;
    } else if (side === 'left') {
      const fitsLeft = triggerRect.left - OFFSET - tooltipWidth >= VIEWPORT_PADDING;
      if (fitsLeft) {
        targetLeft = triggerRect.left - OFFSET - tooltipWidth;
        actualSide = 'left';
      } else {
        targetLeft = triggerRect.right + OFFSET;
        actualSide = 'right';
      }
      targetTop = triggerRect.top + triggerRect.height / 2 - tooltipHeight / 2;
    } else if (side === 'right') {
      const fitsRight = triggerRect.right + OFFSET + tooltipWidth <= window.innerWidth - VIEWPORT_PADDING;
      if (fitsRight) {
        targetLeft = triggerRect.right + OFFSET;
        actualSide = 'right';
      } else {
        targetLeft = triggerRect.left - OFFSET - tooltipWidth;
        actualSide = 'left';
      }
      targetTop = triggerRect.top + triggerRect.height / 2 - tooltipHeight / 2;
    }

    // Clamp horizontally to stay within viewport
    targetLeft = Math.max(
      VIEWPORT_PADDING,
      Math.min(targetLeft, window.innerWidth - tooltipWidth - VIEWPORT_PADDING)
    );

    // Clamp vertically to stay within viewport
    targetTop = Math.max(
      VIEWPORT_PADDING,
      Math.min(targetTop, window.innerHeight - tooltipHeight - VIEWPORT_PADDING)
    );

    setCoords({ top: targetTop, left: targetLeft, actualSide });
  }, [side]);

  // Recalculate on open, scroll, or resize
  useLayoutEffect(() => {
    if (!isOpen) {
      setCoords(null);
      return;
    }

    updatePosition();

    const handleScroll = () => {
      updatePosition();
    };

    const handleResize = () => {
      updatePosition();
    };

    window.addEventListener('scroll', handleScroll, { capture: true, passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen, updatePosition]);

  // Dismiss listeners
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        tooltipRef.current?.contains(target)
      ) {
        return;
      }
      setIsOpen(false);
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

  const handleMouseEnter = () => {
    clearCloseTimeout();
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    clearCloseTimeout();
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearCloseTimeout();
    setIsOpen((prev) => !prev);
  };

  return (
    <div
      className={`relative inline-flex items-center select-none ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        ref={triggerRef}
        type="button"
        onClick={handleClick}
        aria-label="Component help"
        className="p-1 rounded-md text-current opacity-60 hover:opacity-100 hover:bg-white/10 apple-press transition-all focus:outline-none"
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {isOpen && coords && (
              <motion.div
                ref={tooltipRef}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                  type: 'spring',
                  bounce: 0,
                  duration: 0.18,
                }}
                onMouseEnter={clearCloseTimeout}
                onMouseLeave={handleMouseLeave}
                className="fixed p-3 rounded-xl border shadow-2xl backdrop-blur-2xl text-left font-sans pointer-events-auto"
                style={{
                  top: coords.top,
                  left: coords.left,
                  width: `${TOOLTIP_WIDTH}px`,
                  zIndex: 99999,
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-card)',
                  color: 'var(--text-main)',
                }}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  {title && (
                    <h5
                      className="text-xs font-semibold tracking-tight leading-snug"
                      style={{ color: 'var(--text-main)' }}
                    >
                      {title}
                    </h5>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="opacity-60 hover:opacity-100 p-0.5 rounded transition-opacity -mr-1 -mt-0.5"
                    style={{ color: 'var(--text-dim)' }}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                <div
                  className="text-[11px] leading-relaxed font-normal"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {content}
                </div>

                {formula && (
                  <div
                    className="mt-2 pt-1.5 border-t font-mono text-[10px] px-2 py-1 rounded-md"
                    style={{
                      borderColor: 'var(--border-subtle)',
                      backgroundColor: 'var(--bg-input)',
                      color: 'var(--accent-primary)',
                    }}
                  >
                    <span className="select-none" style={{ color: 'var(--text-dim)' }}>
                      Math:{' '}
                    </span>
                    {formula}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
};
