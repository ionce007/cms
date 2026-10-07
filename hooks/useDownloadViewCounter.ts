// hooks/useDownloadViewCounter.ts
'use client';

import { useEffect, useRef, useState } from 'react';
import { API_BASE_URL } from '@/config/env';
//import { API_ENDPOINTS } from '@/config/routes'
/**
 * 下载文件浏览量计数（防刷）
 * - 使用 localStorage 记录已浏览文件
 * - 同一文件 24 小时内只计一次
 */
const STORAGE_KEY = 'viewed_downloads';
const EXPIRE_TIME = 24 * 60 * 60 * 1000; // 24 小时

interface ViewedRecord {
    [fsId: string]: number;
}

function getViewedRecords(): ViewedRecord {
    if (typeof window === 'undefined') return {};

    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return {};

        const records: ViewedRecord = JSON.parse(raw);
        const now = Date.now();

        const cleaned: ViewedRecord = {};
        Object.entries(records).forEach(([id, timestamp]) => {
            if (now - timestamp < EXPIRE_TIME) {
                cleaned[id] = timestamp;
            }
        });

        return cleaned;
    } catch {
        return {};
    }
}

function markAsViewed(fsId: string | number): void {
    if (typeof window === 'undefined') return;

    try {
        const records = getViewedRecords();
        records[String(fsId)] = Date.now();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
        console.warn('保存浏览记录失败:', e);
    }
}

function hasViewed(fsId: string | number): boolean {
    const records = getViewedRecords();
    return !!records[String(fsId)];
}

function getVisitorId(): string {
    if (typeof window === 'undefined') return '';

    const KEY = 'visitor_id';
    let id = localStorage.getItem(KEY);
    if (!id) {
        id = `v_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
        localStorage.setItem(KEY, id);
    }
    return id;
}

interface UseDownloadViewCounterOptions {
    fsId: number | string | undefined;
    enabled?: boolean;
    initialViews?: number;
    onSuccess?: (newViews: number) => void;
}

export function useDownloadViewCounter({
    fsId,
    enabled = true,
    initialViews = 0,
    onSuccess,
}: UseDownloadViewCounterOptions) {
    const [views, setViews] = useState(initialViews);
    const [isCounted, setIsCounted] = useState(false);
    const hasRun = useRef(false);

    // ✅ 同步初始值
    useEffect(() => {
        setViews(initialViews);
    }, [initialViews]);

    useEffect(() => {
        if (!enabled || !fsId || hasRun.current) return;

        // ✅ 防刷检查
        if (hasViewed(fsId)) {
            hasRun.current = true;
            setIsCounted(true);
            return;
        }

        hasRun.current = true;
        markAsViewed(fsId);

        // ✅ 乐观更新
        setViews(prev => prev + 1);

        async function sendViewCount() {
            try {
                const res = await fetch(
                    `${API_BASE_URL}/formulas/${fsId}/view`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ uid: getVisitorId() }),
                    }
                );

                if (!res.ok) throw new Error(`HTTP ${res.status}`);

                const data = await res.json();

                if (data.code === 1 && data.data) {
                    setViews(data.data.views);
                    onSuccess?.(data.data.views);
                    setIsCounted(true);
                }
            } catch (err) {
                console.warn('下载浏览量计数失败:', err);
            }
        }

        // ✅ 延迟 1 秒发送
        const timer = setTimeout(sendViewCount, 1000);
        return () => clearTimeout(timer);
    }, [fsId, enabled, onSuccess]);

    return { views, isCounted };
}