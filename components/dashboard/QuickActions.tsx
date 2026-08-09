import { QuickActionsProps } from '@/types';

export default function QuickActions({
    onCreateContent,
    onViewAnalytics,
    onManageUsers,
}: QuickActionsProps) {
    const actions = [
        {
            label: '创建内容',
            icon: '✨',
            onClick: onCreateContent,
            color: 'bg-primary-50 text-primary-600 hover:bg-primary-100',
        },
        {
            label: '数据分析',
            icon: '📊',
            onClick: onViewAnalytics,
            color: 'bg-green-50 text-green-600 hover:bg-green-100',
        },
        {
            label: '用户管理',
            icon: '👥',
            onClick: onManageUsers,
            color: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
        },
    ];

    return (
        <div className="flex items-center space-x-2">
            {actions.map((action) => (
                <button
                    key={action.label}
                    onClick={action.onClick}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-1.5 ${action.color}`}
                >
                    <span>{action.icon}</span>
                    <span className="hidden sm:inline">{action.label}</span>
                </button>
            ))}
        </div>
    );
}