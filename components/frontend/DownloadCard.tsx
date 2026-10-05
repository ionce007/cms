// components/frontend/DownloadCard.tsx
'use client';

import Link from 'next/link';
import SafeImage from './SafeImage';
import CoverImage from './CoverImage';
import { formatFileSize, formatTimestamp } from '@/config/constants';
import { API_BASE_URL } from '@/config/env';
import { API_ENDPOINTS } from '@/config/routes'
import { cn } from '@/lib/utils';

interface DownloadCardProps {
    item: any;
    index?: number;
}

export default function DownloadCard({ item, index = 0 }: DownloadCardProps) {
    // ✅ 用 hasContent 判断是否有详情
    const hasDetail = true;// item.hasContent === true;
    const detailUrl = `/downloads/${item.fs_id}`;
    const downloadUrl = `${API_BASE_URL}${API_ENDPOINTS.FORMULA_DETAIL(item.fs_id)}/download`;

    return (
        <article
            className={cn(
                'bg-white rounded-xl border border-gray-200 overflow-hidden',
                'hover:shadow-lg hover:border-primary-200 transition-all duration-300 group',
                'animate-slide-up'
            )}
            style={{ animationDelay: `${index * 50}ms` }}
        >
            {/* 封面图 - 只有详情时才可点击 */}
            {hasDetail ? (
                <Link
                    href={detailUrl}
                    className="block relative overflow-hidden aspect-video bg-gray-100 cursor-pointer"
                >
                    <CoverImage
                        src={item.img}
                        alt={item.server_filename}
                        aspectRatio="video"
                        objectFit="cover"
                        fallbackIcon="📄"
                        className="group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* 分类标签 */}
                    <div className="absolute top-3 left-3 pointer-events-none">
                        <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium rounded-full shadow-sm">
                            {item.kind || '文件'}
                        </span>
                    </div>
                    {/* 价格标签 */}
                    {item.isSell === 0 ? (
                        <div className="absolute top-3 right-3 pointer-events-none">
                            <span className="px-2 py-1 bg-green-400/90 text-white text-xs font-medium rounded-full shadow-sm">
                                免费
                            </span>
                        </div>
                    ) : item.price > 0 ? (
                        <div className="absolute top-3 right-3 pointer-events-none">
                            <span className="px-2 py-1 bg-orange-400/90 text-white text-xs font-medium rounded-full shadow-sm">
                                ¥{item.price}
                            </span>
                        </div>
                    ) : null}
                </Link>
            ) : (
                <div className="block relative overflow-hidden aspect-video bg-gray-100">
                    <SafeImage
                        src={item.img}
                        alt={item.server_filename}
                        className="w-full h-full object-cover"
                        fallbackIcon="📄"
                    />
                    <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium rounded-full shadow-sm">
                            {item.kind || '文件'}
                        </span>
                    </div>
                    {item.isSell === 0 ? (
                        <div className="absolute top-3 right-3">
                            <span className="px-2 py-1 bg-green-400/90 text-white text-xs font-medium rounded-full shadow-sm">
                                免费
                            </span>
                        </div>
                    ) : item.price > 0 ? (
                        <div className="absolute top-3 right-3">
                            <span className="px-2 py-1 bg-orange-400/90 text-white text-xs font-medium rounded-full shadow-sm">
                                ¥{item.price}
                            </span>
                        </div>
                    ) : null}
                </div>
            )}

            {/* 内容 */}
            <div className="p-5">
                {/* 文件名 */}
                <h3 className="text-base font-semibold text-gray-800 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                    {hasDetail ? (
                        <Link href={detailUrl}>{item.server_filename.substring(0, item.server_filename.lastIndexOf('.'))}</Link>
                    ) : (
                        item.server_filename.substring(0, item.server_filename.lastIndexOf('.'))
                    )}
                </h3>

                {/* 概述 */}
                {item.summary && (
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                        {item.summary}
                    </p>
                )}

                {/* 元信息 */}
                <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                    <span>{formatFileSize(item.size)}</span>
                    <span>{formatTimestamp(item.server_ctime)}</span>
                </div>

                {/* 操作 */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-3 text-xs text-gray-400">
                        <span className="flex items-center space-x-1">
                            <span>👁️</span>
                            <span>{item.views || 0}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                            <span>❤️</span>
                            <span>{item.likes || 0}</span>
                        </span>
                    </div>

                    {hasDetail ? (
                        <Link
                            href={detailUrl}
                            className="inline-flex items-center space-x-1 px-3 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-medium hover:bg-primary-700 transition-colors"
                        >
                            <span>查看详情</span>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    ) : (
                        <a
                            href={downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            <span>下载</span>
                        </a>
                    )}
                </div>
            </div>
        </article>
    );
}