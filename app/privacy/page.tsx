// app/privacy/page.tsx
import type { Metadata } from 'next';
import PolicyPage from '@/components/frontend/PolicyPage';

export const metadata: Metadata = {
    title: '隐私政策',
    description: '了解我们如何收集、使用和保护您的个人信息',
};

export default function PrivacyPage() {
    return (
        <PolicyPage
            mark="privacy_policy"
            fallbackTitle="隐私政策"
            fallbackDescription="了解我们如何收集、使用和保护您的个人信息"
        />
    );
}