// app/member/components/MemberUserCard.tsx
'use client';

import { cn } from '@/lib/utils';
import { useMemberUser } from '../MemberLayoutClient';
import SafeImage from '@/components/frontend/SafeImage';

interface MemberUserCardProps {
    /** 紧凑模式（窄屏横向一行显示） */
    compact?: boolean;
}

export default function MemberUserCard({ compact = false }: MemberUserCardProps) {
    const { user, loading } = useMemberUser();

    // 骨架屏
    if (loading) {
        if (compact) {
            return (
                <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-3 animate-pulse">
                    <div className="w-10 h-10 bg-gray-200 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                        <div className="h-3.5 bg-gray-200 rounded w-24" />
                        <div className="h-3 bg-gray-200 rounded w-32" />
                    </div>
                </div>
            );
        }
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-20" />
                        <div className="h-3 bg-gray-200 rounded w-32" />
                    </div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-20" />
            </div>
        );
    }

    if (!user) return null;

    // ✅ 紧凑模式
    if (compact) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-3">
                {/*<img
                    src={user.avatar || '/img/avatar-default-member.jpg'}
                    alt={user.nickname}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />*/}
                <SafeImage
                    src={user?.avatar || '/img/avatar-default-member.png'}
                    alt={user?.nickname || user?.username || '用户'}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-800 truncate">
                        {user.nickname}
                    </div>
                    <div className="text-xs text-gray-500 truncate">{user.email}</div>
                </div>
                {user.level && (
                    <span
                        className={cn(
                            'flex-shrink-0 inline-flex items-center px-2 py-1 text-xs rounded-full',
                            user.isVip
                                ? 'bg-yellow-50 text-yellow-700'
                                : 'bg-primary-50 text-primary-600'
                        )}
                    >
                        {user.level}
                    </span>
                )}
            </div>
        );
    }

    // 常规模式
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-3">
                {/*<img
                    src={user.avatar || '/img/avatar-default-member.jpg'}
                    alt={user.nickname}
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                />*/}
                <SafeImage
                    src={user?.avatar || '/img/avatar-default-member.png'}
                    alt={user?.nickname || user?.username || '用户'}
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                />
                <div className="min-w-0">
                    <div className="text-sm font-semibold text-gray-800 truncate">
                        {user.nickname}
                    </div>
                    <div className="text-xs text-gray-500 truncate">{user.email}</div>
                </div>
            </div>

            {user.level && (
                <span
                    className={cn(
                        'inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full',
                        user.isVip
                            ? 'bg-yellow-50 text-yellow-700'
                            : 'bg-primary-50 text-primary-600'
                    )}
                >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                    </svg>
                    {user.level}
                </span>
            )}
        </div>
    );
}