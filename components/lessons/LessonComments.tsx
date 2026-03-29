'use client';

import { useState, useEffect } from 'react';
import { FiMessageSquare, FiSend, FiCornerDownLeft, FiMoreHorizontal } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface Comment {
    id: string;
    content: string;
    authorName: string;
    authorEmail: string;
    createdAt: string;
    replies?: Comment[];
}

export default function LessonComments({ lessonId, courseId }: { lessonId: string, courseId: string }) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);

    useEffect(() => {
        fetchComments();
    }, [lessonId]);

    const fetchComments = async () => {
        try {
            const res = await fetch(`/api/lessons/${lessonId}/comments`);
            if (res.ok) setComments(await res.json());
        } catch (e) { console.error(e); }
    };

    const submitComment = async (parentId?: string) => {
        if (!newComment.trim()) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/lessons/${lessonId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: newComment,
                    courseId,
                    parentId
                })
            });
            if (res.ok) {
                setNewComment('');
                setReplyingTo(null);
                fetchComments();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-12 bg-[#0A0A0A] dark:bg-card-white border border-white/10 dark:border-gray-800 rounded-xl p-8">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-emerald-700 text-white/10 text-[#10B981] rounded-xl">
                    <FiMessageSquare size={24} />
                </div>
                <h3 className="text-xl font-bold text-[#10B981] dark:text-white">النقاشات والأسئلة ({comments.length})</h3>
            </div>

            {/* Post Input */}
            <div className="relative mb-10 group">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="لديك استفسار أو إضافة؟ اكتبها هنا..."
                    className="w-full p-5 bg-[#111111]/50 dark:bg-bg-dark/50 border border-white/10 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all min-h-[120px] text-lg font-medium pr-14"
                />
                <div className="absolute top-5 right-5 text-gray-400">
                    <FiSend size={24} />
                </div>
                <div className="mt-3 flex justify-end">
                    <button
                        onClick={() => submitComment()}
                        disabled={loading || !newComment.trim()}
                        className="px-6 py-3 bg-emerald-700 text-white rounded-xl font-bold hover:shadow-lg shadow-[#10B981]/20 hover:shadow-accent/20 transition-all disabled:opacity-50"
                    >
                        نشـر التعليق
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="space-y-8">
                {comments.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <p className="font-medium text-lg">لا توجد نقاشات بعد. كن أول من يشارك!</p>
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="group">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white dark:from-gray-800 dark:to-gray-700 font-bold text-[#10B981] dark:text-white flex items-center justify-center shrink-0">
                                    {comment.authorName?.[0]}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-bold text-[#10B981] dark:text-white">{comment.authorName}</h4>
                                        <span className="text-xs text-gray-400 font-bold">
                                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: ar })}
                                        </span>
                                    </div>
                                    <p className="text-gray-400 dark:text-gray-300 leading-relaxed font-medium mb-3">
                                        {comment.content}
                                    </p>
                                    <div className="flex items-center gap-4">
                                        <button 
                                            onClick={() => setReplyingTo(comment.id)}
                                            className="text-[#10B981] font-bold text-sm hover:underline flex items-center gap-1"
                                        >
                                            رد <FiCornerDownLeft />
                                        </button>
                                    </div>

                                    {/* Replies Loop */}
                                    {comment.replies && comment.replies.length > 0 && (
                                        <div className="mt-6 border-r-2 border-white/10 dark:border-gray-800 pr-6 space-y-6">
                                            {comment.replies.map(reply => (
                                                <div key={reply.id}>
                                                     <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-bold text-sm text-[#10B981] dark:text-white">{reply.authorName}</span>
                                                        <span className="text-[10px] text-gray-400">{formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true, locale: ar })}</span>
                                                     </div>
                                                     <p className="text-sm text-gray-400 dark:text-gray-400 font-medium">{reply.content}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
