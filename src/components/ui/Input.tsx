import React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, icon, rightElement, id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-[#A0A8BD]">
            {label} {props.required && <span className="text-[#FB7185]">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3.5 text-[#737D95] pointer-events-none flex items-center">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'glass-input w-full rounded-xl px-3.5 py-2.5 text-sm text-[#F1F3FA] placeholder:text-[#737D95] focus:outline-hidden',
              icon && 'pl-10',
              rightElement && 'pr-10',
              error && 'border-[#FB7185] focus:border-[#FB7185] focus:ring-[#FB7185]/30',
              className
            )}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3 text-[#737D95] flex items-center">
              {rightElement}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-[#FB7185] font-medium">{error}</p>}
        {helperText && !error && <p className="text-xs text-[#737D95]">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
