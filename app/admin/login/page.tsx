// app/admin/login/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Shield, Lock, User } from 'lucide-react';

export default function AdminLoginPage() {
    const router = useRouter();
    const { adminLogin, isAdminLoggedIn } = useAdminAuth();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // 如果已登录，直接跳转仪表盘
    useEffect(() => {
        if (isAdminLoggedIn) {
            router.replace('/admin');
        }
    }, [isAdminLoggedIn, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await adminLogin(username, password);
            router.push('/admin');
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : '登录失败');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    {/* 头部 */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">后台管理登录</h1>
                        <p className="text-sm text-gray-500 mt-2">仅限管理员访问</p>
                    </div>

                    {/* 表单 */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                用户名
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="请输入管理员账号"
                                    required
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm 
                             focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                密码
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="请输入密码"
                                    required
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm 
                             focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 bg-slate-800 text-white rounded-lg font-medium 
                         hover:bg-slate-900 transition-colors disabled:opacity-50"
                        >
                            {isLoading ? '登录中...' : '登录'}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-xs text-gray-400">
                        后台管理系统 v2.0
                    </div>
                </div>
            </div>
        </div>
    );
}