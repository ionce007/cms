// app/admin/formulas/token/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminFetch } from '@/hooks/useAdminFetch';
import { ArrowLeft, Clock } from 'lucide-react';

export default function BaiduTokenPage() {
    const router = useRouter();
    const { adminFetch } = useAdminFetch();
    const [tokenData, setTokenData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchToken() {
            const res = await adminFetch('/admin/formulas/token');
            if (res.code === 1) {
                setTokenData(res.data);
            } else {
                alert(res.message);
            }
            setLoading(false);
        }
        fetchToken();
    }, [adminFetch]);

    const handleBack = () => {
        router.push('/admin/formulas');
    };

    if (loading) return <div className="p-6 text-center text-gray-500">加载中...</div>;
    if (!tokenData) return <div className="p-6 text-center text-gray-500">未找到授权信息</div>;

    // 格式化时间戳
    const formatTime = (timestamp: number) => {
        if (!timestamp) return '';
        const d = new Date(timestamp);
        return d.toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-');
    };

    return (
        <div className="p-4 pb-20">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <button onClick={handleBack} className="hover:text-blue-600 flex items-center gap-1 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> 返回公式列表
                </button>
                <span>/</span>
                <span className="text-gray-800">指标公式-网盘授权</span>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-4xl">
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

                    <div className="flex items-center">
                        <label className="w-28 flex-shrink-0 text-sm text-gray-600 text-right pr-4">刷新Token</label>
                        <input value={tokenData.refresh_token || ''} readOnly className="flex-1 border rounded p-2 text-sm bg-gray-50 text-gray-600 outline-none truncate" />
                    </div>

                    <div className="flex items-center">
                        <label className="w-28 flex-shrink-0 text-sm text-gray-600 text-right pr-4">访问权限</label>
                        <input value={tokenData.scope || ''} readOnly className="flex-1 border rounded p-2 text-sm bg-gray-50 text-gray-600 outline-none" />
                    </div>

                    <div className="flex items-center">
                        <label className="w-28 flex-shrink-0 text-sm text-gray-600 text-right pr-4">备注说明</label>
                        <input value={tokenData.remark || ''} readOnly className="flex-1 border rounded p-2 text-sm bg-gray-50 text-gray-600 outline-none" />
                    </div>

                    <div className="flex items-center">
                        <label className="w-28 flex-shrink-0 text-sm text-gray-600 text-right pr-4">到期时间</label>
                        <div className="flex-1 flex items-center border rounded p-2 bg-gray-50 text-gray-600 text-sm">
                            <Clock className="w-4 h-4 mr-2 text-gray-400" /> {formatTime(tokenData.expires_in * 1000 + new Date(tokenData.createdAt).getTime())}
                        </div>
                    </div>

                    <div className="flex items-center">
                        <label className="w-28 flex-shrink-0 text-sm text-gray-600 text-right pr-4">上次授权时间</label>
                        <div className="flex-1 flex items-center border rounded p-2 bg-gray-50 text-gray-600 text-sm">
                            <Clock className="w-4 h-4 mr-2 text-gray-400" /> {formatTime(new Date(tokenData.updatedAt).getTime())}
                        </div>
                    </div>

                    <div className="flex items-center">
                        <label className="w-28 flex-shrink-0 text-sm text-gray-600 text-right pr-4">首次授权时间</label>
                        <div className="flex-1 flex items-center border rounded p-2 bg-gray-50 text-gray-600 text-sm">
                            <Clock className="w-4 h-4 mr-2 text-gray-400" /> {formatTime(new Date(tokenData.createdAt).getTime())}
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-start pl-28">
                    <button
                        onClick={handleBack}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-2 rounded text-sm transition-colors"
                    >
                        授权
                    </button>
                </div>
            </div>
        </div>
    );
}