// app/test/page.tsx
'use client';

import { usePathname } from 'next/navigation';

export default function CategoryPathPage() {
    const pathname = usePathname();

    return (
        <div style={{ padding: 20, fontFamily: 'monospace' }}>
            <h1>Test Page</h1>
            <p>当前访问路径：</p>
            <pre style={{ background: '#f5f5f5', padding: 10 }}>
                {pathname}
            </pre>
        </div>
    );
}