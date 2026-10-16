// app/member/password/page.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMemberFetch } from '@/hooks/useMemberFetch';

interface PasswordForm {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export default function ChangePasswordPage() {
    const { isLoggedIn, isLoading: authLoading } = useAuth();
    const { memberFetch } = useMemberFetch();

    const [form, setForm] = useState<PasswordForm>({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleChange = (key: keyof PasswordForm, value: string) => {
        setForm(prev => ({ ...prev, [key]: value }));
        // 清空上一次的错误和成功提示
        setError('');
        setSuccess(false);
    };

    const validate = (): string => {
        if (!form.oldPassword) return '请输入当前密码';
        if (!form.newPassword) return '请输入新密码';
        if (form.newPassword.length < 6) return '新密码至少 6 位';
        if (form.newPassword === form.oldPassword) return '新密码不能与当前密码相同';
        if (form.newPassword !== form.confirmPassword) return '两次输入的新密码不一致';
        return '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 前端校验
        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        if (!isLoggedIn) {
            setError('未登录，请先登录');
            return;
        }

        setSubmitting(true);
        setError('');
        setSuccess(false);

        const result = await memberFetch('/member/password', {
            method: 'PUT',
            body: JSON.stringify({
                oldPassword: form.oldPassword,
                newPassword: form.newPassword,
            }),
        });

        if (result.ok) {
            setSuccess(true);
            // 清空表单
            setForm({
                oldPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
        } else {
            setError(result.message || '修改失败');
        }

        setSubmitting(false);
    };

    // 未登录时提示
    if (!authLoading && !isLoggedIn) {
        return (
            <>
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">修改密码</h1>
                    <p className="text-sm text-gray-500">定期更换密码，保障账号安全</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
                    <div className="text-6xl mb-4">🔒</div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">请先登录</h2>
                    <p className="text-gray-600 mb-6">
                        登录后即可修改账号密码
                    </p>
                    <a
                        href="/login"
                        className="inline-flex items-center gap-1 px-4 py-2 bg-primary-600 
                       text-white rounded-lg text-sm font-medium 
                       hover:bg-primary-700 transition-colors"
                    >
                        去登录
                    </a>
                </div>
            </>
        );
    }

    return (
        <>
            {/* 页面标题 */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">修改密码</h1>
                <p className="text-sm text-gray-500">定期更换密码，保障账号安全</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-md">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* 当前密码 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            当前密码 <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="password"
                            value={form.oldPassword}
                            onChange={e => handleChange('oldPassword', e.target.value)}
                            placeholder="请输入当前密码"
                            autoComplete="current-password"
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm 
                         focus:outline-none focus:ring-2 focus:ring-primary-500 
                         focus:border-transparent"
                        />
                    </div>

                    {/* 新密码 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            新密码 <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="password"
                            value={form.newPassword}
                            onChange={e => handleChange('newPassword', e.target.value)}
                            placeholder="至少 6 位"
                            autoComplete="new-password"
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm 
                         focus:outline-none focus:ring-2 focus:ring-primary-500 
                         focus:border-transparent"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            密码长度至少 6 位，建议包含字母和数字
                        </p>
                    </div>

                    {/* 确认新密码 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            确认新密码 <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="password"
                            value={form.confirmPassword}
                            onChange={e => handleChange('confirmPassword', e.target.value)}
                            placeholder="再次输入新密码"
                            autoComplete="new-password"
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm 
                         focus:outline-none focus:ring-2 focus:ring-primary-500 
                         focus:border-transparent"
                        />
                    </div>

                    {/* 错误提示 */}
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg 
                            text-sm text-red-600 flex items-start gap-2">
                            <svg
                                className="w-4 h-4 mt-0.5 flex-shrink-0"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* 成功提示 */}
                    {success && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg 
                            text-sm text-green-600 flex items-start gap-2">
                            <svg
                                className="w-4 h-4 mt-0.5 flex-shrink-0"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                            <span>密码修改成功！下次登录请使用新密码</span>
                        </div>
                    )}

                    {/* 提交按钮 */}
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-2.5 bg-primary-600 text-white rounded-lg text-sm 
                       font-medium hover:bg-primary-700 transition-colors 
                       disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center justify-center gap-2"
                    >
                        {submitting ? (
                            <>
                                <svg
                                    className="w-4 h-4 animate-spin"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                                <span>提交中...</span>
                            </>
                        ) : (
                            <span>确认修改</span>
                        )}
                    </button>
                </form>
            </div>
        </>
    );
}