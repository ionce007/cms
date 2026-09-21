// components/frontend/ArticleSkeleton.tsx
export default function ArticleSkeleton() {
    return (
        <article className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* 面包屑骨架 */}
            <div className="px-6 pt-5 pb-3 border-b border-gray-100">
                <div className="h-4 bg-gray-200 rounded w-64 animate-pulse" />
            </div>

            {/* 封面骨架 */}
            <div className="relative h-64 sm:h-80 lg:h-96 bg-gray-200 animate-pulse">
                <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3">
                    <div className="h-6 bg-gray-300/50 rounded w-24 animate-pulse" />
                    <div className="h-10 bg-gray-300/50 rounded w-3/4 animate-pulse" />
                </div>
            </div>

            {/* 元信息骨架 */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
                        <div className="h-3 bg-gray-200 rounded w-24 animate-pulse" />
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
                </div>
            </div>

            {/* 正文骨架 */}
            <div className="px-6 py-8 space-y-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                    <div
                        key={i}
                        className="h-4 bg-gray-200 rounded animate-pulse"
                        style={{ width: `${60 + Math.random() * 40}%` }}
                    />
                ))}
                <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
            </div>

            {/* 标签骨架 */}
            <div className="px-6 pb-6 flex gap-2">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-6 bg-gray-200 rounded-full w-16 animate-pulse" />
                ))}
            </div>
        </article>
    );
}