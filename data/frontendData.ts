// data/frontendData.ts

import { FrontendArticle, Category, Tag, PopularPost, SiteInfo } from '@/types/frontend';

export const siteInfo: SiteInfo = {
    name: 'TechBlog',
    description: '分享技术知识，记录开发心得，探索前沿科技。我们致力于为开发者提供高质量的技术文章和教程。',
    logo: '📝',
    socialLinks: {
        github: 'https://github.com',
        twitter: 'https://twitter.com',
        weibo: 'https://weibo.com',
        email: 'mailto:contact@techblog.com',
    },
};

export const categories: Category[] = [
    { id: 1, name: '前端开发', slug: 'frontend', count: 128, icon: '🎨' },
    { id: 2, name: '后端开发', slug: 'backend', count: 95, icon: '⚙️' },
    { id: 3, name: '移动开发', slug: 'mobile', count: 67, icon: '📱' },
    { id: 4, name: '人工智能', slug: 'ai', count: 54, icon: '🤖' },
    { id: 5, name: '云计算', slug: 'cloud', count: 43, icon: '☁️' },
    { id: 6, name: '数据库', slug: 'database', count: 38, icon: '🗄️' },
    { id: 7, name: 'DevOps', slug: 'devops', count: 31, icon: '🔄' },
    { id: 8, name: '安全', slug: 'security', count: 25, icon: '🔒' },
];

export const tags: Tag[] = [
    { id: 1, name: 'React', slug: 'react', count: 45 },
    { id: 2, name: 'Next.js', slug: 'nextjs', count: 32 },
    { id: 3, name: 'TypeScript', slug: 'typescript', count: 38 },
    { id: 4, name: 'Node.js', slug: 'nodejs', count: 28 },
    { id: 5, name: 'Python', slug: 'python', count: 25 },
    { id: 6, name: 'Docker', slug: 'docker', count: 20 },
    { id: 7, name: 'Kubernetes', slug: 'kubernetes', count: 15 },
    { id: 8, name: 'GraphQL', slug: 'graphql', count: 12 },
    { id: 9, name: 'CSS', slug: 'css', count: 30 },
    { id: 10, name: 'JavaScript', slug: 'javascript', count: 42 },
    { id: 11, name: 'Vue.js', slug: 'vuejs', count: 22 },
    { id: 12, name: 'Angular', slug: 'angular', count: 18 },
    { id: 13, name: 'MongoDB', slug: 'mongodb', count: 16 },
    { id: 14, name: 'PostgreSQL', slug: 'postgresql', count: 14 },
    { id: 15, name: 'Redis', slug: 'redis', count: 11 },
];

// 注意：每个文章对象都添加了 categorySlug 字段
export const articles: FrontendArticle[] = [
    {
        id: 1,
        title: 'React 19 新特性完全指南：从入门到精通',
        excerpt: 'React 19 带来了许多令人兴奋的新特性，包括 Server Components 的改进、新的 Hooks API，以及性能优化。本文将深入探讨这些新特性，帮助你快速上手。',
        coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop',
        author: {
            name: '张三',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop',
        },
        category: '前端开发',
        categorySlug: 'frontend',  // 添加此字段
        tags: ['React', '前端开发', 'JavaScript'],
        publishDate: '2026-08-08',
        readTime: 8,
        views: 1234,
        likes: 89,
        //comments: 23,
        featured: true,
    },
    {
        id: 2,
        title: 'Next.js 14 App Router 实战教程：构建全栈应用',
        excerpt: '详细讲解 Next.js 14 的 App Router 使用方法，包括路由配置、数据获取、中间件等核心概念，通过实际项目带你掌握现代全栈开发。',
        coverImage: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=400&fit=crop',
        author: {
            name: '李四',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop',
        },
        category: '前端开发',
        categorySlug: 'frontend',  // 添加此字段
        tags: ['Next.js', 'SSR', 'React'],
        publishDate: '2026-08-07',
        readTime: 12,
        views: 892,
        likes: 67,
        //comments: 15,
    },
    {
        id: 3,
        title: 'TypeScript 5.0 高级类型体操实战指南',
        excerpt: '深入探讨 TypeScript 5.0 的高级类型系统，通过实际案例学习类型体操的核心概念和技巧，提升代码质量和开发效率。',
        coverImage: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=400&fit=crop',
        author: {
            name: '王五',
            avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop',
        },
        category: '前端开发',
        categorySlug: 'frontend',  // 添加此字段
        tags: ['TypeScript', '类型系统', '编程'],
        publishDate: '2026-08-06',
        readTime: 15,
        views: 567,
        likes: 45,
        //comments: 8,
    },
    {
        id: 4,
        title: 'Python 异步编程：从回调到 async/await 的演进',
        excerpt: '探索 Python 异步编程的发展历程，从最初的回调函数到现代的 async/await 语法，深入理解异步编程的核心概念。',
        coverImage: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&h=400&fit=crop',
        author: {
            name: '赵六',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop',
        },
        category: '后端开发',
        categorySlug: 'backend',  // 添加此字段
        tags: ['Python', '异步编程', '后端'],
        publishDate: '2026-08-05',
        readTime: 10,
        views: 723,
        likes: 56,
        //comments: 12,
    },
    {
        id: 5,
        title: 'Docker 容器化部署最佳实践',
        excerpt: '总结 Docker 在生产环境中的最佳实践，包括镜像优化、安全配置、日志管理等，帮助你构建可靠的容器化应用。',
        coverImage: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=800&h=400&fit=crop',
        author: {
            name: '钱七',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop',
        },
        category: 'DevOps',
        categorySlug: 'devops',  // 添加此字段
        tags: ['Docker', '容器化', 'DevOps'],
        publishDate: '2026-08-04',
        readTime: 7,
        views: 456,
        likes: 34,
        //comments: 6,
    },
    {
        id: 6,
        title: 'Kubernetes 集群监控方案对比',
        excerpt: '对比分析 Prometheus、Grafana、ELK Stack 等主流 Kubernetes 监控方案，帮助你选择最适合的监控工具组合。',
        coverImage: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&h=400&fit=crop',
        author: {
            name: '孙八',
            avatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=40&h=40&fit=crop',
        },
        category: '云计算',
        categorySlug: 'cloud',  // 添加此字段
        tags: ['Kubernetes', '监控', '云原生'],
        publishDate: '2026-08-03',
        readTime: 11,
        views: 389,
        likes: 28,
        //comments: 9,
    },
];

export const popularPosts: PopularPost[] = [
    { id: 1, title: 'React 19 新特性完全指南', date: '2026-08-08', views: 1234 },
    { id: 2, title: 'Next.js 14 App Router 实战教程', date: '2026-08-07', views: 892 },
    { id: 3, title: 'Python 异步编程完全指南', date: '2026-08-05', views: 723 },
    { id: 4, title: 'TypeScript 5.0 类型体操', date: '2026-08-06', views: 567 },
    { id: 5, title: 'Docker 容器化最佳实践', date: '2026-08-04', views: 456 },
];