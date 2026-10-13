// app/member/password/PasswordClient.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/config/env';

export default function PasswordClient() {
    const { token } = useAuth();

    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

        setMessage({ type: '', text: '' });

        if (formData.newPassword.length < 6) {
            setMessage({ type: 'error', text: '新密码至少 6 位' });
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setMessage({ type: 'error', text: '两次输入的密码不一致' });
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch(`${API_BASE_URL}/member/password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    oldPassword: formData.oldPassword,
                    newPassword: formData.newPassword,
                }),
            });

            const data = await res.json();

            if (data.code === 1) {
                setMessage({ type: 'success', text: '密码修改成功' });
                setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                setMessage({ type: 'error', text: data.message || '修改失败' });
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
                <h2 className="text-xl font-bold text-gray-800 mb-2">修改密码</h2>
                <p className="text-sm text-gray-500 mb-6">
                    修改密码后需要重新登录
                </p>

                <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            当前密码
                        </label>
                        <input
                            type="password"
                            value={formData.oldPassword}
                            onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
                            placeholder="请输入当前密码"
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            新密码
                        </label>
                        <input
                            type="password"
                            value={formData.newPassword}
                            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                            placeholder="至少 6 位"
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            确认新密码
                        </label>
                        <input
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            placeholder="再次输入新密码"
                            required
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
                        {isLoading ? '提交中...' : '确认修改'}
                    </button>
                </form>
            </div>
        </div>
    );
}