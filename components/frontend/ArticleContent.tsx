// components/frontend/ArticleContent.tsx
'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface ArticleContentProps {
    content: string;
}

// 检测内容类型
function detectContentType(content: string): 'html' | 'markdown' {
    // 1. 移除 Markdown 代码块（``` 包围的内容）
    const withoutMarkdownCodeBlocks = content.replace(/```[\s\S]*?```/g, '');

    // 2. 移除 HTML pre/code 代码块（<pre>...</pre> 包围的内容）
    const withoutPreBlocks = withoutMarkdownCodeBlocks.replace(/<pre[\s\S]*?<\/pre>/gi, '');

    // 3. 移除行内代码（` 包围的内容）
    const withoutInlineCode = withoutPreBlocks.replace(/`[^`]*`/g, '');

    // 4. 移除 HTML 行内 code（<code>...</code> 包围的内容）
    const withoutCodeTags = withoutInlineCode.replace(/<code[\s\S]*?<\/code>/gi, '');

    // 5. 检测剩余的 HTML 标签
    const htmlRegex = /<(div|p|h1|h2|h3|h4|h5|h6|span|a|ul|ol|li|table|thead|tbody|tr|th|td|img|br|section|article|header|footer|main|aside|nav|strong|em|blockquote|figure|figcaption)[\s>]/i;

    if (htmlRegex.test(withoutCodeTags)) {
        return 'html';
    }

    // 默认按 Markdown 处理
    return 'markdown';
}

export default function ArticleContent({ content }: ArticleContentProps) {
    const contentType = detectContentType(content);

    if (contentType === 'html') {
        return (
            <div
                className="article-html-content"
                dangerouslySetInnerHTML={{ __html: content }}
            />
        );
    }

    return (
        <div className="article-markdown-content">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
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
                    a: ({ href, children }) => (
                        <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 underline">
                            {children}
                        </a>
                    ),
                    ul: ({ children }) => (
                        <ul className="list-disc pl-6 space-y-2 mb-4">{children}</ul>
                    ),
                    ol: ({ children }) => (
                        <ol className="list-decimal pl-6 space-y-2 mb-4">{children}</ol>
                    ),
                    blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-primary-300 pl-4 italic text-gray-600 my-4 bg-gray-50 py-2 pr-4 rounded-r">
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
                            <code className={className} {...props}>
                                {children}
                            </code>
                        );
                    },
                    pre: ({ children }) => (
                        <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto my-4 text-sm leading-relaxed">
                            {children}
                        </pre>
                    ),
                    table: ({ children }) => (
                        <div className="overflow-x-auto my-4">
                            <table className="min-w-full border border-gray-200">{children}</table>
                        </div>
                    ),
                    th: ({ children }) => (
                        <th className="bg-gray-50 px-4 py-2 border border-gray-200 text-left font-semibold">{children}</th>
                    ),
                    td: ({ children }) => (
                        <td className="px-4 py-2 border border-gray-200 text-gray-700">{children}</td>
                    ),
                    img: ({ src, alt }) => (
                        <img src={src} alt={alt || ''} className="rounded-lg my-4 max-w-full h-auto" />
                    ),
                    strong: ({ children }) => (
                        <strong className="font-semibold text-gray-900">{children}</strong>
                    ),
                    em: ({ children }) => (
                        <em className="italic">{children}</em>
                    ),
                    hr: () => <hr className="my-8 border-gray-200" />,
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}