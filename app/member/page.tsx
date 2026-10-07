// app/member/page.tsx
import type { Metadata } from 'next';
import MemberClient from './MemberClient';

export const metadata: Metadata = {
    title: '会员中心',
    description: '管理您的账户信息',
};

export default function MemberPage() {
    return <MemberClient />;
}