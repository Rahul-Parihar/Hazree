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
      bg: 'bg-emerald-50 border-emerald-200',
      text: 'text-emerald-700',
      dot: 'bg-emerald-500',
    },
    active: {
      bg: 'bg-emerald-50 border-emerald-200',
      text: 'text-emerald-700',
      dot: 'bg-emerald-500',
    },
    late: {
      bg: 'bg-amber-50 border-amber-200',
      text: 'text-amber-700',
      dot: 'bg-amber-500',
    },
    pending: {
      bg: 'bg-amber-50 border-amber-200',
      text: 'text-amber-700',
      dot: 'bg-amber-500',
    },
    absent: {
      bg: 'bg-rose-50 border-rose-200',
      text: 'text-rose-700',
      dot: 'bg-rose-500',
    },
    suspended: {
      bg: 'bg-rose-50 border-rose-200',
      text: 'text-rose-700',
      dot: 'bg-rose-500',
    },
    halfday: {
      bg: 'bg-indigo-50 border-indigo-200',
      text: 'text-indigo-700',
      dot: 'bg-indigo-500',
    },
    enterprise: {
      bg: 'bg-purple-50 border-purple-200',
      text: 'text-purple-700',
      dot: 'bg-purple-500',
    },
    growth: {
      bg: 'bg-sky-50 border-sky-200',
      text: 'text-sky-700',
      dot: 'bg-sky-500',
    },
    trial: {
      bg: 'bg-orange-50 border-orange-200',
      text: 'text-orange-700',
      dot: 'bg-orange-500',
    },
    neutral: {
      bg: 'bg-slate-100 border-slate-200',
      text: 'text-slate-700',
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
