// app/cookies/page.tsx
import type { Metadata } from 'next';
import PolicyPage from '@/components/frontend/PolicyPage';

export const metadata: Metadata = {
    title: 'Cookie 政策',
    description: '了解我们如何使用 Cookie 和类似技术',
};

export default function CookiesPage() {
    return (
        <PolicyPage
            mark="cookie_policy"
            fallbackTitle="Cookie 政策"
            fallbackDescription="了解我们如何使用 Cookie 和类似技术"
        />
    );
}