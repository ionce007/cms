// components/frontend/RequireLoginModal.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface RequireLoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    /** 操作名称，如"点赞"、"收藏"、"下载" */
    action?: string;
}

export default function RequireLoginModal({
    isOpen,
    onClose,
    action = '此操作',
}: RequireLoginModalProps) {
    const router = useRouter();

    // Esc 关闭
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // 锁定滚动
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    // ✅ 记住当前页面，登录后跳回
    const redirect = typeof window !== 'undefined'
        ? encodeURIComponent(window.location.pathname)
        : '/';

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            {/* 遮罩 */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />

            {/* 弹窗 */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden animate-scale-in">
                {/* 头部 */}
                <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                        请先登录
                    </h3>
                    <p className="text-sm text-gray-500">
                        {action}需要登录后才能操作
                    </p>
                </div>

                {/* 操作 */}
                <div className="px-6 pb-6 space-y-3">
                    <Link
                        href={`/login?redirect=${redirect}`}
                        className="block w-full py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors text-center"
                    >
                        去登录
                    </Link>
                    <Link
                        href={`/register?redirect=${redirect}`}
                        className="block w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-center"
                    >
                        注册新账号
                    </Link>
                    <button
                        onClick={onClose}
                        className="block w-full py-2.5 text-gray-500 hover:text-gray-700 text-sm transition-colors"
                    >
                        暂不登录
                    </button>
                </div>
            </div>
        </div>
    );
}