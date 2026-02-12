'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import CertificatePreview from '@/components/CertificatePreview';
import { FiDownload, FiCheck, FiX } from 'react-icons/fi';

interface Certificate {
    certificateNumber: string;
    studentName: string;
    courseName: string;
    issueDate: string;
    isVerified: boolean;
    course: {
        user: {
            name: string;
        };
    };
}

export default function CertificatePage() {
    const params = useParams();
    const certificateNumber = params.certificateNumber as string;

    const [certificate, setCertificate] = useState<Certificate | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchCertificate();
    }, [certificateNumber]);

    const fetchCertificate = async () => {
        try {
            const response = await fetch(`/api/certificates/verify/${certificateNumber}`);

            if (response.ok) {
                const data = await response.json();
                if (data.valid) {
                    setCertificate(data.certificate);
                } else {
                    setError('الشهادة غير صالحة');
                }
            } else {
                setError('الشهادة غير موجودة');
            }
        } catch (error) {
            console.error('Error fetching certificate:', error);
            setError('حدث خطأ أثناء التحقق من الشهادة');
        } finally {
            setLoading(false);
        }
    };

    const downloadPDF = () => {
        // TODO: Implement PDF generation
        alert('سيتم إضافة تحميل PDF قريباً');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error || !certificate) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-md">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                        <FiX className="text-red-600" size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">غير موجود</h1>
                    <p className="text-gray-600">{error || 'الشهادة غير موجودة'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Verification Badge */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
                                <FiCheck className="text-green-600" size={24} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">شهادة معتمدة</h2>
                                <p className="text-sm text-gray-600">
                                    رقم الشهادة: {certificate.certificateNumber}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={downloadPDF}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            <FiDownload />
                            تحميل PDF
                        </button>
                    </div>
                </div>

                {/* Certificate Preview */}
                <div className="bg-white rounded-lg shadow-md p-8">
                    <CertificatePreview
                        studentName={certificate.studentName}
                        courseName={certificate.courseName}
                        instructorName={certificate.course.user.name}
                        issueDate={new Date(certificate.issueDate).toLocaleDateString('ar-EG', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                        certificateNumber={certificate.certificateNumber}
                    />
                </div>

                {/* Certificate Details */}
                <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">تفاصيل الشهادة</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">اسم الطالب</p>
                            <p className="font-semibold text-gray-900">{certificate.studentName}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">اسم الدورة</p>
                            <p className="font-semibold text-gray-900">{certificate.courseName}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">المدرب</p>
                            <p className="font-semibold text-gray-900">{certificate.course.user.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">تاريخ الإصدار</p>
                            <p className="font-semibold text-gray-900">
                                {new Date(certificate.issueDate).toLocaleDateString('ar-EG')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
