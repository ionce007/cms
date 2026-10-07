// app/forgot-password/page.tsx
import type { Metadata } from 'next';
import ForgotPasswordClient from './ForgotPasswordClient';

export const metadata: Metadata = {
    title: '忘记密码',
    description: '通过邮箱找回您的账户密码',
    robots: {
        index: false,
        follow: false,
    },
};

export default function ForgotPasswordPage() {
    return <ForgotPasswordClient />;
}