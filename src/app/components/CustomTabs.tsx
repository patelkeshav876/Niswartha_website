import React from 'react';
import { cn } from '../lib/utils';

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  tabs: Tab[];
  className?: string;
}

export function Tabs({ activeTab, onTabChange, tabs, className }: TabsProps) {
  return (
    <div className={cn('w-full', className)}>
      {/* Tab Headers */}
      <div className="flex border-b border-border mb-6 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap relative',
              activeTab === tab.id
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={cn(
              'transition-opacity duration-200',
              activeTab === tab.id ? 'block' : 'hidden'
            )}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
}
