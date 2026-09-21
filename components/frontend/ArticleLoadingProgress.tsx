// components/frontend/ArticleLoadingProgress.tsx
'use client';

interface ArticleLoadingProgressProps {
    progress: number;
    label?: string;
}

export default function ArticleLoadingProgress({
    progress,
    label = '正在加载文章...',
}: ArticleLoadingProgressProps) {
    // 根据进度显示不同的提示文字
    const getMessage = () => {
        if (progress < 30) return '正在连接服务器...';
        if (progress < 60) return '正在获取文章内容...';
        if (progress < 90) return '正在渲染内容...';
        if (progress < 100) return '即将完成...';
        return '加载完成！';
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6 mb-6">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                    {/* 旋转加载图标 */}
                    <div className="relative w-10 h-10 flex-shrink-0">
                        <div className="w-10 h-10 rounded-full border-3 border-primary-100 border-t-primary-600 animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-sm">📖</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-700">
                            {label}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {getMessage()}
                        </p>
                    </div>
                </div>
                <span className="text-sm font-bold text-primary-600">
                    {progress}%
                </span>
            </div>

            {/* 进度条 */}
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
}