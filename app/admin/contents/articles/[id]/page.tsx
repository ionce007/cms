// app/admin/articles/[id]/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAdminFetch } from '@/hooks/useAdminFetch';
import RichTextEditor, { RichTextEditorHandle } from '@/components/frontend/RichTextEditor';
import { ArrowLeft, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { uploadImageToQiniu } from '@/lib/qiniuUpload';

// ✅ 获取当前时间，格式化为 datetime-local 需要的 YYYY-MM-DDTHH:mm
// ✅ 极其稳健的本地时间格式化方法
const getCurrentTime = () => {
    const d = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');

    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());

    // 返回格式必须是：2026-10-24T15:30 (绝对不能带有 Z 或时区偏移)
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// 初始表单数据
const initialForm = {
    title: '',
    shortTitle: '',
    cid: '',
    tagIds: [] as number[],
    attr: '0',
    source: '',
    // ✅ 扩展信息中的作者默认值
    author: { name: '缠说・股经', avatar: '/img/avatar.jpg' },
    description: '',
    img: '',
    content: '',
    status: 0, // 0发布 1不发布
    link: '',
    articleView: '',
    pv: 0,
    orderBy: 1,
    createdAt: getCurrentTime() // ✅ 发布时间默认为当前时间
};

export default function ArticleEditPage() {
    const router = useRouter();
    const params = useParams();
    const isEdit = params.id !== 'create';
    const { adminFetch } = useAdminFetch();
    const editorRef = useRef<RichTextEditorHandle>(null);

    // 图片上传相关的 Ref 和状态
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const [activeTab, setActiveTab] = useState<'basic' | 'extend'>('basic');
    const [form, setForm] = useState<any>(initialForm);
    const [categories, setCategories] = useState<any[]>([]);
    const [allTags, setAllTags] = useState<any[]>([]);

    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(isEdit);

    // 1. 初始化栏目和标签下拉数据
    useEffect(() => {
        async function fetchMeta() {
            const [resCate, resTags] = await Promise.all([
                adminFetch('/admin/categories'),
                adminFetch('/admin/tags')
            ]);
            if (resCate.code === 1) setCategories(resCate.data);
            if (resTags.code === 1) setAllTags(resTags.data);
        }
        fetchMeta();
    }, [adminFetch]);

    // 2. 如果是编辑状态，拉取文章详情
    useEffect(() => {
        if (!isEdit) return;
        async function fetchDetail() {
            const res = await adminFetch(`/admin/articles/${params.id}`);
            if (res.code === 1) {
                const data = res.data;

                // 提取标签 ID 数组
                const tagIds = data.Tags ? data.Tags.map((t: any) => t.id) : [];

                // 格式化日期供 datetime-local 使用
                let formattedDate = getCurrentTime();
                if (data.createdAt) {
                    const d = new Date(data.createdAt);
                    formattedDate = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                }

                setForm({
                    ...initialForm,
                    ...data,
                    tagIds,
                    createdAt: formattedDate
                });

                // 延迟渲染富文本
                setTimeout(() => {
                    if (editorRef.current) editorRef.current.setHtml(data.content || '');
                }, 100);
            } else {
                alert(res.message);
            }
            setLoading(false);
        }
        fetchDetail();
    }, [isEdit, params.id, adminFetch]);

    // 处理普通输入
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    // 处理多选标签
    const handleTagChange = (tagId: number) => {
        const newTagIds = form.tagIds.includes(tagId)
            ? form.tagIds.filter((id: number) => id !== tagId)
            : [...form.tagIds, tagId];
        setForm({ ...form, tagIds: newTagIds });
    };

    // 处理图片上传
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('请选择图片文件');
            return;
        }

        setUploading(true);
        try {
            const result = await uploadImageToQiniu(file, 'uploads', true);
            setForm((prev: any) => ({ ...prev, img: result.originalUrl }));
        } catch (err) {
            console.error('图片上传失败:', err);
            alert(err instanceof Error ? err.message : '图片上传失败');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // 保存提交
    const handleSave = async () => {
        if (!form.title || !form.cid) return alert('标题和栏目不能为空');

        setSubmitting(true);
        const content = editorRef.current?.getHtml() || '';
        const submitData = { ...form, content };

        const url = isEdit ? `/admin/articles/${params.id}` : '/admin/articles';
        const method = isEdit ? 'PUT' : 'POST';

        const res = await adminFetch(url, { method, body: JSON.stringify(submitData) });
        setSubmitting(false);

        if (res.code === 1) {
            alert('保存成功');
            router.push('/admin/articles');
        } else {
            alert(res.message);
        }
    };

    // 安全返回上一页
    const handleBack = () => {
        if (window.history.length > 2) {
            router.back();
        } else {
            router.push('/admin/articles');
        }
    };

    if (loading) return <div className="p-6 text-center text-gray-500">加载中...</div>;

    return (
        <div className="p-4 pb-20">
            {/* 顶部面包屑与返回 */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <button onClick={handleBack} className="hover:text-blue-600 flex items-center gap-1 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> 返回文章列表
                </button>
                <span>/</span>
                <span className="text-gray-800">文章管理-{isEdit ? '更新' : '新增'}</span>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-4 bg-white">
                {[
                    { id: 'basic', label: '基本信息' },
                    { id: 'extend', label: '扩展信息' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* 基本信息 Tab */}
            {activeTab === 'basic' && (
                <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">

                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex items-center w-full md:w-1/3">
                            <label className="w-20 flex-shrink-0 text-sm text-gray-700 text-right pr-3">文章栏目</label>
                            <select name="cid" value={form.cid} onChange={handleChange} className="flex-1 border rounded p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none">
                                <option value="">请选择栏目</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="flex items-center flex-1">
                            <label className="w-20 flex-shrink-0 text-sm text-gray-700 text-right pr-3"><span className="text-red-500 mr-1">*</span>文章标题</label>
                            <input name="title" value={form.title} onChange={handleChange} className="flex-1 border rounded p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none" placeholder="请输入标题" />
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex items-start w-full md:w-1/3">
                            <label className="w-20 flex-shrink-0 text-sm text-gray-700 text-right pr-3 pt-1.5">Tag标签</label>
                            <div className="flex-1 border rounded p-1.5 flex flex-wrap gap-1 min-h-[38px]">
                                {form.tagIds.map((id: number) => {
                                    const tag = allTags.find(t => t.id === id);
                                    return tag ? (
                                        <span key={id} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded flex items-center gap-1">
                                            {tag.name}
                                            <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => handleTagChange(id)} />
                                        </span>
                                    ) : null;
                                })}
                                <select
                                    className="outline-none text-sm bg-transparent flex-1 min-w-[80px]"
                                    onChange={(e) => {
                                        const val = Number(e.target.value);
                                        if (val && !form.tagIds.includes(val)) handleTagChange(val);
                                        e.target.value = '';
                                    }}
                                >
                                    <option value="">+ 添加标签</option>
                                    {allTags.filter(t => !form.tagIds.includes(t.id)).map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex items-center flex-1">
                            <label className="w-20 flex-shrink-0 text-sm text-gray-700 text-right pr-3">内容属性</label>
                            <div className="flex gap-4 text-sm">
                                <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" /> 头条</label>
                                <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" /> 推荐</label>
                                <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" /> 轮播</label>
                                <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" /> 热门</label>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex items-center w-full md:w-1/3">
                            <label className="w-20 flex-shrink-0 text-sm text-gray-700 text-right pr-3">发布时间</label>
                            {/* ✅ 这里会自动显示 getCurrentTime 返回的值 */}
                            <input type="datetime-local" name="createdAt" value={form.createdAt} onChange={handleChange} className="flex-1 border rounded p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none" />
                        </div>
                        <div className="flex items-start flex-1">
                            <label className="w-20 flex-shrink-0 text-sm text-gray-700 text-right pr-3 pt-1.5">缩略图</label>
                            <div className="flex items-center gap-3 w-full">
                                <div className="w-16 h-16 border rounded flex items-center justify-center bg-gray-50 text-gray-400 flex-shrink-0 overflow-hidden">
                                    {form.img ? <img src={form.img} alt="封面" className="w-full h-full object-cover" /> : <ImageIcon className="w-6 h-6" />}
                                </div>

                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />

                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                    className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1.5 rounded transition-colors flex-shrink-0 flex items-center gap-1 disabled:opacity-50"
                                >
                                    {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                                    {uploading ? '上传中...' : '默认封面'}
                                </button>

                                <input
                                    type="text"
                                    name="img"
                                    value={form.img}
                                    onChange={handleChange}
                                    className="flex-1 border rounded p-2 text-sm outline-none"
                                    placeholder="图片URL"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start">
                        <label className="w-20 flex-shrink-0 text-sm text-gray-700 text-right pr-3 pt-1.5">内容摘要</label>
                        <textarea name="description" value={form.description} onChange={handleChange} rows={2} className="flex-1 border rounded p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none resize-none" />
                    </div>

                    <div className="flex items-start">
                        <label className="w-20 flex-shrink-0 text-sm text-gray-700 text-right pr-3 pt-1.5">文章内容</label>
                        <div className="flex-1 border rounded overflow-hidden">
                            <div className="max-h-[600px] overflow-y-auto">
                                <RichTextEditor ref={editorRef} minHeight={400} imgUploadPath='uploads' isAdmin={true} />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t mt-4">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">自动页面</span>
                                <input type="number" name="orderBy" value={form.orderBy} onChange={handleChange} className="w-16 border rounded p-1 text-sm text-center" />
                                <span className="text-sm text-gray-500">张图</span>
                            </div>
                            <label className="flex items-center gap-1 text-sm text-gray-500 cursor-pointer">
                                <input type="checkbox" className="rounded text-blue-600" /> 提取描述
                            </label>
                            <label className="flex items-center gap-1 text-sm text-gray-500 cursor-pointer">
                                <input type="checkbox" className="rounded text-blue-600" /> 提取文章描述
                            </label>
                        </div>

                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-500">是否显示</span>
                            <label className="flex items-center gap-1 text-sm cursor-pointer">
                                <input type="radio" name="status" value="0" checked={Number(form.status) === 0} onChange={handleChange} className="w-4 h-4 text-blue-600" /> 发布
                            </label>
                            <label className="flex items-center gap-1 text-sm cursor-pointer">
                                <input type="radio" name="status" value="1" checked={Number(form.status) === 1} onChange={handleChange} className="w-4 h-4 text-blue-600" /> 不发布
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-start mt-4">
                        <button onClick={handleSave} disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded text-sm disabled:opacity-50">
                            {submitting ? '保存中...' : '保存'}
                        </button>
                    </div>
                </div>
            )}

            {/* 扩展信息 Tab */}
            {activeTab === 'extend' && (
                <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center">
                            <label className="w-20 flex-shrink-0 text-sm text-gray-700 text-right pr-3">短标题</label>
                            <input name="shortTitle" value={form.shortTitle} onChange={handleChange} className="flex-1 border rounded p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none" />
                        </div>
                        <div className="flex items-center">
                            <label className="w-20 flex-shrink-0 text-sm text-gray-700 text-right pr-3">内容模板</label>
                            <select name="articleView" value={form.articleView} onChange={handleChange} className="flex-1 border rounded p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none">
                                <option value="">请选择模板</option>
                                <option value="article.html">article.html</option>
                            </select>
                        </div>
                        <div className="flex items-center">
                            <label className="w-20 flex-shrink-0 text-sm text-gray-700 text-right pr-3">来源</label>
                            <input name="source" value={form.source} onChange={handleChange} className="flex-1 border rounded p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none" />
                        </div>
                        <div className="flex items-center">
                            <label className="w-20 flex-shrink-0 text-sm text-gray-700 text-right pr-3">作者</label>
                            {/* ✅ 默认值会从 initialForm 中读取，并显示在输入框中 */}
                            <input
                                name="author"
                                value={form.author?.name || ''}
                                onChange={e => setForm({ ...form, author: { ...form.author, name: e.target.value } })}
                                className="flex-1 border rounded p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div className="flex items-center">
                            <label className="w-20 flex-shrink-0 text-sm text-gray-700 text-right pr-3">外链跳转</label>
                            <input name="link" value={form.link} onChange={handleChange} className="flex-1 border rounded p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none" />
                        </div>
                        <div className="flex items-center">
                            <label className="w-20 flex-shrink-0 text-sm text-gray-700 text-right pr-3">浏览量</label>
                            <input name="pv" value={form.pv} onChange={handleChange} className="flex-1 border rounded p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none bg-gray-50 text-gray-500" readOnly />
                        </div>
                    </div>
                    <div className="flex justify-start mt-6">
                        <button onClick={handleSave} disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded text-sm disabled:opacity-50">
                            {submitting ? '保存中...' : '保存'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}