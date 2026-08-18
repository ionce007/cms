// components/frontend/Sidebar.tsx
import { cn } from '@/lib/utils';
import { siteInfo, categories, tags, popularPosts } from '@/data/frontendData';
import SidebarWidget from './SidebarWidget';

export default function Sidebar() {
    return (
        <aside className="space-y-6">
            {/* 网站介绍 */}
            <SidebarWidget title="关于本站" icon="📖">
                <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold">{siteInfo.logo}</span>
                        </div>
                        <span className="text-lg font-bold text-gray-800">{siteInfo.name}</span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        {siteInfo.description}
                    </p>
                    {/* 社交链接 */}
                    <div className="flex items-center space-x-3 pt-2">
                        {siteInfo.socialLinks.github && (
                            <a href={siteInfo.socialLinks.github} className="p-2 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200 hover:text-gray-800 transition-colors" aria-label="GitHub">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                </svg>
                            </a>
                        )}
                        <a href={siteInfo.socialLinks.email || '#'} className="p-2 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200 hover:text-gray-800 transition-colors" aria-label="Email">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </a>
                    </div>
                </div>
            </SidebarWidget>

            {/* 文章分类 */}
            <SidebarWidget title="文章分类" icon="📂">
                <div className="space-y-1">
                    {categories.map((category) => (
                        <a
                            key={category.id}
                            href={`/categories/${category.slug}`}
                            className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 hover:text-primary-600 transition-colors group"
                        >
                            <span className="flex items-center space-x-2">
                                <span>{category.icon}</span>
                                <span>{category.name}</span>
                            </span>
                            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                                {category.count}
                            </span>
                        </a>
                    ))}
                </div>
            </SidebarWidget>

            {/* 热门标签 */}
            <SidebarWidget title="热门标签" icon="🏷️">
                <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                        <a
                            key={tag.id}
                            href={`/tags/${tag.slug}`}
                            className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs rounded-lg hover:bg-primary-50 hover:text-primary-600 transition-colors font-medium"
                        >
                            #{tag.name}
                            <span className="ml-1 text-gray-400">({tag.count})</span>
                        </a>
                    ))}
                </div>
            </SidebarWidget>

            {/* 热门文章 */}
            <SidebarWidget title="热门文章" icon="🔥">
                <div className="space-y-3">
                    {popularPosts.map((post, index) => (
                        <a
                            key={post.id}
                            href={`/articles/${post.id}`}  // 确保链接正确
                            className="flex items-start space-x-3 group"
                        >
                            <span className={cn(
                                'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                                index < 3 ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-500'
                            )}>
                                {index + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm text-gray-700 group-hover:text-primary-600 transition-colors line-clamp-2 font-medium">
                                    {post.title}
                                </h4>
                                <div className="flex items-center space-x-2 mt-1 text-xs text-gray-400">
                                    <span>{post.date}</span>
                                    <span>•</span>
                                    <span>{post.views.toLocaleString()} 阅读</span>
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            </SidebarWidget>

            {/* 订阅 */}
            <SidebarWidget title="订阅更新" icon="📧">
                <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                        订阅我们的 newsletter，获取最新技术文章推送。
                    </p>
                    <div className="flex space-x-2">
                        <input
                            type="email"
                            placeholder="输入邮箱地址"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                        <button className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
                            订阅
                        </button>
                    </div>
                </div>
            </SidebarWidget>
        </aside>
    );
}