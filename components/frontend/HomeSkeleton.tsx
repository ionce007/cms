// components/frontend/HomeSkeleton.tsx
export default function HomeSkeleton() {
    return (
        <>
            {/* Hero 骨架 */}
            <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-primary-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
                    <div className="max-w-3xl space-y-4">
                        <div className="h-6 bg-white/10 rounded w-32 animate-pulse" />
                        <div className="h-12 bg-white/10 rounded w-3/4 animate-pulse" />
                        <div className="h-6 bg-white/10 rounded w-full animate-pulse" />
                        <div className="h-6 bg-white/10 rounded w-2/3 animate-pulse" />
                        <div className="flex gap-4 pt-4">
                            <div className="h-10 w-10 bg-white/10 rounded-full animate-pulse" />
                            <div className="h-4 bg-white/10 rounded w-24 animate-pulse" />
                        </div>
                    </div>
                </div>
            </section>

            {/* 主内容骨架 */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* 左侧文章列表骨架 */}
                    <div className="flex-1 min-w-0">
                        {/* 标题栏 */}
                        <div className="flex items-center justify-between mb-8">
                            <div className="h-8 bg-gray-200 rounded w-32 animate-pulse" />
                            <div className="flex gap-3">
                                <div className="h-10 bg-gray-200 rounded w-20 animate-pulse" />
                                <div className="h-5 bg-gray-200 rounded w-20 animate-pulse" />
                            </div>
                        </div>

                        {/* 文章卡片骨架 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[1, 2, 3, 4, 5, 6].map((item) => (
                                <div
                                    key={item}
                                    className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                                >
                                    <div className="aspect-video bg-gray-200 animate-pulse" />
                                    <div className="p-5 space-y-3">
                                        <div className="flex gap-2">
                                            <div className="h-5 bg-gray-200 rounded w-16 animate-pulse" />
                                            <div className="h-5 bg-gray-200 rounded w-16 animate-pulse" />
                                        </div>
                                        <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse" />
                                        <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                                        <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
                                        <div className="flex justify-between pt-4 border-t border-gray-100">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 bg-gray-200 rounded-full animate-pulse" />
                                                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
                                            </div>
                                            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 右侧边栏骨架 */}
                    <div className="w-full lg:w-80 flex-shrink-0">
                        <div className="space-y-6">
                            {[1, 2, 3, 4].map((item) => (
                                <div
                                    key={item}
                                    className="bg-white rounded-xl border border-gray-200 p-5"
                                >
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
        </>
    );
}