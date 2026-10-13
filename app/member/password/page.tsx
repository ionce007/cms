// app/member/password/page.tsx
import type { Metadata } from 'next';
import PasswordClient from './PasswordClient';

export const metadata: Metadata = {
    title: '修改密码',
};

export default function PasswordPage() {
    return <PasswordClient />;
}