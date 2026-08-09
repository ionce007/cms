// app/admin/page.tsx
'use client';

import StatCard from '@/components/dashboard/StatCard';
import QuickActions from '@/components/dashboard/QuickActions';
import ContentSection from '@/components/content/ContentSection';
import { useContentData } from '@/hooks/useContentData';

export default function AdminDashboard() {
    const { stats, sections, loading, error, refresh } = useContentData();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mx-auto" />
                    <p className="text-gray-600 font-medium">正在加载数据...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center space-y-4">
                    <div className="text-6xl">😕</div>
                    <h2 className="text-xl font-semibold text-gray-800">加载失败</h2>
                    <p className="text-gray-600">{error}</p>
                    <button
                        onClick={refresh}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        🔄 重新加载
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">仪表盘</h1>
                <p className="text-sm text-gray-500 mt-1">欢迎回来，这是您的内容概览</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {stats.map((stat, index) => (
                    <StatCard key={index} stat={stat} index={index} />
                ))}
            </div>

            <div className="space-y-6">
                {sections.map((section) => (
                    <ContentSection key={section.id} section={section} />
                ))}
            </div>
        </div>
    );
}