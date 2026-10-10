import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  subtle?: boolean;
  interactive?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  subtle = false,
  interactive = false,
  ...props
}) => {
  return (
    <div
      className={`
        rounded-2xl transition-all duration-200
        ${subtle ? 'glass-surface-subtle' : 'glass-surface'}
        ${interactive ? 'hover:border-white/20 hover:shadow-2xl cursor-pointer apple-press' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};
