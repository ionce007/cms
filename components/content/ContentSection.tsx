import { ContentSectionProps } from '@/types';
import { Article, Media, User, Setting } from '@/types';
import ArticleCard from './ArticleCard';
import MediaCard from './MediaCard';
import UserCard from './UserCard';
import SettingCard from './SettingCard';

export default function ContentSection({ section }: ContentSectionProps) {
    const renderCards = () => {
        switch (section.type) {
            case 'article':
                return (section.items as Article[]).map((item, index) => (
                    <ArticleCard key={item.id} article={item} />
                ));
            case 'media':
                return (section.items as Media[]).map((item) => (
                    <MediaCard key={item.id} media={item} />
                ));
            case 'user':
                return (section.items as User[]).map((item) => (
                    <UserCard key={item.id} user={item} />
                ));
            case 'setting':
                return (section.items as Setting[]).map((item) => (
                    <SettingCard key={item.id} setting={item} />
                ));
            default:
                return null;
        }
    };

    return (
        <div className="card overflow-hidden animate-slide-up">
            {/* 区块头部 */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center space-x-2">
                    <span className="text-xl">{section.icon}</span>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">{section.title}</h2>
                        {section.description && (
                            <p className="text-xs text-gray-500 mt-0.5">{section.description}</p>
                        )}
                    </div>
                    <span className="text-sm text-gray-400 ml-2">({section.items.length})</span>
                </div>
                <div className="flex items-center space-x-2">
                    <button className="btn-ghost text-sm">
                        筛选
                    </button>
                    <button className="text-sm text-primary-600 hover:text-primary-700 font-medium px-3 py-1.5 rounded-lg hover:bg-primary-50 transition-colors">
                        查看全部 →
                    </button>
                </div>
            </div>

            {/* 内容网格 */}
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {renderCards()}
                </div>
            </div>
        </div>
    );
}