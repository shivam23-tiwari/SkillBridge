import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const variantStyles = {
      primary:
        'bg-[#FF2D95] hover:bg-[#E61980] text-white border border-[#FF4DA8] font-semibold transition-colors',
      secondary:
        'bg-[#121215] hover:bg-[#18181D] text-[#F3F4F6] border border-[#202026] hover:border-[#007BA7] font-medium transition-colors',
      outline:
        'bg-transparent hover:bg-[#121215] text-[#F3F4F6] border border-[#202026] hover:border-[#007BA7] font-medium transition-colors',
      ghost:
        'bg-transparent hover:bg-white/[0.05] text-[#9CA3AF] hover:text-[#F3F4F6] font-medium transition-colors',
      destructive:
        'bg-[#FB7185]/10 hover:bg-[#FB7185]/20 text-[#FB7185] border border-[#FB7185]/30 font-medium transition-colors',
    };

    const sizeStyles = {
      sm: 'text-xs px-3 py-1.5 rounded-lg',
      md: 'text-xs sm:text-sm px-4 py-2 rounded-lg',
      lg: 'text-sm sm:text-base px-5 py-2.5 rounded-lg font-medium',
      icon: 'p-2 rounded-lg',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center gap-2 cursor-pointer transition-colors duration-150 active:translate-y-px disabled:opacity-40 disabled:pointer-events-none whitespace-nowrap shrink-0',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
