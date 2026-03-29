'use client';

import Link from 'next/link';
import { FiHome, FiSearch } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#111111] flex items-center justify-center p-4">
            <div className="text-center max-w-lg w-full">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-9xl font-bold text-gray-200">404</h1>
                </motion.div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="relative -mt-12"
                >
                    <h2 className="text-3xl font-bold text-white mb-4">هذه الصفحة غير موجودة</h2>
                    <p className="text-gray-400 mb-8 text-lg">
                        عذراً، يبدو أن الرابط الذي تحاول الوصول إليه غير صحيح أو قد تم نقله.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/"
                            className="btn btn-primary flex items-center justify-center gap-2 px-8 py-3 shadow-lg shadow-[#10B981]/20 hover:shadow-lg shadow-[#10B981]/20 hover:-translate-y-1 transition-all"
                        >
                            <FiHome />
                            الرئيسية
                        </Link>
                        <Link
                            href="/contact"
                            className="btn bg-[#0A0A0A] border border-emerald-500/20 text-gray-700 flex items-center justify-center gap-2 px-8 py-3 hover:bg-[#111111] transition-colors"
                        >
                            <FiSearch />
                            مركز المساعدة
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
