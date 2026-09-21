// components/frontend/SortDropdown.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

export type SortOption = 'latest' | 'oldest' | 'popular' | 'likes';

interface SortDropdownProps {
    value: SortOption;
    onChange: (value: SortOption) => void;
}

const sortOptions: { value: SortOption; label: string; icon: string }[] = [
    { value: 'latest', label: '最新发布', icon: '🕐' },
    { value: 'oldest', label: '最早发布', icon: '📅' },
    { value: 'popular', label: '最多阅读', icon: '👁️' },
    { value: 'likes', label: '最多点赞', icon: '❤️' },
];

export default function SortDropdown({ value, onChange }: SortDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // 点击外部关闭
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Esc 关闭
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    const currentOption = sortOptions.find(o => o.value === value) || sortOptions[0];

    return (
        <div className="relative" ref={dropdownRef}>
            {/* 触发按钮 */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    'flex items-center space-x-2 px-3 py-2 rounded-lg',
                    'bg-white border border-gray-200 text-sm font-medium',
                    'text-gray-700 hover:bg-gray-50 hover:border-gray-300',
                    'transition-colors whitespace-nowrap',
                    isOpen && 'border-primary-300 bg-primary-50 text-primary-700'
                )}
                aria-label="排序方式"
                aria-expanded={isOpen}
            >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
                <span className="hidden sm:inline">{currentOption.label}</span>
                <svg
                    className={cn(
                        'w-4 h-4 flex-shrink-0 transition-transform',
                        isOpen && 'rotate-180'
                    )}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* 下拉菜单 */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-20 animate-fade-in">
                    {sortOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                            className={cn(
                                'w-full flex items-center space-x-2 px-4 py-2.5 text-sm transition-colors text-left',
                                option.value === value
                                    ? 'bg-primary-50 text-primary-700 font-medium'
                                    : 'text-gray-700 hover:bg-gray-50'
                            )}
                        >
                            <span>{option.icon}</span>
                            <span className="flex-1">{option.label}</span>
                            {option.value === value && (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}