// components/dashboard/StatCard.tsx
import { StatCardProps } from '@/types';
import { cn } from '@/lib/utils';

export default function StatCard({ stat, index = 0 }: StatCardProps) {
    const colorClasses: Record<string, string> = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        purple: 'bg-purple-50 text-purple-600',
        orange: 'bg-orange-50 text-orange-600',
        red: 'bg-red-50 text-red-600',
    };

    return (
        <div
            className="card p-5 hover:scale-105 transition-transform duration-200 animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
        >
            <div className="flex items-center justify-between mb-4">
                <div className={cn('p-3 rounded-xl', colorClasses[stat.color])}>
                    <span className="text-2xl">{stat.icon}</span>
                </div>
                <div
                    className={cn(
                        'flex items-center space-x-1 text-xs font-semibold px-2 py-1 rounded-full',
                        stat.changeType === 'increase'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-red-50 text-red-700'
                    )}
                >
                    <span>{stat.changeType === 'increase' ? '↑' : '↓'}</span>
                    <span>{stat.change}%</span>
                </div>
            </div>
            <div>
                <div className="text-sm text-gray-500 mb-1 font-medium">{stat.label}</div>
                <div className="text-2xl font-bold text-gray-800 tracking-tight">{stat.value}</div>
            </div>

            {/* 迷你趋势图 - 修复 undefined 问题 */}
            {stat.trend && stat.trend.length > 0 && (
                <div className="mt-3 flex items-end space-x-1 h-8">
                    {stat.trend.map((value, i) => {
                        const maxValue = Math.max(...stat.trend!);  // 添加 ! 断言
                        const height = (value / maxValue) * 100;
                        return (
                            <div
                                key={i}
                                className={cn(
                                    'flex-1 rounded-t-sm transition-all duration-300',
                                    stat.changeType === 'increase' ? 'bg-primary-200' : 'bg-red-200'
                                )}
                                style={{ height: `${height}%` }}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}