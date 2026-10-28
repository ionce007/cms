'use client';
import { useState, useEffect } from 'react';
import { useAdminFetch } from '@/hooks/useAdminFetch';
import Modal from '@/components/admin/Modal';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { pinyin } from 'pinyin-pro';

export default function TagsPage() {
    const [list, setList] = useState<any[]>([]);
    const [filteredList, setFilteredList] = useState<any[]>([]);
    const [keyword, setKeyword] = useState('');
    const { adminFetch } = useAdminFetch();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState({ name: '', path: '' });
    const [submitting, setSubmitting] = useState(false);

    const fetchList = async () => {
        const res = await adminFetch('/admin/tags');
        if (res.code === 1) {
            setList(res.data);
            setFilteredList(res.data);
        }
    };

    useEffect(() => { fetchList(); }, []);

    useEffect(() => {
        if (!keyword) setFilteredList(list);
        else setFilteredList(list.filter(item => item.name.includes(keyword) || item.path.includes(keyword)));
    }, [keyword, list]);

    const openCreateModal = () => {
        setEditingId(null);
        setForm({ name: '', path: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (item: any) => {
        setEditingId(item.id);
        setForm({ name: item.name, path: item.path });
        setIsModalOpen(true);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'name') {
            const py = pinyin(value, { toneType: 'none', type: 'array' }).join('');
            if (!editingId || !form.path) {
                setForm({ ...form, name: value, path: py });
                return;
            }
        }
        setForm({ ...form, [name]: value });
    };

    const handleSave = async () => {
        if (!form.name) return alert('名称不能为空');
        setSubmitting(true);
        const url = editingId ? `/admin/tags/${editingId}` : '/admin/tags';
        const method = editingId ? 'PUT' : 'POST';
        const res = await adminFetch(url, { method, body: JSON.stringify(form) });
        setSubmitting(false);
        if (res.code === 1) {
            setIsModalOpen(false);
            fetchList();
        } else {
            alert(res.message);
        }
    };

    return (
        <div className="p-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                <h1 className="text-lg font-bold text-gray-800">标签管理</h1>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
                        <input type="text" placeholder="搜索标签..." value={keyword} onChange={e => setKeyword(e.target.value)} className="pl-7 pr-2 py-1 border rounded text-xs w-full sm:w-56 focus:ring-1 focus:ring-blue-500 outline-none" />
                    </div>
                    <button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 whitespace-nowrap">
                        <Plus className="w-3.5 h-3.5" /> 新增
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        {/* ✅ 确保 thead 内部紧凑无多余空格 */}
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs">
                            <tr>
                                <th className="py-2 px-3 font-medium">ID</th>
                                <th className="py-2 px-3 font-medium">标签名称</th>
                                <th className="py-2 px-3 font-medium">标签标识</th>
                                <th className="py-2 px-3 font-medium">使用次数</th>
                                <th className="py-2 px-3 font-medium text-right">操作</th>
                            </tr>
                        </thead>

                        {/* ✅ 确保 tbody 内部紧凑无多余空格 */}
                        <tbody className="divide-y divide-gray-100">
                            {filteredList.map(item => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="py-1.5 px-3 text-gray-400 text-xs">{item.id}</td>
                                    <td className="py-1.5 px-3 font-medium text-gray-800"><span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-xs">#{item.name}</span></td>
                                    <td className="py-1.5 px-3 text-gray-500 text-xs">{item.path}</td>
                                    <td className="py-1.5 px-3 text-gray-500 text-xs">{item.count || 0}</td>
                                    <td className="py-1.5 px-3 flex items-center justify-end gap-1">
                                        <button onClick={() => openEditModal(item)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="编辑"><Edit2 className="w-3.5 h-3.5" /></button>
                                        <button onClick={async () => { if (confirm('确认删除?')) { await adminFetch(`/admin/tags/${item.id}`, { method: 'DELETE' }); fetchList(); } }} className="p-1 text-red-500 hover:bg-red-50 rounded" title="删除"><Trash2 className="w-3.5 h-3.5" /></button>
                                    </td>
                                </tr>
                            ))}
                            {filteredList.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-6 text-center text-gray-400 text-sm">暂无数据</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? '编辑标签' : '新增标签'} footer={
                <>
                    <button onClick={() => setIsModalOpen(false)} className="px-3 py-1.5 border rounded text-sm hover:bg-gray-100">取消</button>
                    <button onClick={handleSave} disabled={submitting} className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50">{submitting ? '保存中...' : '保存'}</button>
                </>
            }>
                <div className="space-y-4">
                    <div className="flex items-center">
                        <label className="w-24 flex-shrink-0 text-sm text-gray-700 text-right pr-4"><span className="text-red-500 mr-1">*</span>标签名称</label>
                        <input type="text" name="name" value={form.name} onChange={handleChange} className="flex-1 border rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none" />
                    </div>
                    <div className="flex items-center">
                        <label className="w-24 flex-shrink-0 text-sm text-gray-700 text-right pr-4">标签标识</label>
                        <input type="text" name="path" value={form.path} onChange={handleChange} className="flex-1 border rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none" placeholder="拼音或英文" />
                    </div>
                </div>
            </Modal>
        </div>
    );
}