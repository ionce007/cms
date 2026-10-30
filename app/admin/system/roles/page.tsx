// app/admin/system/roles/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useAdminFetch } from '@/hooks/useAdminFetch';
import Modal from '@/components/admin/Modal';
import { Plus, Edit2, Trash2, ShieldCheck, HelpCircle } from 'lucide-react';
import { PERMISSION_GROUPS } from '@/config/permissions';
import { usePermission } from '@/hooks/usePermission';

export default function RolesPage() {
    const { hasPermission } = usePermission();
    const [roles, setRoles] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<any>({
        name: '', value: '', sort: 0, status: 1, remark: '', permissions: {}
    });

    // ✅ 权限提示气泡状态
    const [showPermissionTip, setShowPermissionTip] = useState(false);
    const tipRef = useRef<HTMLDivElement>(null);

    const { adminFetch } = useAdminFetch();

    const fetchRoles = async () => {
        const res = await adminFetch('/admin/system/roles');
        if (res.code === 1) setRoles(res.data);
    };

    useEffect(() => { fetchRoles(); }, []);

    // ✅ 点击外部关闭提示气泡
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (tipRef.current && !tipRef.current.contains(event.target as Node)) {
                setShowPermissionTip(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const openCreateModal = () => {
        setEditingId(null);
        setForm({ name: '', value: '', sort: 0, status: 1, remark: '', permissions: {} });
        setShowPermissionTip(false);
        setIsModalOpen(true);
    };

    const openEditModal = (role: any) => {
        setEditingId(role.id);
        setForm({
            ...role,
            permissions: role.permissions || {}
        });
        setShowPermissionTip(false);
        setIsModalOpen(true);
    };

    // ✅ 切换单个权限
    const togglePermission = (moduleKey: string, actionKey: string) => {
        const newPerms = { ...form.permissions };
        if (!newPerms[moduleKey]) newPerms[moduleKey] = [];

        if (newPerms[moduleKey].includes(actionKey)) {
            newPerms[moduleKey] = newPerms[moduleKey].filter((k: string) => k !== actionKey);
            if (newPerms[moduleKey].length === 0) delete newPerms[moduleKey];
        } else {
            newPerms[moduleKey].push(actionKey);
        }
        setForm({ ...form, permissions: newPerms });
    };

    // ✅ 全选/取消全选某组
    const toggleGroupAll = (modules: any[], isChecked: boolean) => {
        const newPerms = { ...form.permissions };
        modules.forEach(mod => {
            if (isChecked) {
                newPerms[mod.module] = mod.actions.map((a: any) => a.key);
            } else {
                delete newPerms[mod.module];
            }
        });
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
                {hasPermission('roles', 'create') && (<button onClick={openCreateModal} className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm flex items-center gap-1 hover:bg-blue-700 transition-colors">
                    <Plus className="w-4 h-4" /> 新增角色
                </button>
                )}
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
                                    {hasPermission('roles', 'create') && (<button onClick={() => openEditModal(r)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="编辑">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    )}
                                    {r.value !== 'super' && (
                                        hasPermission('roles', 'create') ? (<button onClick={() => handleDelete(r.id)} className="p-1 text-red-500 hover:bg-red-50 rounded" title="删除">
                                            <Trash2 className="w-4 h-4" />
                                        </button>) : (<></>)
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingId ? '编辑角色' : '新增角色'}
                size="xl"
                footer={
                    <>
                        <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded text-sm hover:bg-gray-50">取消</button>
                        <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">保存</button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm text-gray-700 mb-1">角色名称</label>
                            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full border rounded p-2 text-sm outline-none focus:ring-1 focus:ring-blue-500" placeholder="如：内容编辑" />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm text-gray-700 mb-1">角色标识</label>
                            <input type="text" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} className="w-full border rounded p-2 text-sm outline-none focus:ring-1 focus:ring-blue-500" placeholder="如：editor" disabled={form.value === 'super'} />
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center justify-between">
                            {/* ✅ 权限配置标题 + 可点击的 HelpCircle 提示 */}
                            <span className="flex items-center gap-1.5 relative" ref={tipRef}>
                                权限配置
                                <button
                                    type="button"
                                    onClick={() => setShowPermissionTip(v => !v)}
                                    className="text-gray-400 hover:text-blue-600 transition-colors focus:outline-none"
                                    title="权限配置说明"
                                    aria-label="权限配置说明"
                                >
                                    <HelpCircle className="w-4 h-4" />
                                </button>

                                {/* ✅ 提示气泡 */}
                                {showPermissionTip && (
                                    <div className="absolute left-0 top-full mt-2 w-80 z-[120] 
                                        bg-amber-50 border border-amber-200 rounded-lg shadow-lg p-3 
                                        text-xs text-amber-800 leading-relaxed animate-in fade-in slide-in-from-top-1">
                                        <div className="flex gap-2 items-start">
                                            <HelpCircle className="w-4 h-4 flex-shrink-0 text-amber-500 mt-0.5" />
                                            <div>
                                                <span className="font-semibold">温馨提示：</span>
                                                如果模块没有“查看”权限，即使您有选中其它权限，也不会拥有该模块的其它所有权限！
                                            </div>
                                        </div>
                                        {/* 小三角箭头 */}
                                        <span className="absolute -top-1.5 left-3 w-3 h-3 bg-amber-50 border-l border-t border-amber-200 rotate-45" />
                                    </div>
                                )}
                            </span>
                            <span className="text-xs font-normal text-gray-400">勾选该角色拥有的操作权限</span>
                        </h3>

                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                            {/* ✅ 按大类循环渲染权限 */}
                            {PERMISSION_GROUPS.map(group => {
                                // 检查当前大类是否全选
                                const isAllChecked = group.modules.every(mod =>
                                    mod.actions.every((act: any) => form.permissions?.[mod.module]?.includes(act.key))
                                );

                                return (
                                    <div key={group.groupName} className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                                        <div className="bg-gray-100 px-4 py-2 border-b flex justify-between items-center">
                                            <span className="font-bold text-sm text-gray-700">{group.groupName}</span>
                                            <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={isAllChecked}
                                                    onChange={(e) => toggleGroupAll(group.modules, e.target.checked)}
                                                    className="rounded text-blue-600 w-3.5 h-3.5"
                                                />
                                                全选本类
                                            </label>
                                        </div>
                                        <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {group.modules.map(mod => (
                                                <div key={mod.module} className="bg-white p-3 rounded border shadow-sm">
                                                    <div className="font-medium text-sm text-gray-800 mb-2">{mod.label}</div>
                                                    <div className="flex flex-wrap gap-3">
                                                        {mod.actions.map(action => (
                                                            <label key={action.key} className="flex items-center gap-1.5 text-xs cursor-pointer text-gray-600 hover:text-blue-600">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={form.permissions?.[mod.module]?.includes(action.key) || false}
                                                                    onChange={() => togglePermission(mod.module, action.key)}
                                                                    className="rounded text-blue-600 w-3.5 h-3.5"
                                                                />
                                                                {action.label}
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}