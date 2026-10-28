// contexts/AuthContext.tsx
'use client';


import { createContext, useContext, useState, useEffect, useCallback, ReactNode, } from 'react';
import { usePathname } from 'next/navigation';
import { API_BASE_URL } from '@/config/env';

interface User {
    id: number;
    username: string;
    nickname: string;
    avatar: string;
    role: string;
    email?: string;
    vipExpireAt?: string;
}

interface AuthContextValue {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isLoggedIn: boolean;
    isVip: boolean;
    isAdmin: boolean;
    login: (username: string, password: string) => Promise<void>;
    register: (data: {
        username: string;
        password: string;
        email?: string;
        nickname?: string;
    }) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export function AuthProvider({ children }: { children: ReactNode }) {
    const pathname = usePathname();

    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // ✅ 拦截器：自动记录当前页面（排除登录页本身和纯 API 页面）
    useEffect(() => {
        if (pathname && !pathname.startsWith('/login') && !pathname.startsWith('/register')) {
            // 将当前路径和查询参数记录下来
            const currentUrl = window.location.pathname + window.location.search;
            sessionStorage.setItem('login_redirect_url', currentUrl);
        }
    }, [pathname]);
    
    // ✅ 清理登录状态
    const clearAuth = useCallback(() => {
        setUser(null);
        setToken(null);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    }, []);

    // ✅ 初始化：从 localStorage 恢复 + 验证 token
    useEffect(() => {
        let isMounted = true;

        async function initAuth() {
            try {
                const savedToken = localStorage.getItem(TOKEN_KEY);
                const savedUser = localStorage.getItem(USER_KEY);

                // ✅ 没有 token，直接结束
                if (!savedToken || !savedUser) {
                    if (isMounted) setIsLoading(false);
                    return;
                }

                // ✅ 先显示本地用户（提升体验，避免白屏）
                try {
                    if (isMounted) {
                        setToken(savedToken);
                        setUser(JSON.parse(savedUser));
                    }
                } catch {
                    // 解析失败，清理
                    clearAuth();
                    if (isMounted) setIsLoading(false);
                    return;
                }

                // ✅ 关键：调用 /api/member/me 验证 token 有效性
                try {
                    const res = await fetch(`${API_BASE_URL}/member/me`, {
                        headers: { Authorization: `Bearer ${savedToken}` },
                    });

                    // ✅ 401/403：token 无效或用户已被删除/停用
                    if (res.status === 401 || res.status === 403) {
                        console.warn('登录已失效，自动登出');
                        clearAuth();
                        return;
                    }

                    if (!res.ok) {
                        // 其他错误（如 500）不强制登出，保留本地状态
                        console.warn('验证用户信息失败:', res.status);
                        return;
                    }

                    const data = await res.json();

                    // ✅ 后端返回码判断
                    if (data.code === -1 || !data.data) {
                        console.warn('用户信息无效，自动登出');
                        clearAuth();
                        return;
                    }

                    // ✅ 更新用户信息（可能昵称/头像已变更）
                    if (isMounted) {
                        setUser(data.data);
                        localStorage.setItem(USER_KEY, JSON.stringify(data.data));
                    }
                } catch (err) {
                    // 网络错误：保留本地状态，允许离线使用
                    console.warn('验证登录状态时网络错误:', err);
                }
            } finally {
                if (isMounted) setIsLoading(false);
            }
        }

        initAuth();

        return () => {
            isMounted = false;
        };
    }, [clearAuth]);

    // ✅ 登录
    const login = useCallback(async (username: string, password: string) => {
        const res = await fetch(`${API_BASE_URL}/member/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        const data = await res.json();

        if (data.code !== 1) {
            throw new Error(data.message || '登录失败');
        }

        setToken(data.data.token);
        setUser(data.data.user);

        localStorage.setItem(TOKEN_KEY, data.data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(data.data.user));
    }, []);

    // ✅ 注册
    const register = useCallback(async (formData: {
        username: string;
        password: string;
        email?: string;
        nickname?: string;
    }) => {
        const res = await fetch(`${API_BASE_URL}/member/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        const data = await res.json();

        if (data.code !== 1) {
            throw new Error(data.message || '注册失败');
        }

        setToken(data.data.token);
        setUser(data.data.user);

        localStorage.setItem(TOKEN_KEY, data.data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(data.data.user));
    }, []);

    // ✅ 登出
    const logout = useCallback(() => {
        clearAuth();
    }, [clearAuth]);

    // ✅ 刷新用户信息（手动调用）
    const refreshUser = useCallback(async () => {
        if (!token) return;

        try {
            const res = await fetch(`${API_BASE_URL}/member/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.status === 401 || res.status === 403) {
                clearAuth();
                return;
            }

            if (!res.ok) return;

            const data = await res.json();

            if (data.code === 1 && data.data) {
                setUser(data.data);
                localStorage.setItem(USER_KEY, JSON.stringify(data.data));
            } else {
                clearAuth();
            }
        } catch (err) {
            console.warn('刷新用户信息失败:', err);
        }
    }, [token, clearAuth]);

    const isLoggedIn = !!user && !!token;
    const isVip =
        user?.role === 'vip' &&
        (!user.vipExpireAt || new Date(user.vipExpireAt) > new Date());
    const isAdmin = user?.role === 'super';

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isLoading,
                isLoggedIn,
                isVip,
                isAdmin,
                login,
                register,
                logout,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}