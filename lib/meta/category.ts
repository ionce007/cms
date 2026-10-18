import { API_BASE_URL } from '@/config/env'
// ✅ 抽离出一个获取文章数据的函数（可在 generateMetadata 和 page 中复用）
export async function getCategoryById(id: string) {
    try {
        const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
            // 可选：根据实际需求配置缓存策略
            cache: 'no-store',
        });
        if (!res.ok) return null;
        const json = await res.json();
        return json.code === 1 ? json.data : null;
    } catch (error) {
        console.error('获取文章失败:', error);
        return null;
    }
}
export async function getCategoryBySlug(id: string) {
    try {
        const res = await fetch(`${API_BASE_URL}/categories/${id}`, {
            // 可选：根据实际需求配置缓存策略
            cache: 'no-store',
        });
        if (!res.ok) return null;
        const json = await res.json();
        return json.code === 1 ? json.data : null;
    } catch (error) {
        console.error('获取文章失败:', error);
        return null;
    }
}