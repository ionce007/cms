// components/frontend/ArticleDetail.tsx
'use client';

import { useState } from 'react';
import { ArticleDetail as ArticleDetailType, Comment } from '@/types/frontend';
import AuthorCard from './AuthorCard';
import CommentSection from './CommentSection';
import RelatedArticles from './RelatedArticles';
import ShareButtons from './ShareButtons';

interface ArticleDetailProps {
    article: ArticleDetailType;
    relatedArticles: any[];
}

export default function ArticleDetail({ article, relatedArticles }: ArticleDetailProps) {
    const [isLiked, setIsLiked] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [likeCount, setLikeCount] = useState(article.likes);

    const handleLike = () => {
        setIsLiked(!isLiked);
        setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    };

    const handleBookmark = () => {
        setIsBookmarked(!isBookmarked);
    };

    return (
        <article className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* 封面图 */}
            <div className="relative h-64 sm:h-80 lg:h-96 overflow-hidden">
                <img
                    src={article.coverImage}
                    alt={article.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-center space-x-2 mb-2">
                        <span className="px-3 py-1 bg-white/90 text-gray-700 text-xs font-medium rounded-full">
                            {article.category}
                        </span>
                        {article.featured && (
                            <span className="px-3 py-1 bg-yellow-400/90 text-yellow-900 text-xs font-medium rounded-full">
                                🔥 精选
                            </span>
                        )}
                    </div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                        {article.title}
                    </h1>
                </div>
            </div>

            {/* 文章元信息 */}
            <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                    <img
                        src={article.author.avatar}
                        alt={article.author.name}
                        className="w-10 h-10 rounded-full"
                    />
                    <div>
                        <div className="text-sm font-medium text-gray-800">{article.author.name}</div>
                        <div className="text-xs text-gray-500">{article.publishDate}</div>
                    </div>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{article.readTime} 分钟阅读</span>
                    <span>•</span>
                    <span>{article.views.toLocaleString()} 次阅读</span>
                </div>
            </div>

            {/* 文章内容 */}
            <div className="px-6 py-8">
                <div className="prose prose-gray max-w-none">
                    {article.content.split('\n').map((line, index) => {
                        if (line.startsWith('# ')) {
                            return <h1 key={index} className="text-2xl font-bold text-gray-800 mt-8 mb-4">{line.slice(2)}</h1>;
                        }
                        if (line.startsWith('## ')) {
                            return <h2 key={index} className="text-xl font-bold text-gray-800 mt-6 mb-3">{line.slice(3)}</h2>;
                        }
                        if (line.startsWith('### ')) {
                            return <h3 key={index} className="text-lg font-semibold text-gray-800 mt-4 mb-2">{line.slice(4)}</h3>;
                        }
                        if (line.startsWith('```')) {
                            return null; // 代码块开始/结束标记
                        }
                        if (line.trim() === '') {
                            return <div key={index} className="h-4" />;
                        }
                        if (line.startsWith('- ')) {
                            return <li key={index} className="ml-4 text-gray-700">{line.slice(2)}</li>;
                        }
                        if (line.startsWith('    ')) {
                            return (
                                <pre key={index} className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto my-4">
                                    <code>{line.slice(4)}</code>
                                </pre>
                            );
                        }
                        return <p key={index} className="text-gray-700 leading-relaxed mb-4">{line}</p>;
                    })}
                </div>

                {/* 标签 */}
                <div className="flex flex-wrap gap-2 mt-8">
                    {article.tags.map((tag) => (
                        <a
                            key={tag}
                            href={`/articles?tag=${tag}`}
                            className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-primary-50 hover:text-primary-600 transition-colors"
                        >
                            #{tag}
                        </a>
                    ))}
                </div>

                {/* 操作按钮 */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={handleLike}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${isLiked
                                    ? 'bg-red-50 text-red-600'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            <svg className="w-5 h-5" fill={isLiked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span>{likeCount}</span>
                        </button>
                        <button
                            onClick={handleBookmark}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${isBookmarked
                                    ? 'bg-primary-50 text-primary-600'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            <svg className="w-5 h-5" fill={isBookmarked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                            <span>收藏</span>
                        </button>
                    </div>
                    <ShareButtons title={article.title} url={`/articles/${article.id}`} />
                </div>
            </div>
        </article>
    );
}