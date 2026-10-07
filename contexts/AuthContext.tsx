// contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { API_BASE_URL } from '@/config/env';

interface Member {
    id: number;
    username: string;
    nickname: string;
    avatar: string;
    role: string;
    email?: string;
    vipExpireAt?: string;
}

interface AuthContextValue {
    user: Member | null;
    token: string | null;
    isLoading: boolean;
    isLoggedIn: boolean;
    isVip: boolean;
    isAdmin: boolean;
    login: (username: string, password: string) => Promise<void>;
    register: (data: { username: string; password: string; email?: string; nickname?: string }) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<Member | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // ✅ 初始化：从 localStorage 恢复
    useEffect(() => {
        try {
            const savedToken = localStorage.getItem(TOKEN_KEY);
            const savedUser = localStorage.getItem(USER_KEY);

            if (savedToken && savedUser) {
                setToken(savedToken);
                setUser(JSON.parse(savedUser));
            }
        } catch (e) {
            console.warn('恢复登录状态失败:', e);
        } finally {
            setIsLoading(false);
        }
    }, []);

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
        setUser(null);
        setToken(null);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    }, []);

    // ✅ 刷新用户信息
    const refreshUser = useCallback(async () => {
        if (!token) return;

        try {
            const res = await fetch(`${API_BASE_URL}/member/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json();

            if (data.code === 1) {
                setUser(data.data);
                localStorage.setItem(USER_KEY, JSON.stringify(data.data));
            } else if (res.status === 401) {
                logout();
            }
        } catch (err) {
            console.warn('刷新用户信息失败:', err);
        }
    }, [token, logout]);

    const isLoggedIn = !!user;
    const isVip =
        user?.role === 'vip' &&
        (!user.vipExpireAt || new Date(user.vipExpireAt) > new Date());
    const isAdmin = user?.role === 'admin';

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