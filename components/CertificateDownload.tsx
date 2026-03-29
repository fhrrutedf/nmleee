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
            <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6 ">
                <div className="h-20 bg-[#111111] rounded-xl"></div>
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
            <div className="bg-[#0A0A0A] border-2 border-dashed border-white/10 rounded-xl p-8">
                <div className="flex items-center gap-6">
                    <div className="flex-shrink-0 p-4 bg-[#111111] rounded-xl">
                        <FiLock className="text-2xl text-gray-400" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-[#10B981] mb-1">
                            شهادة الإتمام 🔒
                        </h3>
                        <p className="text-sm text-gray-500 mb-4 font-bold">
                            أكمل الدورة للحصول على شهادتك الرسمية
                        </p>
                        <div className="flex items-center gap-4">
                            <div className="flex-1 bg-[#111111] rounded-xl h-2.5 overflow-hidden">
                                <div
                                    className="h-full bg-emerald-700 text-white transition-all duration-1000 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <span className="text-sm font-bold text-[#10B981] font-inter">
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
            <div className="bg-emerald-700 text-white-light border-2 border-emerald-600/10 rounded-xl p-8">
                <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-right">
                    <div className="flex-shrink-0 p-5 bg-[#0A0A0A] rounded-xl shadow-lg shadow-[#10B981]/20">
                        <FiCheckCircle className="text-4xl text-[#10B981]" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-[#10B981] mb-1">
                            🎉 مبروك! لقد أتممت الدورة بنجاح
                        </h3>
                        <p className="text-sm text-[#10B981] font-bold mb-4">
                            شهادتك المعتمدة جاهزة للتحميل الآن
                        </p>
                        <button
                            onClick={downloadCertificate}
                            className="bg-emerald-700 text-white px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-lg shadow-[#10B981]/20 active:scale-95 w-full sm:w-auto"
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
            <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-8 shadow-lg shadow-[#10B981]/20">
                <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-right">
                    <div className="flex-shrink-0 p-5 bg-emerald-700 text-white-light rounded-xl">
                        <FiAward className="text-4xl text-[#10B981]" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-[#10B981] mb-1">
                            🎊 أحسنت! تستحق شهادة الإتمام
                        </h3>
                        <p className="text-sm text-gray-500 font-bold mb-4 uppercase tracking-wider">Official Certificate Unlocked</p>
                        <button
                            onClick={generateCertificate}
                            disabled={generating}
                            className="bg-emerald-700 text-white px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 text-white-hover transition-all shadow-lg shadow-[#10B981]/20 shadow-accent/20 active:scale-95 w-full sm:w-auto"
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
