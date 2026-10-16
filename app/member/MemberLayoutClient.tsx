// app/member/MemberLayoutClient.tsx
'use client';

import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import Header from '@/components/frontend/Header';
import Footer from '@/components/frontend/Footer';
import MemberSidebar from './components/MemberSidebar';
import MemberUserCard from './components/MemberUserCard';
import { API_BASE_URL } from '@/config/env';
import { useAuth } from '@/contexts/AuthContext';

// ============ 用户信息 Context ============
export interface MemberUser {
    id: number;
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
    const { isLoggedIn, isLoading: authLoading, token } = useAuth();

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
        // 未登录时直接结束
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

    return (
        <MemberUserContext.Provider
            value={{ user, loading, refresh: fetchUser }}
        >
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Header />

                <main className="flex-1">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">

                        {/* ==========================================================
                窄屏（lg 以下）：用户卡片 + 横向 Tab 菜单，占据顶部
                宽屏（lg 及以上）：隐藏此块，改用左侧边栏
            ========================================================== */}
                        <div className="lg:hidden mb-6 space-y-3">
                            {/* 紧凑版用户卡片 */}
                            <MemberUserCard compact />

                            {/* 横向滚动 Tab 菜单 */}
                            <div className="-mx-4 px-4 overflow-x-auto scrollbar-hide">
                                <MemberSidebar horizontal />
                            </div>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* ======================================================
                  宽屏（lg 及以上）：左侧用户卡片 + 垂直菜单
                  窄屏：隐藏（上面已有横向版本）
              ====================================================== */}
                            <div className="hidden lg:block w-64 flex-shrink-0 space-y-4">
                                <MemberUserCard />
                                <MemberSidebar />
                            </div>

                            {/* 主内容 */}
                            <div className="flex-1 min-w-0">{children}</div>
                        </div>
                    </div>
                </main>

                <Footer />
            </div>
        </MemberUserContext.Provider>
    );
}