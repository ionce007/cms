// components/frontend/ArticleBreadcrumb.tsx
'use client';

import Link from 'next/link';

interface BreadcrumbItem {
    label: string;
    href?: string;
    icon?: string;
}

interface ArticleBreadcrumbProps {
    items: BreadcrumbItem[];
}

export default function ArticleBreadcrumb({ items }: ArticleBreadcrumbProps) {
    return (
        <nav className="flex items-center flex-wrap gap-x-2 gap-y-1 text-sm text-gray-500">
            {items.map((item, index) => {
                const isLast = index === items.length - 1;

                return (
                    <div key={index} className="flex items-center gap-2 min-w-0">
                        {index > 0 && (
                            <span className="text-gray-300 flex-shrink-0">/</span>
                        )}

                        {isLast || !item.href ? (
                            <span className="text-gray-800 font-medium truncate max-w-[200px] sm:max-w-xs">
                                {item.icon && <span className="mr-1">{item.icon}</span>}
                                {item.label}
                            </span>
                        ) : (
                            <Link
                                href={item.href}
                                className="hover:text-primary-600 transition-colors flex items-center gap-1 flex-shrink-0"
                            >
                                {item.icon && <span>{item.icon}</span>}
                                <span>{item.label}</span>
                            </Link>
                        )}
                    </div>
                );
            })}
        </nav>
    );
}