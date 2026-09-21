// components/frontend/CommentSection.tsx
'use client';

import { useState } from 'react';
import { Comment } from '@/types/frontend';
import SafeImage from './SafeImage';

interface CommentSectionProps {
    comments: Comment[];
    articleId: number;
}

export default function CommentSection({ comments, articleId }: CommentSectionProps) {
    const [newComment, setNewComment] = useState('');
    const [commentList, setCommentList] = useState(comments);

    const handleSubmitComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        const comment: Comment = {
            id: Date.now(),
            articleId,
            author: {
                name: '当前用户',
                avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop',
            },
            content: newComment,
            date: new Date().toISOString().split('T')[0],
            likes: 0,
        };

        setCommentList([...commentList, comment]);
        setNewComment('');
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mt-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6">
                评论 ({commentList.length})
            </h3>

            {/* 评论输入框 */}
            <form onSubmit={handleSubmitComment} className="mb-8">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="写下你的评论..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
                <div className="flex justify-end mt-2">
                    <button
                        type="submit"
                        disabled={!newComment.trim()}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        发表评论
                    </button>
                </div>
            </form>

            {/* 评论列表 */}
            <div className="space-y-6">
                {commentList.map((comment) => (
                    <div key={comment.id} className="flex space-x-3">
                        {/*<img
                            src={comment.author.avatar}
                            alt={comment.author.name}
                            className="w-10 h-10 rounded-full flex-shrink-0"
                        />*/}
                        <SafeImage
                            src={comment.author.avatar}
                            alt={comment.author.name}
                            className="w-10 h-10 rounded-full flex-shrink-0"
                        />
                        <div className="flex-1">
                            <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-800">{comment.author.name}</span>
                                <span className="text-xs text-gray-400">{comment.date}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{comment.content}</p>
                            <div className="flex items-center space-x-4 mt-2">
                                <button className="text-xs text-gray-400 hover:text-gray-600">
                                    点赞 ({comment.likes})
                                </button>
                                <button className="text-xs text-gray-400 hover:text-gray-600">
                                    回复
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}