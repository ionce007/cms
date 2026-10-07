// hooks/useViewCounter.ts
'use client';

import { useEffect, useRef, useState } from 'react';
import { API_BASE_URL } from '@/config/env';
import { API_ENDPOINTS } from '@/config/routes';

/**
 * 防刷策略：
 * - 使用 localStorage 记录已浏览的文章 ID + 时间戳
 * - 同一篇文章 3 分钟内只计一次
 */
const STORAGE_KEY = 'viewed_articles';
const EXPIRE_TIME =  3 * 60 * 1000; // 3 分钟

interface ViewedRecord {
    [articleId: string]: number;  // articleId -> timestamp
}

/**
 * 读取已浏览记录
 */
function getViewedRecords(): ViewedRecord {
    if (typeof window === 'undefined') return {};

    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return {};

        const records: ViewedRecord = JSON.parse(raw);
        const now = Date.now();

        // ✅ 清理过期记录
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

/**
 * 记录已浏览
 */
function markAsViewed(articleId: string | number): void {
    if (typeof window === 'undefined') return;

    try {
        const records = getViewedRecords();
        records[String(articleId)] = Date.now();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
        console.warn('保存浏览记录失败:', e);
    }
}

/**
 * 检查是否已浏览
 */
function hasViewed(articleId: string | number): boolean {
    const records = getViewedRecords();
    return !!records[String(articleId)];
}

interface UseViewCounterOptions {
    articleId: number | string | undefined;
    /** 是否启用（默认 true） */
    enabled?: boolean;
    /** 初始浏览量 */
    initialPv?: number;
    /** 计数成功回调 */
    onSuccess?: (newPv: number) => void;
}

interface UseViewCounterResult {
    /** 当前浏览量（乐观更新） */
    pv: number;
    /** 是否已完成计数 */
    isCounted: boolean;
}

export function useViewCounter({
    articleId = '',
    enabled = true,
    initialPv = 0,
    onSuccess,
}: UseViewCounterOptions): UseViewCounterResult {
    const [pv, setPv] = useState(initialPv);
    const [isCounted, setIsCounted] = useState(false);
    const hasRun = useRef(false);

    // ✅ 同步初始值
    useEffect(() => {
        setPv(initialPv);
    }, [initialPv]);

    useEffect(() => {
        // 前置检查
        if (!enabled || !articleId || hasRun.current) return;

        // ✅ 检查是否已浏览过（防刷）
        if (hasViewed(articleId)) {
            hasRun.current = true;
            setIsCounted(true);
            return;
        }

        hasRun.current = true;

        // ✅ 立即标记为已浏览（避免重复触发）
        markAsViewed(articleId);

        // ✅ 乐观更新：立即 +1
        setPv(prev => prev + 1);

        // ✅ 异步发送请求
        async function sendViewCount() {
            try {
                const res = await fetch(
                    `${API_BASE_URL}${API_ENDPOINTS.ARTICLE_DETAIL(articleId)}/view`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            uid: getVisitorId(),
                        }),
                    }
                );

                if (!res.ok) throw new Error(`HTTP ${res.status}`);

                const data = await res.json();

                if (data.code === 1 && data.data) {
                    // ✅ 用服务端返回的准确值同步
                    setPv(data.data.pv);
                    onSuccess?.(data.data.pv);
                    setIsCounted(true);
                }
            } catch (err) {
                console.warn('浏览量计数失败:', err);
                // 失败时不影响页面显示，保留乐观值
            }
        }

        // ✅ 延迟 500 毫秒发送，避免用户快速离开时浪费请求
        const timer = setTimeout(sendViewCount, 500);

        return () => clearTimeout(timer);
    }, [articleId, enabled, onSuccess]);

    return { pv, isCounted };
}

/**
 * 获取访客唯一标识（用于防刷）
 */
function getVisitorId(): string {
    if (typeof window === 'undefined') return '';

    const KEY = 'visitor_id';
    let id = localStorage.getItem(KEY);

    if (!id) {
        // ✅ 生成唯一 ID
        id = `v_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
        localStorage.setItem(KEY, id);
    }

    return id;
}