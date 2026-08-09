import { MediaCardProps } from '@/types';

export default function MediaCard({ media }: MediaCardProps) {
    const typeConfig = {
        image: { bg: 'bg-blue-50', icon: '🖼️', text: 'text-blue-600', border: 'border-blue-200' },
        video: { bg: 'bg-red-50', icon: '🎬', text: 'text-red-600', border: 'border-red-200' },
        document: { bg: 'bg-green-50', icon: '📄', text: 'text-green-600', border: 'border-green-200' },
        audio: { bg: 'bg-purple-50', icon: '🎵', text: 'text-purple-600', border: 'border-purple-200' },
    };

    const config = typeConfig[media.type];

    return (
        <div className="p-4 border border-gray-200 rounded-xl card-hover cursor-pointer group">
            <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 ${config.bg} rounded-xl flex items-center justify-center text-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-200`}>
                    {config.icon}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-800 truncate group-hover:text-primary-600 transition-colors">
                        {media.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                        {media.size} • {media.date}
                    </p>
                </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <div>
                    {media.dimensions && <span>尺寸: {media.dimensions}</span>}
                    {media.duration && <span>时长: {media.duration}</span>}
                    {media.pages && <span>页数: {media.pages}页</span>}
                </div>
                <button className="text-primary-600 hover:text-primary-700 font-medium hover:underline">
                    下载
                </button>
            </div>
        </div>
    );
}