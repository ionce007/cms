// types/frontend.ts - 在现有基础上添加
export interface FrontendArticle {
    id: number;
    title: string;
    excerpt: string;
    content?: string;
    coverImage: string;
    author: {
        name: string;
        avatar: string;
    };
    category: string;
    categorySlug: string;
    tags: string[];
    publishDate: string;
    readTime: number;
    views: number;
    likes: number;
    comments: number;
    featured?: boolean;
}

export interface Category {
    id: number;
    name: string;
    slug: string;
    count: number;
    icon: string;
}

export interface Tag {
    id: number;
    name: string;
    slug: string;
    count: number;
}

export interface PopularPost {
    id: number;
    title: string;
    date: string;
    views: number;
    thumbnail?: string;
}

export interface SiteInfo {
    name: string;
    description: string;
    logo: string;
    socialLinks: {
        github?: string;
        twitter?: string;
        weibo?: string;
        email?: string;
    };
}

export interface PaginationInfo {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
}

export interface ArticleFilters {
    category: string;
    tag: string;
    sort: 'latest' | 'popular' | 'oldest';
    search: string;
}

export interface Comment {
  id: number;
  articleId: number;
  author: {
    name: string;
    avatar: string;
  };
  content: string;
  date: string;
  likes: number;
  replies?: Comment[];
}

export interface ArticleDetail extends FrontendArticle {
  content: string;
  tableOfContents: {
    id: string;
    title: string;
  }[];
  comments: Comment[];
}