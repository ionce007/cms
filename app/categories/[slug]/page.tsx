// app/category/[slug]/page.tsx
import type { Metadata } from 'next';
//import { categories } from '@/data/articlesData';
import CategoryClient from './CategoryClient';
import { defaultCategory,Category1 } from '@/types/frontend';

const baseUrl = process.env.API_URL || 'http://localhost:8088/api';

interface CategoryPageProps {
    params: Promise<{ slug: string }>;
}

async function getCategories(): Promise<Category1[]> {
    const [CategoryResult] = await Promise.allSettled([
        fetch(`${baseUrl}/categories`),
    ]);

    if (CategoryResult.status !== 'fulfilled' || !CategoryResult.value.ok) {
        return [];
    }

    const result = (await CategoryResult.value.json()) as { data?: Category1[] };
    return result.data ?? [];
}

// ✅ 构建时生成所有分类页面
export async function generateStaticParams() {
    const categories = await getCategories();

    return categories.map(category => ({
        slug: category.pinyin,
    }));
}

// ✅ 动态元数据
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
    const { slug } = await params;
    const categories = await getCategories();
    const category = categories.find(c => c.pinyin === slug);

    return {
        title: category ? `${category.name} - 文章分类` : '分类未找到',
        description: category ? `浏览${category.name}相关的所有文章` : undefined,
    };
}


// ✅ 服务端组件，渲染客户端组件
export default async function CategoryPage({ params }: CategoryPageProps) {
    const { slug } = await params;
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
        <CategoryClient
            slug={slug}
            categoryName={category.name}
            categoryIcon={category.icon}
        />
    );
}