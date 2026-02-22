import prisma from "@/lib/prisma";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";

export default async function VerifyCertificatePage({ params }: { params: { code: string } }) {
    const certificate = await prisma.certificate.findUnique({
        where: { verificationCode: params.code },
        include: {
            course: {
                include: {
                    user: true // The instructor
                }
            }
        }
    });

    if (!certificate) {
        return (
            <div className="min-h-screen bg-bg-light flex flex-col items-center justify-center p-6 text-center">
                <FiXCircle className="text-6xl text-red-500 mb-4" />
                <h1 className="text-3xl font-bold text-primary-charcoal mb-2">شهادة غير صالحة</h1>
                <p className="text-text-muted">عذراً، لم نتمكن من العثور على شهادة برمز التحقق هذا. يرجى التأكد من الرابط والمحاولة مرة أخرى.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-light py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-action-blue to-purple-600 px-8 py-12 text-center text-white relative">
                        <div className="absolute top-4 right-4 flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                            <FiCheckCircle className="text-green-300" />
                            <span>موثقة رسمياً</span>
                        </div>
                        <h1 className="text-4xl font-bold mb-2">شهادة إتمام دورة</h1>
                        <p className="text-white/80 text-lg">هذه الشهادة تثبت إتمام المتدرب للدورة التدريبية بنجاح</p>
                    </div>

                    {/* Content */}
                    <div className="p-8 md:p-12 text-center">
                        <p className="text-gray-500 mb-2">تُمنح هذه الشهادة إلى:</p>
                        <h2 className="text-3xl font-bold text-gray-900 mb-8">{certificate.studentName}</h2>

                        <p className="text-gray-500 mb-2">لإتمامه بنجاح دورة:</p>
                        <h3 className="text-2xl font-bold text-action-blue mb-8">"{certificate.courseName}"</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 mb-8 text-right">
                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                                <p className="text-sm text-gray-400 mb-1">تاريخ الإصدار</p>
                                <p className="font-semibold text-gray-900">{format(new Date(certificate.issueDate), "dd MMMM yyyy", { locale: ar })}</p>
                            </div>
                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                                <p className="text-sm text-gray-400 mb-1">مُقدم الدورة (المدرب)</p>
                                <p className="font-semibold text-gray-900">{certificate.course.user.name}</p>
                            </div>
                        </div>

                        {/* Verification details */}
                        <div className="border-t border-gray-100 pt-8 mt-8 flex flex-col items-center">
                            <p className="text-sm text-gray-400">رمز التحقق المرجعي</p>
                            <code className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg mt-2 font-mono text-sm tracking-widest">
                                {certificate.verificationCode}
                            </code>
                            <p className="text-xs text-gray-400 mt-4 max-w-md mx-auto text-center">
                                هذه الشهادة صادرة إلكترونياً ولا تتطلب توقيعاً يدوياً. يمكنك دائماً التحقق من صحتها من خلال هذا الرابط.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
