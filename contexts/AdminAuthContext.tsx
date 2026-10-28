// contexts/AdminAuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { API_BASE_URL } from '@/config/env';

interface AdminUser {
    id: number;
    username: string;
    role: string;
    roleName: string;
    //permissions: string[]; // ✅ 新增
    permissions: Record<string, string[]>;
}

interface AdminAuthContextType {
    adminUser: AdminUser | null;
    adminToken: string | null;
    isAdminLoggedIn: boolean;
    isLoading: boolean;
    adminLogin: (username: string, password: string) => Promise<void>;
    adminLogout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
    adminUser: null,
    adminToken: null,
    isAdminLoggedIn: false,
    isLoading: true,
    adminLogin: async () => { },
    adminLogout: () => { },
});

export function AdminAuthProvider({ children }: { children: ReactNode }) {
    const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
    const [adminToken, setAdminToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // 初始化：读取本地存储
    useEffect(() => {
        const savedToken = localStorage.getItem('admin_token');
        const savedUser = localStorage.getItem('admin_user');
        if (savedToken && savedUser) {
            setAdminToken(savedToken);
            setAdminUser(JSON.parse(savedUser));
        }
        setIsLoading(false);
    }, []);

    const adminLogin = async (username: string, password: string) => {
        const res = await fetch(`${API_BASE_URL}/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        const data = await res.json();

        if (data.code === 1) {
            // 登录成功后
            localStorage.setItem('admin_user', JSON.stringify(data.data.user));
            setAdminUser(data.data.user);
            localStorage.setItem('admin_token', data.data.token);
            localStorage.setItem('admin_user', JSON.stringify(data.data.user));
            setAdminToken(data.data.token);
            setAdminUser(data.data.user);
        } else {
            throw new Error(data.message || '登录失败');
        }
    };

    const adminLogout = () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        setAdminToken(null);
        setAdminUser(null);
    };

    return (
        <AdminAuthContext.Provider
            value={{
                adminUser,
                adminToken,
                isAdminLoggedIn: !!adminToken,
                isLoading,
                adminLogin,
                adminLogout,
            }}
        >
            {children}
        </AdminAuthContext.Provider>
    );
}

export const useAdminAuth = () => useContext(AdminAuthContext);