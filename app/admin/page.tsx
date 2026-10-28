// app/admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { FileText, Download, Users, MessageSquare, Activity, TrendingUp } from 'lucide-react';
import { API_BASE_URL } from '@/config/env';
import { useAdminFetch } from '@/hooks/useAdminFetch';

// 简单的 SVG 折线图组件（适配30天数据）
function PvTrendChart({ data }: { data: { date: string; count: number }[] }) {
    if (!data || data.length === 0) return <div className="text-gray-400 text-sm">暂无数据</div>;

    const max = Math.max(...data.map(d => d.count), 1);
    const min = 0; // 从0开始
    const range = max - min || 1;
    const width = 800;
    const height = 200;
    const padding = 20;

    // 生成折线点
    const points = data.map((d, i) => {
        const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
        const y = height - padding - ((d.count - min) / range) * (height - 2 * padding);
        return `${x},${y}`;
    }).join(' ');

    // 生成面积填充
    const areaPoints = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`;

    return (
        <div className="w-full">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48" preserveAspectRatio="none">
                {/* 背景网格线 */}
                <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4" />
                <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4" />
                <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e5e7eb" strokeWidth="1" />

                {/* 折线 */}
                <polyline fill="none" stroke="#3b82f6" strokeWidth="2" points={points} strokeLinecap="round" strokeLinejoin="round" />

                {/* 面积填充 */}
                <polygon fill="#3b82f6" fillOpacity="0.1" points={areaPoints} />

                {/* 数据点（只显示最大值和首尾） */}
                {data.map((d, i) => {
                    if (i === 0 || i === data.length - 1 || d.count === max) {
                        const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
                        const y = height - padding - ((d.count - min) / range) * (height - 2 * padding);
                        return <circle key={i} cx={x} cy={y} r="3" fill="#3b82f6" />;
                    }
                    return null;
                })}
            </svg>
            <div className="flex justify-between text-xs text-gray-400 mt-1 px-2">
                <span>{data[0]?.date}</span>
                <span>最高: {max}</span>
                <span>{data[data.length - 1]?.date}</span>
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const { adminFetch } = useAdminFetch();
    const [stats, setStats] = useState({
        totalArticles: 0, totalFormulas: 0, totalMembers: 0, totalComments: 0, todayVisits: 0
    });
    const [pvTrend, setPvTrend] = useState<{ date: string; count: number }[]>([]);
    const [loading, setLoading] = useState(true);
    const [trendError, setTrendError] = useState('');

    useEffect(() => {
        async function fetchData() {
            try {
                const [resStats, resTrend] = await Promise.all([
                    adminFetch('/admin/dashboard/stats'),
                    adminFetch('/admin/dashboard/baidu-pv-trend') // ✅ 替换为百度统计接口
                ]);

                if (resStats.code === 1) setStats(resStats.data);

                if (resTrend.code === 1) {
                    setPvTrend(resTrend.data);
                } else {
                    setTrendError(resTrend.message || '获取趋势数据失败');
                }
            } catch (err) {
                console.error('获取仪表盘数据失败', err);
                setTrendError('网络异常');
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [adminFetch]);

    const cards = [
        { title: '总文章数', value: stats.totalArticles, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
        { title: '下载公式', value: stats.totalFormulas, icon: Download, color: 'text-green-600', bg: 'bg-green-50' },
        { title: '会员总数', value: stats.totalMembers, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
        { title: '总评论数', value: stats.totalComments, icon: MessageSquare, color: 'text-orange-600', bg: 'bg-orange-50' },
    ];

    if (loading) return <div className="p-8 text-center text-gray-500">加载中...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">数据仪表盘</h1>
                    <p className="text-sm text-gray-500 mt-1">实时监控网站运行状况</p>
                </div>
            </div>

            {/* 统计卡片 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((card, idx) => (
                    <div key={idx} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">{card.title}</p>
                                <h3 className="text-2xl font-bold text-gray-900">{card.value.toLocaleString()}</h3>
                            </div>
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.bg} ${card.color}`}>
                                <card.icon className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* 趋势图与快捷统计 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ✅ 近30天 PV 趋势 */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-primary-500" />
                            近 30 天浏览量 (PV) 趋势
                        </h3>
                        <span className="text-sm text-gray-500">
                            今日访问 <strong className="text-primary-600">{stats.todayVisits}</strong> 次
                        </span>
                    </div>
                    <div className="h-56 flex items-center">
                        {trendError ? (
                            <div className="text-center w-full text-red-500 text-sm">{trendError}</div>
                        ) : (
                            <PvTrendChart data={pvTrend} />
                        )}
                    </div>
                </div>

                {/* 快捷操作/系统信息 */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-500" />
                        系统信息
                    </h3>
                    <ul className="space-y-3 text-sm">
                        <li className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-500">系统版本</span>
                            <span className="font-medium text-gray-900">v2.0.0</span>
                        </li>
                        <li className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-500">服务器环境</span>
                            <span className="font-medium text-gray-900">Node.js 18 / MySQL</span>
                        </li>
                        <li className="flex justify-between py-2">
                            <span className="text-gray-500">数据同步状态</span>
                            <span className="font-medium text-green-600 flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                正常
                            </span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}