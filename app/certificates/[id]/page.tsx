'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FiAward, FiCalendar, FiUser, FiDownload } from 'react-icons/fi';

export default function CertificatePage() {
    const params = useParams();
    const certificateId = params.id as string;

    const [certificateData, setCertificateData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // In production, fetch from database
        // For now, parse from certificateId or use mock data
        const mockData = {
            id: certificateId,
            studentName: 'الطالب المميز',
            courseName: 'دورة البرمجة المتقدمة',
            instructorName: 'المدرب الخبير',
            completionDate: new Date().toLocaleDateString('ar-EG'),
            issueDate: new Date().toISOString()
        };
        setCertificateData(mockData);
        setLoading(false);
    }, [certificateId]);

    const downloadPDF = () => {
        // In production, generate actual PDF
        window.print();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent" />
            </div>
        );
    }

    if (!certificateData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        الشهادة غير موجودة
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        رقم الشهادة غير صالح
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900/20 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Download Button (Print) */}
                <div className="flex justify-end mb-4 print:hidden">
                    <button
                        onClick={downloadPDF}
                        className="btn btn-primary flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
                    >
                        <FiDownload />
                        <span>تحميل PDF</span>
                    </button>
                </div>

                {/* Certificate */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-12 border-8 border-double border-purple-200 dark:border-purple-800 relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-5">
                        <div className="absolute top-0 left-0 w-full h-full"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                            }}
                        />
                    </div>

                    {/* Header */}
                    <div className="text-center mb-8 relative">
                        <div className="inline-flex items-center gap-3 mb-4 bg-purple-100 dark:bg-purple-900/30 px-6 py-3 rounded-full">
                            <FiAward className="text-4xl text-purple-600 dark:text-purple-400" />
                            <h1 className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                                شهادة إتمام
                            </h1>
                        </div>
                        <div className="h-1 w-32 bg-gradient-to-r from-purple-600 to-pink-600 mx-auto rounded-full" />
                    </div>

                    {/* Body */}
                    <div className="text-center space-y-6 relative">
                        <p className="text-lg text-gray-600 dark:text-gray-400">
                            تشهد هذه الوثيقة بأن
                        </p>

                        <h2 className="text-4xl font-bold text-primary-charcoal dark:text-white">
                            {certificateData.studentName}
                        </h2>

                        <p className="text-lg text-gray-600 dark:text-gray-400">
                            قد أكمل بنجاح دورة
                        </p>

                        <h3 className="text-3xl font-bold text-purple-700 dark:text-purple-400">
                            {certificateData.courseName}
                        </h3>

                        <div className="flex items-center justify-center gap-8 pt-6 text-gray-700 dark:text-gray-300">
                            <div className="flex items-center gap-2">
                                <FiUser className="text-purple-600 dark:text-purple-400" />
                                <div className="text-right">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">المدرب</p>
                                    <p className="font-semibold">{certificateData.instructorName}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <FiCalendar className="text-purple-600 dark:text-purple-400" />
                                <div className="text-right">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">تاريخ الإكمال</p>
                                    <p className="font-semibold">{certificateData.completionDate}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-12 pt-8 border-t-2 border-purple-200 dark:border-purple-800 relative">
                        <div className="flex items-center justify-between">
                            <div className="text-right">
                                <div className="w-48 border-b-2 border-gray-800 dark:border-gray-200 mb-2" />
                                <p className="text-sm text-gray-600 dark:text-gray-400">توقيع المدرب</p>
                            </div>

                            <div className="text-center">
                                <div className="inline-block p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">رقم الشهادة</p>
                                    <p className="font-mono text-sm font-bold text-purple-700 dark:text-purple-400">
                                        {certificateData.id}
                                    </p>
                                </div>
                            </div>

                            <div className="text-left">
                                <div className="w-48 border-b-2 border-gray-800 dark:border-gray-200 mb-2" />
                                <p className="text-sm text-gray-600 dark:text-gray-400">الختم الرسمي</p>
                            </div>
                        </div>
                    </div>

                    {/* Watermark */}
                    <div className="absolute bottom-4 right-4 text-xs text-gray-400 dark:text-gray-600">
                        صادرة من منصة تمكين - {new Date().getFullYear()}
                    </div>
                </div>

                {/* Verification Note */}
                <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400 print:hidden">
                    <p>للتحقق من صحة هذه الشهادة، استخدم رقم الشهادة: <span className="font-mono font-bold">{certificateData.id}</span></p>
                </div>
            </div>
        </div>
    );
}
