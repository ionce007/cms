// app/about/AboutClient.tsx
'use client';

import Header from '@/components/frontend/Header';
import Footer from '@/components/frontend/Footer';
import Sidebar from '@/components/frontend/Sidebar';
import { useFrag } from '@/hooks/useCommonData';

type AboutClientProps = {
  slug: string;
};

export default function AboutClient({ slug }: AboutClientProps) {
    // ✅ 从 cms_frag 表读取 mark = 'aboutus' 的 HTML 内容
    const { frag, isLoading, error } = useFrag(slug);

    // ========== 加载中 ==========
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Header />
                <main className="flex-1">
                    {/* 页面标题 */}
                    <div className="bg-white border-b border-gray-200">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                            <div className="h-10 bg-gray-200 rounded w-48 mb-2 animate-pulse" />
                            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
                        </div>
                    </div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* 左侧内容骨架 */}
                            <div className="flex-1 min-w-0">
                                <div className="bg-white rounded-xl border border-gray-200 p-6 lg:p-8 space-y-4">
                                    <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse" />
                                    <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                                    <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
                                    <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                                    <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
                                </div>
                            </div>

                            {/* 右侧边栏骨架 */}
                            <div className="w-full lg:w-80 flex-shrink-0">
                                <div className="space-y-6">
                                    {[1, 2, 3].map((item) => (
                                        <div key={item} className="bg-white rounded-xl border border-gray-200 p-5">
                                            <div className="h-5 bg-gray-200 rounded w-24 mb-4 animate-pulse" />
                                            <div className="space-y-2">
                                                <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                                                <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
                                                <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    // ========== 错误 ==========
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Header />
                <main className="flex-1">
                    <div className="bg-white border-b border-gray-200">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                                关于我们
                            </h1>
                        </div>
                    </div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="flex flex-col lg:flex-row gap-8">
                            <div className="flex-1 min-w-0">
                                <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
                                    <div className="text-6xl mb-4">😕</div>
                                    <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                        加载失败
                                    </h2>
                                    <p className="text-gray-600">
                                        {error?.message || '无法加载关于页面数据'}
                                    </p>
                                </div>
                            </div>
                            <div className="w-full lg:w-80 flex-shrink-0">
                                <Sidebar />
                            </div>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    // ========== 正常内容 ==========
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />

            <main className="flex-1">
                {/* 页面标题 - 与其他页面保持一致 */}
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                            {frag?.name || '关于我们'}
                        </h1>
                        <p className="text-gray-600">
                            了解我们的团队、技术栈和发展历程
                        </p>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* ✅ 左侧主内容 - 渲染 HTML */}
                        <div className="flex-1 min-w-0">
                            {frag?.content ? (
                                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                    <div
                                        className="about-content p-6 lg:p-8"
                                        dangerouslySetInnerHTML={{ __html: frag.content }}
                                    />
                                </div>
                            ) : (
                                <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
                                    <div className="text-6xl mb-4">📝</div>
                                    <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                        内容未配置
                                    </h2>
                                    <p className="text-gray-600">
                                        请在管理后台配置 mark 为 <code className="px-1.5 py-0.5 bg-gray-100 rounded text-sm">aboutus</code> 的内容
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* ✅ 右侧边栏 - 与其他页面完全一致 */}
                        <div className="w-full lg:w-80 flex-shrink-0">
                            <Sidebar />
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}