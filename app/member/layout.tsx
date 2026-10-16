// app/member/layout.tsx
import type { Metadata } from 'next';
import MemberLayoutClient from './MemberLayoutClient';

export const metadata: Metadata = {
    title: '会员中心',
    description: '管理你的评论、点赞、收藏和下载',
};

export default function MemberLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <MemberLayoutClient>{children}</MemberLayoutClient>;
}