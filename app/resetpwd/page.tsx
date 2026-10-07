// app/reset-password/page.tsx
import type { Metadata } from 'next';
import { Suspense } from 'react';
import ResetPasswordClient from './ResetPasswordClient';

export const metadata: Metadata = {
    title: '重置密码',
    description: '设置新密码',
    robots: {
        index: false,
        follow: false,
    },
};

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">加载中...</div>}>
            <ResetPasswordClient />
        </Suspense>
    );
}