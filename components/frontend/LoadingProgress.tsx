// components/frontend/LoadingProgress.tsx
'use client';

interface LoadingProgressProps {
    progress: number;
    loadingMessage: string;
    loadingStates: Record<string, boolean>;
}

const ITEM_CONFIG: Record<string, { label: string; icon: string }> = {
    categories: { label: '分类', icon: '📂' },
    tags: { label: '标签', icon: '🏷️' },
    popularPosts: { label: '热门', icon: '🔥' },
    featuredArticles: { label: '精选', icon: '⭐' },
    articles: { label: '文章', icon: '📄' },
    article: { label: '正文', icon: '📖' },  // ✅ 新增：文章详情
};

export default function LoadingProgress({
    progress,
    loadingMessage,
    loadingStates,
}: LoadingProgressProps) {
    const items = Object.keys(loadingStates).map(key => {
        const config = ITEM_CONFIG[key] || { label: key, icon: '📌' };
        return {
            key,
            label: config.label,
            icon: config.icon,
            done: loadingStates[key],
        };
    });

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6 mb-6">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                    <div className="relative w-10 h-10 flex-shrink-0">
                        <div className="w-10 h-10 rounded-full border-3 border-primary-100 border-t-primary-600 animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-sm">📖</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-700">
                            正在加载...
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {loadingMessage}
                        </p>
                    </div>
                </div>
                <span className="text-sm font-bold text-primary-600">
                    {progress}%
                </span>
            </div>

            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/*<div
                className="grid gap-1 sm:gap-1.5 md:gap-2 mt-4"
                style={{
                    gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))`,
                }}
            >
                {items.map(({ key, label, icon, done }) => (
                    <div
                        key={key}
                        className={`flex items-center justify-center gap-1 
                            text-[10px] sm:text-xs px-1 sm:px-2 py-1.5 rounded-lg 
                            transition-colors min-w-0 whitespace-nowrap ${
                                done
                                    ? 'bg-green-50 text-green-700'
                                    : 'bg-gray-50 text-gray-400'
                            }`}
                    >
                        <span className="flex-shrink-0 text-sm sm:text-base">
                            {done ? '✅' : icon}
                        </span>
                        <span className="truncate">{label}</span>
                    </div>
                ))}
            </div>*/}
        </div>
    );
}