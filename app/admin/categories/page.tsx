// app/admin/categories/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useAdminFetch } from '@/hooks/useAdminFetch';
import Modal from '@/components/admin/Modal';
import { Plus, Edit2, Trash2, Search, HelpCircle, Home } from 'lucide-react';
import { pinyin } from 'pinyin-pro';

// 初始表单数据
const initialForm = {
    name: '',
    path: '',
    pinyin: '',
    listView: 'index.html',
    articleView: 'article.html',
    type: '1', // '0' 栏目, '1' 单页
    platform: '0', // '0' 所有平台, '1' EdgeOne
    status: '0', // '0' 显示, '1' 隐藏

    seoTitle: '',
    seoKeywords: '',
    seoDescription: '',

    url: '',
    mid: '1', // 扩展模型 '1' 基本模型, '2' 下载模型
    target: '0', // 打开方式 '0' 当前页, '1' 新页
    orderBy: 1,
    description: '',
};

export default function CategoriesPage() {
    const [list, setList] = useState<any[]>([]);
    const [filteredList, setFilteredList] = useState<any[]>([]);
    const [keyword, setKeyword] = useState('');
    const { adminFetch } = useAdminFetch();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<any>(initialForm);
    const [submitting, setSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<'basic' | 'seo' | 'extend'>('basic');

    // 获取列表数据
    const fetchList = async () => {
        const res = await adminFetch('/admin/categories');
        if (res.code === 1) {
            setList(res.data);
            setFilteredList(res.data);
        }
    };

    useEffect(() => { fetchList(); }, []);

    // 过滤搜索
    useEffect(() => {
        if (!keyword) {
            setFilteredList(list);
        } else {
            setFilteredList(list.filter(item => item.name.includes(keyword) || item.path.includes(keyword)));
        }
    }, [keyword, list]);

    const openCreateModal = () => {
        setEditingId(null);
        setForm(initialForm);
        setActiveTab('basic');
        setIsModalOpen(true);
    };

    const openEditModal = (item: any) => {
        setEditingId(item.id);
        setForm({ ...initialForm, ...item });
        setActiveTab('basic');
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!form.name) return alert('栏目名称不能为空');
        setSubmitting(true);
        const url = editingId ? `/admin/categories/${editingId}` : '/admin/categories';
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

    // ✅ 核心处理：输入变化与自动拼音生成
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        // 如果是修改“栏目名称”，且当前是新增状态（或者用户未手动改过标识），则自动生成拼音
        if (name === 'name') {
            // 将中文转为拼音，去掉空格，全小写
            const py = pinyin(value, { toneType: 'none', type: 'array' }).join('');

            // 如果是新建，或者旧路径为空，则自动填充标识和路径
            if (!editingId || !form.pinyin) {
                setForm({
                    ...form,
                    name: value,
                    pinyin: py,
                    path: `/${py}` // ✅ 路径自动加 '/'
                });
                return;
            }
        }

        // 如果用户手动修改了“栏目标识”，同步更新路径
        if (name === 'pinyin') {
            setForm({
                ...form,
                pinyin: value,
                path: `/${value}` // ✅ 路径自动加 '/'
            });
            return;
        }

        // 处理“栏目路径”手动输入，确保以 '/' 开头
        if (name === 'path') {
            let finalValue = value;
            if (finalValue && !finalValue.startsWith('/')) {
                finalValue = `/${finalValue}`;
            }
            setForm({ ...form, path: finalValue });
            return;
        }

        setForm({ ...form, [name]: value });
    };

    return (
        <div className="p-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                <h1 className="text-lg font-bold text-gray-800">栏目管理</h1>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="搜索栏目..."
                            value={keyword}
                            onChange={e => setKeyword(e.target.value)}
                            className="pl-7 pr-2 py-1 border border-gray-300 rounded text-xs w-full sm:w-56 focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 whitespace-nowrap transition-colors">
                        <Plus className="w-3.5 h-3.5" /> 新增
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs">
                            <tr>
                                <th className="py-2 px-3 font-medium">ID</th>
                                <th className="py-2 px-3 font-medium">栏目名称</th>
                                <th className="py-2 px-3 font-medium">路径</th>
                                <th className="py-2 px-3 font-medium">类型</th>
                                <th className="py-2 px-3 font-medium">排序</th>
                                <th className="py-2 px-3 font-medium">状态</th>
                                <th className="py-2 px-3 font-medium text-right">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredList.map(item => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="py-1.5 px-3 text-gray-400 text-xs">{item.id}</td>
                                    <td className="py-1.5 px-3 font-medium text-gray-800">{item.name}</td>
                                    <td className="py-1.5 px-3 text-gray-500 text-xs">{item.path}</td>
                                    <td className="py-1.5 px-3 text-gray-500 text-xs">{item.type === '0' ? '栏目' : '单页'}</td>
                                    <td className="py-1.5 px-3 text-gray-500 text-xs">{item.orderBy}</td>
                                    <td className="py-1.5 px-3">
                                        <span className={`px-1.5 py-0.5 rounded text-[11px] font-medium ${item.status === '0' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                                            {item.status === '0' ? '显示' : '隐藏'}
                                        </span>
                                    </td>
                                    <td className="py-1.5 px-3 flex items-center justify-end gap-1">
                                        <button onClick={() => openEditModal(item)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="编辑">
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button onClick={async () => { if (confirm('确认删除?')) { await adminFetch(`/admin/categories/${item.id}`, { method: 'DELETE' }); fetchList(); } }} className="p-1 text-red-500 hover:bg-red-50 rounded" title="删除">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredList.length === 0 && <tr><td colSpan={7} className="py-6 text-center text-gray-400 text-sm">暂无数据</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 弹窗组件 */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingId ? '编辑栏目' : '新增栏目'}
                size="xl"
                footer={
                    <>
                        <button onClick={() => setIsModalOpen(false)} className="px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-100">取消</button>
                        <button onClick={handleSave} disabled={submitting} className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50">
                            {submitting ? '保存中...' : '保存栏目'}
                        </button>
                    </>
                }
            >
                {/* Tabs */}
                <div className="flex border-b border-gray-200 mb-4 bg-white sticky top-0 z-10">
                    {[
                        { id: 'basic', label: '基本信息' },
                        { id: 'seo', label: 'SEO设置' },
                        { id: 'extend', label: '扩展信息' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* 基本信息 Tab */}
                {activeTab === 'basic' && (
                    <div className="space-y-3.5">
                        {/* ✅ label 与 input 同行 */}
                        <div className="flex items-center">
                            <label className="w-24 flex-shrink-0 text-sm text-gray-700 text-right pr-4"><span className="text-red-500 mr-1">*</span>栏目名称</label>
                            <input name="name" value={form.name} onChange={handleChange} className="flex-1 border rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none" placeholder="请输入栏目名称" />
                        </div>

                        <div className="flex items-center">
                            <label className="w-24 flex-shrink-0 text-sm text-gray-700 text-right pr-4">栏目标识</label>
                            <input name="pinyin" value={form.pinyin} onChange={handleChange} className="flex-1 border rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none" placeholder="例如：home" />
                        </div>

                        <div className="flex items-center">
                            <label className="w-24 flex-shrink-0 text-sm text-gray-700 text-right pr-4">栏目路径</label>
                            <input name="path" value={form.path} onChange={handleChange} className="flex-1 border rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none" placeholder="例如：/home" />
                        </div>

                        <div className="flex items-center">
                            <label className="w-24 flex-shrink-0 text-sm text-gray-700 text-right pr-4">列表模板</label>
                            <select name="listView" value={form.listView} onChange={handleChange} className="flex-1 border rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none bg-white">
                                <option value="index.html">index.html</option>
                                <option value="list.html">list.html</option>
                            </select>
                        </div>

                        <div className="flex items-center">
                            <label className="w-24 flex-shrink-0 text-sm text-gray-700 text-right pr-4">内容模板</label>
                            <select name="articleView" value={form.articleView} onChange={handleChange} className="flex-1 border rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none bg-white">
                                <option value="article.html">article.html</option>
                                <option value="page.html">page.html</option>
                            </select>
                        </div>

                        <div className="flex items-center">
                            <label className="w-24 flex-shrink-0 text-sm text-gray-700 text-right pr-4">栏目类型</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                    <input type="radio" name="type" value="0" checked={form.type === '0'} onChange={handleChange} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                                    栏目
                                </label>
                                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                    <input type="radio" name="type" value="1" checked={form.type === '1'} onChange={handleChange} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                                    单页
                                </label>
                            </div>
                        </div>

                        <div className="flex items-center">
                            <label className="w-24 flex-shrink-0 text-sm text-gray-700 text-right pr-4">使用平台</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                    <input type="checkbox" name="platform" checked={form.platform === '0'} onChange={() => setForm({ ...form, platform: '0' })} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" />
                                    所有平台
                                </label>
                                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                    <input type="checkbox" name="platform" checked={form.platform === '1'} onChange={() => setForm({ ...form, platform: '1' })} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" />
                                    EdgeOne平台
                                </label>
                            </div>
                        </div>

                        <div className="flex items-center">
                            <label className="w-24 flex-shrink-0 text-sm text-gray-700 text-right pr-4">是否显示</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                    <input type="radio" name="status" value="0" checked={form.status === '0'} onChange={handleChange} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                                    显示
                                </label>
                                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                    <input type="radio" name="status" value="1" checked={form.status === '1'} onChange={handleChange} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                                    隐藏
                                </label>
                            </div>
                        </div>
                    </div>
                )}

                {/* SEO 设置 Tab */}
                {activeTab === 'seo' && (
                    <div className="space-y-3.5">
                        <div className="flex items-center">
                            <label className="w-24 flex-shrink-0 text-sm text-gray-700 text-right pr-4">SEO标题</label>
                            <input name="seoTitle" value={form.seoTitle} onChange={handleChange} className="flex-1 border rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none" />
                        </div>
                        <div className="flex items-center">
                            <label className="w-24 flex-shrink-0 text-sm text-gray-700 text-right pr-4">SEO关键词</label>
                            <input name="seoKeywords" value={form.seoKeywords} onChange={handleChange} className="flex-1 border rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none" />
                        </div>
                        <div className="flex items-start">
                            <label className="w-24 flex-shrink-0 text-sm text-gray-700 text-right pr-4 pt-1.5">SEO描述</label>
                            <textarea name="seoDescription" value={form.seoDescription} onChange={handleChange} rows={4} className="flex-1 border rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none resize-none" />
                        </div>
                    </div>
                )}

                {/* 扩展信息 Tab */}
                {activeTab === 'extend' && (
                    <div className="space-y-3.5">
                        <div className="flex items-center">
                            <label className="w-24 flex-shrink-0 text-sm text-gray-700 text-right pr-4">栏目链接</label>
                            <div className="flex-1 flex items-center border rounded overflow-hidden">
                                <span className="px-2.5 bg-gray-50 border-r text-gray-500 py-1.5"><Home className="w-4 h-4" /></span>
                                <input name="url" value={form.url} onChange={handleChange} className="flex-1 p-1.5 text-sm outline-none" placeholder="例如：https://..." />
                            </div>
                        </div>
                        <div className="flex items-center">
                            <label className="w-24 flex-shrink-0 flex items-center justify-end gap-1 text-sm text-gray-700 pr-4">
                                扩展模型 <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
                            </label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                    <input type="radio" name="mid" value="1" checked={form.mid === '1'} onChange={handleChange} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                                    基本模型
                                </label>
                                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                    <input type="radio" name="mid" value="2" checked={form.mid === '2'} onChange={handleChange} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                                    下载模型模型
                                </label>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <label className="w-24 flex-shrink-0 text-sm text-gray-700 text-right pr-4">打开方式</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                    <input type="radio" name="target" value="0" checked={form.target === '0'} onChange={handleChange} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                                    当前页面
                                </label>
                                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                    <input type="radio" name="target" value="1" checked={form.target === '1'} onChange={handleChange} className="w-4 h-4 text-blue-600 focus:ring-blue-500" />
                                    新页面
                                </label>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <label className="w-24 flex-shrink-0 text-sm text-gray-700 text-right pr-4">栏目排序</label>
                            <input type="number" name="orderBy" value={form.orderBy} onChange={handleChange} className="flex-1 border rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none" />
                        </div>
                        <div className="flex items-start">
                            <label className="w-24 flex-shrink-0 text-sm text-gray-700 text-right pr-4 pt-1.5">栏目描述</label>
                            <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="flex-1 border rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none resize-none" />
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}