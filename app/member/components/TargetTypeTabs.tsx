// app/member/components/TargetTypeTabs.tsx
'use client';

import { cn } from '@/lib/utils';

export type TargetType = 'all' | 'article' | 'formula';

const TABS: { key: TargetType; label: string; icon: string }[] = [
    { key: 'all', label: '全部', icon: '📦' },
    { key: 'article', label: '文章', icon: '📄' },
    { key: 'formula', label: '下载', icon: '⬇' },
];

interface TargetTypeTabsProps {
    value: TargetType;
    onChange: (value: TargetType) => void;
}

export default function TargetTypeTabs({ value, onChange }: TargetTypeTabsProps) {
    return (
        <div className="flex items-center gap-2 mb-6 border-b border-gray-200">
            {TABS.map(tab => {
                const active = value === tab.key;
                return (
                    <button
                        key={tab.key}
                        onClick={() => onChange(tab.key)}
                        className={cn(
                            'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium',
                            'transition-colors relative -mb-px',
                            active
                                ? 'text-primary-600 border-b-2 border-primary-600'
                                : 'text-gray-600 hover:text-gray-900 border-b-2 border-transparent'
                        )}
                    >
                        <span>{tab.icon}</span>
                        <span>{tab.label}</span>
                    </button>
                );
            })}
        </div>
    );
}