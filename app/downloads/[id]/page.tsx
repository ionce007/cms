// app/downloads/[id]/page.tsx
import type { Metadata } from 'next';
import DownloadDetailClient from './DownloadDetailClient';

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;

    return {
        title: `文件详情 - ${id}`,
        description: '文件详细信息与下载',
    };
}

export default async function DownloadDetailPage({ params }: PageProps) {
    const { id } = await params;

    return <DownloadDetailClient id={id} />;
}