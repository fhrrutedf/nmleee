'use client';

import { FiAward, FiCheck } from 'react-icons/fi';

interface CertificatePreviewProps {
    studentName: string;
    courseName: string;
    instructorName: string;
    issueDate: string;
    certificateNumber: string;
    brandColor?: string;
}

export default function CertificatePreview({
    studentName,
    courseName,
    instructorName,
    issueDate,
    certificateNumber,
    brandColor = '#4f46e5',
}: CertificatePreviewProps) {
    return (
        <div className="relative w-full aspect-[1.414/1] bg-white border-8 border-double" style={{ borderColor: brandColor }}>
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle, ${brandColor} 1px, transparent 1px)`,
                    backgroundSize: '20px 20px',
                }} />
            </div>

            {/* Content */}
            <div className="relative h-full flex flex-col items-center justify-center p-12 text-center">
                {/* Award Icon */}
                <div className="mb-6" style={{ color: brandColor }}>
                    <FiAward size={80} strokeWidth={1.5} />
                </div>

                {/* Title */}
                <h1 className="text-4xl font-bold text-gray-900 mb-2">شهادة إتمام</h1>
                <p className="text-lg text-gray-600 mb-8">Certificate of Completion</p>

                {/* Divider */}
                <div className="w-32 h-1 mb-8" style={{ backgroundColor: brandColor }} />

                {/* Student Name */}
                <p className="text-gray-700 mb-2">تُمنح هذه الشهادة إلى</p>
                <h2 className="text-3xl font-bold text-gray-900 mb-8">{studentName}</h2>

                {/* Course Name */}
                <p className="text-gray-700 mb-2">لإتمامه بنجاح دورة</p>
                <h3 className="text-2xl font-semibold mb-8" style={{ color: brandColor }}>
                    {courseName}
                </h3>

                {/* Instructor */}
                <div className="mt-auto pt-8 border-t border-gray-200 w-full">
                    <div className="flex items-center justify-between">
                        <div className="text-left">
                            <p className="text-sm text-gray-600 mb-1">المدرب</p>
                            <p className="font-semibold text-gray-900">{instructorName}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600 mb-1">تاريخ الإصدار</p>
                            <p className="font-semibold text-gray-900">{issueDate}</p>
                        </div>
                    </div>
                </div>

                {/* Certificate Number */}
                <div className="absolute bottom-4 left-4 text-xs text-gray-400">
                    {certificateNumber}
                </div>

                {/* Verification Badge */}
                <div className="absolute bottom-4 right-4 flex items-center gap-1 text-xs" style={{ color: brandColor }}>
                    <FiCheck size={14} />
                    <span>تم التحقق</span>
                </div>
            </div>
        </div>
    );
}
