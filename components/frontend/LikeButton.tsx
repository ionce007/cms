// components/frontend/LikeButton.tsx
'use client';

import { cn } from '@/lib/utils';
import { useLike } from '@/hooks/useLike';
import RequireLoginModal from './RequireLoginModal';

interface LikeButtonProps {
    target: 'article' | 'formula';
    id: number | string | undefined;
    initialLikes?: number;
    initialIsLiked?: boolean;
    enabled?: boolean;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
    className?: string;
    /** ✅ 新增：图标颜色模式 */
    variant?: 'default' | 'on-dark' | 'ghost';
}

const SIZE_CLASSES = {
    sm: { button: 'px-3 py-1.5 text-xs gap-1', icon: 'w-3.5 h-3.5', label: 'text-xs' },
    md: { button: 'px-4 py-2 text-sm gap-2', icon: 'w-5 h-5', label: 'text-sm' },
    lg: { button: 'px-6 py-3 text-base gap-2', icon: 'w-6 h-6', label: 'text-base' },
};

export default function LikeButton({
    target,
    id,
    initialLikes = 0,
    initialIsLiked = false,
    enabled = true,
    size = 'md',
    showLabel = false,
    className,
    variant = 'default',  // ✅ 默认灰色按钮
}: LikeButtonProps) {
    const {
        likes, isLiked, isLoading, toggle,
        needLogin, closeLoginModal,
    } = useLike({
        target, id, initialLikes, initialIsLiked, enabled,
    });

    const sizeClass = SIZE_CLASSES[size];

    // ✅ 根据 variant + 状态计算样式
    const getButtonClass = () => {
        // 深色背景模式
        if (variant === 'on-dark') {
            return isLiked
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-white/20 text-white backdrop-blur-sm hover:bg-white/30';
        }

        // 幽灵模式（无背景，只显示图标颜色）
        if (variant === 'ghost') {
            return isLiked
                ? 'bg-transparent text-red-500 hover:bg-red-50'
                : 'bg-transparent text-gray-400 hover:bg-gray-100 hover:text-gray-600';
        }

        // ✅ 默认模式：灰色底 → 红色底
        return isLiked
            ? 'bg-red-50 text-red-600 hover:bg-red-100'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200';
    };

    return (
        <>
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
                    sizeClass.button,
                    getButtonClass(),
                    className
                )}
            >
                <svg
                    className={cn(sizeClass.icon, isLiked && 'scale-110')}
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
                <span className={cn('font-semibold', sizeClass.label)}>
                    {likes.toLocaleString()}
                </span>
                {showLabel && (
                    <span className={sizeClass.label}>
                        {isLiked ? '已赞' : '点赞'}
                    </span>
                )}
            </button>

            <RequireLoginModal
                isOpen={needLogin}
                onClose={closeLoginModal}
                action="点赞"
            />
        </>
    );
}