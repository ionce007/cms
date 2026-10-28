// app/admin/system/roles/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAdminFetch } from '@/hooks/useAdminFetch';
import Modal from '@/components/admin/Modal';
import { Plus, Edit2, Trash2, ShieldCheck } from 'lucide-react';
import { PERMISSION_MODULES } from '@/config/permissions';

export default function RolesPage() {
    const [roles, setRoles] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<any>({
        name: '', value: '', sort: 0, status: 1, remark: '', permissions: {}
    });

    const { adminFetch } = useAdminFetch();

    const fetchRoles = async () => {
        const res = await adminFetch('/admin/system/roles');
        if (res.code === 1) setRoles(res.data);
    };

    useEffect(() => { fetchRoles(); }, []);

    const openCreateModal = () => {
        setEditingId(null);
        // 默认初始化一个空对象
        setForm({ name: '', value: '', sort: 0, status: 1, remark: '', permissions: {} });
        setIsModalOpen(true);
    };

    const openEditModal = (role: any) => {
        setEditingId(role.id);
        setForm({
            ...role,
            permissions: role.permissions || {}
        });
        setIsModalOpen(true);
    };

    // ✅ 切换勾选
    const togglePermission = (moduleKey: string, actionKey: string) => {
        const newPerms = { ...form.permissions };
        if (!newPerms[moduleKey]) newPerms[moduleKey] = [];

        if (newPerms[moduleKey].includes(actionKey)) {
            newPerms[moduleKey] = newPerms[moduleKey].filter((k: string) => k !== actionKey);
            // 如果该模块没权限了，可以删掉这个 key，保持干净
            if (newPerms[moduleKey].length === 0) delete newPerms[moduleKey];
        } else {
            newPerms[moduleKey].push(actionKey);
        }
        setForm({ ...form, permissions: newPerms });
    };

    const handleSave = async () => {
        if (!form.name || !form.value) return alert('名称和标识不能为空');
        const url = editingId ? `/admin/system/roles/${editingId}` : '/admin/system/roles';
        const method = editingId ? 'PUT' : 'POST';

        const res = await adminFetch(url, { method, body: JSON.stringify(form) });
        if (res.code === 1) {
            setIsModalOpen(false);
            fetchRoles();
        } else alert(res.message);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('确定删除该角色吗？')) return;
        const res = await adminFetch(`/admin/system/roles/${id}`, { method: 'DELETE' });
        if (res.code === 1) fetchRoles(); else alert(res.message);
    };

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-bold text-gray-800">角色权限管理</h1>
                <button onClick={openCreateModal} className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm flex items-center gap-1">
                    <Plus className="w-4 h-4" /> 新增角色
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-gray-50 border-b text-gray-500 text-xs">
                        <tr>
                            <th className="py-2.5 px-3 font-medium">ID</th>
                            <th className="py-2.5 px-3 font-medium">角色名称</th>
                            <th className="py-2.5 px-3 font-medium">标识</th>
                            <th className="py-2.5 px-3 font-medium text-right">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {roles.map(r => (
                            <tr key={r.id} className="hover:bg-gray-50">
                                <td className="py-2 px-3 text-gray-400 text-xs">{r.id}</td>
                                <td className="py-2 px-3 font-medium text-gray-800 flex items-center gap-1">
                                    {r.value === 'super' && <ShieldCheck className="w-4 h-4 text-green-500" />}
                                    {r.name}
                                </td>
                                <td className="py-2 px-3 text-gray-500 text-xs">{r.value}</td>
                                <td className="py-2 px-3 flex justify-end gap-1">
                                    <button onClick={() => openEditModal(r)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="编辑">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    {r.value !== 'super' && (
                                        <button onClick={() => handleDelete(r.id)} className="p-1 text-red-500 hover:bg-red-50 rounded" title="删除">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? '编辑角色' : '新增角色'} size="xl" footer={
                <>
                    <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded text-sm">取消</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded text-sm">保存</button>
                </>
            }>
                <div className="space-y-4">
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm text-gray-700 mb-1">角色名称</label>
                            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full border rounded p-2 text-sm outline-none" />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm text-gray-700 mb-1">角色标识</label>
                            <input type="text" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} className="w-full border rounded p-2 text-sm outline-none" placeholder="如：editor" />
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <h3 className="text-sm font-bold text-gray-800 mb-3">权限配置</h3>
                        <div className="space-y-3 bg-gray-50 p-4 rounded-lg border">
                            {PERMISSION_MODULES.map(mod => (
                                <div key={mod.module} className="flex items-center gap-4 bg-white p-3 rounded border shadow-sm">
                                    <div className="w-24 font-medium text-sm text-gray-700">{mod.label}</div>
                                    <div className="flex-1 flex flex-wrap gap-4">
                                        {mod.actions.map(action => (
                                            <label key={action.key} className="flex items-center gap-2 text-sm cursor-pointer text-gray-600 hover:text-blue-600">
                                                <input
                                                    type="checkbox"
                                                    checked={form.permissions?.[mod.module]?.includes(action.key) || false}
                                                    onChange={() => togglePermission(mod.module, action.key)}
                                                    className="rounded text-blue-600 w-4 h-4"
                                                />
                                                {action.label}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}