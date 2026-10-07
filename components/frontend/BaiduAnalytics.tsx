// components/frontend/BaiduAnalytics.tsx
'use client';

import Script from 'next/script';
import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { API_BASE_URL } from '@/config/env';
import { parseAnalyticsCode } from '@/lib/analyticsParser';
import { useSiteConfig } from '@/hooks/useSiteConfig';

export default function BaiduAnalytics() {
    const { siteConfig, isLoading, isLoaded, error } = useSiteConfig();
    const [code, setCode] = useState('');
    //const [loaded, setLoaded] = useState(false);
    const pathname = usePathname();

    // ✅ 从数据库读取统计代码
    useEffect(() => {
        if (isLoaded && siteConfig.code) {
            setCode(siteConfig.code);
        }
    }, [isLoaded, siteConfig.code]);
    
    // ✅ 解析脚本
    const parsed = useMemo(() => parseAnalyticsCode(code), [code]);

    // ✅ 监听路由变化，手动上报 PV
    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (!(window as any)._hmt) return;

        // 百度统计的 SPA 页面浏览上报
        (window as any)._hmt.push(['_trackPageview', pathname]);
    }, [pathname]);

    // 未加载或没有代码，不渲染
    if (!isLoaded || (!parsed.inline.length && !parsed.external.length)) {
        return null;
    }

    return (
        <>
            {/* ✅ 外链脚本 */}
            {parsed.external.map((src, index) => (
                <Script
                    key={`ext-${index}`}
                    id={`analytics-external-${index}`}
                    src={src}
                    strategy="afterInteractive"
                />
            ))}

            {/* ✅ 内联脚本 */}
            {parsed.inline.map((js, index) => (
                <Script
                    key={`inline-${index}`}
                    id={`analytics-inline-${index}`}
                    strategy="afterInteractive"
                    dangerouslySetInnerHTML={{ __html: js }}
                />
            ))}
        </>
    );
}