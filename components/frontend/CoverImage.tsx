// components/frontend/CoverImage.tsx
'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { getProxiedImageUrl } from '@/lib/imageProxy';

interface CoverImageProps {
    src?: string | null;
    alt: string;
    aspectRatio?: 'video' | 'square' | 'wide' | 'auto'| 'fill';
    useBlurBackground?: boolean;
    objectFit?: 'cover' | 'contain';
    className?: string;
    fallbackIcon?: string;
}

const ASPECT_CLASSES = {
    video: 'aspect-video',
    square: 'aspect-square',
    wide: 'aspect-[21/9]',
    auto: '',
    fill: 'h-full',  // ✅ fill 模式：填满父容器
};

export default function CoverImage({
    src,
    alt,
    aspectRatio = 'video',
    useBlurBackground = true,
    objectFit = 'contain',
    className,
    fallbackIcon = '📄',
}: CoverImageProps) {
    const [hasError, setHasError] = useState(false);
    const proxiedSrc = getProxiedImageUrl(src);

    const isEmpty = !proxiedSrc || proxiedSrc.trim() === '';
    const showFallback = isEmpty || hasError;

    // 占位图
    if (showFallback) {
        return (
            <div
                className={cn(
                    ASPECT_CLASSES[aspectRatio],
                    'w-full flex items-center justify-center',
                    'bg-gradient-to-br from-gray-100 to-gray-200',
                    className
                )}
            >
                <span className="text-5xl opacity-40">{fallbackIcon}</span>
            </div>
        );
    }

    return (
        <div
            className={cn(
                ASPECT_CLASSES[aspectRatio],
                'relative w-full overflow-hidden bg-gray-100',
                // ✅ 关键1：容器用 Flex 居中
                'flex items-center justify-center',
                className
            )}
        >
            {/* ✅ 关键2：模糊背景 - 居中且覆盖 */}
            {useBlurBackground && objectFit === 'contain' && (
                <div
                    className="absolute inset-0 bg-cover bg-center blur-xl scale-110 opacity-50 "
                    style={{ backgroundImage: `url("${proxiedSrc}")`}}
                    aria-hidden="true"
                />
            )}

            {/* ✅ 关键3：主图 - 水平垂直居中 */}
            <img
                src={proxiedSrc}
                alt={alt}
                loading="lazy"
                onError={() => setHasError(true)}
                className={cn(
                    'relative block',
                    objectFit === 'cover'
                        ? 'w-full h-full object-cover object-center'
                        : 'max-w-full max-h-full w-auto h-auto object-contain object-center'
                )}
                style={{
                    // ✅ 关键4：确保 Flex 居中生效
                    margin: 'auto',
                }}
            />
        </div>
    );
}