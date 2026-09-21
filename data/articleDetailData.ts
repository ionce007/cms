// data/articleDetailData.ts
/*
import { allArticles } from './articlesData';

// ========== 类型定义 ==========

export interface ArticleComment {
    id: number;
    articleId: number;
    author: string;
    avatar: string;
    content: string;
    date: string;
    likes: number;
}

export interface ArticleDetailData {
    id: number;
    title: string;
    excerpt: string;
    coverImage: string;
    category: string;
    categorySlug: string;
    tags: string[];
    author: string;
    avatar: string;
    publishDate: string;
    readTime: number;
    views: number;
    likes: number;
    featured?: boolean;
    content: string;
    comments: ArticleComment[];
}

// ========== 文章正文内容（Markdown 格式） ==========

const markdownContentMap: Record<number, string> = {
    1: `
# React 19 新特性完全指南：从入门到精通

React 19 带来了许多令人兴奋的新特性，包括 Server Components 的改进、新的 Hooks API，以及性能优化。本文将深入探讨这些新特性，帮助你快速上手。

## 1. Server Components 改进

React 19 对 Server Components 进行了重大改进，提供了更好的性能和开发体验。

### 主要变化

- 更快的初始加载速度
- 更小的客户端包体积
- 自动代码分割
- 改进的数据获取方式

### 代码示例

\`\`\`typescript
// Server Component 示例
async function ServerComponent() {
  const data = await fetchData();
  return < div>{data.title}</div>;
}
\`\`\`

## 2. 新的 Hooks API

### useOptimistic

\`\`\`typescript
const [optimisticState, addOptimistic] = useOptimistic(
  state,
  (currentState, optimisticValue) => {
    return { ...currentState, ...optimisticValue };
  }
);
\`\`\`

### useFormStatus

\`\`\`typescript
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending}>
      {pending ? '提交中...' : '提交'}
    </button>
  );
}
\`\`\`

### useTransition

\`\`\`typescript
const [isPending, startTransition] = useTransition();
\`\`\`

## 3. 性能优化

React 19 在性能方面有显著提升：

- 更快的渲染速度
- 更小的包体积
- 更好的内存管理
- 改进的并发渲染

## 4. 迁移建议

从 React 18 升级到 React 19 的步骤：

1. 更新依赖版本
2. 移除已废弃的 API
3. 测试应用功能
4. 逐步采用新特性

## 总结

React 19 是一次重大的版本更新，为开发者带来了更好的开发体验和更强大的功能。建议在项目稳定后尽快升级。
`,

    2: `
<h1>Next.js 14 App Router 实战教程：构建全栈应用</h1>

<p>Next.js 14 的 App Router 提供了全新的开发体验。本教程将带你从零开始，掌握 App Router 的核心概念和实战技巧。</p>

<h2>1. 路由配置</h2>

<h3>基础路由</h3>

<pre><code>// app/page.tsx
export default function Home() {
  return &lt;h1&gt;首页&lt;/h1&gt;;
}</code></pre>

<h3>动态路由</h3>

<pre><code>// app/articles/[id]/page.tsx
export default function ArticlePage({ params }) {
  return &lt;h1&gt;文章 {params.id}&lt;/h1&gt;;
}</code></pre>

<h3>路由组</h3>

<pre><code>// app/(auth)/login/page.tsx
// app/(auth)/register/page.tsx</code></pre>

<h2>2. 数据获取</h2>

<h3>Server Components 直接获取</h3>

<pre><code>async function getData() {
  const res = await fetch('https://api.example.com/data');
  return res.json();
}

export default async function Page() {
  const data = await getData();
  return &lt;div&gt;{data.title}&lt;/div&gt;;
}</code></pre>

<h3>静态生成</h3>

<pre><code>export function generateStaticParams() {
  return [{ id: '1' }, { id: '2' }];
}</code></pre>

<h2>3. 中间件</h2>

<pre><code>// middleware.ts
export function middleware(request) {
  // 处理认证、重定向等
}</code></pre>

<blockquote>
  <p>💡 提示：App Router 让全栈开发更加简单高效。</p>
</blockquote>

<h2>总结</h2>

<p>Next.js 14 的 App Router 提供了更灵活的路由和数据获取方式，是现代 Web 应用开发的优秀选择。</p>
`,

    3: `
# TypeScript 5.0 高级类型体操实战指南

深入探讨 TypeScript 5.0 的高级类型系统，通过实际案例学习类型体操的核心概念和技巧，提升代码质量和开发效率。

## 1. 条件类型

\`\`\`typescript
type IsString<T> = T extends string ? true : false;

type TypeName<T> =
  T extends string ? 'string' :
  T extends number ? 'number' :
  T extends boolean ? 'boolean' :
  T extends undefined ? 'undefined' :
  T extends Function ? 'function' :
  'object';
\`\`\`

## 2. 映射类型

\`\`\`typescript
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

type Partial<T> = {
  [P in keyof T]?: T[P];
};

type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};
\`\`\`

## 3. 模板字面量类型

\`\`\`typescript
type EventName<T extends string> = \`on\${Capitalize<T>}\`;

type PropEventName<T> = {
  [K in keyof T as \`on\${Capitalize<string & K>}Change\`]: (value: T[K]) => void;
};
\`\`\`

## 4. 推断类型

\`\`\`typescript
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

type Parameters<T> = T extends (...args: infer P) => any ? P : never;
\`\`\`

## 总结

类型体操是 TypeScript 的高级用法，需要多加练习才能掌握。通过不断实践，你可以写出更安全、更优雅的代码。
`,
};

// ========== HTML 格式文章内容 ==========

const htmlContentMap: Record<number, string> = {
    4: `
<h1>Python 异步编程：从回调到 async/await 的演进</h1>

<p>探索 Python 异步编程的发展历程，从最初的回调函数到现代的 async/await 语法，深入理解异步编程的核心概念。</p>

<h2>1. 回调函数时代</h2>

<p>早期的异步编程主要依赖回调函数，但容易出现回调地狱问题。</p>

<pre><code>def fetch_data(callback):
    # 模拟异步操作
    result = "data"
    callback(result)

def process_data(data):
    print(f"Processing: {data}")

fetch_data(process_data)</code></pre>

<h2>2. Promise/Future 模式</h2>

<p>通过 Promise 或 Future 对象来管理异步操作的状态。</p>

<h2>3. async/await 语法</h2>

<pre><code>import asyncio

async def fetch_data():
    await asyncio.sleep(1)
    return "data"

async def main():
    result = await fetch_data()
    print(result)

asyncio.run(main())</code></pre>

<blockquote>
  <p>💡 async/await 让异步代码看起来像同步代码，大大提升了可读性。</p>
</blockquote>

<h2>总结</h2>

<p>Python 的异步编程经历了从回调到 async/await 的演进，现代 Python 推荐使用 async/await 语法。</p>
`,

    5: `
<h1>Docker 容器化部署最佳实践</h1>

<p>总结 Docker 在生产环境中的最佳实践，包括镜像优化、安全配置、日志管理等。</p>

<h2>1. 镜像优化</h2>

<ul>
  <li>使用多阶段构建减小镜像体积</li>
  <li>选择合适的基础镜像（如 alpine）</li>
  <li>合并 RUN 指令减少层数</li>
  <li>使用 .dockerignore 排除不必要文件</li>
</ul>

<h2>2. 安全配置</h2>

<ul>
  <li>以非 root 用户运行容器</li>
  <li>扫描镜像漏洞</li>
  <li>使用 secrets 管理敏感信息</li>
</ul>

<h2>3. 日志管理</h2>

<pre><code># docker-compose.yml
services:
  app:
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"</code></pre>

<h2>总结</h2>

<p>遵循这些最佳实践，可以构建更可靠、更安全的容器化应用。</p>
`,
};

// ========== 默认内容生成 ==========

function getDefaultMarkdownContent(title: string, category: string, excerpt: string): string {
    return `
# ${title}

${excerpt}

## 引言

这是一篇关于 ${category} 的详细文章。在本文中，我们将深入探讨相关概念和实践技巧。

## 核心内容

### 基础概念

了解基本概念是掌握任何技术的第一步。我们将从最基础的知识点开始讲解。

### 实践技巧

通过实际案例来巩固所学知识，帮助你更好地理解和应用。

### 进阶应用

掌握进阶技巧，提升开发效率和代码质量。

## 常见问题

- 问题一：如何开始？
- 问题二：有哪些注意事项？
- 问题三：如何优化？

## 总结

希望通过本文的讲解，你能够对 ${category} 有更深入的理解。继续学习和实践，你会越来越熟练。
`;
}

// ========== 评论模拟数据 ==========

const mockComments: Record<number, ArticleComment[]> = {
    1: [
        {
            id: 101,
            articleId: 1,
            author: '李四',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop',
            content: '写得非常好，学到了很多新知识！特别是关于 useOptimistic 的部分，解决了我之前遇到的实际问题。',
            date: '2026-08-09',
            likes: 12,
        },
        {
            id: 102,
            articleId: 1,
            author: '王五',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop',
            content: 'Server Components 的改进确实很令人期待，性能提升明显。',
            date: '2026-08-09',
            likes: 8,
        },
        {
            id: 103,
            articleId: 1,
            author: '赵六',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop',
            content: '期待更多实战教程，特别是结合 TypeScript 的使用示例。',
            date: '2026-08-10',
            likes: 3,
        },
    ],
    2: [
        {
            id: 201,
            articleId: 2,
            author: '张三',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop',
            content: 'App Router 确实比 Pages Router 好用很多，数据获取方式更加灵活。',
            date: '2026-08-08',
            likes: 15,
        },
        {
            id: 202,
            articleId: 2,
            author: '李四',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop',
            content: '文章中关于中间件的讲解很清晰，解决了我的疑惑。',
            date: '2026-08-08',
            likes: 7,
        },
    ],
    3: [
        {
            id: 301,
            articleId: 3,
            author: '王五',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop',
            content: '类型体操的内容很有深度，需要多读几遍才能完全理解。',
            date: '2026-08-07',
            likes: 10,
        },
    ],
    4: [
        {
            id: 401,
            articleId: 4,
            author: '张三',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop',
            content: 'async/await 确实让异步代码简洁了很多。',
            date: '2026-08-06',
            likes: 6,
        },
    ],
    5: [
        {
            id: 501,
            articleId: 5,
            author: '李四',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop',
            content: '多阶段构建的技巧很实用，镜像体积减小了不少。',
            date: '2026-08-05',
            likes: 9,
        },
    ],
    6: [],
};

// ========== 核心函数 ==========


export function getArticleDetail(id: number): ArticleDetailData | null {
    const article = allArticles.find((item) => item.id === id);

    if (!article) return null;

    // 获取文章内容（优先使用预定义内容，否则生成默认内容）
    let content: string;
    if (markdownContentMap[id]) {
        content = markdownContentMap[id];
    } else if (htmlContentMap[id]) {
        content = htmlContentMap[id];
    } else {
        content = getDefaultMarkdownContent(article.title, article.category, article.excerpt);
    }

    return {
        id: article.id,
        title: article.title,
        excerpt: article.excerpt,
        coverImage: article.coverImage,
        category: article.category,
        categorySlug: article.categorySlug,
        tags: article.tags,
        author: article.author.name,
        avatar: article.author.avatar,
        publishDate: article.publishDate,
        readTime: article.readTime,
        views: article.views,
        likes: article.likes,
        featured: article.featured,
        content,
        comments: mockComments[id] || [],
    };
}


export function getArticleComments(articleId: number): ArticleComment[] {
    return mockComments[articleId] || [];
}


export function addArticleComment(articleId: number, comment: ArticleComment): void {
    if (!mockComments[articleId]) {
        mockComments[articleId] = [];
    }
    mockComments[articleId].push(comment);
}


export function getRelatedArticles(
    articleId: number,
    categorySlug: string,
    limit: number = 3
) {
    return allArticles
        .filter((item) => item.id !== articleId && item.categorySlug === categorySlug)
        .slice(0, limit);
}
*/