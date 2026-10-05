// app/terms/page.tsx
import type { Metadata } from 'next';
import PolicyPage from '@/components/frontend/PolicyPage';

export const metadata: Metadata = {
    title: '服务条款',
    description: '使用本网站服务的权利和义务',
};

export default function TermsPage() {
    return (
        <PolicyPage
            mark="terms_of_service"
            fallbackTitle="服务条款"
            fallbackDescription="使用本网站服务的权利和义务"
        />
    );
}