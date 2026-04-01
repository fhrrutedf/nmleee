'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageCircle, FiSend, FiUser, FiCheck, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface QAProps {
    productId: string;
    sellerId: string;
    currentUserId?: string;
    isOwner: boolean;
}

interface Question {
    id: string;
    content: string;
    isAnonymous: boolean;
    askerName: string | null;
    asker: { name: string; avatar: string | null } | null;
    createdAt: string;
    answers: Answer[];
}

interface Answer {
    id: string;
    content: string;
    answerer: { name: string; avatar: string | null };
    createdAt: string;
}

export default function ProductQASection({ productId, sellerId, currentUserId, isOwner }: QAProps) {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [newQuestion, setNewQuestion] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [askerName, setAskerName] = useState('');
    const [loading, setLoading] = useState(false);
    const [answerInputs, setAnswerInputs] = useState<Record<string, string>>({});
    const [showAnswerForm, setShowAnswerForm] = useState<Record<string, boolean>>({});

    useEffect(() => {
        fetchQuestions();
    }, [productId]);

    const fetchQuestions = async () => {
        try {
            const response = await fetch(`/api/products/questions?productId=${productId}`);
            if (response.ok) {
                const data = await response.json();
                setQuestions(data.questions || []);
            }
        } catch (error) {
            console.error('Error fetching questions:', error);
        }
    };

    const submitQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newQuestion.trim()) return;

        setLoading(true);
        try {
            const response = await fetch('/api/products/questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId,
                    content: newQuestion,
                    isAnonymous,
                    askerName: isAnonymous ? null : askerName
                })
            });

            if (response.ok) {
                toast.success('تم إرسال السؤال بنجاح');
                setNewQuestion('');
                setAskerName('');
                fetchQuestions();
            } else {
                toast.error('حدث خطأ أثناء إرسال السؤال');
            }
        } catch (error) {
            toast.error('حدث خطأ');
        } finally {
            setLoading(false);
        }
    };

    const submitAnswer = async (questionId: string) => {
        const content = answerInputs[questionId];
        if (!content?.trim()) return;

        try {
            const response = await fetch('/api/products/answers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questionId, content })
            });

            if (response.ok) {
                toast.success('تم إرسال الإجابة بنجاح');
                setAnswerInputs(prev => ({ ...prev, [questionId]: '' }));
                setShowAnswerForm(prev => ({ ...prev, [questionId]: false }));
                fetchQuestions();
            } else {
                toast.error('حدث خطأ');
            }
        } catch (error) {
            toast.error('حدث خطأ');
        }
    };

    const deleteAnswer = async (answerId: string) => {
        try {
            const response = await fetch(`/api/products/answers?answerId=${answerId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                toast.success('تم حذف الإجابة');
                fetchQuestions();
            }
        } catch (error) {
            toast.error('حدث خطأ');
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="bg-[#0A0A0A] rounded-xl border border-white/10 p-6">
            <div className="flex items-center gap-2 mb-6">
                <FiMessageCircle className="text-[#10B981]" size={24} />
                <h3 className="text-xl font-bold text-white">الأسئلة والأجوبة</h3>
                <span className="text-sm text-gray-400 mr-auto">({questions.length} سؤال)</span>
            </div>

            {/* Ask Question Form */}
            <form onSubmit={submitQuestion} className="mb-6 space-y-3">
                <div className="relative">
                    <textarea
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        placeholder="اسأل سؤالك عن المنتج..."
                        className="w-full p-4 pr-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#10B981] resize-none"
                        rows={3}
                    />
                    <FiMessageCircle className="absolute top-4 right-4 text-gray-500" />
                </div>

                {!currentUserId && (
                    <div className="flex items-center gap-4">
                        <input
                            type="text"
                            value={askerName}
                            onChange={(e) => setAskerName(e.target.value)}
                            placeholder="اسمك (اختياري)"
                            className="flex-1 p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm"
                        />
                        <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isAnonymous}
                                onChange={(e) => setIsAnonymous(e.target.checked)}
                                className="rounded border-white/20"
                            />
                            سؤال مجهول
                        </label>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading || !newQuestion.trim()}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#10B981] to-[#7c3aed] text-white rounded-xl font-bold disabled:opacity-50 hover:opacity-90 transition-opacity"
                >
                    <FiSend size={18} />
                    {loading ? 'جاري الإرسال...' : 'أرسل سؤالك'}
                </button>
            </form>

            {/* Questions List */}
            <div className="space-y-4">
                {questions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <FiMessageCircle className="mx-auto mb-3 opacity-50" size={48} />
                        <p>لا توجد أسئلة حتى الآن</p>
                        <p className="text-sm mt-1">كن أول من يسأل!</p>
                    </div>
                ) : (
                    questions.map((question, index) => (
                        <motion.div
                            key={question.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white/5 rounded-xl p-4"
                        >
                            {/* Question */}
                            <div className="flex gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#10B981]/20 to-[#7c3aed]/20 flex items-center justify-center flex-shrink-0">
                                    {question.isAnonymous ? (
                                        <FiUser className="text-gray-400" size={18} />
                                    ) : question.asker?.avatar ? (
                                        <img src={question.asker.avatar} alt="" className="w-full h-full rounded-lg object-cover" />
                                    ) : (
                                        <span className="text-white font-bold">
                                            {(question.askerName || question.asker?.name || 'زائر').charAt(0)}
                                        </span>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-white text-sm">
                                            {question.isAnonymous ? 'سائل مجهول' : (question.askerName || question.asker?.name || 'زائر')}
                                        </span>
                                        <span className="text-xs text-gray-500">{formatDate(question.createdAt)}</span>
                                    </div>
                                    <p className="text-gray-300">{question.content}</p>
                                </div>
                            </div>

                            {/* Answers */}
                            {question.answers.length > 0 && (
                                <div className="mt-4 mr-13 space-y-3">
                                    {question.answers.map((answer) => (
                                        <div key={answer.id} className="flex gap-3 bg-white/5 rounded-lg p-3">
                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#10B981] to-[#7c3aed] flex items-center justify-center flex-shrink-0">
                                                {answer.answerer.avatar ? (
                                                    <img src={answer.answerer.avatar} alt="" className="w-full h-full rounded-lg object-cover" />
                                                ) : (
                                                    <span className="text-white text-xs font-bold">
                                                        {answer.answerer.name.charAt(0)}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold text-white text-sm flex items-center gap-1">
                                                        {answer.answerer.name}
                                                        <FiCheck className="text-[#10B981]" size={12} />
                                                        <span className="text-[10px] bg-[#10B981]/20 text-[#10B981] px-2 py-0.5 rounded">البائع</span>
                                                    </span>
                                                    <span className="text-xs text-gray-500">{formatDate(answer.createdAt)}</span>
                                                    {isOwner && (
                                                        <button
                                                            onClick={() => deleteAnswer(answer.id)}
                                                            className="mr-auto text-gray-500 hover:text-red-400 transition-colors"
                                                        >
                                                            <FiTrash2 size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                                <p className="text-gray-300 text-sm">{answer.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Answer Form (for owner) */}
                            {isOwner && (
                                <div className="mt-4 mr-13">
                                    {!showAnswerForm[question.id] ? (
                                        <button
                                            onClick={() => setShowAnswerForm(prev => ({ ...prev, [question.id]: true }))}
                                            className="text-sm text-[#10B981] hover:underline"
                                        >
                                            أجب على هذا السؤال
                                        </button>
                                    ) : (
                                        <div className="space-y-2">
                                            <textarea
                                                value={answerInputs[question.id] || ''}
                                                onChange={(e) => setAnswerInputs(prev => ({ ...prev, [question.id]: e.target.value }))}
                                                placeholder="اكتب إجابتك..."
                                                className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 text-sm resize-none"
                                                rows={2}
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => submitAnswer(question.id)}
                                                    className="px-4 py-2 bg-[#10B981] text-white rounded-lg text-sm font-bold hover:opacity-90"
                                                >
                                                    إرسال الإجابة
                                                </button>
                                                <button
                                                    onClick={() => setShowAnswerForm(prev => ({ ...prev, [question.id]: false }))}
                                                    className="px-4 py-2 bg-white/5 text-gray-400 rounded-lg text-sm hover:bg-white/10"
                                                >
                                                    إلغاء
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
