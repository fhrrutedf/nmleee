'use client';

import { useState } from 'react';
import { FiMessageCircle, FiSend, FiHeart, FiCornerDownRight } from 'react-icons/fi';

interface Comment {
    id: string;
    content: string;
    authorName: string;
    likes: number;
    createdAt: string;
    replies?: Comment[];
}

interface CommentSectionProps {
    lessonId: string;
    comments: Comment[];
    onCommentAdded?: () => void;
}

export default function CommentSection({ lessonId, comments: initialComments, onCommentAdded }: CommentSectionProps) {
    const [comments, setComments] = useState<Comment[]>(initialComments);
    const [newComment, setNewComment] = useState('');
    const [replyTo, setReplyTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const [loading, setLoading] = useState(false);

    const addComment = async () => {
        if (!newComment.trim()) return;

        setLoading(true);
        try {
            const response = await fetch(`/api/lessons/${lessonId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: newComment,
                    authorName: 'الطالب', // Should come from session
                    authorEmail: 'student@example.com', // Should come from session
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setComments([data, ...comments]);
                setNewComment('');
                onCommentAdded?.();
            }
        } catch (error) {
            console.error('Error adding comment:', error);
        } finally {
            setLoading(false);
        }
    };

    const addReply = async (parentId: string) => {
        if (!replyText.trim()) return;

        setLoading(true);
        try {
            const response = await fetch(`/api/lessons/${lessonId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: replyText,
                    authorName: 'الطالب',
                    authorEmail: 'student@example.com',
                    parentId,
                }),
            });

            if (response.ok) {
                // Refresh comments to show new reply
                const commentsResponse = await fetch(`/api/lessons/${lessonId}/comments`);
                if (commentsResponse.ok) {
                    const data = await commentsResponse.json();
                    setComments(data);
                }
                setReplyText('');
                setReplyTo(null);
            }
        } catch (error) {
            console.error('Error adding reply:', error);
        } finally {
            setLoading(false);
        }
    };

    const likeComment = async (commentId: string) => {
        // TODO: Implement like API
        console.log('Like comment:', commentId);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return 'اليوم';
        if (days === 1) return 'أمس';
        if (days < 7) return `منذ ${days} أيام`;
        return date.toLocaleDateString('ar-EG');
    };

    const renderComment = (comment: Comment, isReply = false) => (
        <div key={comment.id} className={`${isReply ? 'mr-12 mt-4' : ''}`}>
            <div className="flex gap-3">
                <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {comment.authorName.charAt(0)}
                    </div>
                </div>
                <div className="flex-1">
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">{comment.authorName}</h4>
                            <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4 mt-2">
                        <button
                            onClick={() => likeComment(comment.id)}
                            className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600 transition-colors"
                        >
                            <FiHeart size={16} />
                            <span>{comment.likes}</span>
                        </button>
                        {!isReply && (
                            <button
                                onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                                className="flex items-center gap-1 text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                            >
                                <FiCornerDownRight size={16} />
                                <span>رد</span>
                            </button>
                        )}
                    </div>

                    {/* Reply Form */}
                    {replyTo === comment.id && (
                        <div className="mt-3 flex gap-2">
                            <input
                                type="text"
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="اكتب ردك..."
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                onKeyPress={(e) => e.key === 'Enter' && addReply(comment.id)}
                            />
                            <button
                                onClick={() => addReply(comment.id)}
                                disabled={loading}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                            >
                                <FiSend size={16} />
                            </button>
                        </div>
                    )}

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                        <div className="space-y-4 mt-4">
                            {comment.replies.map((reply) => renderComment(reply, true))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FiMessageCircle />
                التعليقات ({comments.length})
            </h3>

            {/* New Comment Form */}
            <div className="mb-6">
                <div className="flex gap-3">
                    <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                            ط
                        </div>
                    </div>
                    <div className="flex-1">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="شارك رأيك أو اسأل سؤالاً..."
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                        />
                        <div className="flex justify-end mt-2">
                            <button
                                onClick={addComment}
                                disabled={loading || !newComment.trim()}
                                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FiSend size={16} />
                                نشر التعليق
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Comments List */}
            <div className="space-y-6">
                {comments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        لا توجد تعليقات بعد. كن أول من يعلق!
                    </div>
                ) : (
                    comments.map((comment) => renderComment(comment))
                )}
            </div>
        </div>
    );
}
