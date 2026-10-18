// app/member/MemberLayoutClient.tsx
'use client';

import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Header from '@/components/frontend/Header';
import Footer from '@/components/frontend/Footer';
import MemberSidebar from './components/MemberSidebar';
import MemberUserCard from './components/MemberUserCard';
import { API_BASE_URL } from '@/config/env';
import { useAuth } from '@/contexts/AuthContext';

// ============ 用户信息 Context ============
export interface MemberUser {
    id: number;
    username?: string;
    nickname: string;
    email: string;
    avatar?: string;
    level?: string;
    isVip?: boolean;
}

interface MemberUserContextValue {
    user: MemberUser | null;
    loading: boolean;
    refresh: () => Promise<void>;
}

const MemberUserContext = createContext<MemberUserContextValue>({
    user: null,
    loading: true,
    refresh: async () => { },
});

export function useMemberUser() {
    return useContext(MemberUserContext);
}

// ============ 布局组件 ============
export default function MemberLayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const { isLoggedIn, isLoading: authLoading, token } = useAuth();

    // ✅ 1. 所有 Hooks 必须放在最顶层，在条件判断之前声明
    const [user, setUser] = useState<MemberUser | null>(null);
    const [loading, setLoading] = useState(true);

    const getAuthHeaders = useCallback((): Record<string, string> => {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    }, [token]);

    const fetchUser = useCallback(async () => {
        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            const headers = getAuthHeaders();
            const res = await fetch(`${API_BASE_URL}/member/profile`, { headers });
            const data = await res.json();

            if (data.code === 1) {
                setUser(data.data);
            } else {
                setUser(null);
            }
        } catch (err) {
            console.error('获取用户信息失败:', err);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, [token, getAuthHeaders]);

    useEffect(() => {
        if (!authLoading) {
            fetchUser();
        }
    }, [authLoading, fetchUser]);

    // ✅ 未登录时的重定向拦截
    useEffect(() => {
        if (!authLoading && !isLoggedIn) {
            // 记录当前路径以便登录后跳回（如果之前有做记录逻辑）
            const currentUrl = window.location.pathname + window.location.search;
            sessionStorage.setItem('login_redirect_url', currentUrl);

            router.replace('/login');
        }
    }, [authLoading, isLoggedIn, router]);

    // ==========================================================
    // ✅ 2. 所有 Hooks 执行完毕后，再进行条件判断和渲染
    // ==========================================================

    // 鉴权状态加载中
    if (authLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Header />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-4">
                        <div className="w-12 h-12 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin mx-auto" />
                        <p className="text-gray-600">正在验证登录状态...</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    // 未登录（正在跳转中，或者由于某些原因未拦截成功）
    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Header />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-4">
                        <div className="text-6xl mb-4">🔒</div>
                        <h2 className="text-xl font-semibold text-gray-800">需要登录</h2>
                        <p className="text-gray-600">请先登录以访问会员中心</p>
                        <button
                            onClick={() => router.push('/login')}
                            className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                            去登录
                        </button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    // ==========================================================
    // ✅ 3. 渲染会员中心布局
    // ==========================================================
    return (
        <MemberUserContext.Provider value={{ user, loading, refresh: fetchUser }}>
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Header />

                <main className="flex-1">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">

                        {/* 窄屏 (lg 以下)：顶部紧凑用户卡片 + 横向滚动 Tab 菜单 */}
                        <div className="lg:hidden mb-6 space-y-3">
                            <MemberUserCard compact />
                            <div className="-mx-4 px-4 overflow-x-auto scrollbar-hide">
                                <MemberSidebar horizontal />
                            </div>
                        </div>

                        {/* 宽屏布局 (lg 及以上)：左侧边栏 + 右侧内容 */}
                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* 左侧边栏 */}
                            <div className="hidden lg:block w-64 flex-shrink-0 space-y-4">
                                <MemberUserCard />
                                <MemberSidebar />
                            </div>

                            {/* 右侧主内容区 */}
                            <div className="flex-1 min-w-0">{children}</div>
                        </div>

                    </div>
                </main>

                <Footer />
            </div>
        </MemberUserContext.Provider>
    );
}