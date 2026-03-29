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
            <div className="bg-white border border-gray-100 rounded-xl p-6 ">
                <div className="h-20 bg-gray-50 rounded-xl"></div>
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
            <div className="bg-white border-2 border-dashed border-gray-100 rounded-xl p-8">
                <div className="flex items-center gap-6">
                    <div className="flex-shrink-0 p-4 bg-gray-50 rounded-xl">
                        <FiLock className="text-2xl text-gray-400" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-ink mb-1">
                            شهادة الإتمام 🔒
                        </h3>
                        <p className="text-sm text-gray-500 mb-4 font-bold">
                            أكمل الدورة للحصول على شهادتك الرسمية
                        </p>
                        <div className="flex items-center gap-4">
                            <div className="flex-1 bg-gray-50 rounded-xl h-2.5 overflow-hidden">
                                <div
                                    className="h-full bg-accent transition-all duration-1000 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <span className="text-sm font-bold text-ink font-inter">
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
            <div className="bg-accent-light border-2 border-accent/10 rounded-xl p-8">
                <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-right">
                    <div className="flex-shrink-0 p-5 bg-white rounded-xl shadow-sm">
                        <FiCheckCircle className="text-4xl text-accent" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-ink mb-1">
                            🎉 مبروك! لقد أتممت الدورة بنجاح
                        </h3>
                        <p className="text-sm text-accent font-bold mb-4">
                            شهادتك المعتمدة جاهزة للتحميل الآن
                        </p>
                        <button
                            onClick={downloadCertificate}
                            className="bg-ink text-white px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-sm active:scale-95 w-full sm:w-auto"
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
            <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm">
                <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-right">
                    <div className="flex-shrink-0 p-5 bg-accent-light rounded-xl">
                        <FiAward className="text-4xl text-accent" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-ink mb-1">
                            🎊 أحسنت! تستحق شهادة الإتمام
                        </h3>
                        <p className="text-sm text-gray-500 font-bold mb-4 uppercase tracking-wider">Official Certificate Unlocked</p>
                        <button
                            onClick={generateCertificate}
                            disabled={generating}
                            className="bg-accent text-white px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-accent-hover transition-all shadow-sm shadow-accent/20 active:scale-95 w-full sm:w-auto"
                        >
                            {generating ? (
                                <>
                                    <div className="animate-spin rounded-xl h-4 w-4 border-2 border-white border-t-transparent" />
                                    <span>جاري إنشاء الشهادة...</span>
                                </>
                            ) : (
                                <>
                                    <FiAward />
                                    <span>إصدار الشهادة الآن</span>
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
