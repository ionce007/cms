// data/aboutData.ts
export interface TeamMember {
    id: number;
    name: string;
    role: string;
    avatar: string;
    bio: string;
    github: string;
    twitter: string;
}

export interface Milestone {
    id: number;
    year: string;
    title: string;
    description: string;
}

export interface TechItem {
    name: string;
    icon: string;
    category: string;
    description: string;
}

export const teamMembers: TeamMember[] = [
    {
        id: 1,
        name: '张三',
        role: '创始人 & 全栈工程师',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
        bio: '全栈开发者，专注于 React、Node.js 和云原生技术，拥有 8 年开发经验。',
        github: 'https://github.com',
        twitter: 'https://twitter.com',
    },
    {
        id: 2,
        name: '李四',
        role: '前端工程师',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
        bio: '热爱前端技术，擅长 React、TypeScript 和性能优化，关注最新的 Web 技术趋势。',
        github: 'https://github.com',
        twitter: 'https://twitter.com',
    },
    {
        id: 3,
        name: '王五',
        role: '后端工程师',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
        bio: '专注于后端开发和系统架构，精通 Python、Go 和微服务架构设计。',
        github: 'https://github.com',
        twitter: 'https://twitter.com',
    },
    {
        id: 4,
        name: '赵六',
        role: 'UI/UX 设计师',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
        bio: '专注于用户体验设计，擅长将复杂的需求转化为简洁优雅的界面。',
        github: 'https://github.com',
        twitter: 'https://twitter.com',
    },
];

export const milestones: Milestone[] = [
    {
        id: 1,
        year: '2024',
        title: '网站成立',
        description: 'TechBlog 正式上线，开始分享技术文章和开发经验。',
    },
    {
        id: 2,
        year: '2024',
        title: '内容扩展',
        description: '新增视频教程和在线课程，丰富内容形式。',
    },
    {
        id: 3,
        year: '2025',
        title: '社区建设',
        description: '建立开发者社区，超过 10,000 名注册用户。',
    },
    {
        id: 4,
        year: '2025',
        title: '技术升级',
        description: '全面升级到 Next.js 14 + TypeScript，提升性能和开发体验。',
    },
    {
        id: 5,
        year: '2026',
        title: '国际化',
        description: '推出多语言支持，服务全球开发者。',
    },
];

export const techStack: TechItem[] = [
    {
        name: 'Next.js',
        icon: '⚡',
        category: '前端框架',
        description: 'React 全栈框架，提供服务端渲染和静态生成',
    },
    {
        name: 'React',
        icon: '⚛️',
        category: 'UI 库',
        description: '构建用户界面的 JavaScript 库',
    },
    {
        name: 'TypeScript',
        icon: '📘',
        category: '编程语言',
        description: '类型安全的 JavaScript 超集',
    },
    {
        name: 'Tailwind CSS',
        icon: '🎨',
        category: 'CSS 框架',
        description: '实用优先的 CSS 框架',
    },
    {
        name: 'Node.js',
        icon: '🟢',
        category: '后端',
        description: 'JavaScript 运行时环境',
    },
    {
        name: 'PostgreSQL',
        icon: '🐘',
        category: '数据库',
        description: '强大的开源关系型数据库',
    },
    {
        name: 'Docker',
        icon: '🐳',
        category: '部署',
        description: '容器化部署和管理',
    },
    {
        name: 'Vercel',
        icon: '▲',
        category: '托管平台',
        description: '全球领先的前端部署平台',
    },
];