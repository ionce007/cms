// app/member/page.tsx
import type { Metadata } from 'next';
import MemberClient from './MemberClient';

export const metadata: Metadata = {
    title: '概览',
};

export default function MemberPage() {
    return <MemberClient />;
}