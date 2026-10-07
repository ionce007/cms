// components/frontend/BookmarkButton.tsx
'use client';

import { cn } from '@/lib/utils';
import { useBookmark } from '@/hooks/useBookmark';

interface BookmarkButtonProps {
    target: 'article' | 'formula';
    id: number | string | undefined;
    initialMarked?: number;
    enabled?: boolean;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
    className?: string;
}

const SIZE_CLASSES = {
    sm: {
        button: 'px-3 py-1.5 text-xs gap-1',
        icon: 'w-3.5 h-3.5',
        label: 'text-xs',
    },
    md: {
        button: 'px-4 py-2 text-sm gap-2',
        icon: 'w-5 h-5',
        label: 'text-sm',
    },
    lg: {
        button: 'px-6 py-3 text-base gap-2',
        icon: 'w-6 h-6',
        label: 'text-base',
    },
};

export default function BookmarkButton({
    target,
    id,
    initialMarked = 0,
    enabled = true,
    size = 'md',
    showLabel = true,
    className,
}: BookmarkButtonProps) {
    const { marked, isBookmarked, isLoading, toggle } = useBookmark({
        target,
        id,
        initialMarked,
        enabled,
    });

    const sizeClass = SIZE_CLASSES[size];

    return (
        <button
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggle();
            }}
            disabled={isLoading || !id}
            className={cn(
                'inline-flex items-center justify-center rounded-lg font-medium',
                'transition-all duration-200',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'focus:outline-none focus:ring-2 focus:ring-offset-2',
                sizeClass.button,
                isBookmarked
                    ? 'bg-primary-50 text-primary-600 hover:bg-primary-100 focus:ring-primary-500'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 focus:ring-gray-400',
                className
            )}
            aria-label={isBookmarked ? '取消收藏' : '收藏'}
            aria-pressed={isBookmarked}
        >
            {/* 书签图标 */}
            <svg
                className={cn(
                    sizeClass.icon,
                    'transition-transform duration-200',
                    isBookmarked && 'scale-110'
                )}
                fill={isBookmarked ? 'currentColor' : 'none'}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
            </svg>

            {/* 数字 */}
            {marked > 0 && (
                <span className={cn('font-semibold', sizeClass.label)}>
                    {marked.toLocaleString()}
                </span>
            )}

            {/* 文字 */}
            {showLabel && (
                <span className={sizeClass.label}>
                    {isBookmarked ? '已收藏' : '收藏'}
                </span>
            )}
        </button>
    );
}