// app/member/downloads/page.tsx
import type { Metadata } from 'next';
import DownloadsClient from './DownloadsClient';

export const metadata: Metadata = {
    title: '我的下载',
};

export default function DownloadsPage() {
    return <DownloadsClient />;
}