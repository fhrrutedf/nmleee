'use client';

import Link from 'next/link';
import { FiX, FiArrowRight } from 'react-icons/fi';

export default function CancelPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="card text-center">
                    {/* Cancel Icon */}
                    <div className="mb-6">
                        <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-4">
                            <FiX className="text-5xl text-red-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            تم إلغاء العملية
                        </h1>
                        <p className="text-gray-600">
                            لم يتم إكمال عملية الدفع. لا تقلق، لم يتم خصم أي مبلغ من حسابك.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                        <button
                            onClick={() => window.history.back()}
                            className="btn btn-primary w-full"
                        >
                            <FiArrowRight className="inline ml-2" />
                            العودة والمحاولة مرة أخرى
                        </button>

                        <Link href="/" className="btn btn-outline w-full">
                            العودة للصفحة الرئيسية
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
