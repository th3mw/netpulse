import React from 'react';
import { GlassCard } from './GlassCard';
import { HelpTooltip } from './HelpTooltip';

interface MetricCardProps {
  title: string;
  value: string;
  subValue?: string;
  icon?: React.ReactNode;
  trend?: {
    label: string;
    positive?: boolean;
  };
  accentColor?: 'cyan' | 'purple' | 'emerald' | 'amber' | 'rose' | 'blue' | 'primary' | 'rx' | 'tx';
  className?: string;
  badge?: string;
  helpTitle?: string;
  helpContent?: React.ReactNode;
  helpFormula?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subValue,
  icon,
  trend,
  accentColor = 'primary',
  className = '',
  badge,
  helpTitle,
  helpContent,
  helpFormula,
}) => {
  const accentClasses = {
    cyan: 'from-cyan-500/20 to-transparent border-cyan-500/30 text-cyan-400',
    purple: 'from-purple-500/20 to-transparent border-purple-500/30 text-purple-400',
    emerald: 'from-emerald-500/20 to-transparent border-emerald-500/30 text-emerald-400',
    amber: 'from-amber-500/20 to-transparent border-amber-500/30 text-amber-400',
    rose: 'from-rose-500/20 to-transparent border-rose-500/30 text-rose-400',
    blue: 'from-blue-500/20 to-transparent border-blue-500/30 text-blue-400',
    primary: 'from-[var(--accent-primary)]/20 to-transparent border-[var(--accent-primary)]/30 text-[var(--accent-primary)]',
    rx: 'from-[var(--accent-rx)]/20 to-transparent border-[var(--accent-rx)]/30 text-[var(--accent-rx)]',
    tx: 'from-[var(--accent-tx)]/20 to-transparent border-[var(--accent-tx)]/30 text-[var(--accent-tx)]',
  }[accentColor];

  return (
    <GlassCard className={`p-4 relative overflow-hidden flex flex-col justify-between ${className}`}>
      {/* Subtle background glow */}
      <div
        className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${accentClasses} blur-2xl opacity-40 pointer-events-none`}
      />

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            {title}
          </span>
          {helpContent && (
            <HelpTooltip
              title={helpTitle || title}
              content={helpContent}
              formula={helpFormula}
            />
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {badge && (
            <span
              className="px-2 py-0.5 text-[10px] font-semibold rounded-full border"
              style={{
                backgroundColor: 'var(--bg-input)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-muted)',
              }}
            >
              {badge}
            </span>
          )}
          {icon && (
            <div
              className="p-1.5 rounded-lg border"
              style={{
                backgroundColor: 'var(--bg-input)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-muted)',
              }}
            >
              {icon}
            </div>
          )}
        </div>
      </div>

      <div className="mt-1">
        <div
          className="text-2xl font-semibold tracking-tight tabular-nums font-mono"
          style={{ color: 'var(--text-main)' }}
        >
          {value}
        </div>
        {(subValue || trend) && (
          <div className="flex items-center gap-2 mt-1.5 text-xs" style={{ color: 'var(--text-dim)' }}>
            {trend && (
              <span
                className="font-medium"
                style={{
                  color: trend.positive ? 'var(--accent-rx)' : 'var(--text-dim)',
                }}
              >
                {trend.label}
              </span>
            )}
            {subValue && <span className="tabular-nums truncate">{subValue}</span>}
          </div>
        )}
      </div>
    </GlassCard>
  );
};
