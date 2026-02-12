import Link from 'next/link';
import { FiAlertTriangle } from 'react-icons/fi';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-bg-light flex flex-col items-center justify-center p-4">
            <div className="text-center">
                <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                    <FiAlertTriangle className="text-4xl text-red-500" />
                </div>

                <h1 className="text-6xl font-bold text-primary-charcoal mb-4">404</h1>
                <h2 className="text-2xl font-bold text-gray-700 mb-4">الصفحة غير موجودة</h2>

                <p className="text-text-muted mb-8 max-w-md mx-auto">
                    عذراً، يبدو أن الصفحة التي تبحث عنها قد تم نقلها أو حذفها.
                </p>

                <Link
                    href="/"
                    className="btn btn-primary inline-flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
                >
                    العودة للصفحة الرئيسية
                </Link>
            </div>
        </div>
    );
}
