// app/admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { FileText, Download, Users, MessageSquare, Activity, TrendingUp } from 'lucide-react';
import { useAdminFetch } from '@/hooks/useAdminFetch';

// ==================== ✅ 升级版趋势图表组件 ====================
function PvTrendChart({ data }: { data: { date: string; count: number }[] }) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    if (!data || data.length === 0) return <div className="text-gray-400 text-sm h-full flex items-center justify-center">暂无数据</div>;

    const width = 800;
    const height = 260;
    const paddingLeft = 40;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 30;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const maxVal = Math.max(...data.map(d => d.count), 10);
    // 向上取整到合适的刻度，例如 10, 20, 50, 100...
    const yMax = Math.ceil(maxVal / 10) * 10;

    // 生成坐标点
    const points = data.map((d, i) => {
        const x = paddingLeft + (i / (data.length - 1)) * chartWidth;
        const y = paddingTop + chartHeight - (d.count / yMax) * chartHeight;
        return { x, y, dataPoint: d };
    });

    const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');
    const areaPoints = `${paddingLeft},${paddingTop + chartHeight} ${polylinePoints} ${width - paddingRight},${paddingTop + chartHeight}`;

    // 鼠标悬浮逻辑
    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        // 计算比例映射回 index
        const svgX = (mouseX / rect.width) * width;
        const relativeX = svgX - paddingLeft;
        const index = Math.round((relativeX / chartWidth) * (data.length - 1));

        if (index >= 0 && index < data.length) {
            setHoveredIndex(index);
        } else {
            setHoveredIndex(null);
        }
    };

    return (
        <div className="w-full relative">
            <svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full h-auto"
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setHoveredIndex(null)}
            >
                {/* Y 轴网格和刻度 */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                    const y = paddingTop + chartHeight * (1 - ratio);
                    const val = Math.round(yMax * ratio);
                    return (
                        <g key={i}>
                            <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4" />
                            <text x={paddingLeft - 10} y={y + 4} textAnchor="end" fontSize="12" fill="#9ca3af">{val}</text>
                        </g>
                    );
                })}

                {/* X 轴日期 (只显示首尾和中间) */}
                {data.map((d, i) => {
                    if (i === 0 || i === data.length - 1 || i === Math.floor(data.length / 2)) {
                        const x = points[i].x;
                        return (
                            <text key={i} x={x} y={height - 10} textAnchor="middle" fontSize="12" fill="#9ca3af">
                                {d.date}
                            </text>
                        );
                    }
                    return null;
                })}

                {/* 折线和面积 */}
                <polygon fill="#3b82f6" fillOpacity="0.1" points={areaPoints} />
                <polyline fill="none" stroke="#3b82f6" strokeWidth="2" points={polylinePoints} strokeLinecap="round" strokeLinejoin="round" />

                {/* 数据点及悬浮效果 */}
                {points.map((p, i) => (
                    <circle
                        key={i}
                        cx={p.x}
                        cy={p.y}
                        r={hoveredIndex === i ? 4 : 2}
                        fill="#3b82f6"
                        stroke={hoveredIndex === i ? '#fff' : 'none'}
                        strokeWidth={hoveredIndex === i ? 2 : 0}
                        className="transition-all duration-150"
                    />
                ))}

                {/* Tooltip */}
                {hoveredIndex !== null && points[hoveredIndex] && (
                    <g>
                        <line x1={points[hoveredIndex].x} y1={paddingTop} x2={points[hoveredIndex].x} y2={paddingTop + chartHeight} stroke="#9ca3af" strokeWidth="1" strokeDasharray="3" />
                        <foreignObject
                            x={Math.min(points[hoveredIndex].x - 50, width - paddingRight - 110)}
                            y={points[hoveredIndex].y - 60}
                            width="120"
                            height="60"
                            className="overflow-visible"
                        >
                            <div className="bg-gray-800 text-white text-xs rounded shadow-lg p-2 text-center w-max mx-auto">
                                <div className="font-medium">{points[hoveredIndex].dataPoint.date}</div>
                                <div className="mt-1 flex items-center justify-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                                    <span>PV: {points[hoveredIndex].dataPoint.count}</span>
                                </div>
                            </div>
                        </foreignObject>
                    </g>
                )}
            </svg>
        </div>
    );
}

