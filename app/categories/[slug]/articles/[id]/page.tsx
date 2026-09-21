// app/category/[slug]/articles/[id]/page.tsx
import type { Metadata } from 'next';
//import { categories, allArticles } from '@/data/articlesData';
import CategoryArticleClient from './CategoryArticleClient';
import { Category1, FrontendArticle1 } from '@/types/frontend';

const baseUrl = process.env.API_URL || 'https://blog.foryet.com/api';

interface PageProps {
    params: Promise<{ slug: string; id: string }>;
}
async function getCategories(): Promise<Category1[]> {
    try {
        const response = await fetch(`${baseUrl}/categories`);
        if (!response.ok) {
            return [];
        }

        const data = (await response.json()) as { data?: Category1[] };
        return data.data ?? [];
    } catch {
        return [];
    }
}

// ✅ 构建时生成所有分类文章详情页
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

export default async function CategoryArticlePage({ params }: PageProps) {
    const { slug, id } = await params;
    const categories = await getCategories();
    const category = categories.find(c => c.pinyin === slug);

    if (!category) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">📂</div>
                    <h1 className="text-2xl font-bold text-gray-800">分类不存在</h1>
                </div>
            </div>
        );
    }

    return (
        <CategoryArticleClient
            slug={slug}
            categoryName={category.name}
            categoryIcon={category.icon}
            articleId={parseInt(id)}
        />
    );
}