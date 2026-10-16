// app/member/components/MemberStatCards.tsx
'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

interface StatCard {
    key: string;
    label: string;
    icon: string;
    href: string;
    count: number;
    color: 'blue' | 'green' | 'purple' | 'orange';
}

interface MemberStatCardsProps {
    counts: {
        comments: number;
        likes: number;
        favorites: number;
        downloads: number;
    };
}

const COLOR_CLASSES: Record<string, { bg: string; text: string; hover: string }> = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', hover: 'group-hover:bg-blue-100' },
    green: { bg: 'bg-green-50', text: 'text-green-600', hover: 'group-hover:bg-green-100' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', hover: 'group-hover:bg-purple-100' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', hover: 'group-hover:bg-orange-100' },
};

export default function MemberStatCards({ counts }: MemberStatCardsProps) {
    const cards: StatCard[] = [
        {
            key: 'comments',
            label: '我的评论',
            icon: '💬',
            href: '/member/comments',
            count: counts.comments,
            color: 'blue',
        },
        {
            key: 'likes',
            label: '我的点赞',
            icon: '❤️',
            href: '/member/likes',
            count: counts.likes,
            color: 'green',
        },
        {
            key: 'favorites',
            label: '我的收藏',
            icon: '⭐',
            href: '/member/bookmarks',
            count: counts.favorites,
            color: 'purple',
        },
        {
            key: 'downloads',
            label: '我的下载',
            icon: '📥',
            href: '/member/downloads',
            count: counts.downloads,
            color: 'orange',
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map(card => {
                const colors = COLOR_CLASSES[card.color];
                return (
                    <Link
                        key={card.key}
                        href={card.href}
                        className="group bg-white rounded-xl border border-gray-200 p-5 
                       hover:shadow-md hover:border-primary-200 transition-all duration-200"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div
                                className={cn(
                                    'w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-colors',
                                    colors.bg,
                                    colors.hover
                                )}
                            >
                                <span>{card.icon}</span>
                            </div>
                            <svg
                                className="w-5 h-5 text-gray-300 group-hover:text-primary-500 
                           group-hover:translate-x-1 transition-all"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                />
                            </svg>
                        </div>
                        <div>
                            <div className="text-sm text-gray-500 mb-1">{card.label}</div>
                            <div className="text-2xl font-bold text-gray-800">
                                {card.count.toLocaleString()}
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}