'use client';

import { useState } from 'react';
import { FiAward, FiInfo } from 'react-icons/fi';

interface CertificateToggleProps {
    courseId: string;
    initialEnabled: boolean;
    onUpdate?: (enabled: boolean) => void;
}

export function CertificateToggle({
    courseId,
    initialEnabled,
    onUpdate
}: CertificateToggleProps) {
    const [enabled, setEnabled] = useState(initialEnabled);
    const [loading, setLoading] = useState(false);

    const handleToggle = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/courses/${courseId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    isCertificateEnabled: !enabled
                })
            });

            if (response.ok) {
                setEnabled(!enabled);
                onUpdate?.(!enabled);
            } else {
                alert('فشل التحديث');
            }
        } catch (error) {
            console.error('Toggle error:', error);
            alert('حدث خطأ');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card p-6">
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0 p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <FiAward className="text-2xl text-purple-600 dark:text-purple-400" />
                </div>

                <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-primary-charcoal dark:text-white">
                            شهادة إتمام الدورة
                        </h3>

                        {/* Toggle Switch */}
                        <button
                            onClick={handleToggle}
                            disabled={loading}
                            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${enabled
                                    ? 'bg-green-500'
                                    : 'bg-gray-300 dark:bg-gray-600'
                                } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            role="switch"
                            aria-checked={enabled}
                        >
                            <span
                                className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform ${enabled ? 'translate-x-7' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>

                    <p className="text-sm text-text-muted mb-3">
                        {enabled
                            ? '✅ مفعّل: سيحصل الطلاب على شهادة PDF عند إكمال 100% من الدورة'
                            : '⚪ غير مفعّل: لن يتم إصدار شهادات للطلاب'
                        }
                    </p>

                    {/* Info Box */}
                    <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <FiInfo className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <div className="text-xs text-blue-900 dark:text-blue-200">
                            <p className="font-medium mb-1">ملاحظات هامة:</p>
                            <ul className="list-disc list-inside space-y-1 mr-2">
                                <li>الشهادة تُصدر تلقائياً عند إكمال الدورة بنسبة 100%</li>
                                <li>يتم توليد شهادة فريدة لكل طالب تحتوي على اسمه وتاريخ الإكمال</li>
                                <li>يمكن للطالب تحميل الشهادة بصيغة PDF من صفحة الدورة</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
