// app/member/layout.tsx
import type { Metadata } from 'next';
import MemberLayoutClient from './MemberLayoutClient';

export const metadata: Metadata = {
    title: {
        default: '会员中心',
        template: '%s | 会员中心',
    },
    description: '管理您的账户信息',
    robots: {
        index: false,
        follow: false,
    },
};

export default function MemberLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <MemberLayoutClient>{children}</MemberLayoutClient>;
}