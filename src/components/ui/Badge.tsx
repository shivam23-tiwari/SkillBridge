import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'violet' | 'success' | 'warning' | 'slate' | 'outline';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'slate',
  size = 'sm',
  children,
  ...props
}) => {
  const variantStyles = {
    primary:
      'bg-[#FF2D95]/10 text-[#FF2D95] border-[#FF2D95]/30',
    violet:
      'bg-[#007BA7]/15 text-[#00A3E0] border-[#007BA7]/35',
    success:
      'bg-[#34D399]/10 text-[#34D399] border-[#34D399]/25',
    warning:
      'bg-[#FBBF24]/10 text-[#FBBF24] border-[#FBBF24]/25',
    slate:
      'bg-[#18181D] text-[#9CA3AF] border-[#202026]',
    outline:
      'bg-transparent text-[#9CA3AF] border-[#202026]',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 rounded-md font-medium',
    md: 'text-xs px-2.5 py-0.5 rounded-md font-medium',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center border transition-colors whitespace-nowrap shrink-0',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
