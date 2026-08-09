import { useState, useEffect, useCallback } from 'react';
import { StatData, ContentSection } from '@/types';
import { mockStats, mockContentData } from '@/data/mockData';

interface UseContentDataReturn {
    stats: StatData[];
    sections: ContentSection[];
    loading: boolean;
    error: string | null;
    refresh: () => void;
}

export function useContentData(): UseContentDataReturn {
    const [stats, setStats] = useState<StatData[]>([]);
    const [sections, setSections] = useState<ContentSection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // 模拟 API 请求延迟
            await new Promise(resolve => setTimeout(resolve, 800));

            // 在实际项目中，这里应该是真实的 API 调用
            // const response = await fetch('/api/dashboard');
            // const data = await response.json();

            setStats(mockStats);
            setSections(mockContentData);
        } catch (err) {
            setError('获取数据失败，请稍后重试');
            console.error('Failed to fetch dashboard data:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        stats,
        sections,
        loading,
        error,
        refresh: fetchData,
    };
}