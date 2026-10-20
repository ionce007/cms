// components/frontend/DownloadCard.tsx
'use client';

import Link from 'next/link';
import CoverImage from './CoverImage';
import { formatFileSize, formatTimestamp } from '@/config/constants';
import { API_BASE_URL } from '@/config/env';
import { API_ENDPOINTS } from '@/config/routes';
import { cn } from '@/lib/utils';

interface DownloadCardProps {
    item: any;
    index?: number;
    linkPrefix?: string;
}

export default function DownloadCard({
    item,
    index = 0,
    linkPrefix = '/downloads',
}: DownloadCardProps) {
    // ✅ 判断是否有详情内容
    const hasDetail = item.hasContent === true;
    const detailUrl = `${linkPrefix}/${item.fs_id}`;
    const downloadUrl = `${API_BASE_URL}${API_ENDPOINTS.FORMULA_DETAIL(item.fs_id)}/download`;

    // ✅ 判断是否免费
    const isFree = item.isSell === 0 || item.price === 0 || !item.price;

    return (
        <article
            className={cn(
                'bg-white rounded-xl border border-gray-200 overflow-hidden',
                'hover:shadow-lg hover:border-primary-200 transition-all duration-300 group',
                'flex flex-col',      // ✅ 关键1：flex 纵向布局
                'h-full',             // ✅ 关键2：撑满父容器（配合 Grid 对齐）
                'animate-slide-up'
            )}
            style={{ animationDelay: `${index * 50}ms` }}
        >
            {/* ========== 封面图 ========== */}
            <Link
                href={hasDetail ? detailUrl : detailUrl}
                className="block relative overflow-hidden aspect-video flex-shrink-0 bg-gray-100"
            >
                <CoverImage
                    src={item.img}
                    alt={item.server_filename}
                    aspectRatio="fill"
                    objectFit="cover"
                    useBlurBackground={false}
                    fallbackIcon="📄"
                    className="w-full h-full"
                />
                {/* 类型标签 */}
                <div className="absolute top-3 left-3 pointer-events-none">
                    <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium rounded-full shadow-sm">
                        {item.kind || '文件'}
                    </span>
                </div>

                {/* 价格标签 */}
                <div className="absolute top-3 right-3 pointer-events-none">
                    {isFree ? (
                        <span className="px-2 py-1 bg-green-500/90 text-white text-xs font-bold rounded-full shadow-sm">
                            免费
                        </span>
                    ) : (
                        <span className="px-2 py-1 bg-orange-500/90 text-white text-xs font-bold rounded-full shadow-sm">
                            ¥{item.price}
                        </span>
                    )}
                </div>
            </Link>

            {/* ========== 内容区 - flex-1 撑满 ========== */}
            <div className="flex-1 flex flex-col p-5">
                {/* 文件名 - 限制 2 行 */}
                <h3 className="text-base font-semibold text-gray-800 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2 flex-shrink-0">
                    {/*{hasDetail ? (
                        <Link href={detailUrl}>{item.server_filename.substring(0, item.server_filename.lastIndexOf('.'))}</Link>
                    ) : (
                        item.server_filename.substring(0, item.server_filename.lastIndexOf('.'))
                    )}*/}
                    <Link href={detailUrl}>{item.server_filename.substring(0, item.server_filename.lastIndexOf('.'))}</Link>
                </h3>

                {/* 概述 - flex-1 撑开剩余空间 */}
                <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed flex-1">
                    {item.summary || '暂无描述'}
                </p>

                {/* ✅ 关键3：底部信息区用 mt-auto 贴底 */}
                <div className="mt-auto pt-4 border-t border-gray-100">
                    {/* 作者 + 统计信息 */}
                    <div className="flex items-center justify-between gap-3">
                        {/* 作者 */}
                        <div className="flex items-center space-x-2 min-w-0 flex-shrink-0">
                            <img
                                src={item.author?.avatar || '/img/avatar-default.png'}
                                alt={item.author?.name || '匿名'}
                                className="w-7 h-7 rounded-full object-cover ring-2 ring-white flex-shrink-0"
                            />
                            <span className="text-xs font-medium text-gray-700 truncate max-w-[70px]">
                                {item.author?.name || '匿名'}
                            </span>
                        </div>

                        {/* ✅ 统计信息统一尺寸和间距 */}
                        <div className="flex items-center space-x-2.5 text-xs text-gray-400 flex-shrink-0">
                            {/* 文件大小 */}
                            {/*<span className="flex items-center space-x-1 whitespace-nowrap">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span>{formatFileSize(item.size || 0)}</span>
                            </span>*/}

                            {/* 浏览量 */}
                            <span className="flex items-center space-x-1 whitespace-nowrap">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                <span>{item.views || 0}</span>
                            </span>

                            {/* 点赞数 */}
                            <span className="flex items-center space-x-1 whitespace-nowrap">
                                <svg className="w-3.5 h-3.5" fill={item.isLiked ? "currentColor": "none"} viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                <span>{item.likes || 0}</span>
                            </span>

                            {/* 收藏数 */}
                            <span className="flex items-center space-x-1 whitespace-nowrap">
                                <svg
                                    className="w-3.5 h-3.5"
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
                            <span className="flex items-center space-x-1 whitespace-nowrap">
                                <svg className="w-3.5 h-3.5" fill={ item.isDownloaded ? "currentColor" : "none" } viewBox="0 0 24 24" stroke="currentColor">
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