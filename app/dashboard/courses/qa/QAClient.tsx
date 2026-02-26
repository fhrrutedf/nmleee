'use client';

import { useState, useEffect } from 'react';
import { FiSearch, FiCheckCircle, FiClock, FiCornerDownRight, FiFilter, FiSend, FiMessageSquare, FiBookOpen, FiUser, FiMoreVertical } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// Format date helper
const timeAgo = (dateInput: string | Date) => {
    const date = new Date(dateInput);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'منذ لحظات';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `منذ ${diffInDays} أيام`;
    return date.toLocaleDateString('ar-EG');
};

export default function QAClient({ courses }: { courses: { id: string, title: string }[] }) {
    const [questions, setQuestions] = useState<any[]>([]);
    const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
    const [selectedThread, setSelectedThread] = useState<any>(null);

    // Filters & UI State
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'new', 'resolved'
    const [courseFilter, setCourseFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [threadLoading, setThreadLoading] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Brand Accent Color (Magenta/Purple)
    const ACCENT_COLOR = 'bg-fuchsia-600';
    const ACCENT_TEXT = 'text-fuchsia-600';

    useEffect(() => {
        fetchQuestions();
    }, [statusFilter, courseFilter]);

    useEffect(() => {
        if (selectedQuestionId) {
            fetchThread(selectedQuestionId);
        } else {
            setSelectedThread(null);
        }
    }, [selectedQuestionId]);

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams();
            if (statusFilter !== 'all') queryParams.append('status', statusFilter);
            if (courseFilter) queryParams.append('courseId', courseFilter);

            const res = await fetch(`/api/qa?${queryParams.toString()}`);
            const data = await res.json();

            if (data.questions) {
                setQuestions(data.questions);
            }
        } catch (error) {
            toast.error('حدث خطأ أثناء جلب الأسئلة');
        } finally {
            setLoading(false);
        }
    };

    const fetchThread = async (id: string) => {
        setThreadLoading(true);
        try {
            const res = await fetch(`/api/qa/${id}`);
            const data = await res.json();

            if (data.question) {
                setSelectedThread(data.question);
            }
        } catch (error) {
            toast.error('حدث خطأ أثناء جلب تفاصيل السؤال');
        } finally {
            setThreadLoading(false);
        }
    };

    const handleSendReply = async () => {
        if (!replyText.trim() || !selectedQuestionId) return;

        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/qa/${selectedQuestionId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: replyText })
            });

            const data = await res.json();
            if (data.success) {
                toast.success('تم إرسال الرد بنجاح');
                setReplyText('');
                fetchThread(selectedQuestionId); // Refresh thread
                fetchQuestions(); // Refresh list to update counts if needed
            } else {
                toast.error(data.error || 'فشل في إرسال الرد');
            }
        } catch (error) {
            toast.error('خطأ في الاتصال بالخادم');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleMarkResolved = async () => {
        if (!selectedQuestionId) return;

        try {
            const res = await fetch(`/api/qa/${selectedQuestionId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
            });

            const data = await res.json();
            if (data.success) {
                toast.success('تم تحديد السؤال كمحلول');
                fetchThread(selectedQuestionId);
                fetchQuestions(); // Update the list status
            } else {
                toast.error(data.error || 'فشل في تحديث الحالة');
            }
        } catch (error) {
            toast.error('خطأ في الاتصال بالخادم');
        }
    };

    const filteredQuestions = questions.filter(q =>
        q.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.authorName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex h-[calc(100%-80px)] rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-white dark:bg-card-white shadow-xl shadow-fuchsia-900/5 dark:shadow-black/20">

            {/* Left Pane - Discussions List */}
            <div className={`w-full md:w-1/3 lg:w-[400px] flex-shrink-0 border-l border-gray-100 dark:border-gray-800 flex flex-col bg-gray-50/50 dark:bg-black/20 transition-all ${selectedQuestionId ? 'hidden md:flex' : 'flex'}`}>

                {/* Search & Filters Header */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 space-y-4 bg-white dark:bg-card-white z-10">
                    <div className="relative">
                        <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="ابحث في الأسئلة والأسماء..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-800/50 pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 transition-all"
                        />
                    </div>

                    <div className="flex gap-2">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="flex-1 bg-gray-50 dark:bg-gray-800/50 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-semibold focus:outline-none text-gray-600 dark:text-gray-300"
                        >
                            <option value="all">كل الحالات</option>
                            <option value="new">بانتظار الرد (جديد)</option>
                            <option value="resolved">محلولة مقفلة</option>
                        </select>

                        <select
                            value={courseFilter}
                            onChange={(e) => setCourseFilter(e.target.value)}
                            className="flex-1 bg-gray-50 dark:bg-gray-800/50 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-semibold focus:outline-none text-gray-600 dark:text-gray-300 line-clamp-1"
                        >
                            <option value="">كل الكورسات</option>
                            {courses.map(c => (
                                <option key={c.id} value={c.id}>{c.title}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Discussions List */}
                <div className="flex-1 overflow-y-auto scrollbar-hide py-2">
                    {loading ? (
                        <div className="flex justify-center items-center h-full">
                            <div className={`animate-spin rounded-full h-8 w-8 border-b-2 border-fuchsia-600 border-t-transparent`}></div>
                        </div>
                    ) : filteredQuestions.length === 0 ? (
                        <div className="text-center p-8 text-gray-400 dark:text-gray-500">
                            <FiMessageSquare className="mx-auto text-4xl mb-3 opacity-20" />
                            <p className="text-sm">لا توجد أسئلة تطابق بحثك حالياً.</p>
                        </div>
                    ) : (
                        <div className="space-y-1 px-3">
                            {filteredQuestions.map((q) => (
                                <button
                                    key={q.id}
                                    onClick={() => setSelectedQuestionId(q.id)}
                                    className={`w-full text-right p-4 rounded-2xl transition-all duration-200 group relative border ${selectedQuestionId === q.id
                                            ? 'bg-fuchsia-50 dark:bg-fuchsia-900/10 border-fuchsia-200 dark:border-fuchsia-800/30'
                                            : 'bg-white dark:bg-card-white border-transparent hover:border-gray-100 hover:shadow-sm dark:hover:border-gray-800'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${selectedQuestionId === q.id ? 'bg-fuchsia-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-primary-charcoal dark:text-gray-300'
                                                }`}>
                                                {q.authorName.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className={`text-sm font-bold ${selectedQuestionId === q.id ? 'text-fuchsia-900 dark:text-fuchsia-300' : 'text-primary-charcoal dark:text-gray-200'}`}>
                                                    {q.authorName}
                                                </h3>
                                                <div className="flex items-center gap-1 mt-0.5 text-[10px] text-gray-400">
                                                    <FiBookOpen />
                                                    <span className="truncate max-w-[120px]">{q.course?.title || 'عام'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className="text-[10px] text-gray-400 whitespace-nowrap">{timeAgo(q.createdAt)}</span>
                                            {q.isResolved ? (
                                                <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 text-[10px] font-bold rounded-full">محلول</span>
                                            ) : q._count.replies > 0 ? (
                                                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-action-blue text-[10px] font-bold rounded-full">تم الرد</span>
                                            ) : (
                                                <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 text-[10px] font-bold rounded-full">جديد</span>
                                            )}
                                        </div>
                                    </div>
                                    <p className={`text-xs mt-3 line-clamp-2 leading-relaxed ${selectedQuestionId === q.id ? 'text-fuchsia-800/80 dark:text-fuchsia-200/70' : 'text-gray-500 dark:text-gray-400'}`}>
                                        {q.content}
                                    </p>

                                    {/* Unread dot indicator (if logic applies) */}
                                    {!q.isResolved && q._count.replies === 0 && selectedQuestionId !== q.id && (
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-orange-500 shadow-sm shadow-orange-500/50"></div>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Pane - Active Conversation */}
            <div className={`flex-1 flex flex-col bg-white dark:bg-card-white ${!selectedQuestionId ? 'hidden md:flex' : 'flex'}`}>
                {selectedQuestionId ? (
                    threadLoading ? (
                        <div className="flex-1 flex justify-center items-center">
                            <div className={`animate-spin rounded-full h-8 w-8 border-b-2 border-fuchsia-600 border-t-transparent`}></div>
                        </div>
                    ) : selectedThread ? (
                        <>
                            {/* Header / Breadcrumbs */}
                            <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white/50 dark:bg-black/10 backdrop-blur-sm z-10 sticky top-0">
                                <div>
                                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 dark:text-gray-500 mb-2">
                                        <span onClick={() => setSelectedQuestionId(null)} className="md:hidden text-fuchsia-600 cursor-pointer ml-2">← رجوع لردود</span>
                                        <span className="text-primary-charcoal dark:text-gray-300">{selectedThread.course?.title || 'تم الحذف'}</span>
                                        {selectedThread.lesson && (
                                            <>
                                                <span>/</span>
                                                <span className="text-gray-500">{selectedThread.lesson.module?.title}</span>
                                                <span>/</span>
                                                <span className={`${ACCENT_TEXT}`}>{selectedThread.lesson.title}</span>
                                            </>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-lg font-black text-primary-charcoal dark:text-white">تفاصيل النقاش</h2>
                                        {selectedThread.isResolved && (
                                            <span className="flex items-center gap-1 bg-green-100 text-green-600 dark:bg-green-900/30 px-3 py-1 rounded-full text-xs font-bold">
                                                <FiCheckCircle /> تم الحل
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {!selectedThread.isResolved && (
                                    <button
                                        onClick={handleMarkResolved}
                                        className="btn btn-outline border-green-200 text-green-600 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-900/30 text-xs px-4 py-2"
                                    >
                                        <FiCheckCircle className="ml-1" />
                                        تحديد كمحلول
                                    </button>
                                )}
                            </div>

                            {/* Thread Body */}
                            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-hide bg-gray-50/30 dark:bg-black/5">

                                {/* 1. The Main Question */}
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-black text-lg text-primary-charcoal dark:text-gray-300 flex-shrink-0">
                                        {selectedThread.authorName.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 bg-white dark:bg-card-white border border-gray-100 dark:border-gray-800 p-5 rounded-2xl rounded-tr-sm shadow-sm">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="font-bold text-sm text-primary-charcoal dark:text-gray-200">{selectedThread.authorName} <span className="text-xs text-gray-400 font-normal mr-2">الطالب</span></span>
                                            <span className="text-xs text-gray-400 flex items-center gap-1"><FiClock /> {timeAgo(selectedThread.createdAt)}</span>
                                        </div>
                                        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed box-border break-words whitespace-pre-wrap">
                                            {selectedThread.content}
                                        </p>
                                    </div>
                                </div>

                                {/* Replies */}
                                {selectedThread.replies?.map((reply: any) => (
                                    <div key={reply.id} className="flex gap-4 items-end justify-end ml-12">
                                        <div className="flex-1 bg-fuchsia-50 dark:bg-fuchsia-900/20 border border-fuchsia-100 dark:border-fuchsia-800/30 p-5 rounded-2xl rounded-tl-sm shadow-sm relative">
                                            {/* Decorative element resembling a chat bubble tail */}
                                            <div className="absolute top-0 -left-2 w-4 h-4 bg-fuchsia-50 dark:bg-fuchsia-900/20 border-l border-t border-fuchsia-100 dark:border-fuchsia-800/30 transform -skew-x-12"></div>

                                            <div className="flex justify-between items-center mb-3">
                                                <span className="text-xs text-gray-400 flex items-center gap-1"><FiClock /> {timeAgo(reply.createdAt)}</span>
                                                <span className={`font-bold text-sm ${ACCENT_TEXT} dark:text-fuchsia-300`}>أنت (المدرب)</span>
                                            </div>
                                            <p className="text-gray-700 dark:text-gray-200 text-sm leading-relaxed whitespace-pre-wrap text-right">
                                                {reply.content}
                                            </p>
                                        </div>
                                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${ACCENT_COLOR} flex items-center justify-center font-black text-white flex-shrink-0 shadow-md shadow-fuchsia-500/20`}>
                                            <FiUser />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Reply Input Area */}
                            <div className="p-4 sm:p-6 bg-white dark:bg-card-white border-t border-gray-100 dark:border-gray-800">
                                {selectedThread.isResolved ? (
                                    <div className="text-center p-4 bg-gray-50 dark:bg-black/20 rounded-xl text-gray-500 text-sm flex items-center justify-center gap-2">
                                        <FiCheckCircle className="text-green-500" />
                                        تم قفل هذا النقاش وحله من قبل المدرب. لا يمكن إضافة ردود جديدة.
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        <textarea
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            placeholder="اكتب ردك هنا بطريقة منظمة وواضحة للطلاب..."
                                            className="w-full min-h-[100px] p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/40 focus:bg-white dark:focus:bg-card-white transition-all text-sm resize-none"
                                        />
                                        <div className="flex justify-end">
                                            <button
                                                onClick={handleSendReply}
                                                disabled={isSubmitting || !replyText.trim()}
                                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all shadow-lg ${replyText.trim() ? `${ACCENT_COLOR} shadow-fuchsia-500/30 hover:-translate-y-0.5` : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                                                    }`}
                                            >
                                                {isSubmitting ? (
                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                                                ) : (
                                                    <>
                                                        <FiSend /> إرسال الرد السريع
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : null
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400 dark:text-gray-500 bg-gray-50/50 dark:bg-black/10">
                        <div className={`w-24 h-24 rounded-full ${ACCENT_COLOR} bg-opacity-10 flex items-center justify-center mb-6`}>
                            <FiMessageSquare className={`text-4xl ${ACCENT_TEXT}`} />
                        </div>
                        <h2 className="text-2xl font-bold text-primary-charcoal dark:text-gray-300 mb-2">لوحة النقاشات</h2>
                        <p className="max-w-sm">
                            اختر محادثة أو سؤال من القائمة الجانبية لعرض التفاصيل وتوجيه رد مباشر للطلاب بطريقة احترافية.
                        </p>
                    </div>
                )}
            </div>

        </div>
    );
}
