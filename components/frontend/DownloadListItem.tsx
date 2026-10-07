// components/frontend/DownloadListItem.tsx
'use client';

import Link from 'next/link';
//import SafeImage from './SafeImage';
import CoverImage from './CoverImage';
import { formatFileSize, formatTimestamp } from '@/config/constants';
import { API_BASE_URL } from '@/config/env';
import { API_ENDPOINTS } from '@/config/routes'
import { cn } from '@/lib/utils';

interface DownloadListItemProps {
    item: any;
    index?: number;
}

export default function DownloadListItem({ item, index = 0 }: DownloadListItemProps) {
    // ✅ 用 hasContent 判断
    const hasDetail = true;//item.hasContent === true;
    const detailUrl = `/downloads/${item.fs_id}`;
    const downloadUrl = `${API_BASE_URL}${API_ENDPOINTS.FORMULA_DETAIL(item.fs_id)}/download`;
    // ✅ 判断价格类型
    const isFree = item.isSell === 0 || item.price === 0 || !item.price;

    return (
        <article
            className={cn(
                'bg-white rounded-xl border border-gray-200 overflow-hidden',
                'hover:shadow-lg hover:border-primary-200 transition-all duration-300 group'
            )}
            style={{ animationDelay: `${index * 50}ms` }}
        >
            <div className="flex flex-col sm:flex-row">
                {/* 左侧缩略图 */}
                {hasDetail ? (
                    <Link
                        href={detailUrl}
                        className="relative sm:w-48 lg:w-56 flex-shrink-0 overflow-hidden bg-gray-100 cursor-pointer"
                    >
                        {/*<div className="aspect-video sm:aspect-auto sm:h-full min-h-[140px]">*/}
                        <div className="aspect-video sm:aspect-auto h-40 sm:h-44 lg:h-48">
                            <CoverImage
                                src={item.img}
                                alt={item.server_filename}
                                aspectRatio="fill"
                                objectFit="cover"
                                useBlurBackground={false}
                                className="w-full h-full"
                            />
                        </div>
                        <div className="absolute top-2 left-2 pointer-events-none">
                            <span className="px-2 py-0.5 bg-white/90 backdrop-blur-sm text-gray-700 text-[10px] sm:text-xs font-medium rounded-full shadow-sm">
                                {item.kind || '文件'}
                            </span>
                        </div>
                        {/* ✅ 价格标签（缩略图右上角） */}
                        <div className="absolute top-2 right-2 pointer-events-none">
                            {isFree ? (
                                <span className="px-2 py-0.5 bg-green-500/90 text-white text-[10px] sm:text-xs font-bold rounded-full shadow-sm">
                                    免费
                                </span>
                            ) : (
                                <span className="px-2 py-0.5 bg-orange-500/90 text-white text-[10px] sm:text-xs font-bold rounded-full shadow-sm">
                                    ¥{item.price}
                                </span>
                            )}
                        </div>
                    </Link>
                ) : (
                    <div className="relative sm:w-48 lg:w-56 flex-shrink-0 overflow-hidden bg-gray-100">
                        <div className="aspect-video sm:aspect-auto sm:h-full min-h-[140px]">
                            {/*<SafeImage
                                src={item.img}
                                alt={item.server_filename}
                                className="w-full h-full object-cover"
                                fallbackIcon="📄"
                            />*/}
                            <CoverImage
                                src={item.img}
                                alt={item.server_filename}
                                aspectRatio="fill"
                                objectFit="cover"
                                useBlurBackground={false}
                                className="w-full h-full"
                            />
                        </div>
                        <div className="absolute top-2 left-2">
                            <span className="px-2 py-0.5 bg-white/90 backdrop-blur-sm text-gray-700 text-[10px] sm:text-xs font-medium rounded-full shadow-sm">
                                {item.kind || '文件'}
                            </span>
                        </div>
                    </div>
                )}

                {/* 右侧内容 */}
                <div className="flex-1 p-4 sm:p-5 flex flex-col min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                        {hasDetail ? (
                            <Link href={detailUrl}>{item.server_filename.substring(0, item.server_filename.lastIndexOf('.'))}</Link>
                        ) : (
                            item.server_filename.substring(0, item.server_filename.lastIndexOf('.'))
                        )}
                    </h3>

                    {item.summary && (
                        <p className="text-sm text-gray-500 line-clamp-2 mb-3 leading-relaxed flex-1">
                            {item.summary}
                        </p>
                    )}

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400 mb-3">
                        <span>{formatFileSize(item.size)}</span>
                        <span>{formatTimestamp(item.server_ctime)}</span>
                        <span>👁️ {item.views || 0}</span>
                        <span>❤️ {item.likes || 0}</span>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                        {hasDetail ? (
                            <>
                                <Link
                                    href={detailUrl}
                                    className="inline-flex items-center space-x-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
                                >
                                    <span>查看详情</span>
                                </Link>
                                <a
                                    href={downloadUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center space-x-1 px-3 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-medium hover:bg-primary-700 transition-colors"
                                >
                                    <span>下载</span>
                                </a>
                            </>
                        ) : (
                            <a
                                href={downloadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center space-x-1 px-4 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors"
                            >
                                <span>下载</span>
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </article>
    );
}