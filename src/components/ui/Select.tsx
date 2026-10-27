import React from 'react';
import { cn } from '../../lib/utils';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, id, ...props }, ref) => {
    const selectId = id || props.name;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-semibold text-[#8E8E9A]">
            {label} {props.required && <span className="text-[#FF2D95]">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={cn(
              'glass-input w-full appearance-none rounded-xl px-3.5 py-2.5 pr-10 text-sm text-[#F3F4F6] focus:outline-hidden transition-all cursor-pointer',
              error && 'border-[#FF2D95] focus:border-[#FF2D95]',
              className
            )}
            {...props}
          >
            {options.map(opt => (
              <option key={opt.value} value={opt.value} className="bg-[#121215] text-[#F3F4F6]">
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8E8E9A] pointer-events-none">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {error && <p className="text-xs text-[#FF2D95] font-medium">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
