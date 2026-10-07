// app/login/page.tsx
import type { Metadata } from 'next';
import LoginClient from './LoginClient';

export const metadata: Metadata = {
    title: '登录',
    description: '登录到您的账户',
};

export default function LoginPage() {
    return <LoginClient />;
}