import React from 'react';
import { motion } from 'motion/react';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (val: T) => void;
  className?: string;
  id?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className = '',
  id = 'segmented-indicator',
}: SegmentedControlProps<T>) {
  return (
    <div
      className={`
        inline-flex p-1 rounded-xl border backdrop-blur-md relative transition-colors duration-300
        ${className}
      `}
      style={{
        backgroundColor: 'var(--bg-input)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      {options.map((opt) => {
        const isActive = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className="relative px-3 py-1.5 text-xs font-medium rounded-lg transition-colors duration-150 flex items-center gap-1.5 z-10 apple-press"
            style={{
              color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
              fontWeight: isActive ? 600 : 500,
            }}
          >
            {isActive && (
              <motion.div
                layoutId={id}
                transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
                className="absolute inset-0 rounded-lg border shadow-sm z-[-1]"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-card)',
                }}
              />
            )}
            {opt.icon && <span className="opacity-80">{opt.icon}</span>}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
