// app/admin/formulas/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAdminFetch } from '@/hooks/useAdminFetch';
import { Trash2, Search, Edit2, RefreshCw, Loader2 } from 'lucide-react';

export default function FormulasPage() {
    const [list, setList] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [keyword, setKeyword] = useState('');
    // ✅ 新增：同步状态
    const [syncing, setSyncing] = useState(false);
    const limit = 10; // 每页显示 20 条
    const { adminFetch } = useAdminFetch();
    const router = useRouter();

    // 获取列表
    const fetchList = async () => {
        const res = await adminFetch(`/admin/formulas?page=${page}&limit=${limit}&keyword=${keyword}`);
        if (res.code === 1) {
            setList(res.data);
            setTotal(res.total);
        }
    };

    useEffect(() => {
        fetchList();
    }, [page]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchList();
    };

    // 同步网盘操作
    const handleSync = async () => {
        if (syncing) return; // 二次拦截
        setSyncing(true);

        if (!confirm('确定要同步百度网盘数据吗？这可能需要一点时间。')) return;

        try {
            const res = await adminFetch('/admin/bdpan/sync', { method: 'POST' });
            if (res.code === 1) {
                const { inserted, updated } = res.data;
                alert(`同步完成！\n新增: ${inserted} 个\n更新: ${updated} 个`);
                fetchList(); // 刷新列表
            } else {
                alert(res.message || '同步失败');
            }
        } catch (err) {
            alert('请检查网络或稍后重试');
        } finally {
            setSyncing(false); // 结束状态
        }
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="p-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                <h1 className="text-lg font-bold text-gray-800">下载公式管理</h1>
                <div className="flex items-center gap-2">
                    {/* 搜索框 */}
                    <form onSubmit={handleSearch} className="relative">
                        <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="搜索文件名..."
                            value={keyword}
                            onChange={e => setKeyword(e.target.value)}
                            className="pl-7 pr-2 py-1 border rounded text-xs w-full sm:w-48 focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                    </form>

                    {/* 同步网盘按钮 */}
                    {/* ✅ 同步按钮增加 disabled 和 loading 状态 */}
                    <button
                        onClick={handleSync}
                        disabled={syncing}
                        className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 whitespace-nowrap transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {syncing ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                        ) : (
                            <RefreshCw className="w-3.5 h-3.5" />
                        )}
                        {syncing ? '同步中...' : '同步网盘'}
                    </button>

                    {/* 百度授权按钮 */}
                    {/*<button
                        onClick={() => router.push('/admin/formulas/token')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 whitespace-nowrap transition-colors"
                    >
                        <Key className="w-3.5 h-3.5" /> 百度授权
                    </button>
                    <button
                        onClick={() => router.push('/admin/tongji')}
                        className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 whitespace-nowrap"
                    >
                        <BarChart3 className="w-3.5 h-3.5" /> 统计授权
                    </button>*/}
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs">
                            <tr>
                                <th className="py-2 px-3 font-medium">文件ID</th>
                                <th className="py-2 px-3 font-medium w-full max-w-[400px]">公式名称</th>
                                <th className="py-2 px-3 font-medium">大小</th>
                                <th className="py-2 px-3 font-medium">价格</th>
                                <th className="py-2 px-3 font-medium">状态</th>
                                <th className="py-2 px-3 font-medium text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {list.map(item => (
                                <tr key={item.fs_id} className="hover:bg-gray-50 transition-colors">
                                    <td className="py-1.5 px-3 text-gray-400 text-xs">{item.fs_id}</td>
                                    <td className="py-1.5 px-3 font-medium text-gray-800 truncate max-w-[400px]" title={item.server_filename}>
                                        {item.server_filename}
                                    </td>
                                    <td className="py-1.5 px-3 text-gray-500 text-xs">
                                        {((item.size || 0) / 1024).toFixed(1)} KB
                                    </td>
                                    <td className="py-1.5 px-3 text-gray-500 text-xs">¥{item.price || 0}</td>
                                    <td className="py-1.5 px-3">
                                        <span className={`px-1.5 py-0.5 rounded text-[11px] font-medium ${item.status === 1 ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                            {item.status === 1 ? '上架' : '下架'}
                                        </span>
                                    </td>
                                    <td className="py-1.5 px-3 flex items-center justify-end gap-1">
                                        <Link
                                            href={`/admin/formulas/${item.fs_id}`}
                                            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                            title="编辑"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </Link>
                                        <button
                                            onClick={async () => {
                                                if (confirm('确认删除该公式?')) {
                                                    await adminFetch(`/admin/formulas/${item.fs_id}`, { method: 'DELETE' });
                                                    fetchList();
                                                }
                                            }}
                                            className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                                            title="删除"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {list.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-6 text-center text-gray-400 text-sm">暂无数据</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* 底部分页 */}
                <div className="px-3 py-1.5 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
                    <span>共 {total} 条</span>
                    <div className="flex items-center gap-1">
                        <button
                            disabled={page <= 1}
                            onClick={() => setPage(page - 1)}
                            className="px-2 py-0.5 border rounded hover:bg-white disabled:opacity-50 transition-colors"
                        >
                            上一页
                        </button>
                        <span className="px-1">{page} / {totalPages || 1}</span>
                        <button
                            disabled={page >= totalPages}
                            onClick={() => setPage(page + 1)}
                            className="px-2 py-0.5 border rounded hover:bg-white disabled:opacity-50 transition-colors"
                        >
                            下一页
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}