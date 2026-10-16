// components/frontend/CommentSection.tsx
'use client';

import CommentItem from './CommentItem';
import CommentForm from './CommentForm';
import { useComments } from '@/hooks/useComments';

interface CommentSectionProps {
    targetType: 'article' | 'formula';
    targetId: string;
}

export default function CommentSection({
    targetType,
    targetId,
}: CommentSectionProps) {
    const {
        comments,
        loading,
        submitting,
        error,
        addComment,
        deleteComment,
    } = useComments({ targetType, targetId });

    const handleSubmitReply = async (data: {
        content: string;
        nickname?: string;
        email?: string;
        parentId?: number;
    }) => {
        return await addComment(data.content, data.parentId);
    };

    const handleDelete = async (id: number) => {
        await deleteComment(id);
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mt-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6">
                评论 ({comments.length})
            </h3>

            <CommentForm
                onSubmit={handleSubmitReply}
                isSubmitting={submitting}
                placeholder="写下你的评论..."
            />

            {loading ? (
                <div className="text-center py-8 text-gray-400">加载中...</div>
            ) : error ? (
                <div className="text-center py-8 text-red-500">{error}</div>
            ) : comments.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">
                    暂无评论，来抢沙发吧～
                </p>
            ) : (
                <div className="mt-6 divide-y divide-gray-100">
                    {comments.map(comment => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            onSubmitReply={handleSubmitReply}
                            onDelete={handleDelete}
                            isSubmitting={submitting}
                            level={1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}