// app/downloads/page.tsx
import type { Metadata } from 'next';
import DownloadClient from './DownloadClient';

export const metadata: Metadata = {
    title: '文件下载',
    description: '下载各类指标公式、选股公式等资源文件',
};

export default function DownloadsPage() {
    return <DownloadClient />;
}