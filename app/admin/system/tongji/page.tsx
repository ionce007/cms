// app/admin/tongji/page.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAdminFetch } from '@/hooks/useAdminFetch';
import { ArrowLeft, Clock, Key } from 'lucide-react';
import BaiduAuthModal from '@/components/admin/BaiduAuthModal';
import { usePermission } from '@/hooks/usePermission';

function TongjiContent() {
    const { hasPermission } = usePermission();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { adminFetch } = useAdminFetch();

    const [tokenData, setTokenData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [authUrl, setAuthUrl] = useState('');

    const fetchToken = async () => {
        setLoading(true);
        try {
            const res = await adminFetch('/admin/bdtongji/auth/token');
            if (res.code === 1 && res.data) {
                setTokenData(res.data);
            } else {
                setTokenData(null);
                const urlRes = await adminFetch('/admin/bdtongji/auth/url');
                if (urlRes.code === 1 && urlRes.data.url) {
                    setAuthUrl(urlRes.data.url);
                    setIsModalOpen(true);
                }
            }
        } catch (err) {
            console.error('获取授权状态失败', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const authStatus = searchParams.get('auth');
        if (authStatus === 'success') {
            alert('百度统计授权成功！');
            router.replace('/admin/tongji');
        } else if (authStatus === 'fail') {
            alert('百度统计授权失败，请重试');
            router.replace('/admin/tongji');
        }
    }, [searchParams, router]);

    useEffect(() => {
        fetchToken();
    }, []);

    const formatTime = (timestamp: number | string) => {
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

    const handleOpenAuth = async () => {
        const urlRes = await adminFetch('/admin/bdtongji/auth/url');
        if (urlRes.code === 1 && urlRes.data.url) {
            setAuthUrl(urlRes.data.url);
            setIsModalOpen(true);
        } else {
            alert('获取授权链接失败');
        }
    };

    if (loading) {
        return <div className="p-10 text-center text-gray-500">加载授权状态中...</div>;
    }

    return (
        <div className="p-4 pb-20">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <span className="text-gray-800">百度统计授权</span>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-4xl">
                {!tokenData ? (
                    <div className="text-center py-10">
                        <p className="text-gray-500 mb-4">尚未授权百度统计</p>
                        {hasPermission('tongji', 'edit') && (<button
                            onClick={handleOpenAuth}
                            className="bg-blue-600 text-white px-6 py-2 rounded text-sm flex items-center gap-2 mx-auto hover:bg-blue-700 transition-colors"
                        >
                            <Key className="w-4 h-4" /> 立即授权
                        </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center">
                            <label className="w-28 flex-shrink-0 text-sm text-gray-600 text-right pr-4">供应商</label>
                            <input value="百度统计" readOnly className="flex-1 border rounded p-2 text-sm bg-gray-50 text-gray-600 outline-none" />
                        </div>
                        <div className="flex items-center">
                            <label className="w-28 flex-shrink-0 text-sm text-gray-600 text-right pr-4">授权Token</label>
                            <input value={tokenData.access_token || ''} readOnly className="flex-1 border rounded p-2 text-sm bg-gray-50 text-gray-600 outline-none truncate" />
                        </div>
                        <div className="flex items-center">
                            <label className="w-28 flex-shrink-0 text-sm text-gray-600 text-right pr-4">有效期</label>
                            <input value={`${tokenData.expires_in} 秒`} readOnly className="flex-1 border rounded p-2 text-sm bg-gray-50 text-gray-600 outline-none" />
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
                            <label className="w-28 flex-shrink-0 text-sm text-gray-600 text-right pr-4">上次授权时间</label>
                            <div className="flex-1 flex items-center border rounded p-2 bg-gray-50 text-gray-600 text-sm">
                                <Clock className="w-4 h-4 mr-2 text-gray-400" />
                                {tokenData.updatedAt ? formatTime(new Date(tokenData.updatedAt).getTime()) : '未知'}
                            </div>
                        </div>

                        <div className="mt-6 flex justify-start pl-28">
                            {hasPermission('tongji', 'edit') && (<button
                                onClick={handleOpenAuth}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded text-sm flex items-center gap-2 transition-colors"
                            >
                                <Key className="w-4 h-4" /> 重新授权
                            </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <BaiduAuthModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                authUrl={authUrl}
                title="百度统计授权"
                submitApi="/admin/bdtongji/auth"
                onSuccess={() => {
                    fetchToken();
                }}
            />
        </div>
    );
}

export default function BaiduTongjiPage() {
    return (
        <Suspense fallback={<div className="p-6 text-center text-gray-500">加载页面中...</div>}>
            <TongjiContent />
        </Suspense>
    );
}