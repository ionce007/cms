// app/admin/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAdminFetch } from '@/hooks/useAdminFetch';
import { Settings, Globe, Cloud, Save, Loader2 } from 'lucide-react';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<'config' | 'site'>('config');
    const { adminFetch } = useAdminFetch();

    // 表单状态
    const [configForm, setConfigForm] = useState<any>({});
    const [siteForm, setSiteForm] = useState<any>({});

    const [loading, setLoading] = useState(true);
    const [savingConfig, setSavingConfig] = useState(false);
    const [savingSite, setSavingSite] = useState(false);

    // 初始化获取数据
    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const [resConfig, resSite] = await Promise.all([
                    adminFetch('/admin/settings/config'),
                    adminFetch('/admin/settings/site')
                ]);

                if (resConfig.code === 1 && resConfig.data) {
                    setConfigForm(resConfig.data);
                }

                if (resSite.code === 1 && resSite.data) {
                    // ✅ 如果 json 字段是对象，先格式化为字符串方便在 textarea 中编辑
                    const siteData = resSite.data;
                    if (siteData.json && typeof siteData.json === 'object') {
                        siteData.json = JSON.stringify(siteData.json, null, 2);
                    }
                    setSiteForm(siteData);
                }
            } catch (err) {
                console.error('获取设置数据异常', err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [adminFetch]);

    // 更新表单
    const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setConfigForm((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleSiteChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setSiteForm((prev: any) => ({ ...prev, [name]: value }));
    };

    // 保存配置
    const handleSaveConfig = async () => {
        setSavingConfig(true);
        const res = await adminFetch('/admin/settings/config', {
            method: 'PUT',
            body: JSON.stringify(configForm)
        });
        setSavingConfig(false);
        if (res.code === 1) alert('网站配置已保存');
        else alert(res.message);
    };

    // 保存信息
    const handleSaveSite = async () => {
        setSavingSite(true);

        // ✅ 保存前，尝试把 JSON 字符串转回对象
        let submitData = { ...siteForm };
        if (submitData.json && typeof submitData.json === 'string') {
            try {
                submitData.json = JSON.parse(submitData.json);
            } catch (err) {
                setSavingSite(false);
                return alert('JSON 配置格式错误，请检查语法（必须是合法的 JSON 对象）');
            }
        }

        const res = await adminFetch('/admin/settings/site', {
            method: 'PUT',
            body: JSON.stringify(submitData)
        });
        setSavingSite(false);
        if (res.code === 1) alert('网站信息已保存');
        else alert(res.message);
    };

    if (loading) return <div className="p-10 text-center text-gray-500">加载设置项中...</div>;

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" /> 系统设置
            </h1>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-4 bg-white">
                {[
                    { id: 'config', label: '网站配置', icon: Cloud },
                    { id: 'site', label: '网站信息', icon: Globe },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" /> {tab.label}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-4xl">

                {/* ==================== 网站配置 Tab ==================== */}
                {activeTab === 'config' && (
                    <div className="space-y-6">
                        <div className="border-b pb-4">
                            <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2"><Cloud className="w-4 h-4" /> 七牛云配置</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center">
                                    <label className="w-24 flex-shrink-0 text-sm text-gray-700 text-right pr-3">AccessKey</label>
                                    <input type="text" name="accessKey" value={configForm.accessKey || ''} onChange={handleConfigChange} className="flex-1 border rounded p-2 text-sm outline-none focus:ring-1 focus:ring-blue-500" />
                                </div>
                                <div className="flex items-center">
                                    <label className="w-24 flex-shrink-0 text-sm text-gray-700 text-right pr-3">SecretKey</label>
                                    <input type="password" name="secretKey" value={configForm.secretKey || ''} onChange={handleConfigChange} className="flex-1 border rounded p-2 text-sm outline-none focus:ring-1 focus:ring-blue-500" />
                                </div>
                                <div className="flex items-center">
                                    <label className="w-24 flex-shrink-0 text-sm text-gray-700 text-right pr-3">空间名称</label>
                                    <input type="text" name="bucket" value={configForm.bucket || ''} onChange={handleConfigChange} className="flex-1 border rounded p-2 text-sm outline-none focus:ring-1 focus:ring-blue-500" />
                                </div>
                                <div className="flex items-center">
                                    <label className="w-24 flex-shrink-0 text-sm text-gray-700 text-right pr-3">加速域名</label>
                                    <input type="text" name="domain" value={configForm.domain || ''} onChange={handleConfigChange} className="flex-1 border rounded p-2 text-sm outline-none focus:ring-1 focus:ring-blue-500" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2"><Settings className="w-4 h-4" /> 其他配置</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center">
                                    <label className="w-24 flex-shrink-0 text-sm text-gray-700 text-right pr-3">上传方式</label>
                                    <select name="uploadWay" value={configForm.uploadWay || '2'} onChange={handleConfigChange} className="flex-1 border rounded p-2 text-sm outline-none bg-white">
                                        <option value="1">本地服务器普通上传</option>
                                        <option value="2">七牛云对象存储</option>
                                    </select>
                                </div>
                                <div className="flex items-center">
                                    <label className="w-24 flex-shrink-0 text-sm text-gray-700 text-right pr-3">默认模板</label>
                                    <input type="text" name="template" value={configForm.template || 'default'} onChange={handleConfigChange} className="flex-1 border rounded p-2 text-sm outline-none focus:ring-1 focus:ring-blue-500" />
                                </div>
                                <div className="flex items-center">
                                    <label className="w-24 flex-shrink-0 text-sm text-gray-700 text-right pr-3">小程序APPID</label>
                                    <input type="text" name="appid" value={configForm.appid || ''} onChange={handleConfigChange} className="flex-1 border rounded p-2 text-sm outline-none focus:ring-1 focus:ring-blue-500" />
                                </div>
                                <div className="flex items-center">
                                    <label className="w-24 flex-shrink-0 text-sm text-gray-700 text-right pr-3">小程序SECRET</label>
                                    <input type="password" name="secret" value={configForm.secret || ''} onChange={handleConfigChange} className="flex-1 border rounded p-2 text-sm outline-none focus:ring-1 focus:ring-blue-500" />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t flex justify-start pl-24">
                            <button onClick={handleSaveConfig} disabled={savingConfig} className="bg-blue-600 text-white px-6 py-2 rounded text-sm flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50">
                                {savingConfig ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {savingConfig ? '保存中...' : '保存配置'}
                            </button>
                        </div>
                    </div>
                )}

                {/* ==================== 网站信息 Tab ==================== */}
                {activeTab === 'site' && (
                    <div className="space-y-6">
                        <div className="border-b pb-4">
                            <h2 className="text-base font-bold text-gray-800 mb-4">基本信息</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center">
                                    <label className="w-24 flex-shrink-0 text-sm text-gray-700 text-right pr-3">网站名称</label>
                                    <input type="text" name="name" value={siteForm.name || ''} onChange={handleSiteChange} className="flex-1 border rounded p-2 text-sm outline-none" />
                                </div>
                                <div className="flex items-center">
                                    <label className="w-24 flex-shrink-0 text-sm text-gray-700 text-right pr-3">网站域名</label>
                                    <input type="text" name="domain" value={siteForm.domain || ''} onChange={handleSiteChange} className="flex-1 border rounded p-2 text-sm outline-none" />
                                </div>
                                <div className="flex items-center">
                                    <label className="w-24 flex-shrink-0 text-sm text-gray-700 text-right pr-3">联系邮箱</label>
                                    <input type="email" name="email" value={siteForm.email || ''} onChange={handleSiteChange} className="flex-1 border rounded p-2 text-sm outline-none" />
                                </div>
                                <div className="flex items-center">
                                    <label className="w-24 flex-shrink-0 text-sm text-gray-700 text-right pr-3">ICP备案号</label>
                                    <input type="text" name="icp" value={siteForm.icp || ''} onChange={handleSiteChange} className="flex-1 border rounded p-2 text-sm outline-none" />
                                </div>
                                {/* ✅ 已移除公安备案 (wx) */}
                            </div>
                        </div>

                        <div>
                            <h2 className="text-base font-bold text-gray-800 mb-4">SEO 优化</h2>
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <label className="w-24 flex-shrink-0 text-sm text-gray-700 text-right pr-3">站点标题</label>
                                    <input type="text" name="title" value={siteForm.title || ''} onChange={handleSiteChange} className="flex-1 border rounded p-2 text-sm outline-none" />
                                </div>
                                <div className="flex items-start">
                                    <label className="w-24 flex-shrink-0 text-sm text-gray-700 text-right pr-3 pt-2">关键词</label>
                                    <textarea name="keywords" value={siteForm.keywords || ''} onChange={handleSiteChange} rows={2} className="flex-1 border rounded p-2 text-sm outline-none resize-none" placeholder="多个关键词用英文逗号隔开" />
                                </div>
                                <div className="flex items-start">
                                    <label className="w-24 flex-shrink-0 text-sm text-gray-700 text-right pr-3 pt-2">站点描述</label>
                                    <textarea name="description" value={siteForm.description || ''} onChange={handleSiteChange} rows={3} className="flex-1 border rounded p-2 text-sm outline-none resize-none" />
                                </div>
                            </div>
                        </div>

                        {/* ✅ 新增：站点配置 JSON */}
                        <div className="pt-4 border-t">
                            <h2 className="text-base font-bold text-gray-800 mb-4">高级配置</h2>
                            <div className="flex items-start">
                                <label className="w-24 flex-shrink-0 text-sm text-gray-700 text-right pr-3 pt-2">站点 JSON</label>
                                <textarea
                                    name="json"
                                    value={siteForm.json || ''}
                                    onChange={handleSiteChange}
                                    rows={6}
                                    className="flex-1 border rounded p-2 text-sm font-mono outline-none resize-y bg-gray-50 focus:bg-white"
                                    placeholder='{ "key": "value" }'
                                />
                            </div>
                            <p className="text-xs text-gray-400 pl-24 mt-2">提示：请输入合法的 JSON 格式配置。</p>
                        </div>

                        <div className="pt-4 border-t flex justify-start pl-24">
                            <button onClick={handleSaveSite} disabled={savingSite} className="bg-blue-600 text-white px-6 py-2 rounded text-sm flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50">
                                {savingSite ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {savingSite ? '保存中...' : '保存信息'}
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}