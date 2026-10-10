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
  const getAccentVar = (acc: string) => {
    switch (acc) {
      case 'rx':
      case 'emerald':
        return 'var(--accent-rx)';
      case 'tx':
      case 'purple':
        return 'var(--accent-tx)';
      case 'primary':
      case 'cyan':
      case 'blue':
        return 'var(--accent-primary)';
      case 'amber':
      case 'rose':
        return 'color-mix(in srgb, var(--accent-primary) 65%, var(--accent-tx))';
      default:
        return 'var(--accent-primary)';
    }
  };

  const accentVar = getAccentVar(accentColor);

  return (
    <GlassCard className={`p-4 relative overflow-hidden flex flex-col justify-between ${className}`}>
      {/* Subtle background glow */}
      <div
        className="absolute top-0 right-0 w-32 h-32 blur-2xl opacity-35 pointer-events-none rounded-full"
        style={{
          background: `radial-gradient(circle at top right, color-mix(in srgb, ${accentVar} 30%, transparent) 0%, transparent 75%)`,
        }}
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
                backgroundColor: `color-mix(in srgb, ${accentVar} 12%, transparent)`,
                borderColor: `color-mix(in srgb, ${accentVar} 25%, transparent)`,
                color: accentVar,
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
