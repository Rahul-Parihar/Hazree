import React from 'react';
import { cn } from '../../lib/utils';

type BadgeVariant =
  | 'present'
  | 'late'
  | 'absent'
  | 'halfday'
  | 'active'
  | 'pending'
  | 'suspended'
  | 'enterprise'
  | 'growth'
  | 'trial'
  | 'neutral';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'neutral',
  dot = true,
  ...props
}) => {
  const variantStyles: Record<BadgeVariant, { bg: string; text: string; dot: string }> = {
    present: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/50',
      text: 'text-emerald-700 dark:text-emerald-300',
      dot: 'bg-emerald-500',
    },
    active: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/50',
      text: 'text-emerald-700 dark:text-emerald-300',
      dot: 'bg-emerald-500',
    },
    late: {
      bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/50',
      text: 'text-amber-700 dark:text-amber-300',
      dot: 'bg-amber-500',
    },
    pending: {
      bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/50',
      text: 'text-amber-700 dark:text-amber-300',
      dot: 'bg-amber-500',
    },
    absent: {
      bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/50',
      text: 'text-rose-700 dark:text-rose-300',
      dot: 'bg-rose-500',
    },
    suspended: {
      bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/50',
      text: 'text-rose-700 dark:text-rose-300',
      dot: 'bg-rose-500',
    },
    halfday: {
      bg: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/50',
      text: 'text-indigo-700 dark:text-indigo-300',
      dot: 'bg-indigo-500',
    },
    enterprise: {
      bg: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/50',
      text: 'text-purple-700 dark:text-purple-300',
      dot: 'bg-purple-500',
    },
    growth: {
      bg: 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800/50',
      text: 'text-sky-700 dark:text-sky-300',
      dot: 'bg-sky-500',
    },
    trial: {
      bg: 'bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800/50',
      text: 'text-orange-700 dark:text-orange-300',
      dot: 'bg-orange-500',
    },
    neutral: {
      bg: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
      text: 'text-slate-700 dark:text-slate-300',
      dot: 'bg-slate-400',
    },
  };

  const style = variantStyles[variant] || variantStyles.neutral;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors',
        style.bg,
        style.text,
        className
      )}
      {...props}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', style.dot)} />}
      {children}
    </span>
  );
};
