// components/frontend/LikeButton.tsx
'use client';

import { cn } from '@/lib/utils';
import { useLike } from '@/hooks/useLike';

interface LikeButtonProps {
    /** 目标类型 */
    target: 'article' | 'formula';
    /** 目标 ID */
    id: number | string | undefined;
    /** 初始点赞数 */
    initialLikes?: number;
    /** 是否启用 */
    enabled?: boolean;
    /** 大小 */
    size?: 'sm' | 'md' | 'lg';
    /** 是否显示文字 */
    showLabel?: boolean;
    /** 自定义类名 */
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

export default function LikeButton({
    target,
    id,
    initialLikes = 0,
    enabled = true,
    size = 'md',
    showLabel = false,
    className,
}: LikeButtonProps) {
    const { likes, isLiked, isLoading, toggle } = useLike({
        target,
        id,
        initialLikes,
        enabled,
    });

    const sizeClass = SIZE_CLASSES[size];

    return (
        <button
            onClick={toggle}
            disabled={isLoading || !id}
            className={cn(
                'inline-flex items-center justify-center rounded-lg font-medium',
                'transition-all duration-200',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'focus:outline-none focus:ring-2 focus:ring-offset-2',
                sizeClass.button,
                isLiked
                    ? 'bg-red-50 text-red-600 hover:bg-red-100 focus:ring-red-500'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 focus:ring-gray-400',
                className
            )}
            aria-label={isLiked ? '取消点赞' : '点赞'}
            aria-pressed={isLiked}
        >
            {/* ✅ 心形图标 - 用 SVG */}
            <svg
                className={cn(
                    sizeClass.icon,
                    'transition-transform duration-200',
                    isLiked && 'scale-110'
                )}
                fill={isLiked ? 'currentColor' : 'none'}
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
            </svg>

            {/* ✅ 数字 */}
            <span className={cn('font-semibold', sizeClass.label)}>
                {likes.toLocaleString()}
            </span>

            {/* ✅ 可选文字 */}
            {showLabel && (
                <span className={sizeClass.label}>
                    {isLiked ? '已赞' : '点赞'}
                </span>
            )}
        </button>
    );
}