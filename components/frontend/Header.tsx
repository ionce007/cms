// components/frontend/Header.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { FrontendArticle1 } from '@/types/frontend';
import SafeImage from './SafeImage';
//import { allArticles } from '@/data/articlesData';

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();

    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<FrontendArticle1[]>([]);
    const [isMounted, setIsMounted] = useState(false);

    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setIsMounted(true);
        const handleScroll = () => setIsScrolled(window.scrollY > 10);
        handleScroll();
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // 点击外部关闭搜索
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsSearchOpen(false);
                setSearchTerm('');
                setSearchResults([]);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // 键盘快捷键
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen(true);
                setTimeout(() => inputRef.current?.focus(), 100);
            }
            if (e.key === 'Escape') {
                setIsSearchOpen(false);
                setSearchTerm('');
                setSearchResults([]);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // 搜索逻辑 - 修复 Bug
    const handleSearch = async (value: string) => {
        // ✅ 修复：使用 trim() 检查，去除前后空格
        const trimmedValue = value.trim();
        setSearchTerm(trimmedValue);

        // ✅ 修复：空字符串或纯空格时清空结果
        if (trimmedValue.length === 0) {
            setSearchResults([]);
            return;
        }

        const searchLower = trimmedValue.toLowerCase();

        // ✅ 修复：确保只有真正匹配的文章才显示
        try {
            const response = await fetch('/api/articles?search=' + encodeURIComponent(searchLower));
            const articles = await response.json();
            setSearchResults(articles.data || []);
            // 处理获取到的文章数据
        } catch (error) {
            console.error('Error fetching articles:', error);
        }

        //setSearchResults(results);
    };

    // 跳转到搜索结果
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedTerm = searchTerm.trim();  // ✅ 修复：使用 trim()
        if (trimmedTerm && trimmedTerm.length === 0) return; // 如果没有搜索结果，则不进行跳转
        if (trimmedTerm) {
            router.push(`/articles?search=${encodeURIComponent(trimmedTerm)}`);
            setIsSearchOpen(false);
            setSearchTerm('');
            setSearchResults([]);
        }
    };

    // 点击搜索结果
    const handleResultClick = () => {
        setIsSearchOpen(false);
        setSearchTerm('');
        setSearchResults([]);
    };

    // 高亮匹配文字
    const highlightMatch = (text: string, keyword: string) => {
        const trimmedKeyword = keyword.trim();  // ✅ 修复：使用 trim()
        if (!trimmedKeyword) return text;

        const escapedKeyword = trimmedKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escapedKeyword})`, 'gi');

        return text.split(regex).map((part, index) =>
            regex.test(part) ? (
                <span key={index} className="bg-yellow-200 text-gray-800 font-medium">
                    {part}
                </span>
            ) : (
                <span key={index}>{part}</span>
            )
        );
    };

    const navItems = [
        { label: '首页', href: '/', active: pathname === '/' },
        { label: '文章', href: '/articles', active: pathname.startsWith('/articles') },
        { label: '分类', href: '/categories', active: pathname.startsWith('/categories') },
        { label: '标签', href: '/tags', active: pathname.startsWith('/tags') },
        { label: '关于', href: '/about', active: pathname === '/about' },
    ];

    return (
        <header
            className={cn(
                'sticky top-0 z-50 transition-all duration-300',
                isMounted && isScrolled
                    ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200/60'
                    : 'bg-white border-b border-gray-200'
            )}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* 左侧：Logo + 导航 */}
                    <div className="flex items-center space-x-4">
                        <Link href="/" className="flex items-center space-x-2 group">
                            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                                <span className="text-white font-bold text-lg">T</span>
                            </div>
                            <span className="text-xl font-bold text-gray-800 hidden sm:block">
                                Tech<span className="text-primary-600">Blog</span>
                            </span>
                        </Link>

                        <nav className="hidden lg:flex items-center space-x-1 ml-8">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        'px-4 py-2 rounded-lg text-lg font-medium transition-all duration-200',
                                        item.active
                                            ? 'bg-primary-50 text-primary-600 shadow-sm'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    )}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* 右侧：搜索 + 订阅 + 汉堡按钮 */}
                    <div className="flex items-center space-x-2 sm:space-x-3">
                        {/* 搜索区域 */}
                        <div className="relative" ref={searchRef}>
                            {!isSearchOpen && (
                                <button
                                    onClick={() => {
                                        setIsSearchOpen(true);
                                        setTimeout(() => inputRef.current?.focus(), 100);
                                    }}
                                    className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                                    aria-label="搜索"
                                    title="搜索 (Ctrl+K)"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </button>
                            )}

                            {isSearchOpen && (
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-72 sm:w-96">
                                    <form onSubmit={handleSearchSubmit}>
                                        <div className="relative">
                                            <input
                                                ref={inputRef}
                                                type="text"
                                                placeholder="搜索文章、标签、作者..."
                                                value={searchTerm}
                                                onChange={(e) => handleSearch(e.target.value)}
                                                onPaste={(e) => {
                                                    // ✅ 修复：处理粘贴事件
                                                    e.preventDefault();
                                                    const pastedText = e.clipboardData.getData('text');
                                                    const newValue = pastedText; // 直接使用粘贴内容
                                                    handleSearch(newValue);
                                                }}
                                                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-lg"
                                            />
                                            <svg
                                                className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                            {searchTerm && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSearchTerm('');
                                                        setSearchResults([]);
                                                        inputRef.current?.focus();
                                                    }}
                                                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    </form>

                                    {/* 搜索结果下拉 - 仅当有非空搜索词时显示 */}
                                    {searchTerm.trim() && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden max-h-96 overflow-y-auto animate-fade-in">
                                            {searchResults.length > 0 ? (
                                                <>
                                                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 text-xs text-gray-500">
                                                        找到 {searchResults.length} 条结果
                                                    </div>
                                                    {searchResults.map((article) => (
                                                        <Link
                                                            key={article.id}
                                                            href={`/articles/${article.id}`}
                                                            onClick={handleResultClick}
                                                            className="block px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
                                                        >
                                                            <div className="flex items-start space-x-3">
                                                                {/*<img
                                                                    src={article.img}
                                                                    alt={article.title}
                                                                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                                                                />*/}
                                                                <SafeImage
                                                                    src={article.img}
                                                                    alt={article.title}
                                                                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                                                                />
                                                                <div className="flex-1 min-w-0">
                                                                    <h4 className="text-sm font-medium text-gray-800 truncate">
                                                                        {highlightMatch(article.title, searchTerm)}
                                                                    </h4>
                                                                    <p className="text-xs text-gray-500 truncate mt-0.5">
                                                                        {highlightMatch(article.description.slice(0, 60) + '...', searchTerm)}
                                                                    </p>
                                                                    <div className="flex items-center space-x-2 mt-1 text-xs text-gray-400">
                                                                        <span>{article.Category.name}</span>
                                                                        <span>•</span>
                                                                        <span>{article.author.name}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    ))}
                                                    <button
                                                        onClick={handleSearchSubmit}
                                                        className="w-full px-4 py-2.5 text-center text-sm text-primary-600 hover:bg-primary-50 transition-colors font-medium"
                                                    >
                                                        查看全部搜索结果 →
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="px-4 py-8 text-center">
                                                    <div className="text-3xl mb-2">🔍</div>
                                                    <p className="text-sm text-gray-500">未找到相关文章</p>
                                                    <p className="text-xs text-gray-400 mt-1">尝试其他关键词</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <button className="hidden md:inline-flex items-center space-x-1.5 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm hover:shadow">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span>订阅</span>
                        </button>

                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden p-2 -mr-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                            aria-label="菜单"
                        >
                            {isMobileMenuOpen ? (
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* 移动端菜单 */}
            {isMobileMenuOpen && (
                <div className="lg:hidden border-t border-gray-200 bg-white shadow-lg animate-fade-in">
                    <div className="px-4 py-3 space-y-1">
                        <div className="mb-3">
                            <input
                                type="text"
                                placeholder="搜索文章..."
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                            {searchTerm.trim() && searchResults.length > 0 && (
                                <div className="mt-2 space-y-1">
                                    {searchResults.slice(0, 5).map((article) => (
                                        <Link
                                            key={article.id}
                                            href={`/articles/${article.id}`}
                                            onClick={() => {
                                                handleResultClick();
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className="block px-3 py-2 rounded-lg hover:bg-gray-100 text-sm text-gray-700"
                                        >
                                            {article.title}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'block px-4 py-3 rounded-lg text-base font-medium transition-colors',
                                    item.active
                                        ? 'bg-primary-50 text-primary-700'
                                        : 'text-gray-700 hover:bg-gray-100'
                                )}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </header>
    );
}