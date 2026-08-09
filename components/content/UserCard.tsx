import { UserCardProps } from '@/types';

export default function UserCard({ user }: UserCardProps) {
    const roleConfig = {
        Admin: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: '👑' },
        Editor: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: '✏️' },
        User: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: '👤' },
        Moderator: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', icon: '🛡️' },
    };

    const config = roleConfig[user.role];

    return (
        <div className="p-4 border border-gray-200 rounded-xl card-hover cursor-pointer group">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 ${config.bg} rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform`}>
                        {config.icon}
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-800">{user.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${config.bg} ${config.text}`}>
                            {user.role}
                        </span>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-xl font-bold text-gray-800">{user.count}</div>
                    <div className="text-xs text-gray-500">用户</div>
                </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center space-x-1.5 text-xs text-gray-500">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span>活跃: {user.lastActive}</span>
                </div>
                <button className="text-xs text-primary-600 hover:text-primary-700 font-medium hover:underline">
                    管理 →
                </button>
            </div>
        </div>
    );
}