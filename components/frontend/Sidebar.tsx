// components/frontend/Sidebar.tsx
'use client';

import { useSidebarData } from '@/hooks/useCommonData';
import SidebarWidget from './SidebarWidget';
import { processHtmlImages } from '@/lib/htmlProcessor';
import { useMemo } from 'react';

export default function Sidebar() {
    // ✅ SWR 自动缓存，多个页面使用同一份数据
    const { categories, tags, popularArticles, featuredArticles, siteInfo, frags, loadingStates } = useSidebarData();
    const processedContent = useMemo(() => {
        const fragInfo = frags.find(x => x.mark === 'site_introduce');
        const content = fragInfo && fragInfo.content ? fragInfo.content : '';
        return processHtmlImages(content);
    }, [frags]);

    //const fragInfo = frags.find(x => x.mark === 'site_introduce');
    return (
        <aside className="space-y-6">
            {/* 网站介绍 */}
            <SidebarWidget title="关于本站" icon="📖">
                {loadingStates.siteInfo && loadingStates.frags ? (
                    (() => {
                        const fragInfo = frags.find(x => x.mark === 'site_introduce');
                        return (
                            < div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                                        <span className="text-white font-bold">{siteInfo?.json?.logo ?? '站'}</span>
                                    </div>
                                    <span className="text-lg font-bold text-gray-800">{siteInfo?.name ?? '本站'}</span>
                                </div>

                                <p className="text-sm text-gray-600 leading-relaxed"
                                    dangerouslySetInnerHTML={{
                                        __html: processedContent || siteInfo?.description || '暂无介绍',
                                    }}
                                />

                                <div className="flex items-center space-x-3 pt-2">
                                    {siteInfo?.json?.github && (
                                        <a
                                            href={siteInfo.json.github}
                                            className="p-2 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200 hover:text-gray-800 transition-colors"
                                            aria-label="GitHub"
                                        >
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                            </svg>
                                        </a>
                                    )}

                                    <a href={siteInfo?.json?.email || '#'}
                                        className="p-2 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200 hover:text-gray-800 transition-colors"
                                        aria-label="Email"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                            />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        );
                    })()
                ) : (
                    <div className="space-y-2">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />
                        ))}
                    </div>
                )}
            </SidebarWidget>
            {/* 文章分类 */}
            <SidebarWidget title="文章分类" icon="📂">
                {loadingStates.categories ? (
                    <div className="space-y-2">
                        {categories.map(category => (
                            <a
                                key={category.id}
                                href={`/categories/${category.pinyin}`}
                                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 hover:text-primary-600 transition-colors"
                            >
                                <span className="flex items-center space-x-2">
                                    <span>{category.icon}</span>
                                    <span>{category.name}</span>
                                </span>
                                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                                    {category.count}
                                </span>
                            </a>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />
                        ))}
                    </div>
                )}
            </SidebarWidget>

            {/* 热门标签 */}
            <SidebarWidget title="热门标签" icon="🏷️">
                {loadingStates.tags ? (
                    <div className="flex flex-wrap gap-2">
                        {tags.map(tag => (
                            <a
                                key={tag.id}
                                href={`/tags/${tag.path}`}
                                className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs rounded-lg hover:bg-primary-50 hover:text-primary-600 transition-colors font-medium"
                            >
                                #{tag.name}
                            </a>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-7 w-16 bg-gray-100 rounded-lg animate-pulse" />
                        ))}
                    </div>
                )}
            </SidebarWidget>

            {/* 精选文章 */}
            <SidebarWidget title="精选文章" icon="🔥">
                {loadingStates.featuredArticles ? (
                    <div className="space-y-3">
                        {featuredArticles.map((post, index) => (
                            <a
                                key={post.id}
                                href={`/articles/${post.id}`}
                                className="flex items-start space-x-3 group"
                            >
                                <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${index < 3 ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-500'
                                    }`}>
                                    {index + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm text-gray-700 group-hover:text-primary-600 transition-colors line-clamp-2 font-medium">
                                        {post.title}
                                    </h4>
                                </div>
                            </a>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />
                        ))}
                    </div>
                )}
            </SidebarWidget>

            {/* 热门文章 */}
            <SidebarWidget title="热门文章" icon="🔥">
                {loadingStates.popularArticles ? (
                    <div className="space-y-3">
                        {popularArticles.map((post, index) => (
                            <a
                                key={post.id}
                                href={`/articles/${post.id}`}
                                className="flex items-start space-x-3 group"
                            >
                                <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${index < 3 ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-500'
                                    }`}>
                                    {index + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm text-gray-700 group-hover:text-primary-600 transition-colors line-clamp-2 font-medium">
                                        {post.title}
                                    </h4>
                                </div>
                            </a>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />
                        ))}
                    </div>
                )}
            </SidebarWidget>
        </aside >
    );
}