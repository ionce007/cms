// app/tag/[slug]/articles/[id]/page.tsx
import type { Metadata } from 'next';
//import { tags, allArticles } from '@/data/articlesData';
import { FrontendArticle1, Tag } from '@/types/frontend';
import TagArticleClient from './TagArticleClient';

const baseUrl = process.env.API_URL || 'https://blog.foryet.com/api';

interface PageProps {
    params: Promise<{ slug: string; id: string }>;
}

// ✅ 构建时生成所有标签文章详情页
export function generateStaticParams(): { slug: string; id: string }[] {
    return [];
}
async function getArticle(id: number) {
    try {
        const response = await fetch(`${baseUrl}/articles/${id}`);
        const data = await response.json();
        return data.article;
    }
    catch (err) {
        console.log(err);
        return null;
    }
}
// ✅ 动态元数据
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    //const article = allArticles.find(a => a.id === parseInt(id));
    const article: FrontendArticle1 = await getArticle(parseInt(id));

    return {
        title: article ? article.title : '文章未找到',
        description: article?.description,
    };
}

async function getTags() {
    const response = await fetch(`${baseUrl}/tags`);
    const data = await response.json();
    const tags: Tag[] = !data || !data.data || data.data.length === 0 ? [] : data.data;
    return { tags };
}

export default async function TagArticlePage({ params }: PageProps) {
    const { slug, id } = await params;
    const { tags } = await getTags();
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
        <TagArticleClient
            slug={slug}
            tagName={tag.name}
            articleId={parseInt(id)}
        />
    );
}