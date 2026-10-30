// app/admin/interact/likes/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAdminFetch } from '@/hooks/useAdminFetch';
import { Heart, Star, Trash2, ExternalLink } from 'lucide-react';
import { usePermission } from '@/hooks/usePermission';

export default function LikesAndBookmarksPage() {
    const { hasPermission } = usePermission();
    const [activeTab, setActiveTab] = useState<'likes' | 'bookmarks'>('likes');
    const [dataList, setDataList] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [targetType, setTargetType] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const limit = 15;

    const { adminFetch } = useAdminFetch();

    const fetchData = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
            });
            if (targetType) queryParams.append('targetType', targetType);

            const res = await adminFetch(`/admin/interactions/${activeTab}?${queryParams.toString()}`);
            if (res.code === 1) {
                setDataList(res.data || []);
                setTotal(res.total || 0);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setPage(1);
        fetchData();
    }, [activeTab, targetType]);

    const handleDelete = async (id: number) => {
        if (!confirm('确定要删除该条记录吗？')) return;
        const res = await adminFetch(`/admin/interactions/${activeTab}/${id}`, { method: 'DELETE' });
        if (res.code === 1) fetchData();
        else alert(res.message);
    };

    const getTargetUrl = (type: string, id: string) => type === 'article' ? `/articles/${id}` : `/formulas/${id}`;
    const totalPages = Math.ceil(total / limit);

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold text-gray-800 mb-4">点赞/收藏管理</h1>

            <div className="flex border-b border-gray-200 mb-4 bg-white">
                <button
                    onClick={() => setActiveTab('likes')}
                    className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'likes' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'
                        }`}
                >
                    <Heart className="w-4 h-4" /> 点赞记录
                </button>
                <button
                    onClick={() => setActiveTab('bookmarks')}
                    className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'bookmarks' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'
                        }`}
                >
                    <Star className="w-4 h-4" /> 收藏记录
                </button>
            </div>

            <div className="flex items-center gap-2 mb-4 flex-wrap">
                <select
                    value={targetType}
                    onChange={(e) => { setTargetType(e.target.value); setPage(1); }}
                    className="px-3 py-1.5 border border-gray-300 rounded text-sm outline-none bg-white"
                >
                    <option value="">全部类型</option>
                    <option value="article">文章</option>
                    <option value="formula">下载</option>
                </select>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs">
                            <tr>
                                <th className="py-2.5 px-3 font-medium">ID</th>
                                <th className="py-2.5 px-3 font-medium">用户</th>
                                <th className="py-2.5 px-3 font-medium">目标类型</th>
                                <th className="py-2.5 px-3 font-medium min-w-[300px]">目标标题</th>
                                <th className="py-2.5 px-3 font-medium">时间</th>
                                <th className="py-2.5 px-3 font-medium text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={6} className="py-8 text-center text-gray-400">加载中...</td></tr>
                            ) : dataList.length === 0 ? (
                                <tr><td colSpan={6} className="py-8 text-center text-gray-400">暂无数据</td></tr>
                            ) : dataList.map(item => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="py-2 px-3 text-gray-400 text-xs">{item.id}</td>
                                    <td className="py-2 px-3 font-medium text-gray-800">
                                        {item.Member ? (item.Member.nickname || item.Member.username) : '未知用户'}
                                    </td>
                                    <td className="py-2 px-3 text-xs">
                                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{item.targetType === 'article' ? '文章' : '下载'}</span>
                                    </td>
                                    <td className="py-2 px-3 text-gray-600 truncate max-w-[300px]">
                                        <Link href={getTargetUrl(item.targetType, item.targetId)} target="_blank" className="hover:text-blue-600 hover:underline inline-flex items-center gap-0.5" title={item.targetTitle}>
                                            <span className="truncate max-w-[250px]">{item.targetTitle}</span>
                                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                        </Link>
                                    </td>
                                    <td className="py-2 px-3 text-gray-400 text-xs">{new Date(item.createdAt).toLocaleString()}</td>
                                    <td className="py-2 px-3 flex items-center justify-end">
                                        {hasPermission('likes', 'delete') && (<button onClick={() => handleDelete(item.id)} className="text-red-500 p-1 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="px-3 py-2 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
                        <span>共 {total} 条记录</span>
                        <div className="flex items-center gap-1">
                            <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-2 py-1 border rounded hover:bg-white disabled:opacity-50">上一页</button>
                            <span className="px-2">第 {page} / {totalPages} 页</span>
                            <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="px-2 py-1 border rounded hover:bg-white disabled:opacity-50">下一页</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}