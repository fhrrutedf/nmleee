'use client';

import { useState, useEffect } from 'react';
import { FiAward, FiDownload, FiCheckCircle, FiLock } from 'react-icons/fi';

interface CertificateDownloadProps {
    courseId: string;
    courseName: string;
    studentEmail: string;
    studentName: string;
    progress: number; // 0-100
}

export function CertificateDownload({
    courseId,
    courseName,
    studentEmail,
    studentName,
    progress
}: CertificateDownloadProps) {
    const [status, setStatus] = useState<{
        eligible: boolean;
        certificateGenerated: boolean;
        certificateUrl?: string;
        reason?: string;
    }>({ eligible: false, certificateGenerated: false });

    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    // Check certificate eligibility on mount
    useEffect(() => {
        checkCertificateStatus();
    }, [courseId, studentEmail]);

    const checkCertificateStatus = async () => {
        try {
            const response = await fetch(
                `/api/certificates/generate?courseId=${courseId}&studentEmail=${studentEmail}`
            );
            const data = await response.json();
            setStatus(data);
        } catch (error) {
            console.error('Failed to check certificate status:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateCertificate = async () => {
        setGenerating(true);
        try {
            const response = await fetch('/api/certificates/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseId,
                    studentEmail,
                    studentName
                })
            });

            const data = await response.json();

            if (response.ok) {
                setStatus({
                    eligible: true,
                    certificateGenerated: true,
                    certificateUrl: data.certificateUrl
                });
                alert('🎉 ' + data.message);
            } else {
                alert('❌ ' + data.error);
            }
        } catch (error) {
            console.error('Certificate generation failed:', error);
            alert('حدث خطأ أثناء إنشاء الشهادة');
        } finally {
            setGenerating(false);
        }
    };

    const downloadCertificate = () => {
        if (status.certificateUrl) {
            window.open(status.certificateUrl, '_blank');
        }
    };

    // Don't show anything while loading
    if (loading) {
        return (
            <div className="card p-6 animate-pulse">
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
        );
    }

    // Feature disabled for this course
    if (!status.eligible && status.reason === 'feature_disabled') {
        return null; // Hide completely
    }

    // Not enrolled
    if (!status.eligible && status.reason === 'not_enrolled') {
        return null;
    }

    // Incomplete course
    if (!status.eligible && status.reason === 'incomplete') {
        return (
            <div className="card p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 border-2 border-dashed border-gray-300 dark:border-gray-600">
                <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 p-3 bg-gray-200 dark:bg-gray-700 rounded-full">
                        <FiLock className="text-2xl text-gray-500 dark:text-gray-400" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            شهادة الإتمام 🔒
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            أكمل الدورة للحصول على شهادتك
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                {progress}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Eligible and certificate already generated
    if (status.eligible && status.certificateGenerated) {
        return (
            <div className="card p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800">
                <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 p-3 bg-green-100 dark:bg-green-900/40 rounded-full">
                        <FiCheckCircle className="text-3xl text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-green-900 dark:text-green-100 mb-1 flex items-center gap-2">
                            🎉 مبروك! أكملت الدورة
                        </h3>
                        <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                            شهادتك جاهزة للتحميل
                        </p>
                        <button
                            onClick={downloadCertificate}
                            className="btn btn-primary bg-green-600 hover:bg-green-700 border-green-600 flex items-center gap-2"
                        >
                            <FiDownload />
                            <span>تحميل الشهادة (PDF)</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Eligible but not generated yet
    if (status.eligible && !status.certificateGenerated) {
        return (
            <div className="card p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 p-3 bg-purple-100 dark:bg-purple-900/40 rounded-full">
                        <FiAward className="text-3xl text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-purple-900 dark:text-purple-100 mb-1 flex items-center gap-2">
                            🎊 أحسنت! أكملت الدورة بنجاح
                        </h3>
                        <p className="text-sm text-purple-700 dark:text-purple-300 mb-3">
                            انقر أدناه للحصول على شهادتك الرسمية
                        </p>
                        <button
                            onClick={generateCertificate}
                            disabled={generating}
                            className="btn btn-primary bg-purple-600 hover:bg-purple-700 border-purple-600 flex items-center gap-2"
                        >
                            {generating ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                    <span>جاري الإنشاء...</span>
                                </>
                            ) : (
                                <>
                                    <FiAward />
                                    <span>احصل على شهادتك الآن!</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
