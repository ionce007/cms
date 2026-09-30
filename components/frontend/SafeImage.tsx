// components/frontend/SafeImage.tsx
'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { getProxiedImageUrl, getSiteProtocol } from '@/lib/imageProxy';

interface SafeImageProps {
    src?: string | null;
    alt: string;
    className?: string;
    fallbackIcon?: string;
    fallbackClassName?: string;
    loading?: 'lazy' | 'eager';
}

export default function SafeImage({
    src,
    alt,
    className,
    fallbackIcon = '📄',
    fallbackClassName,
    loading = 'lazy',
}: SafeImageProps) {
    const [hasError, setHasError] = useState(false);
    // ✅ 首次渲染时用默认协议（SSR），客户端挂载后再用真实协议
    const [protocol, setProtocol] = useState<'http:' | 'https:'>('https:');

    useEffect(() => {
        // ✅ 客户端挂载后，读取真实协议
        setProtocol(getSiteProtocol());
    }, []);

    // ✅ 根据网站协议决定是否代理
    const proxiedSrc = getProxiedImageUrl(src, { protocol });

    const isEmpty = !proxiedSrc || proxiedSrc.trim() === '';
    const showFallback = isEmpty || hasError;

    if (showFallback) {
        return (
            <div
                className={cn(
                    'w-full h-full flex items-center justify-center',
                    'bg-gradient-to-br from-gray-100 to-gray-200',
                    fallbackClassName
                )}
            >
                <span className="text-4xl opacity-50">{fallbackIcon}</span>
            </div>
        );
    }

    return (
        <img
            src={proxiedSrc}
            alt={alt}
            className={className}
            onError={() => setHasError(true)}
            loading={loading}
        />
    );
}