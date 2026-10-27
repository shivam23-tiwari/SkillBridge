import React from 'react';
import { cn } from '../../lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const textareaId = id || props.name;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={textareaId} className="block text-xs font-semibold text-[#A0A8BD]">
            {label} {props.required && <span className="text-[#FB7185]">*</span>}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          className={cn(
            'glass-input w-full rounded-xl px-3.5 py-2.5 text-sm text-[#F1F3FA] placeholder:text-[#737D95] focus:outline-hidden resize-y min-h-[100px] transition-all',
            error && 'border-[#FB7185] focus:border-[#FB7185]',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-[#FB7185] font-medium">{error}</p>}
        {helperText && !error && <p className="text-xs text-[#737D95]">{helperText}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
