// components/frontend/DownloadSkeleton.tsx
interface DownloadSkeletonProps {
    viewMode?: 'grid' | 'list';
}

export default function DownloadSkeleton({ viewMode = 'grid' }: DownloadSkeletonProps) {
    // 网格骨架
    if (viewMode === 'grid') {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div
                        key={i}
                        className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                    >
                        <div className="aspect-video bg-gray-200 animate-pulse" />
                        <div className="p-5 space-y-3">
                            <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse" />
                            <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                            <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="h-4 bg-gray-200 rounded w-12 animate-pulse" />
                                    <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
                                </div>
                                <div className="h-8 bg-gray-200 rounded w-20 animate-pulse" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // 列表骨架
    return (
        <div className="space-y-3 lg:space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <div
                    key={i}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                >
                    <div className="flex flex-col sm:flex-row">
                        <div className="sm:w-48 lg:w-56 h-40 sm:h-auto min-h-[140px] bg-gray-200 animate-pulse" />
                        <div className="flex-1 p-4 sm:p-5 space-y-3">
                            <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse" />
                            <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                            <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="h-4 bg-gray-200 rounded w-12 animate-pulse" />
                                    <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
                                </div>
                                <div className="h-8 bg-gray-200 rounded w-20 animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}