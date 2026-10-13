// hooks/useDownloads.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '@/config/env';
import { API_ENDPOINTS } from '@/config/routes';
import { useAuth } from '@/contexts/AuthContext';

export type SortOption = 'latest' | 'oldest' | 'popular' | 'likes' | 'price_asc' | 'price_desc';

interface UseDownloadsOptions {
    page?: number;
    limit?: number;
    category?: string | number;
    kind?: string;
    search?: string;
    sort?: SortOption;
}

export function useDownloads(options: UseDownloadsOptions = {}) {
    const {
        page = 1,
        limit = 12,
        kind = '',
        search = '',
        sort = 'latest',
    } = options;
    const { token, isLoading: authLoading } = useAuth();

    const [items, setItems] = useState<any[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setIsLoaded(false);
        setError(null);

        try {
            const params = new URLSearchParams({
                page: String(page),
                limit: String(limit),
                sort,
            });

            if (kind !== '' && kind !== undefined) {
                params.append('kind', String(kind));
            }
            //if (kind) params.append('kind', kind);
            if (search) params.append('search', search);

            const headers: Record<string, string> = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const url = `${API_BASE_URL}${API_ENDPOINTS.FORMULAS}?${params}`;
            const res = await fetch(url, { headers });


            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const json = await res.json();

            if (json.code === 1) {
                setItems(json.data || []);
                setTotalItems(json.count || 0);
                setTotalPages(Math.ceil((json.count || 0) / limit));
            } else {
                setItems([]);
                setTotalItems(0);
                setTotalPages(0);
            }
        } catch (err) {
            console.error('获取下载列表失败:', err);
            setError(err instanceof Error ? err.message : '加载失败');
            setItems([]);
        } finally {
            setIsLoading(false);
            setIsLoaded(true);
        }
    }, [page, limit, kind, search, sort, token]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        items,
        totalItems,
        totalPages,
        isLoading,
        isLoaded,
        error,
        refresh: fetchData,
    };
}

/**
 * 获取文件详情
 */
export function useDownloadDetail(fsId: number | string | undefined) {
    const { token, isLoading: authLoading } = useAuth();  // ✅ 获取 token

    const [item, setItem] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        if (!fsId) {
            setIsLoading(false);
            setIsLoaded(true);
            return;
        }

        // ✅ 认证初始化未完成时，不发请求
        if (authLoading) {
            return;
        }

        setIsLoading(true);
        setIsLoaded(false);
        setError(null);

        try {
            // ✅ 构造请求头
            const headers: Record<string, string> = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const res = await fetch(`${API_BASE_URL}/formulas/${fsId}`, {
                headers,
            });

            // ✅ 401 处理
            if (res.status === 401) {
                setError('登录已失效，请重新登录');
                setItem(null);
                return;
            }

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }

            const data = await res.json();

            if (data.code === 1) {
                setItem(data.data || data.formula || null);
            } else {
                setError(data.message || '文件不存在');
                setItem(null);
            }
        } catch (err) {
            console.error('获取下载详情失败:', err);
            setError(err instanceof Error ? err.message : '加载失败');
            setItem(null);
        } finally {
            setIsLoading(false);
            setIsLoaded(true);
        }
    }, [fsId, token, authLoading]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        item,
        isLoading: isLoading || authLoading,
        isLoaded: isLoaded && !authLoading,
        error,
        refresh: fetchData,
    };
}