// app/admin/formulas/token/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminFetch } from '@/hooks/useAdminFetch';
import { ArrowLeft, Clock, Key } from 'lucide-react';
import BaiduAuthModal from '@/components/admin/BaiduAuthModal';

export default function BaiduTokenPage() {
    const router = useRouter();
    const { adminFetch } = useAdminFetch();
    const [tokenData, setTokenData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // ✅ 弹窗状态
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [authUrl, setAuthUrl] = useState('');

    const fetchToken = async () => {
        setLoading(true);
        const res = await adminFetch('/admin/bdpan/auth/token');
        if (res.code === 1) {
            setTokenData(res.data);
        } else {
            setTokenData(null);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchToken();
    }, []);

    const handleOpenAuth = async () => {
        const urlRes = await adminFetch('/admin/bdpan/auth/url');
        if (urlRes.code === 1 && urlRes.url) {
            setAuthUrl(urlRes.url);
            setIsModalOpen(true);
        } else {
            alert('获取授权链接失败');
        }
    };

    const handleBack = () => {
        router.push('/admin/formulas');
    };

    const formatTime = (timestamp: number) => {
        if (!timestamp) return '';
        const d = new Date(timestamp);
        return d.toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-');
    };
    // ✅ 计算过期时间
    const calculateExpireTime = () => {
        if (!tokenData || !tokenData.expires_in) return '未知';

        // 使用上次授权时间（updatedAt 或 createdAt）加上有效期（秒）
        const baseTime = tokenData.updatedAt ? new Date(tokenData.updatedAt).getTime() : new Date(tokenData.createdAt).getTime();
        const expireTime = baseTime + tokenData.expires_in * 1000;

        // 判断是否已过期
        if (Date.now() > expireTime) {
            return `${formatTime(expireTime)} (已过期)`;
        }
        return formatTime(expireTime);
    };
    if (loading) return <div className="p-6 text-center text-gray-500">加载中...</div>;

    return (
        <div className="p-4 pb-20">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                {/*<button onClick={handleBack} className="hover:text-blue-600 flex items-center gap-1 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> 返回公式列表
                </button>
                <span>/</span>*/}
                <span className="text-gray-800">百度网盘授权</span>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-4xl">
                {!tokenData ? (
                    <div className="text-center py-10">
                        <p className="text-gray-500 mb-4">尚未授权百度网盘</p>
                        <button onClick={handleOpenAuth} className="bg-blue-600 text-white px-6 py-2 rounded text-sm flex items-center gap-2 mx-auto hover:bg-blue-700 transition-colors">
                            <Key className="w-4 h-4" /> 立即授权
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center">
                            <label className="w-28 flex-shrink-0 text-sm text-gray-600 text-right pr-4">供应商</label>
                            <input value={tokenData.supplier || ''} readOnly className="flex-1 border rounded p-2 text-sm bg-gray-50 text-gray-600 outline-none" />
                        </div>
                        <div className="flex items-center">
                            <label className="w-28 flex-shrink-0 text-sm text-gray-600 text-right pr-4">授权Token</label>
                            <input value={tokenData.access_token || ''} readOnly className="flex-1 border rounded p-2 text-sm bg-gray-50 text-gray-600 outline-none truncate" />
                        </div>
                        <div className="flex items-center">
                            <label className="w-28 flex-shrink-0 text-sm text-gray-600 text-right pr-4">有效期</label>
                            <input value={tokenData.expires_in || ''} readOnly className="flex-1 border rounded p-2 text-sm bg-gray-50 text-gray-600 outline-none" />
                        </div>
                        {/* ✅ 新增：过期时间展示 */}
                        <div className="flex items-center">
                            <label className="w-28 flex-shrink-0 text-sm text-gray-600 text-right pr-4">过期时间</label>
                            <div className="flex-1 flex items-center border rounded p-2 bg-gray-50 text-gray-600 text-sm">
                                <Clock className="w-4 h-4 mr-2 text-gray-400" />
                                {calculateExpireTime()}
                            </div>
                        </div>
                        <div className="flex items-center">
                            <label className="w-28 flex-shrink-0 text-sm text-gray-600 text-right pr-4">刷新Token</label>
                            <input value={tokenData.refresh_token || ''} readOnly className="flex-1 border rounded p-2 text-sm bg-gray-50 text-gray-600 outline-none truncate" />
                        </div>
                        <div className="flex items-center">
                            <label className="w-28 flex-shrink-0 text-sm text-gray-600 text-right pr-4">访问权限</label>
                            <input value={tokenData.scope || ''} readOnly className="flex-1 border rounded p-2 text-sm bg-gray-50 text-gray-600 outline-none" />
                        </div>
                        <div className="flex items-center">
                            <label className="w-28 flex-shrink-0 text-sm text-gray-600 text-right pr-4">授权时间</label>
                            <div className="flex-1 flex items-center border rounded p-2 bg-gray-50 text-gray-600 text-sm">
                                <Clock className="w-4 h-4 mr-2 text-gray-400" /> {formatTime(new Date(tokenData.updatedAt).getTime())}
                            </div>
                        </div>

                        <div className="mt-6 flex justify-start pl-28">
                            <button onClick={handleOpenAuth} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded text-sm flex items-center gap-2 transition-colors">
                                <Key className="w-4 h-4" /> 重新授权
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ✅ 挂载弹窗，传入网盘的专用提交接口 */}
            <BaiduAuthModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                authUrl={authUrl}
                title="百度网盘授权"
                submitApi="/admin/bdpan/auth"
                onSuccess={() => {
                    fetchToken();
                }}
            />
        </div>
    );
}