'use client';
import { useState, useEffect, useRef } from 'react';
import { useAdminFetch } from '@/hooks/useAdminFetch';
import RichTextEditor, { RichTextEditorHandle } from '@/components/frontend/RichTextEditor';
import Modal from '@/components/admin/Modal';
import { Edit2, Trash2, Plus } from 'lucide-react';
import { pinyin } from 'pinyin-pro'; // ✅ 引入拼音库
import { usePermission } from '@/hooks/usePermission';

export default function FragsPage() {
    const { hasPermission } = usePermission();
    const [list, setList] = useState<any[]>([]);
    const { adminFetch } = useAdminFetch();
    const editorRef = useRef<RichTextEditorHandle>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFrag, setEditingFrag] = useState<any>(null); // null 表示新增
    const [form, setForm] = useState({ name: '', mark: '' });
    const [submitting, setSubmitting] = useState(false);

    const fetchList = async () => {
        const res = await adminFetch('/admin/frags');
        if (res.code === 1) setList(res.data);
    };

    useEffect(() => { fetchList(); }, []);

    // 新增弹窗
    const openCreateModal = () => {
        setEditingFrag(null);
        setForm({ name: '', mark: '' });
        setIsModalOpen(true);
        // 初始化空编辑器
        setTimeout(() => {
            if (editorRef.current) editorRef.current.setHtml('');
        }, 150);
    };

    // 编辑弹窗
    const openEditModal = (frag: any) => {
        setEditingFrag(frag);
        setForm({ name: frag.name, mark: frag.mark });
        setIsModalOpen(true);
        setTimeout(() => {
            if (editorRef.current) editorRef.current.setHtml(frag.content || '');
        }, 150);
    };

    // ✅ 处理拼音自动生成
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name === 'name') {
            const py = pinyin(value, { toneType: 'none', type: 'array' }).join('');
            // 如果是新增状态，或者标识为空，自动生成标识
            if (!editingFrag || !form.mark) {
                setForm({ ...form, name: value, mark: py });
                return;
            }
        }
        setForm({ ...form, [name]: value });
    };

    const handleSave = async () => {
        if (!form.name || !form.mark) return alert('名称和标识不能为空');
        setSubmitting(true);
        const content = editorRef.current?.getHtml() || '';

        let url = '/admin/frags';
        let method = 'POST';

        if (editingFrag) {
            url = `/admin/frags/${editingFrag.id}`;
            method = 'PUT';
        }

        const res = await adminFetch(url, {
            method,
            body: JSON.stringify({ ...form, content })
        });

        setSubmitting(false);
        if (res.code === 1) {
            setIsModalOpen(false);
            fetchList();
        } else alert(res.message);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('确认删除该碎片吗?')) return;
        const res = await adminFetch(`/admin/frags/${id}`, { method: 'DELETE' });
        if (res.code === 1) fetchList();
        else alert(res.message);
    };

    return (
        <div className="p-3">
            <div className="flex items-center justify-between mb-2">
                <h1 className="text-lg font-bold text-gray-800">碎片信息</h1>
                {hasPermission('frags', 'create') && (<button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 whitespace-nowrap">
                    <Plus className="w-3.5 h-3.5" /> 新增碎片
                </button>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2">
                {list.map(item => (
                    <div key={item.id} className="bg-white px-3 py-2 rounded shadow-sm border border-gray-200 flex flex-col justify-between hover:shadow-md transition-shadow group">
                        <div>
                            <div className="flex items-center justify-between mb-0.5">
                                <h3 className="font-bold text-sm text-gray-800 truncate" title={item.name}>{item.name}</h3>
                                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-all">
                                    {hasPermission('frags', 'edit') && (<button onClick={() => openEditModal(item)} className="p-1 text-blue-600 bg-blue-50 rounded mr-1" title="编辑">
                                        <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    )}
                                    {hasPermission('frags', 'delete') && (<button onClick={() => handleDelete(item.id)} className="p-1 text-red-600 bg-red-50 rounded" title="删除">
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                    )}
                                </div>
                            </div>
                            <p className="text-[11px] text-gray-500 font-mono bg-gray-50 inline-block px-1 py-0.5 rounded border border-gray-100">
                                {item.mark}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingFrag ? '编辑碎片' : '新增碎片'}
                size="xl"
                footer={
                    <>
                        <button onClick={() => setIsModalOpen(false)} className="px-3 py-1.5 border rounded text-sm hover:bg-gray-100">取消</button>
                        <button onClick={handleSave} disabled={submitting} className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50">{submitting ? '保存中...' : '保存'}</button>
                    </>
                }
            >
                <div className="space-y-4 mb-4">
                    {/* ✅ 同行布局 */}
                    <div className="flex items-center">
                        <label className="w-24 flex-shrink-0 text-sm text-gray-700 text-right pr-4"><span className="text-red-500 mr-1">*</span>碎片名称</label>
                        <input type="text" name="name" value={form.name} onChange={handleChange} className="flex-1 border rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none" placeholder="请输入名称" />
                    </div>
                    <div className="flex items-center">
                        <label className="w-24 flex-shrink-0 text-sm text-gray-700 text-right pr-4"><span className="text-red-500 mr-1">*</span>碎片标识</label>
                        <input type="text" name="mark" value={form.mark} onChange={handleChange} className="flex-1 border rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none" placeholder="拼音或英文，唯一标识" />
                    </div>
                </div>

                {/* 编辑器区域 */}
                <div className="min-h-[400px] border rounded">
                    <RichTextEditor ref={editorRef} minHeight={400} imgUploadPath='uploads' isAdmin={true} />
                </div>
            </Modal>
        </div>
    );
}