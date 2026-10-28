// hooks/usePermission.ts
'use client';

import { useAdminAuth } from '@/contexts/AdminAuthContext';

export function usePermission() {
    const { adminUser } = useAdminAuth();

    /**
     * 判断是否有权限
     * @param module 模块名，如 'articles'
     * @param action 操作名，如 'create'
     */
    const hasPermission = (module: string, action: string): boolean => {
        // 超级管理员默认拥有所有权限
        if (adminUser?.role === 'super') return true;

        const perms = adminUser?.permissions || {};
        // 检查该模块是否存在且包含该操作
        return Array.isArray(perms[module]) && perms[module].includes(action);
    };

    return { hasPermission };
}