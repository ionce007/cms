// app/member/settings/SettingsClient.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/config/env';

export default function SettingsClient() {
    const { user, token, refreshUser } = useAuth();

    const [formData, setFormData] = useState({
        nickname: user?.nickname || '',
        email: user?.email || '',
        avatar: user?.avatar || '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

        setIsLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const res = await fetch(`${API_BASE_URL}/member/me`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (data.code === 1) {
                setMessage({ type: 'success', text: '保存成功' });
                await refreshUser();
            } else {
                setMessage({ type: 'error', text: data.message || '保存失败' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: '网络错误' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">账号设置</h2>

                <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            用户名
                        </label>
                        <input
                            type="text"
                            value={user?.username || ''}
                            disabled
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-400 mt-1">用户名不可修改</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            昵称
                        </label>
                        <input
                            type="text"
                            value={formData.nickname}
                            onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                            placeholder="请输入昵称"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            邮箱
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="your@email.com"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            头像 URL
                        </label>
                        <input
                            type="text"
                            value={formData.avatar}
                            onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                            placeholder="https://..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>

                    {message.text && (
                        <div
                            className={`p-3 rounded-lg text-sm ${
                                message.type === 'success'
                                    ? 'bg-green-50 text-green-700 border border-green-200'
                                    : 'bg-red-50 text-red-700 border border-red-200'
                            }`}
                        >
                            {message.type === 'success' ? '✓' : '⚠️'} {message.text}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? '保存中...' : '保存'}
                    </button>
                </form>
            </div>
        </div>
    );
}