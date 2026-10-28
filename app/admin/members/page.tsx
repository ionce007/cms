// app/admin/system/members/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAdminFetch } from '@/hooks/useAdminFetch';
import { Search, Trash2, Ban, CheckCircle } from 'lucide-react';

export default function MembersPage() {
    const [members, setMembers] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [keyword, setKeyword] = useState('');
    const limit = 15;

    const { adminFetch } = useAdminFetch();

    const fetchMembers = async () => {
        // ✅ 修改为 /admin/members
        const res = await adminFetch(`/admin/members?page=${page}&limit=${limit}&keyword=${keyword}`);
        if (res.code === 1) {
            setMembers(res.data);
            setTotal(res.total);
        }
    };

    useEffect(() => { fetchMembers(); }, [page]);

    const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); fetchMembers(); };

    const handleStatusChange = async (id: number, status: number) => {
        if (!confirm(`确定要${status === 0 ? '解封' : '封禁'}该会员吗？`)) return;
        // ✅ 修改为 /admin/members/:id/status
        const res = await adminFetch(`/admin/members/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
        if (res.code === 1) fetchMembers();
        else alert(res.message);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('确定要永久删除该会员吗？此操作不可恢复！')) return;
        // ✅ 修改为 /admin/members/:id
        const res = await adminFetch(`/admin/members/${id}`, { method: 'DELETE' });
        if (res.code === 1) fetchMembers();
        else alert(res.message);
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-bold text-gray-800">前台会员管理</h1>
                <form onSubmit={handleSearch} className="relative">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
                    <input type="text" placeholder="搜索用户名/昵称/邮箱..." value={keyword} onChange={e => setKeyword(e.target.value)} className="pl-7 pr-2 py-1.5 border rounded text-sm w-64 focus:ring-1 focus:ring-blue-500 outline-none" />
                </form>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-gray-50 border-b text-gray-500 text-xs">
                        <tr>
                            <th className="py-2.5 px-3 font-medium">ID</th>
                            <th className="py-2.5 px-3 font-medium">用户头像</th>
                            <th className="py-2.5 px-3 font-medium">用户名</th>
                            <th className="py-2.5 px-3 font-medium">邮箱</th>
                            <th className="py-2.5 px-3 font-medium">角色</th>
                            <th className="py-2.5 px-3 font-medium">注册时间</th>
                            <th className="py-2.5 px-3 font-medium">状态</th>
                            <th className="py-2.5 px-3 font-medium text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {members.map(m => (
                            <tr key={m.id} className="hover:bg-gray-50">
                                <td className="py-2 px-3 text-gray-400 text-xs">{m.id}</td>
                                <td className="py-2 px-3">
                                    <img src={m.avatar || '/img/avatar-default-member.jpg'} className="w-8 h-8 rounded-full object-cover border" />
                                </td>
                                <td className="py-2 px-3 font-medium text-gray-800">
                                    {m.username}
                                    <div className="text-[11px] text-gray-400">{m.nickname}</div>
                                </td>
                                <td className="py-2 px-3 text-gray-500 text-xs">{m.email || '-'}</td>
                                <td className="py-2 px-3 text-xs">
                                    {m.isVip ? <span className="text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded font-medium">VIP</span> : <span className="text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">普通</span>}
                                </td>
                                <td className="py-2 px-3 text-gray-400 text-xs">{new Date(m.createdAt).toLocaleDateString()}</td>
                                <td className="py-2 px-3">
                                    <span className={`px-1.5 py-0.5 rounded text-[11px] ${m.status === 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                        {m.status === 0 ? '正常' : '已封禁'}
                                    </span>
                                </td>
                                <td className="py-2 px-3 flex justify-end gap-2">
                                    {m.status === 0 ? (
                                        <button onClick={() => handleStatusChange(m.id, 1)} className="text-orange-500 p-1 hover:bg-orange-50 rounded" title="封禁账号"><Ban className="w-4 h-4" /></button>
                                    ) : (
                                        <button onClick={() => handleStatusChange(m.id, 0)} className="text-green-600 p-1 hover:bg-green-50 rounded" title="解封账号"><CheckCircle className="w-4 h-4" /></button>
                                    )}
                                    <button onClick={() => handleDelete(m.id)} className="text-red-500 p-1 hover:bg-red-50 rounded" title="彻底删除"><Trash2 className="w-4 h-4" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {totalPages > 1 && (
                    <div className="px-3 py-2 border-t bg-gray-50 flex justify-between text-xs text-gray-500">
                        <span>共 {total} 条</span>
                        <div className="flex gap-1">
                            <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-2 py-1 border rounded disabled:opacity-50">上一页</button>
                            <span className="px-2">第 {page} / {totalPages} 页</span>
                            <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="px-2 py-1 border rounded disabled:opacity-50">下一页</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}