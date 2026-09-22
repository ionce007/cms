// components/frontend/SafeImage.tsx
'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
//import { ImageProxy } from '@/lib/imageProxy';
import { getProxiedImageUrl } from '@/lib/imageProxy';

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

    useEffect(() => {
        //console.log('image src = ', src);
    }, [src])
    // ✅ 自动 HTTP → HTTPS 代理
    //const imgProxy = new ImageProxy({ refUrl: 'https://blog.foryet.com'; });
    //const proxiedSrc = imgProxy.getProxyUrl(src);
    //const proxiedSrc = getProxiedImageUrl(src);

    const proxiedSrc = src ? getProxiedImageUrl(src) : '';

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