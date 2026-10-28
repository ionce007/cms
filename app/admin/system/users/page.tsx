// app/admin/system/users/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAdminFetch } from '@/hooks/useAdminFetch';
import Modal from '@/components/admin/Modal';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';

export default function SystemUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [roles, setRoles] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [keyword, setKeyword] = useState('');
    const limit = 10;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState({ username: '', password: '', role_id: 0, status: 1, remark: '' });

    const { adminFetch } = useAdminFetch();

    const fetchUsers = async () => {
        const res = await adminFetch(`/admin/system/users?page=${page}&limit=${limit}&keyword=${keyword}`);
        if (res.code === 1) {
            setUsers(res.data);
            setTotal(res.total);
        }
    };

    const fetchRoles = async () => {
        const res = await adminFetch('/admin/system/roles');
        if (res.code === 1) setRoles(res.data);
    };

    useEffect(() => { fetchUsers(); }, [page]);
    useEffect(() => { fetchRoles(); }, []);

    const openCreateModal = () => {
        setEditingId(null);
        setForm({ username: '', password: '', role_id: roles[0]?.id || '', status: 1, remark: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (user: any) => {
        setEditingId(user.id);
        setForm({ username: user.username, password: '', role_id: user.role_id, status: user.status, remark: user.remark || '' });
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!form.username || (!editingId && !form.password) || !form.role_id) {
            return alert('请填写完整信息');
        }

        const url = editingId ? `/admin/system/users/${editingId}` : '/admin/system/users';
        const method = editingId ? 'PUT' : 'POST';

        const res = await adminFetch(url, { method, body: JSON.stringify(form) });
        if (res.code === 1) {
            setIsModalOpen(false);
            fetchUsers();
        } else {
            alert(res.message);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('确定删除该用户吗？')) return;
        const res = await adminFetch(`/admin/system/users/${id}`, { method: 'DELETE' });
        if (res.code === 1) fetchUsers();
        else alert(res.message);
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-bold text-gray-800">系统用户管理</h1>
                <div className="flex gap-2">
                    <form onSubmit={(e) => { e.preventDefault(); setPage(1); fetchUsers(); }} className="relative">
                        <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
                        <input type="text" placeholder="搜索用户名..." value={keyword} onChange={e => setKeyword(e.target.value)} className="pl-7 pr-2 py-1.5 border rounded text-sm w-48 focus:ring-1 focus:ring-blue-500 outline-none" />
                    </form>
                    <button onClick={openCreateModal} className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm flex items-center gap-1 hover:bg-blue-700"><Plus className="w-4 h-4" /> 新增用户</button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-gray-50 border-b text-gray-500 text-xs">
                        <tr>
                            <th className="py-2.5 px-3 font-medium">ID</th>
                            <th className="py-2.5 px-3 font-medium">用户名</th>
                            <th className="py-2.5 px-3 font-medium">角色</th>
                            <th className="py-2.5 px-3 font-medium">状态</th>
                            <th className="py-2.5 px-3 font-medium">备注</th>
                            <th className="py-2.5 px-3 font-medium text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {users.map(u => (
                            <tr key={u.id} className="hover:bg-gray-50">
                                <td className="py-2 px-3 text-gray-400 text-xs">{u.id}</td>
                                <td className="py-2 px-3 font-medium text-gray-800">{u.username}</td>
                                <td className="py-2 px-3 text-blue-600 text-xs">{u.Role?.name}</td>
                                <td className="py-2 px-3">
                                    <span className={`px-1.5 py-0.5 rounded text-[11px] ${u.status === 1 ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                        {u.status === 1 ? '启用' : '禁用'}
                                    </span>
                                </td>
                                <td className="py-2 px-3 text-gray-500 text-xs truncate max-w-[150px]">{u.remark}</td>
                                <td className="py-2 px-3 flex justify-end gap-1">
                                    <button onClick={() => openEditModal(u)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="编辑"><Edit2 className="w-4 h-4" /></button>
                                    <button onClick={() => handleDelete(u.id)} className="p-1 text-red-500 hover:bg-red-50 rounded" title="删除"><Trash2 className="w-4 h-4" /></button>
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

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? '编辑用户' : '新增用户'} footer={
                <>
                    <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded text-sm">取消</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded text-sm">保存</button>
                </>
            }>
                <div className="space-y-4">
                    <div className="flex items-center"><label className="w-20 text-sm text-gray-700 text-right pr-3">用户名</label><input type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} className="flex-1 border rounded p-2 text-sm outline-none" /></div>
                    <div className="flex items-center"><label className="w-20 text-sm text-gray-700 text-right pr-3">密码</label><input type="password" placeholder={editingId ? "留空则不修改" : ""} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="flex-1 border rounded p-2 text-sm outline-none" /></div>
                    <div className="flex items-center">
                        <label className="w-20 text-sm text-gray-700 text-right pr-3">角色</label>
                        <select value={form.role_id} onChange={e => setForm({ ...form, role_id: Number(e.target.value) })} className="flex-1 border rounded p-2 text-sm outline-none">
                            {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center">
                        <label className="w-20 text-sm text-gray-700 text-right pr-3">状态</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-1 text-sm"><input type="radio" value="1" checked={form.status === 1} onChange={() => setForm({ ...form, status: 1 })} /> 启用</label>
                            <label className="flex items-center gap-1 text-sm"><input type="radio" value="0" checked={form.status === 0} onChange={() => setForm({ ...form, status: 0 })} /> 禁用</label>
                        </div>
                    </div>
                    <div className="flex items-center"><label className="w-20 text-sm text-gray-700 text-right pr-3">备注</label><input type="text" value={form.remark} onChange={e => setForm({ ...form, remark: e.target.value })} className="flex-1 border rounded p-2 text-sm outline-none" /></div>
                </div>
            </Modal>
        </div>
    );
}