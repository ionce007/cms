// app/member/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useMemberUser } from '../MemberLayoutClient';
import { useMemberFetch } from '@/hooks/useMemberFetch';

export default function MemberSettingsPage() {
    const { user, refresh } = useMemberUser();
    const { memberFetch } = useMemberFetch();

    const [form, setForm] = useState({ nickname: '', avatar: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (user) {
            setForm({
                nickname: user.nickname || '',
                avatar: user.avatar || '',
            });
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        const result = await memberFetch('/member/profile', {
            method: 'PUT',
            body: JSON.stringify(form),
        });

        if (result.ok) {
            alert('保存成功');
            await refresh();
        } else {
            alert(result.message || '保存失败');
        }

        setSubmitting(false);
    };

    return (
        <>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">个人设置</h1>
                <p className="text-sm text-gray-500">管理你的个人资料</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-lg">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            昵称
                        </label>
                        <input
                            type="text"
                            value={form.nickname}
                            onChange={e => setForm({ ...form, nickname: e.target.value })}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm 
                         focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            头像 URL
                        </label>
                        <input
                            type="text"
                            value={form.avatar}
                            onChange={e => setForm({ ...form, avatar: e.target.value })}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm 
                         focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-2.5 bg-primary-600 text-white rounded-lg text-sm 
                       font-medium hover:bg-primary-700 transition-colors 
                       disabled:opacity-50"
                    >
                        {submitting ? '保存中...' : '保存'}
                    </button>
                </form>
            </div>
        </>
    );
}