// app/member/likes/page.tsx
import type { Metadata } from 'next';
import LikesClient from './LikesClient';

export const metadata: Metadata = {
    title: '我的点赞',
};

export default function LikesPage() {
    return <LikesClient />;
}