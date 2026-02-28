'use client';

import { useState } from 'react';
import { FiCheck, FiCpu, FiList, FiAlertCircle } from 'react-icons/fi';

export default function VerifyTransfersPage() {
    const [rawText, setRawText] = useState('');
    const [extractedRefs, setExtractedRefs] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ success?: boolean, message?: string, matchedCount?: number, verifiedOrders?: string[], error?: string } | null>(null);

    const handleExtract = () => {
        // Regex to extract numbers 6 digits or more, or alphanumeric transaction IDs
        const regex = /[A-Za-z0-9]{6,20}/g;
        const matches = rawText.match(regex);

        if (matches) {
            // Filter out common words that might be matched (must contain at least one number)
            const uniqueRefs = Array.from(new Set(matches)).filter(m => /\d/.test(m));
            setExtractedRefs(uniqueRefs);
        } else {
            setExtractedRefs([]);
        }
    };

    const handleVerify = async () => {
        if (extractedRefs.length === 0) return;

        setLoading(true);
        setResult(null);

        try {
            const response = await fetch('/api/admin/verify-transfers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ references: extractedRefs })
            });

            const data = await response.json();
            setResult(data);

            if (data.success && data.matchedCount && data.matchedCount > 0) {
                setRawText('');
                setExtractedRefs([]);
            }
        } catch (error) {
            setResult({ error: 'حدث خطأ في الاتصال بالخادم. يرجى المحاولة لاحقاً.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto min-h-[80vh]">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 text-blue-600 rounded-xl flex items-center justify-center shadow-inner">
                        <FiCpu className="text-2xl" />
                    </div>
                    نظام مطابقة الحوالات الذكي
                </h1>
                <p className="text-gray-500 text-lg">الصق إشعارات البنوك أو رسائل الـ SMS هنا ليقوم النظام باستخراج الأرقام المرجعية واعتماد الطلبات المعلقة تلقائياً بنسبة دقة 90٪.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-sm">1</span>
                        لصق الإشعارات (SMS)
                    </h2>
                    <textarea
                        value={rawText}
                        onChange={(e) => setRawText(e.target.value)}
                        placeholder="الصق تفاصيل ورسائل التحويل هنا..."
                        className="w-full h-64 p-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-none mb-4 outline-none transition-shadow"
                    />
                    <button
                        onClick={handleExtract}
                        disabled={!rawText.trim()}
                        className="w-full py-3.5 bg-gray-900 dark:bg-gray-700 text-white font-bold rounded-xl hover:bg-black transition-colors disabled:opacity-50"
                    >
                        استخراج المعرفات (Reference IDs)
                    </button>
                </div>

                {/* Verification Section */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">2</span>
                        التحقق والاعتماد
                    </h2>

                    {extractedRefs.length > 0 ? (
                        <div className="space-y-6 flex-1 flex flex-col">
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30 flex-1 overflow-auto max-h-64 mb-auto">
                                <p className="font-bold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
                                    <FiList /> تم استخراج {extractedRefs.length} رقم مرجعي:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {extractedRefs.map((ref, idx) => (
                                        <span key={idx} className="bg-white dark:bg-gray-900 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-700/50 font-mono text-sm text-gray-700 dark:text-gray-300 shadow-sm">
                                            {ref}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleVerify}
                                disabled={loading}
                                className="w-full py-4 mt-auto bg-green-600 hover:bg-green-700 text-white font-black text-lg rounded-xl shadow-[0_8px_20px_rgba(22,163,74,0.3)] transition-all hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <span className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin flex-shrink-0" />
                                ) : (
                                    <FiCheck className="text-2xl" />
                                )}
                                {loading ? 'جاري مطابقة الحوالات...' : 'اعتماد الحوالات المتطابقة'}
                            </button>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/50 min-h-[16rem]">
                            <div className="w-16 h-16 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center mb-4 shadow-sm border border-gray-100 dark:border-gray-700">
                                <FiList className="text-3xl opacity-50 text-gray-400" />
                            </div>
                            <p className="font-medium text-gray-500">لا توجد أرقام مرجعية مستخرجة</p>
                            <p className="text-sm mt-1">قم بلصق إشعار بنكي في المربع المجاور</p>
                        </div>
                    )}

                    {/* Results */}
                    {result && (
                        <div className={`mt-6 p-5 rounded-xl border ${result.error ? 'bg-red-50 border-red-200 text-red-700' : result.matchedCount && result.matchedCount > 0 ? 'bg-green-50 border-green-200 text-green-800' : 'bg-yellow-50 border-yellow-200 text-yellow-800'}`}>
                            <p className="font-bold flex items-center gap-2">
                                {result.error ? <FiAlertCircle className="text-xl" /> : result.matchedCount && result.matchedCount > 0 ? <FiCheck className="text-xl" /> : <FiAlertCircle className="text-xl" />}
                                {result.error || result.message}
                            </p>
                            {result.verifiedOrders && result.verifiedOrders.length > 0 && (
                                <p className="mt-3 text-sm font-mono opacity-80 bg-white/50 px-3 py-2 rounded-lg border border-current">
                                    الطلبات التي تم اعتمادها: {result.verifiedOrders.join('، ')}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
