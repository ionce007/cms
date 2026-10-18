// components/frontend/ArticleContent.tsx
'use client';

import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { processHtmlImages } from '@/lib/htmlProcessor';
import { getProxiedImageUrl } from '@/lib/imageProxy';
// ✅ 引入 useLightbox
import { useLightbox } from '@/components/frontend/ImageLightbox';

interface ArticleContentProps {
    content: string;
}

function detectContentType(content: string): 'html' | 'markdown' {
    const withoutCode = content
        .replace(/```[\s\S]*?```/g, '')
        .replace(/`[^`]*`/g, '')
        .replace(/<pre[\s\S]*?<\/pre>/gi, '')
        .replace(/<code[\s\S]*?<\/code>/gi, '');

    const htmlRegex = /<(div|p|h1|h2|h3|h4|h5|h6|span|a|ul|ol|li|table|thead|tbody|tr|th|td|img|br|section|article|header|footer|main|aside|nav|strong|em|blockquote|figure|figcaption)[\s>]/i;

    return htmlRegex.test(withoutCode) ? 'html' : 'markdown';
}

export default function ArticleContent({ content }: ArticleContentProps) {
    const contentType = detectContentType(content);
    // ✅ 获取灯箱方法
    const { openLightbox } = useLightbox();

    // ✅ 处理 HTML 中的 HTTP 图片
    const processedContent = useMemo(() => {
        return processHtmlImages(content);
    }, [content]);

    // ✅ 提取点击图片的公共逻辑
    const handleImageClick = (e: React.MouseEvent, src: string) => {
        if (!src) return;
        e.preventDefault();
        e.stopPropagation();
        openLightbox([src]); // 打开灯箱
    };

    // ============ HTML 内容 ============
    if (contentType === 'html') {
        return (
            <div
                className="article-html-content"
                onClick={(e) => {
                    // ✅ 利用事件委托，捕获 HTML 内容内的图片点击
                    const target = e.target as HTMLElement;
                    if (target.tagName === 'IMG') {
                        const img = target as HTMLImageElement;
                        // 优先取 data-original-src 作为原图地址
                        const src = img.getAttribute('data-original-src') || img.src;
                        handleImageClick(e, src);
                    }
                }}
                dangerouslySetInnerHTML={{ __html: processedContent }}
            />
        );
    }

    // ============ Markdown 内容 ============
    return (
        <div className="article-markdown-content">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                    // ✅ 修改 img 组件，绑定点击事件
                    img: ({ src, alt }) => {
                        if (!src) {
                            return (
                                <img
                                    src={src}
                                    alt={alt || ''}
                                    className="rounded-lg my-4 max-w-full h-auto"
                                    loading="lazy"
                                />
                            );
                        }

                        const originalSrc = typeof src === 'string' ? src : '';
                        const finalSrc = originalSrc ? getProxiedImageUrl(originalSrc) : '';

                        // 无有效 src 直接不渲染
                        if (!finalSrc) return null;

                        return (
                            <img
                                src={finalSrc}
                                alt={alt || ''}
                                className="rounded-lg my-4 max-w-full h-auto cursor-zoom-in"
                                loading="lazy"
                                data-original-src={originalSrc}
                                onClick={(e) => handleImageClick(e, originalSrc)}
                            />
                        );
                    },
                    a: ({ href, children }) => (
                        <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-700 underline"
                        >
                            {children}
                        </a>
                    ),
                    h1: ({ children }) => (
                        <h1 className="text-2xl font-bold text-gray-800 mt-8 mb-4">{children}</h1>
                    ),
                    h2: ({ children }) => (
                        <h2 className="text-xl font-bold text-gray-800 mt-8 mb-4">{children}</h2>
                    ),
                    h3: ({ children }) => (
                        <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-3">{children}</h3>
                    ),
                    p: ({ children }) => (
                        <p className="text-gray-700 leading-relaxed mb-4">{children}</p>
                    ),
                    ul: ({ children }) => (
                        <ul className="list-disc pl-6 space-y-2 mb-4">{children}</ul>
                    ),
                    ol: ({ children }) => (
                        <ol className="list-decimal pl-6 space-y-2 mb-4">{children}</ol>
                    ),
                    blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-primary-300 pl-4 italic text-gray-600 my-4">
                            {children}
                        </blockquote>
                    ),
                    code: ({ className, children, ...props }) => {
                        const match = /language-(\w+)/.exec(className || '');
                        return !match ? (
                            <code className="bg-gray-100 text-red-600 px-1.5 py-0.5 rounded text-sm" {...props}>
                                {children}
                            </code>
                        ) : (
                            <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto my-4">
                                <code className={className} {...props}>{children}</code>
                            </pre>
                        );
                    },
                }}
            >
                {processedContent}
            </ReactMarkdown>
        </div>
    );
}