// components/frontend/DownloadListItem.tsx
'use client';

import Link from 'next/link';
import CoverImage from './CoverImage';
import { formatFileSize } from '@/config/constants';
import { API_BASE_URL } from '@/config/env';
import {API_ENDPOINTS} from '@/config/routes';
import { cn } from '@/lib/utils';

interface DownloadListItemProps {
    item: any;
    index?: number;
    linkPrefix?: string;
}

export default function DownloadListItem({
    item,
    index = 0,
    linkPrefix = '/downloads',
}: DownloadListItemProps) {
    const hasDetail = true;//item.hasContent === true;
    const detailUrl = `${linkPrefix}/${item.fs_id}`;
    const downloadUrl = `${API_BASE_URL}${API_ENDPOINTS.FORMULA_DETAIL(item.fs_id)}/download`;
    const isFree = item.isSell === 0 || item.price === 0 || !item.price;

    return (
        <article
            className={cn(
                'bg-white rounded-xl border border-gray-200 overflow-hidden',
                'hover:shadow-lg hover:border-primary-200 transition-all duration-300 group',
                'animate-slide-up'
            )}
            style={{ animationDelay: `${index * 50}ms` }}
        >
            {/* ✅ 关键：固定高度卡片（跟封面图等高） */}
            <div className="flex flex-row h-24 sm:h-32">
                {/* ✅ 封面图：固定宽高 */}
                <Link
                    href={hasDetail ? detailUrl : '#'}
                    className="relative flex-shrink-0 overflow-hidden bg-gray-100
                        w-24 sm:w-32 md:w-36 lg:w-40
                        h-full"
                >
                    <CoverImage
                        src={item.img}
                        alt={item.server_filename}
                        aspectRatio="fill"
                        objectFit="cover"
                        useBlurBackground={false}
                        fallbackIcon="📦"
                        className="w-full h-full"
                    />

                    {/* 类型标签 */}
                    <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 pointer-events-none">
                        <span className="px-1.5 sm:px-2 py-0.5 bg-white/90 backdrop-blur-sm text-gray-700 text-[10px] sm:text-xs font-medium rounded-full shadow-sm">
                            {item.kind || '文件'}
                        </span>
                    </div>

                    {/* 价格标签 */}
                    <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 pointer-events-none">
                        {isFree ? (
                            <span className="px-1.5 sm:px-2 py-0.5 bg-green-500/90 text-white text-[10px] sm:text-xs font-bold rounded-full shadow-sm">
                                免费
                            </span>
                        ) : (
                            <span className="px-1.5 sm:px-2 py-0.5 bg-orange-500/90 text-white text-[10px] sm:text-xs font-bold rounded-full shadow-sm">
                                ¥{item.price}
                            </span>
                        )}
                    </div>
                </Link>

                {/* ✅ 内容区：高度固定，超出隐藏 */}
                <div className="flex-1 p-3 sm:p-4 flex flex-col min-w-0 overflow-hidden">
                    {/* 文件名 */}
                    <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-1 group-hover:text-primary-600 transition-colors line-clamp-2 flex-shrink-0">
                        {hasDetail ? (
                            <Link href={detailUrl}>{item.server_filename}</Link>
                        ) : (
                            item.server_filename
                        )}
                    </h3>

                    {/* 概述：撑开剩余空间 */}
                    {item.summary && (
                        <p className="text-xs sm:text-sm text-gray-500 line-clamp-1 sm:line-clamp-2 leading-relaxed flex-1">
                            {item.summary}
                        </p>
                    )}

                    {/* 无 summary 时占位 */}
                    {!item.summary && <div className="flex-1" />}

                    {/* ✅ 底部信息：mt-auto 贴底 */}
                    <div className="flex items-center justify-between gap-2 pt-1.5 sm:pt-2 border-t border-gray-100 mt-auto flex-shrink-0">
                        {/* 作者 */}
                        <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0 flex-shrink-0">
                            <img
                                src={item.author?.avatar || '/img/avatar-default.png'}
                                alt={item.author?.name || '匿名'}
                                className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover ring-2 ring-white flex-shrink-0"
                            />
                            <span className="text-[10px] sm:text-xs font-medium text-gray-700 truncate max-w-[50px] sm:max-w-[80px]">
                                {item.author?.name || '匿名'}
                            </span>
                        </div>

                        {/* 统计信息 */}
                        <div className="flex items-center space-x-2 sm:space-x-3 text-[10px] sm:text-xs text-gray-400 flex-shrink-0">
                            {/* 文件大小 */}
                            <span className="hidden sm:flex items-center space-x-1 whitespace-nowrap">
                                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span>{formatFileSize(item.size || 0)}</span>
                            </span>

                            {/* 浏览量 */}
                            <span className="flex items-center space-x-1 whitespace-nowrap">
                                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                <span>{item.views || 0}</span>
                            </span>

                            {/* 点赞 */}
                            <span className="flex items-center space-x-1 whitespace-nowrap">
                                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill={item.isLiked ? "currentColor": "none"} viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                <span>{item.likes || 0}</span>
                            </span>

                            {/* 收藏 */}
                            <span className="hidden sm:flex items-center space-x-1 whitespace-nowrap">
                                <svg
                                    className="w-3 h-3 sm:w-3.5 sm:h-3.5"
                                    fill={item.isBookmarked ? "currentColor": "none"}
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                                    />
                                </svg>
                                <span>{item.marked || 0}</span>
                            </span>

                            {/* 下载次数 */}
                            <span className="hidden sm:flex items-center space-x-1 whitespace-nowrap">
                                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill={ item.isDownloaded ? "currentColor" : "none" } viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                <span>{item.downloads || 0}</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
}