// ==================== 主页面组件 ====================
export default function DashboardPage() {
    const { adminFetch } = useAdminFetch();
    const [stats, setStats] = useState<any>({
        totalArticles: 0, totalFormulas: 0, totalMembers: 0, totalComments: 0, todayVisits: 0,
        articleStats: { views: 0, likes: 0, bookmarks: 0 },
        formulaStats: { views: 0, likes: 0, bookmarks: 0, downloads: 0 }
    });
    const [pvTrend, setPvTrend] = useState<{ date: string; count: number }[]>([]);
    const [loading, setLoading] = useState(true);
    const [trendError, setTrendError] = useState('');

    useEffect(() => {
        async function fetchData() {
            try {
                const [resStats, resTrend] = await Promise.all([
                    adminFetch('/admin/dashboard/stats'),
                    adminFetch('/admin/dashboard/baidu-pv-trend')
                ]);

                let finalTodayVisits = 0;

                // ✅ 处理百度趋势数据
                if (resTrend.code === 1) {
                    resTrend.data.sort((a: { count: Number, date: string[] }, b: { count: Number, date: string[] }) => {
                        // 提取日期字符串，转换为 Date 对象的时间戳
                        const dateA = new Date(a.date[0]).getTime();
                        const dateB = new Date(b.date[0]).getTime();
                        return dateA - dateB;
                    });

                    setPvTrend(resTrend.data);
                    // 优先使用百度统计返回的今日访问
                    finalTodayVisits = resTrend.data[resTrend.data.length-1].count;// resTrend.todayVisits;
                } else {
                    setTrendError(resTrend.message || '获取趋势数据失败');
                }

                // ✅ 合并统计数据
                if (resStats.code === 1) {
                    const statsData = resStats.data;

                    // 如果百度接口拿到了今日数据，则覆盖本地数据库的统计
                    statsData.todayVisits = finalTodayVisits;
                    /*if (finalTodayVisits > 0 || resTrend.code === 1) {
                        statsData.todayVisits = finalTodayVisits;
                    }*/
                    setStats(statsData);
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

    // 卡片配置项
    const cards = [
        {
            title: '总文章数', value: stats.totalArticles, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50',
            sub: `浏览: ${stats.articleStats.views} | 点赞: ${stats.articleStats.likes} | 收藏: ${stats.articleStats.bookmarks}`
        },
        {
            title: '下载公式', value: stats.totalFormulas, icon: Download, color: 'text-green-600', bg: 'bg-green-50',
            sub: `浏览: ${stats.formulaStats.views} | 点赞: ${stats.formulaStats.likes} | 收藏: ${stats.formulaStats.bookmarks} | 下载: ${stats.formulaStats.downloads}`
        },
        {
            title: '会员总数', value: stats.totalMembers, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50',
            sub: '平台注册用户'
        },
        {
            title: '总评论数', value: stats.totalComments, icon: MessageSquare, color: 'text-orange-600', bg: 'bg-orange-50',
            sub: '全站互动评论'
        },
    ];

    if (loading) return <div className="p-8 text-center text-gray-500">加载中...</div>;

    return (
        <div className="space-y-6 p-4">
            <div className="flex justify-between items-end mb-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">数据仪表盘</h1>
                    <p className="text-sm text-gray-500 mt-1">实时监控网站运行状况</p>
                </div>
            </div>

            {/* 统计卡片 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((card, idx) => (
                    <div key={idx} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">{card.title}</p>
                                <h3 className="text-2xl font-bold text-gray-900">{card.value.toLocaleString()}</h3>
                            </div>
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.bg} ${card.color}`}>
                                <card.icon className="w-6 h-6" />
                            </div>
                        </div>
                        {/* ✅ 新增的副标题（互动数据） */}
                        <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500 font-medium">
                            {card.sub}
                        </div>
                    </div>
                ))}
            </div>

            {/* 趋势图与快捷统计 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ✅ 近30天 PV 趋势 */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-primary-500" />
                            近 30 天浏览量 (PV) 趋势
                        </h3>
                        <span className="text-sm text-gray-500">
                            今日访问 <strong className="text-primary-600">{stats.todayVisits}</strong> 次
                        </span>
                    </div>
                    <div className="h-64">
                        {trendError ? (
                            <div className="text-center w-full text-red-500 text-sm h-full flex items-center justify-center">{trendError}</div>
                        ) : (
                            <PvTrendChart data={pvTrend} />
                        )}
                    </div>
                </div>

                {/* 系统信息 */}
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
                            <span className="font-medium text-gray-900">Node.js 20.20 / MySQL</span>
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