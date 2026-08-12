import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  glass?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  title,
  subtitle,
  action,
  glass = true,
  ...props
}) => {
  return (
    <div
      className={cn(
        'rounded-2xl p-5 transition-all duration-300',
        glass
          ? 'glass-card shadow-sm hover:shadow-md'
          : 'bg-white border border-slate-200/80 shadow-sm',
        className
      )}
      {...props}
    >
      {(title || action) && (
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div>
            {title && <h3 className="text-base font-semibold text-slate-900 tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
