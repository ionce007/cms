// components/frontend/AuthorCard.tsx
import { FrontendArticle } from '@/types/frontend';

interface AuthorCardProps {
    author: FrontendArticle['author'];
}

export default function AuthorCard({ author }: AuthorCardProps) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mt-8">
            <div className="flex items-center space-x-4">
                <img
                    src={author.avatar}
                    alt={author.name}
                    className="w-16 h-16 rounded-full"
                />
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">{author.name}</h3>
                    <p className="text-sm text-gray-500">技术博主</p>
                </div>
            </div>
            <p className="text-sm text-gray-600 mt-4 leading-relaxed">
                热爱技术，专注于前端开发，喜欢分享和写作。
            </p>
            <button className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
                关注作者
            </button>
        </div>
    );
}