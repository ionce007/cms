// app/admin/interact/comments/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAdminFetch } from '@/hooks/useAdminFetch';
import Modal from '@/components/admin/Modal';
import { Search, Trash2, CheckCircle, XCircle, Clock, ExternalLink, ImageIcon } from 'lucide-react';
import { usePermission } from '@/hooks/usePermission';

export default function CommentsManagePage() {
    const { hasPermission } = usePermission();
    const [dataList, setDataList] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [keyword, setKeyword] = useState('');
    const [targetType, setTargetType] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [previewContent, setPreviewContent] = useState<string | null>(null);

    // ✅ 用于追踪正在提交状态的评论 ID，防止按钮被重复点击
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    const limit = 15;
    const { adminFetch } = useAdminFetch();

    const fetchData = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
            });
            if (keyword) queryParams.append('keyword', keyword);
            if (targetType) queryParams.append('targetType', targetType);

            const res = await adminFetch(`/admin/interactions/comments?${queryParams.toString()}`);
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
        fetchData();
    }, [page, targetType]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchData();
    };

    const handleDelete = async (id: number) => {
        if (!confirm('确定要删除该条记录吗？')) return;
        const res = await adminFetch(`/admin/interactions/comments/${id}`, { method: 'DELETE' });
        if (res.code === 1) {
            // 删除操作由于会减少数据总量，还是需要重新请求一下以保持分页正确
            fetchData();
        } else {
            alert(res.message);
        }
    };

    // ✅ 核心修改：只更新单行数据，不刷新整个页面
    const handleCommentStatus = async (id: number, status: number) => {
        setUpdatingId(id); // 锁定当前行
        try {
            const res = await adminFetch(`/admin/interactions/comments/${id}/status`, {
                method: 'PUT',
                body: JSON.stringify({ status })
            });

            if (res.code === 1) {
                // ✅ 局部更新 dataList 中对应的记录
                setDataList(prevList =>
                    prevList.map(item =>
                        item.id === id ? { ...item, status } : item
                    )
                );
            } else {
                alert(res.message);
            }
        } catch (err) {
            alert('操作失败，请重试');
        } finally {
            setUpdatingId(null); // 解锁
        }
    };

    const getStatusBadge = (status: number) => {
        switch (status) {
            case 0: return <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs flex items-center gap-1 w-max"><CheckCircle className="w-3 h-3" />已通过</span>;
            case 1: return <span className="text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded text-xs flex items-center gap-1 w-max"><Clock className="w-3 h-3" />待审核</span>;
            case 2: return <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded text-xs flex items-center gap-1 w-max"><XCircle className="w-3 h-3" />已拒绝</span>;
            default: return null;
        }
    };

    const getTargetUrl = (type: string, id: string) => type === 'article' ? `/articles/${id}` : `/formulas/${id}`;

    const parseCommentPreview = (html: string) => {
        if (!html) return '[无内容]';
        const hasImage = /<img[^>]+src=["']([^"']+)["']/i.test(html);
        const plainText = html.replace(/<[^>]+>/g, '').trim();
        if (plainText) return plainText;
        if (hasImage) return <span className="text-blue-500 flex items-center gap-1 italic"><ImageIcon className="w-3.5 h-3.5" /> [图片评论]</span>;
        return '[无内容]';
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold text-gray-800 mb-4">评论管理</h1>

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

                <form onSubmit={handleSearch} className="relative">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="搜索评论内容..."
                        value={keyword}
                        onChange={e => setKeyword(e.target.value)}
                        className="pl-7 pr-2 py-1.5 border border-gray-300 rounded text-sm w-64 outline-none"
                    />
                </form>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs">
                            <tr>
                                <th className="py-2.5 px-3 font-medium">ID</th>
                                <th className="py-2.5 px-3 font-medium">用户</th>
                                <th className="py-2.5 px-3 font-medium">评论内容</th>
                                <th className="py-2.5 px-3 font-medium min-w-[200px]">关联内容</th>
                                <th className="py-2.5 px-3 font-medium">状态</th>
                                <th className="py-2.5 px-3 font-medium">时间</th>
                                <th className="py-2.5 px-3 font-medium text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={7} className="py-8 text-center text-gray-400">加载中...</td></tr>
                            ) : dataList.length === 0 ? (
                                <tr><td colSpan={7} className="py-8 text-center text-gray-400">暂无数据</td></tr>
                            ) : dataList.map(item => (
                                // ✅ 如果当前行正在提交，可以降低透明度，给用户反馈
                                <tr key={item.id} className={`hover:bg-gray-50 ${updatingId === item.id ? 'opacity-50 pointer-events-none' : ''}`}>
                                    <td className="py-2 px-3 text-gray-400 text-xs">{item.id}</td>
                                    <td className="py-2 px-3 font-medium text-gray-800">
                                        {item.nickname}
                                        {item.memberId && <span className="ml-1 text-[10px] bg-blue-50 text-blue-600 px-1 rounded">会员</span>}
                                    </td>
                                    <td className="py-2 px-3 max-w-[250px] truncate cursor-pointer text-blue-600 hover:underline" title="点击查看完整内容" onClick={() => setPreviewContent(item.content)}>
                                        {parseCommentPreview(item.content)}
                                    </td>
                                    <td className="py-2 px-3 text-gray-500 text-xs truncate max-w-[280px]">
                                        <div className="flex items-center gap-1.5">
                                            <span className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded whitespace-nowrap">{item.targetType === 'article' ? '文章' : '下载'}</span>
                                            <Link href={getTargetUrl(item.targetType, item.targetId)} target="_blank" className="hover:text-blue-600 hover:underline inline-flex items-center gap-0.5 truncate" title={item.targetTitle}>
                                                <span className="truncate max-w-[180px]">{item.targetTitle}</span>
                                                <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                            </Link>
                                        </div>
                                    </td>
                                    <td className="py-2 px-3">{getStatusBadge(item.status)}</td>
                                    <td className="py-2 px-3 text-gray-400 text-xs">{new Date(item.createdAt).toLocaleString()}</td>
                                    <td className="py-2 px-3 flex items-center justify-end gap-2">
                                        {/* 如果正在更新，显示个简单的加载文案 */}
                                        {updatingId === item.id ? (
                                            <span className="text-xs text-blue-500 animate-pulse">处理中...</span>
                                        ) : (
                                            <>
                                                {item.status !== 0 && hasPermission('comments', 'audit') && (
                                                    <button onClick={() => handleCommentStatus(item.id, 0)} className="text-green-600 text-xs hover:underline">
                                                        通过
                                                    </button>
                                                )}
                                                {item.status !== 2 && hasPermission('comments', 'audit') && (
                                                    <button onClick={() => handleCommentStatus(item.id, 2)} className="text-orange-500 text-xs hover:underline">
                                                        拒绝
                                                    </button>
                                                )}
                                                {hasPermission('comments', 'delete') && (<button onClick={() => handleDelete(item.id)} className="text-red-500 p-1 hover:bg-red-50 rounded" title="删除">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                )}
                                            </>
                                        )}
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

            <Modal isOpen={!!previewContent} onClose={() => setPreviewContent(null)} title="评论内容详情" size="lg" footer={<button onClick={() => setPreviewContent(null)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm">关闭</button>}>
                <div className="prose prose-sm max-w-none text-gray-700 break-words leading-relaxed" dangerouslySetInnerHTML={{ __html: previewContent || '' }} />
            </Modal>
        </div>
    );
}