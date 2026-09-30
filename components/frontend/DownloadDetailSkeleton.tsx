// components/frontend/DownloadDetailSkeleton.tsx
export default function DownloadDetailSkeleton() {
    return (
        <article className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* 封面骨架 */}
            <div className="aspect-video bg-gray-200 animate-pulse" />

            {/* 内容骨架 */}
            <div className="p-6 space-y-6">
                {/* 标题 */}
                <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse" />

                {/* 概述 */}
                <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
                </div>

                {/* 元信息 */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-gray-100">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i}>
                            <div className="h-3 bg-gray-200 rounded w-16 mb-2 animate-pulse" />
                            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
                        </div>
                    ))}
                </div>

                {/* 说明内容 */}
                <div className="space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-24 animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
                </div>

                {/* 按钮 */}
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <div className="h-12 bg-gray-200 rounded-lg w-32 animate-pulse" />
                    <div className="h-12 bg-gray-200 rounded-lg w-32 animate-pulse" />
                </div>
            </div>
        </article>
    );
}