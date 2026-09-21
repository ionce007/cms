// app/articles/[id]/page.tsx
import type { Metadata } from 'next';
import ArticleClient from './ArticleClient';

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    // 可以从 API 获取标题，也可以直接用默认值
    return {
        title: `文章详情 - ${id}`,
        description: '阅读文章详情',
    };
}

export default async function ArticleDetailPage({ params }: PageProps) {
    const { id } = await params;

    // ✅ 直接传给客户端组件，由客户端获取数据并显示进度
    return <ArticleClient articleId={parseInt(id)} />;
}