import React from 'react';
import { cn } from '../../lib/utils';

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => {
  return (
    <div
      className={cn(
        'bg-[#121215] border border-[#202026] text-[#F3F4F6] rounded-xl p-6 transition-colors duration-150',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => {
  return (
    <div
      className={cn('animate-pulse bg-[#16161B] rounded-lg border border-[#202026]', className)}
      {...props}
    />
  );
};

interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className }) => {
  return (
    <div className={cn('flex items-center gap-1 p-1 bg-[#121215] rounded-lg border border-[#202026] overflow-x-auto no-scrollbar', className)}>
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors duration-150 cursor-pointer',
              isActive
                ? 'bg-[#18181D] text-[#F3F4F6] border border-[#2E2E38] shadow-xs'
                : 'text-[#8E8E9A] hover:text-[#F3F4F6] hover:bg-[#16161B] border border-transparent'
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  'text-[10px] px-1.5 py-0.2 rounded font-mono tabular-nums',
                  isActive ? 'bg-[#202026] text-[#00A3E0]' : 'text-[#8E8E9A]'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
