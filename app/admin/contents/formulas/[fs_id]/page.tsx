// app/admin/contents/formulas/[fs_id]/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAdminFetch } from '@/hooks/useAdminFetch';
import RichTextEditor, { RichTextEditorHandle } from '@/components/frontend/RichTextEditor';
import { ArrowLeft, Image as ImageIcon, Loader2, Clock } from 'lucide-react';
import { uploadImageToQiniu } from '@/lib/qiniuUpload';
import { getProxiedImageUrl, restoreOriginalImageUrls } from '@/lib/imageProxy';

// 格式化时间戳 (秒/毫秒) 为 YYYY-MM-DD HH:mm:ss
const formatTime = (timestamp: number) => {
    if (!timestamp) return '';
    const d = new Date(timestamp < 10000000000 ? timestamp * 1000 : timestamp);
    return d.toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-');
};

export default function FormulaEditPage() {
    const router = useRouter();
    const params = useParams();
    const fs_id = params.fs_id as string;
    const { adminFetch } = useAdminFetch();
    const editorRef = useRef<RichTextEditorHandle>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const [activeTab, setActiveTab] = useState<'basic' | 'extend'>('basic');
    const [form, setForm] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // 获取详情
    useEffect(() => {
        async function fetchDetail() {
            const res = await adminFetch(`/admin/formulas/${fs_id}`);
            if (res.code === 1) {
                setForm(res.data);
                // 延迟渲染富文本
                setTimeout(() => {
                    if (editorRef.current) editorRef.current.setHtml(res.data.content || '');
                }, 100);
            } else {
                alert(res.message);
                router.push('/admin/contents/formulas');
            }
            setLoading(false);
        }
        if (fs_id) fetchDetail();
    }, [fs_id, adminFetch, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setForm({ ...form, [name]: val });
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) return alert('请选择图片文件');

        setUploading(true);
        try {
            const result = await uploadImageToQiniu(file, 'uploads', true);
            setForm((prev: any) => ({ ...prev, img: result.originalUrl }));
        } catch (err) {
            alert(err instanceof Error ? err.message : '图片上传失败');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleSave = async () => {
        if (!form.server_filename) return alert('文件名称不能为空');

        setSubmitting(true);
        const rawContent = editorRef.current?.getHtml() || '';
        const content = restoreOriginalImageUrls(rawContent);
        const submitData = { ...form, content };

        const res = await adminFetch(`/admin/formulas/${fs_id}`, {
            method: 'PUT',
            body: JSON.stringify(submitData)
        });
        setSubmitting(false);

        if (res.code === 1) {
            alert('保存成功');
            router.push('/admin/contents/formulas');
        } else {
            alert(res.message);
        }
    };

    const handleBack = () => {
        if (window.history.length > 2) router.back();
        else router.push('/admin/contents/formulas');
    };

    if (loading) return <div className="p-6 text-center text-gray-500">加载中...</div>;

    return (
        <div className="p-4 pb-20">
            {/* 顶部面包屑 */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <button onClick={handleBack} className="hover:text-blue-600 flex items-center gap-1 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> 返回公式列表
                </button>
                <span>/</span>
                <span className="text-gray-800">指标公式-更新</span>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-4 bg-white">
                {[{ id: 'basic', label: '基本信息' }, { id: 'extend', label: '扩展信息' }].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'
                            }`}
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
                            <label className="w-20 flex-shrink-0 text-sm text-gray-700 text-right pr-3">文件类型</label>
                            <select name="kind" value={form.kind || ''} onChange={handleChange} disabled className="flex-1 border rounded p-2 text-sm outline-none">
                                <option value="指标公式">指标公式</option>
                                <option value="选股公式">选股公式</option>
                                <option value="经验分享">经验分享</option>
                                <option value="操作说明">操作说明</option>
                            </select>
                        </div>
                        <div className="flex items-center flex-1">
                            <label className="w-20 flex-shrink-0 text-sm text-gray-700 text-right pr-3"><span className="text-red-500 mr-1">*</span>文件名称</label>
                            <input name="server_filename" value={form.server_filename || ''} onChange={handleChange} readOnly className="flex-1 border rounded p-2 text-sm bg-gray-50 outline-none" placeholder="请输入文件名称" />
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex items-center w-full md:w-1/3">
                            <label className="w-20 flex-shrink-0 text-sm text-gray-700 text-right pr-3">是否可售</label>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" name="isSell" checked={form.isSell === 1} onChange={(e) => setForm({ ...form, isSell: e.target.checked ? 1 : 0 })} className="rounded text-blue-600 w-4 h-4" />
                                <span className="text-sm text-gray-700 mr-2">售价</span>
                                <input type="number" name="price" value={form.price || 0} onChange={handleChange} className="w-20 border rounded p-1.5 text-sm outline-none" />
                            </div>
                        </div>
                        <div className="flex items-center flex-1">
                            <label className="w-20 flex-shrink-0 text-sm text-gray-700 text-right pr-3">作者</label>
                            <input value={JSON.stringify(form.author || { name: '缠说・股经', avatar: '/img/avatar.jpg' })} readOnly className="flex-1 border rounded p-2 text-sm bg-gray-50 text-gray-500 outline-none" />
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex items-center w-full md:w-1/3">
                            <label className="w-20 flex-shrink-0 text-sm text-gray-700 text-right pr-3">上传时间</label>
                            <div className="flex-1 flex items-center border rounded p-2 bg-gray-50 text-gray-500 text-sm">
                                <Clock className="w-4 h-4 mr-2" />
                                {formatTime(form.server_ctime)}
                            </div>
                        </div>
                        <div className="flex items-start flex-1">
                            <label className="w-20 flex-shrink-0 text-sm text-gray-700 text-right pr-3 pt-1.5">缩略图</label>
                            <div className="flex items-center gap-3 w-full">
                                <div className="w-16 h-16 border rounded flex items-center justify-center bg-gray-50 text-gray-400 flex-shrink-0 overflow-hidden">
                                    {form.img ? <img src={getProxiedImageUrl(form.img, { forceProxy: true })} alt="封面" className="w-full h-full object-cover" /> : <ImageIcon className="w-6 h-6" />}
                                </div>
                                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
                                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="bg-green-500 text-white text-xs px-3 py-1.5 rounded flex-shrink-0 flex items-center gap-1">
                                    {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                                    {uploading ? '上传中...' : '默认封面图'}
                                </button>
                                <input type="text" name="img" value={form.img || ''} onChange={handleChange} className="flex-1 border rounded p-2 text-sm outline-none" placeholder="图片URL" />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start">
                        <label className="w-20 flex-shrink-0 text-sm text-gray-700 text-right pr-3 pt-1.5">内容摘要</label>
                        <textarea name="summary" value={form.summary || ''} onChange={handleChange} rows={3} className="flex-1 border rounded p-2 text-sm outline-none resize-none" />
                    </div>

                    <div className="flex items-start">
                        <label className="w-20 flex-shrink-0 text-sm text-gray-700 text-right pr-3 pt-1.5">文章内容</label>
                        <div className="flex-1 border rounded overflow-hidden">
                            <div className="max-h-[500px] overflow-y-auto">
                                <RichTextEditor ref={editorRef} minHeight={200} maxHeight={400}/>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t mt-4">
                        <div className="flex items-center gap-6">
                            <label className="flex items-center gap-1 text-sm text-gray-500 cursor-pointer">
                                <input type="checkbox" name="autoCover" className="rounded text-blue-600" /> 自动封面
                            </label>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                文章第 <input type="number" className="w-12 border rounded p-1 text-center outline-none" defaultValue={1} /> 张图
                            </div>
                            <label className="flex items-center gap-1 text-sm text-gray-500 cursor-pointer">
                                <input type="checkbox" className="rounded text-blue-600" /> 自动提取文章概要
                            </label>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-500">是否发布</span>
                            <label className="flex items-center gap-1 text-sm cursor-pointer">
                                <input type="checkbox" name="status" checked={form.status === 1} onChange={(e) => setForm({ ...form, status: e.target.checked ? 1 : 0 })} className="w-4 h-4 text-blue-600 rounded" /> 发布
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-start gap-2 mt-4">
                        <button onClick={handleSave} disabled={submitting} className="bg-blue-500 text-white px-6 py-2 rounded text-sm disabled:opacity-50">保存</button>
                    </div>
                </div>
            )}

            {/* 扩展信息 Tab (只读) */}
            {activeTab === 'extend' && (
                <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="flex items-center">
                            <label className="w-24 flex-shrink-0 text-sm text-gray-700 text-right pr-3">是否目录</label>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" checked={form.isdir === 1} readOnly className="w-4 h-4 rounded text-blue-600 border-gray-300" />
                                <span className="text-sm text-gray-600">是否为目录</span>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <label className="w-24 flex-shrink-0 text-sm text-gray-700 text-right pr-3">文件类型</label>
                            <input value="其他" readOnly className="flex-1 border rounded p-2 text-sm bg-gray-50 text-gray-500 outline-none" />
                        </div>

                        <div className="flex items-center">
                            <label className="w-24 flex-shrink-0 text-sm text-gray-700 text-right pr-3">网盘创建时间</label>
                            <div className="flex-1 flex items-center border rounded p-2 bg-gray-50 text-gray-500 text-sm">
                                <Clock className="w-4 h-4 mr-2" /> {formatTime(form.server_ctime)}
                            </div>
                        </div>
                        <div className="flex items-center">
                            <label className="w-24 flex-shrink-0 text-sm text-gray-700 text-right pr-3">网盘修改时间</label>
                            <div className="flex-1 flex items-center border rounded p-2 bg-gray-50 text-gray-500 text-sm">
                                <Clock className="w-4 h-4 mr-2" /> {formatTime(form.server_mtime)}
                            </div>
                        </div>

                        <div className="flex items-center">
                            <label className="w-24 flex-shrink-0 text-sm text-gray-700 text-right pr-3">本地创建时间</label>
                            <div className="flex-1 flex items-center border rounded p-2 bg-gray-50 text-gray-500 text-sm">
                                <Clock className="w-4 h-4 mr-2" /> {formatTime(form.local_ctime)}
                            </div>
                        </div>
                        <div className="flex items-center">
                            <label className="w-24 flex-shrink-0 text-sm text-gray-700 text-right pr-3">本地修改时间</label>
                            <div className="flex-1 flex items-center border rounded p-2 bg-gray-50 text-gray-500 text-sm">
                                <Clock className="w-4 h-4 mr-2" /> {formatTime(form.local_mtime)}
                            </div>
                        </div>

                        <div className="flex items-center">
                            <label className="w-24 flex-shrink-0 text-sm text-gray-700 text-right pr-3">浏览数量</label>
                            <input value={form.views || 0} readOnly className="flex-1 border rounded p-2 text-sm bg-gray-50 text-gray-500 outline-none" />
                        </div>
                        <div className="flex items-center">
                            <label className="w-24 flex-shrink-0 text-sm text-gray-700 text-right pr-3">喜欢数量</label>
                            <input value={form.likes || 0} readOnly className="flex-1 border rounded p-2 text-sm bg-gray-50 text-gray-500 outline-none" />
                        </div>
                        {/* ✅ 2. 增加下载数量 */}
                        <div className="flex items-center">
                            <label className="w-24 flex-shrink-0 text-sm text-gray-700 text-right pr-3">下载数量</label>
                            <input value={form.downloads || 0} readOnly className="flex-1 border rounded p-2 text-sm bg-gray-50 text-gray-500 outline-none" />
                        </div>
                    </div>

                    <div className="flex justify-start gap-2 mt-8">
                        <button onClick={handleSave} disabled={submitting} className="bg-blue-500 text-white px-6 py-2 rounded text-sm disabled:opacity-50">保存</button>
                    </div>
                </div>
            )}
        </div>
    );
}