// hooks/useAdminFetch.ts
'use client';
import { useCallback } from 'react';
import { API_BASE_URL } from '@/config/env';

export function useAdminFetch() {
    const adminFetch = useCallback(async (path: string, options: RequestInit = {}) => {
        const token = localStorage.getItem('admin_token');
        const headers = {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        };
        const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
        return res.json();
    }, []);
    return { adminFetch };
}