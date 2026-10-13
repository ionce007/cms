// components/frontend/BookmarkButton.tsx
'use client';

import { cn } from '@/lib/utils';
import { useBookmark } from '@/hooks/useBookmark';
import RequireLoginModal from './RequireLoginModal';

interface BookmarkButtonProps {
    /** 目标类型 */
    target: 'article' | 'formula';
    /** 目标 ID */
    id: number | string | undefined;
    /** 初始收藏数 */
    initialMarked?: number;
    /** 初始是否已收藏 */
    initialIsBookmarked?: boolean;
    /** 是否启用 */
    enabled?: boolean;
    /** 尺寸 */
    size?: 'sm' | 'md' | 'lg';
    /** 是否显示文字 */
    showLabel?: boolean;
    /** 自定义类名 */
    className?: string;
    /**
     * ✅ 视觉样式
     * - 'default': 浅色背景用（灰色 → 红色）
     * - 'on-dark': 深色背景用（白色 → 红色）← 你要的
     * - 'ghost': 无背景（灰色图标 → 红色图标）
     */
    variant?: 'default' | 'on-dark' | 'ghost';
    onBeforeToggle?: () => boolean | void;
    onToggle?: (isBookmarked: boolean, marked: number) => void;
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
    initialIsBookmarked = false,
    enabled = true,
    size = 'md',
    showLabel = true,
    className,
    variant = 'default',
    onBeforeToggle,
    onToggle,
}: BookmarkButtonProps) {
    const {
        marked,
        isBookmarked,
        isLoading,
        toggle,
        needLogin,
        closeLoginModal,
    } = useBookmark({
        target,
        id,
        initialMarked,
        initialIsBookmarked,
        enabled,
    });

    const sizeClass = SIZE_CLASSES[size];

    // ==================== 样式策略 ====================
    const getButtonClass = () => {
        // ✅ 深色背景模式（你要的：白色 → 红色）
        if (variant === 'on-dark') {
            return isBookmarked
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-black/40 text-white backdrop-blur-sm hover:bg-black/60';
        }

        // ✅ 幽灵模式（无背景，图标颜色变化）
        if (variant === 'ghost') {
            return isBookmarked
                ? 'bg-transparent text-red-500 hover:bg-red-50'
                : 'bg-transparent text-gray-400 hover:bg-gray-100 hover:text-gray-600';
        }

        // ✅ 默认模式（浅色背景：灰色 → 红色）
        return isBookmarked
            ? 'bg-red-50 text-red-600 hover:bg-red-100'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200';
    };

    // ==================== 星形填充策略 ====================
    const getStarFill = () => {
        if (isBookmarked) return 'currentColor';  // ✅ 已收藏：填充
        return 'none';                             // ✅ 未收藏：空心
    };

    const handleClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (onBeforeToggle) {
            const result = onBeforeToggle();
            if (result === false) return;
        }

        const prevBookmarked = isBookmarked;
        await toggle();

        if (onToggle) {
            onToggle(!prevBookmarked, prevBookmarked ? marked - 1 : marked + 1);
        }
    };

    return (
        <>
            <button
                type="button"
                onClick={handleClick}
                disabled={isLoading || !id}
                className={cn(
                    'inline-flex items-center justify-center rounded-lg font-medium',
                    'transition-all duration-200',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'focus:outline-none focus:ring-2 focus:ring-offset-2',
                    'select-none',
                    sizeClass.button,
                    getButtonClass(),
                    className
                )}
                aria-label={isBookmarked ? '取消收藏' : '收藏'}
                aria-pressed={isBookmarked}
                title={isBookmarked ? '取消收藏' : '收藏'}
            >
                {/* ✅ 星形图标 */}
                <svg
                    className={cn(
                        sizeClass.icon,
                        'flex-shrink-0 transition-all duration-200',
                        isBookmarked && 'scale-110'
                    )}
                    fill={getStarFill()}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    {/* ✅ 五角星路径 */}
                    <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>

                {/* 收藏数 */}
                {marked > 0 && (
                    <span className={cn('font-semibold', sizeClass.label)}>
                        {marked.toLocaleString()}
                    </span>
                )}

                {/* 文字标签 */}
                {showLabel && (
                    <span className={sizeClass.label}>
                        {isBookmarked ? '已收藏' : '收藏'}
                    </span>
                )}
            </button>

            {/* 未登录提示 */}
            <RequireLoginModal
                isOpen={needLogin}
                onClose={closeLoginModal}
                action="收藏"
            />
        </>
    );
}