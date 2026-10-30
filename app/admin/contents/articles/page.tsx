'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAdminFetch } from '@/hooks/useAdminFetch';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { usePermission } from '@/hooks/usePermission';

export default function ArticlesPage() {
    const { hasPermission } = usePermission();

    const [list, setList] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [keyword, setKeyword] = useState('');
    const limit = 10; // 行距压缩后，一页可以显示更多
    const { adminFetch } = useAdminFetch();

    const fetchList = async () => {
        debugger;
        const res = await adminFetch(`/admin/articles?page=${page}&limit=${limit}&keyword=${keyword}`);
        if (res.code === 1) {
            setList(res.data);
            setTotal(res.total);
        }
    };

    useEffect(() => { fetchList(); }, [page]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchList();
    };

    const totalPages = Math.ceil(total / limit);

    return (
        // ✅ p-4 改为 p-3，减少页面留白
        <div className="p-3">
            {/* ✅ 顶部操作区：减少 mb，缩小标题，对齐操作项 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                <h1 className="text-lg font-bold text-gray-800">文章管理</h1>
                <div className="flex items-center gap-2">
                    <form onSubmit={handleSearch} className="relative">
                        <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="搜索标题..."
                            value={keyword}
                            onChange={e => setKeyword(e.target.value)}
                            // ✅ 缩小搜索框高度和字号
                            className="pl-7 pr-2 py-1 border border-gray-300 rounded text-xs w-full sm:w-56 focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                    </form>
                    {hasPermission('articles', 'create') && (
                        <Link href="/admin/contents/articles/create" className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm">
                            + 新建
                        </Link>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    {/* ✅ 表格文字缩小，行高压缩 */}
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs">
                            <tr>
                                <th className="py-2 px-3 font-medium">ID</th>
                                <th className="py-2 px-3 font-medium w-full max-w-[400px]">标题</th>
                                <th className="py-2 px-3 font-medium">栏目</th>
                                <th className="py-2 px-3 font-medium">浏览量</th>
                                <th className="py-2 px-3 font-medium">状态</th>
                                <th className="py-2 px-3 font-medium text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {list.map(item => (
                                // ✅ 行内 padding 压缩为 py-1.5
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="py-1.5 px-3 text-gray-400 text-xs">{item.id}</td>
                                    <td className="py-1.5 px-3 font-medium text-gray-800 truncate max-w-[400px]" title={item.title}>
                                        {item.title}
                                    </td>
                                    <td className="py-1.5 px-3 text-gray-500 text-xs">
                                        <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{item.Category?.name || '未分类'}</span>
                                    </td>
                                    <td className="py-1.5 px-3 text-gray-500 text-xs">{item.pv || 0}</td>
                                    <td className="py-1.5 px-3">
                                        <span className={`px-1.5 py-0.5 rounded text-[11px] font-medium ${item.status === 0 ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
                                            {item.status === 0 ? '已发布' : '草稿'}
                                        </span>
                                    </td>
                                    <td className="py-1.5 px-3 flex items-center justify-end gap-1">
                                        {/* ✅ 控制“编辑”按钮 */}
                                        {hasPermission('articles', 'edit') && (
                                            <Link href={`/admin/contents/articles/${item.id}`} className="p-1 text-blue-600">
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </Link>
                                        )}

                                        {/* ✅ 控制“删除”按钮 */}
                                        {hasPermission('articles', 'delete') && (
                                            <button onClick={async () => { if (confirm('确认删除?')) { await adminFetch(`/admin/articles/${item.id}`, { method: 'DELETE' }); fetchList(); } }} className="p-1 text-red-500">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {list.length === 0 && <tr><td colSpan={6} className="py-6 text-center text-gray-400 text-sm">暂无数据</td></tr>}
                        </tbody>
                    </table>
                </div>

                {/* 底部分页同样紧凑 */}
                <div className="px-3 py-1.5 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
                    <span>共 {total} 条</span>
                    <div className="flex items-center gap-1">
                        <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-2 py-0.5 border rounded hover:bg-white disabled:opacity-50">上一页</button>
                        <span className="px-1">{page} / {totalPages || 1}</span>
                        <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="px-2 py-0.5 border rounded hover:bg-white disabled:opacity-50">下一页</button>
                    </div>
                </div>
            </div>
        </div>
    );
}