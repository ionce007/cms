// app/tag/[slug]/page.tsx
import type { Metadata } from 'next';
//import { tags } from '@/data/articlesData';
import TagClient from './TagClient';
import { Tag } from '@/types/frontend';

interface TagPageProps {
    params: Promise<{ slug: string }>;
}
const baseUrl = process.env.API_URL || 'http://localhost:8088/api';

async function getTags(): Promise<Tag[]> {
    const [tagResult] = await Promise.allSettled([
        fetch(`${baseUrl}/tags`),
    ]);

    if (tagResult.status !== 'fulfilled' || !tagResult.value.ok) {
        return [];
    }

    const result = (await tagResult.value.json()) as { data?: Tag[] };
    return result.data ?? [];
}

// ✅ 构建时生成所有标签页面
export async function generateStaticParams() {
    const tags = await getTags();

    return tags.map(tag => ({
        slug: tag.path,
    }));
}

// ✅ 动态元数据
export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
    const { slug } = await params;
    const tags = await getTags();
    const tag = tags.find(t => t.path === slug);

    return {
        title: tag ? `#${tag.name} - 标签` : '标签未找到',
        description: tag ? `浏览与 ${tag.name} 相关的所有文章` : undefined,
    };
}

export default async function TagPage({ params }: TagPageProps) {
    const { slug } = await params;
    const tags = await getTags();
    const tag = tags.find(t => t.path === slug);

    if (!tag) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">🏷️</div>
                    <h1 className="text-2xl font-bold text-gray-800">标签不存在</h1>
                </div>
            </div>
        );
    }

    return (
        <TagClient
            slug={slug}
            tagName={tag.name}
        />
    );
}