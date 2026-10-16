// hooks/useMemberFetch.ts
'use client';

import { useCallback } from 'react';
import { API_BASE_URL } from '@/config/env';
import { useAuth } from '@/contexts/AuthContext';

/**
 * ✅ 统一的会员 API 请求 Hook
 *
 * 特性：
 * - 自动注入 Authorization 头
 * - 未登录时直接返回失败，不发起请求
 * - 401 静默处理
 * - 统一错误兜底
 */
export function useMemberFetch() {
    const { token } = useAuth();

    const memberFetch = useCallback(
        async <T = any>(
            path: string,
            options: RequestInit = {}
        ): Promise<{
            ok: boolean;
            data?: T;
            message?: string;
            status?: number;
        }> => {
            // ✅ 未登录时直接返回失败，不发起请求
            if (!token) {
                return { ok: false, message: '未登录', status: 401 };
            }

            try {
                const res = await fetch(`${API_BASE_URL}${path}`, {
                    ...options,
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                        ...(options.headers || {}),
                    },
                });

                // ✅ 401 静默处理
                if (res.status === 401) {
                    return { ok: false, message: '未授权', status: 401 };
                }

                const data = await res.json();
                if (data.code === 1) {
                    return { ok: true, data: data.data, status: res.status };
                }

                return {
                    ok: false,
                    message: data.message || '请求失败',
                    status: res.status,
                };
            } catch (err) {
                return {
                    ok: false,
                    message: err instanceof Error ? err.message : '网络错误',
                };
            }
        },
        [token]
    );

    return { memberFetch };
}