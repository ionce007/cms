// app/member/components/EmptyState.tsx
'use client';

import Link from 'next/link';

interface EmptyStateProps {
    icon?: string;
    title: string;
    description?: string;
    actionLabel?: string;
    actionHref?: string;
}

export default function EmptyState({
    icon = '📭',
    title,
    description,
    actionLabel,
    actionHref,
}: EmptyStateProps) {
    return (
        <div className="py-12 text-center">
            <div className="text-5xl mb-3">{icon}</div>
            <h3 className="text-base font-semibold text-gray-800 mb-1">{title}</h3>
            {description && (
                <p className="text-sm text-gray-500 mb-4">{description}</p>
            )}
            {actionLabel && actionHref && (
                <Link
                    href={actionHref}
                    className="inline-flex items-center gap-1 px-4 py-2 bg-primary-600 
                     text-white rounded-lg text-sm font-medium 
                     hover:bg-primary-700 transition-colors"
                >
                    {actionLabel}
                </Link>
            )}
        </div>
    );
}