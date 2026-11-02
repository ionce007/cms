'use client';
import { useState, useEffect } from 'react';
import { useAdminFetch } from '@/hooks/useAdminFetch';
import { Send, Search, X } from 'lucide-react';

const LIMIT = 20;
const PICK_LIMIT = 10;

export default function BaiduPushLogsPage() {
    const { adminFetch } = useAdminFetch();

    // ===== 历史列表 =====
    const [list, setList] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [filterType, setFilterType] = useState('');

    // ✅ 新增搜索关键词状态
    const [searchKeyword, setSearchKeyword] = useState('');
    const [inputKeyword, setInputKeyword] = useState('');

    const fetchLogs = async () => {
        // ✅ 请求带上 keyword
        const res = await adminFetch(`/admin/baidu/push/logs?page=${page}&limit=${LIMIT}&type=${filterType}&keyword=${searchKeyword}`);
        if (res.code === 1) {
            setList(res.data);
            setTotal(res.total);
        }
    };

    useEffect(() => { fetchLogs(); }, [page, filterType, searchKeyword]);

    // ✅ 触发搜索
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        setSearchKeyword(inputKeyword);
    };

    // ===== 推送弹窗 =====
    const [dialogOpen, setDialogOpen] = useState(false);
    const [pickType, setPickType] = useState<'article' | 'formula'>('article');
    const [pickList, setPickList] = useState<any[]>([]);
    const [pickTotal, setPickTotal] = useState(0);
    const [pickPage, setPickPage] = useState(1);
    const [pickKeyword, setPickKeyword] = useState('');
    const [pickLoading, setPickLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [submittedMap, setSubmittedMap] = useState<Record<number, { count: number; lastTime: string | null }>>({});
    const [pushing, setPushing] = useState(false);

    const openDialog = () => {
        setDialogOpen(true);
        setPickType('article');
        setPickPage(1);
        setPickKeyword('');
        setSelectedIds([]);
    };

    const fetchPickList = async () => {
        setPickLoading(true);
        const api = pickType === 'article' ? '/admin/articles' : '/admin/formulas';
        const res = await adminFetch(`${api}?page=${pickPage}&limit=${PICK_LIMIT}&keyword=${pickKeyword}`);
        setPickLoading(false);

        if (res.code === 1) {
            const formattedData = res.data.map((item: any) => ({
                ...item,
                id: item.id ?? item.articleId ?? item.formulaId,
                title: item.title ?? item.name ?? '未命名',
            }));
            setPickList(formattedData);
            setPickTotal(res.total);
        } else {
            setPickList([]);
            setPickTotal(0);
        }
    };

    const fetchSubmittedMap = async () => {
        const res = await adminFetch(`/admin/baidu/push/submitted-ids?type=${pickType}`);
        if (res.code === 1) {
            const map: Record<number, { count: number; lastTime: string | null }> = {};
            res.data.forEach((i: any) => {
                map[i.id] = { count: i.count, lastTime: i.lastTime };
            });
            setSubmittedMap(map);
        } else {
            setSubmittedMap({});
        }
    };

    useEffect(() => {
        if (!dialogOpen) return;
        fetchPickList();
    }, [dialogOpen, pickType, pickPage]);

    useEffect(() => {
        if (!dialogOpen) return;
        fetchSubmittedMap();
        setSelectedIds([]);
    }, [dialogOpen, pickType]);

    const handlePickSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPickPage(1);
        fetchPickList();
    };

    const toggleSelect = (id: number | undefined) => {
        if (id === undefined) return;
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handlePush = async () => {
        if (!selectedIds.length) return alert('请先选择要推送的页面');
        setPushing(true);
        const res = await adminFetch('/admin/baidu/push', {
            method: 'POST',
            body: JSON.stringify({ type: pickType, ids: selectedIds })
        });
        setPushing(false);
        alert(res.message);
        if (res.code === 1) {
            await fetchSubmittedMap();
            setSelectedIds([]);
            fetchLogs();
        }
    };

    const pickTotalPages = Math.ceil(pickTotal / PICK_LIMIT);
    const totalPages = Math.ceil(total / LIMIT);

    return (
        <div className="p-3">
            {/* 顶部操作区 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                <h1 className="text-lg font-bold text-gray-800">百度提交记录</h1>
                <div className="flex items-center gap-2">
                    {/* ✅ 新增历史记录搜索框 */}
                    <form onSubmit={handleSearch} className="relative">
                        <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="搜索标题..."
                            value={inputKeyword}
                            onChange={e => setInputKeyword(e.target.value)}
                            className="pl-7 pr-2 py-1 border border-gray-300 rounded text-xs w-full sm:w-48 focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                    </form>

                    <select
                        value={filterType}
                        onChange={e => { setFilterType(e.target.value); setPage(1); }}
                        className="border rounded px-2 py-1 text-sm bg-white"
                    >
                        <option value="">全部类型</option>
                        <option value="article">文章</option>
                        <option value="formula">下载公式</option>
                    </select>
                    <button
                        onClick={openDialog}
                        className="bg-green-600 text-white px-3 py-1.5 rounded text-sm flex items-center gap-1"
                    >
                        <Send className="w-3.5 h-3.5" /> 推送
                    </button>
                </div>
            </div>

            {/* 历史列表 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs">
                            <tr>
                                <th className="py-2 px-3 font-medium">ID</th>
                                <th className="py-2 px-3 font-medium w-full max-w-[400px]">标题 / URL</th>
                                <th className="py-2 px-3 font-medium">类型</th>
                                <th className="py-2 px-3 font-medium">状态</th>
                                <th className="py-2 px-3 font-medium">提交时间</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {list.map((item, idx) => (
                                <tr key={item.id ?? `log-${idx}`} className="hover:bg-gray-50">
                                    <td className="py-1.5 px-3 text-gray-400 text-xs">{item.id}</td>
                                    <td className="py-1.5 px-3 max-w-[400px]">
                                        <div className="text-gray-800 truncate" title={item.title}>{item.title || '-'}</div>
                                        <div className="text-gray-400 text-xs truncate" title={item.url}>{item.url}</div>
                                    </td>
                                    <td className="py-1.5 px-3 text-xs">
                                        <span className={`px-1.5 py-0.5 rounded ${item.mark === 'article' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                            {item.mark === 'article' ? '文章' : '公式'}
                                        </span>
                                    </td>
                                    <td className="py-1.5 px-3">
                                        <span className={`px-1.5 py-0.5 rounded text-[11px] ${item.status === 1 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                            {item.status === 1 ? '成功' : '失败'}
                                        </span>
                                    </td>
                                    <td className="py-1.5 px-3 text-gray-500 text-xs">
                                        {item.createdAt ? new Date(item.createdAt).toLocaleString() : '-'}
                                    </td>
                                </tr>
                            ))}
                            {list.length === 0 && <tr><td colSpan={5} className="py-6 text-center text-gray-400 text-sm">暂无记录</td></tr>}
                        </tbody>
                    </table>
                </div>
                <div className="px-3 py-1.5 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
                    <span>共 {total} 条</span>
                    <div className="flex items-center gap-1">
                        <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-2 py-0.5 border rounded hover:bg-white disabled:opacity-50">上一页</button>
                        <span className="px-1">{page} / {totalPages || 1}</span>
                        <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="px-2 py-0.5 border rounded hover:bg-white disabled:opacity-50">下一页</button>
                    </div>
                </div>
            </div>

            {/* ===== 推送弹窗 ===== */}
            {dialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl h-[600px] flex flex-col">
                        <div className="flex items-center justify-between px-4 py-2 border-b">
                            <h2 className="text-base font-bold text-gray-800">推送页面到百度</h2>
                            <button onClick={() => setDialogOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex items-center gap-2 px-4 py-2 border-b">
                            <div className="flex rounded border overflow-hidden text-sm">
                                {(['article', 'formula'] as const).map(t => (
                                    <button
                                        key={t}
                                        onClick={() => { setPickType(t); setPickPage(1); setSelectedIds([]); }}
                                        className={`px-3 py-1 ${pickType === t ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
                                    >
                                        {t === 'article' ? '文章' : '下载公式'}
                                    </button>
                                ))}
                            </div>
                            <form onSubmit={handlePickSearch} className="relative flex-1">
                                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="搜索标题..."
                                    value={pickKeyword}
                                    onChange={e => setPickKeyword(e.target.value)}
                                    className="pl-7 pr-2 py-1 border border-gray-300 rounded text-xs w-full focus:ring-1 focus:ring-blue-500 outline-none"
                                />
                            </form>
                        </div>

                        <div className="flex-1 overflow-auto">
                            {pickLoading ? (
                                <div className="py-10 text-center text-gray-400 text-sm">加载中...</div>
                            ) : (
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className="bg-gray-50 border-b text-gray-500 text-xs sticky top-0 z-10">
                                        <tr>
                                            <th className="py-2 px-3 w-8">
                                                <input
                                                    type="checkbox"
                                                    checked={pickList.length > 0 && selectedIds.length === pickList.length}
                                                    onChange={e => {
                                                        if (e.target.checked) setSelectedIds(pickList.map(i => i.id).filter(Boolean));
                                                        else setSelectedIds([]);
                                                    }}
                                                />
                                            </th>
                                            <th className="py-2 px-3">ID</th>
                                            <th className="py-2 px-3 w-full max-w-[300px]">标题</th>
                                            <th className="py-2 px-3">推送情况</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {pickList.map((item, idx) => {
                                            const stat = submittedMap[item.id];
                                            const isChecked = item.id !== undefined && selectedIds.includes(item.id);
                                            return (
                                                <tr key={`${pickType}-${item.id ?? 'noid'}-${idx}`} className="hover:bg-gray-50">
                                                    <td className="py-1.5 px-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={isChecked}
                                                            onChange={() => toggleSelect(item.id)}
                                                            disabled={item.id === undefined}
                                                        />
                                                    </td>
                                                    <td className="py-1.5 px-3 text-gray-400 text-xs">{item.id ?? '-'}</td>
                                                    <td className="py-1.5 px-3 text-gray-800 truncate max-w-[300px]" title={item.title}>
                                                        {item.title}
                                                    </td>
                                                    <td className="py-1.5 px-3 text-xs">
                                                        {stat ? (
                                                            <span className="text-green-600">
                                                                已推送 {stat.count} 次
                                                                {stat.lastTime && (
                                                                    <span className="text-gray-400 ml-1">
                                                                        最后 {new Date(stat.lastTime).toLocaleString()}
                                                                    </span>
                                                                )}
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-400">未推送</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {pickList.length === 0 && (
                                            <tr><td colSpan={4} className="py-8 text-center text-gray-400 text-sm">暂无数据</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        <div className="px-4 py-2 border-t bg-gray-50 flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                                <button disabled={pickPage <= 1} onClick={() => setPickPage(pickPage - 1)} className="px-2 py-0.5 border rounded hover:bg-white disabled:opacity-50">上一页</button>
                                <span className="px-1">{pickPage} / {pickTotalPages || 1}</span>
                                <button disabled={pickPage >= pickTotalPages} onClick={() => setPickPage(pickPage + 1)} className="px-2 py-0.5 border rounded hover:bg-white disabled:opacity-50">下一页</button>
                            </div>
                            <div className="flex items-center gap-2">
                                <span>已选 {selectedIds.length} 条</span>
                                <button
                                    onClick={handlePush}
                                    disabled={pushing || !selectedIds.length}
                                    className="bg-green-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                                >
                                    {pushing ? '提交中...' : '确认推送'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}