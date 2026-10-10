import React from 'react';

interface AppleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'glass' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const AppleButton: React.FC<AppleButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs gap-1.5 rounded-lg',
    md: 'px-3.5 py-1.5 text-sm gap-2 rounded-xl',
    lg: 'px-5 py-2.5 text-base gap-2.5 rounded-xl',
  }[size];

  const variantClasses = {
    primary:
      'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-medium shadow-lg shadow-cyan-500/25 border border-cyan-400/40',
    secondary:
      'bg-white/10 hover:bg-white/15 text-slate-100 font-medium border border-white/10 shadow-sm',
    glass:
      'glass-surface-subtle hover:bg-white/10 text-slate-200 border border-white/10',
    ghost:
      'hover:bg-white/10 text-slate-300 hover:text-white',
    danger:
      'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30',
  }[variant];

  return (
    <button
      disabled={disabled}
      className={`
        inline-flex items-center justify-center font-sans tracking-tight select-none
        apple-press transition-colors duration-150
        disabled:opacity-40 disabled:pointer-events-none
        ${sizeClasses}
        ${variantClasses}
        ${className}
      `}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children && <span>{children}</span>}
    </button>
  );
};
