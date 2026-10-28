// components/admin/BaiduAuthModal.tsx
'use client';

import { useState } from 'react';
import { X, Key, Loader2 } from 'lucide-react';
import { useAdminFetch } from '@/hooks/useAdminFetch';

interface BaiduAuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    authUrl: string;
    title?: string; // ✅ 动态标题
    submitApi: string; // ✅ 动态提交接口
    onSuccess: () => void;
}

export default function BaiduAuthModal({
    isOpen,
    onClose,
    authUrl,
    title = '百度授权',
    submitApi,
    onSuccess
}: BaiduAuthModalProps) {
    const [code, setCode] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { adminFetch } = useAdminFetch();

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!code.trim()) return alert('请先粘贴授权码');

        setSubmitting(true);
        try {
            const res = await adminFetch(submitApi, {
                method: 'POST',
                body: JSON.stringify({ code: code.trim() }),
            });

            if (res.code === 1) {
                alert('授权成功！');
                onSuccess();
                onClose();
            } else {
                alert(res.message || '授权失败，请检查授权码是否正确');
            }
        } catch (err) {
            alert('请求异常，请稍后重试');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="absolute inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col h-[85vh] overflow-hidden">

                {/* 头部 */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50 flex-shrink-0">
                    <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                        <Key className="w-5 h-5 text-blue-600" />
                        {title}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* 内容区 */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 w-full bg-gray-100 relative">
                        <iframe
                            src={authUrl}
                            className="w-full h-full border-none bg-white"
                            title={title}
                        />
                    </div>

                    <div className="p-4 bg-white border-t border-gray-200 flex items-center gap-4 flex-shrink-0">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                请复制上方页面显示的 <b>授权码 (Code)</b> 并粘贴于此：
                            </label>
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="例如：60399eff490e161d54f187f8..."
                                className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* 底部按钮 */}
                <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex justify-end gap-2 flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        取消
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || !code.trim()}
                        className="px-5 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5 transition-colors"
                    >
                        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                        {submitting ? '验证中...' : '继续授权'}
                    </button>
                </div>
            </div>
        </div>
    );
}