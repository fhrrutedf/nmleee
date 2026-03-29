'use client';

import { motion } from 'framer-motion';
import { FaWhatsapp } from 'react-icons/fa';
import { usePathname } from 'next/navigation';

export const WhatsAppButton = () => {
    const pathname = usePathname();
    const isDashboard = pathname?.startsWith('/dashboard');

    // Replace with your real support number
    const whatsappNumber = '201012345678'; 
    const message = 'مرحباً، أحتاج للمساعدة في منصة تمالين';

    const showButton = pathname === '/dashboard/support' || pathname?.startsWith('/dashboard/support/') || pathname === '/dashboard/admin/platform-settings';
    
    if (!showButton) return null;

    return (
        <motion.a
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="fixed bottom-6 left-6 z-[60] w-12 h-12 bg-[#25D366] text-white rounded-xl flex items-center justify-center shadow-lg shadow-[#10B981]/20 shadow-green-500/20 cursor-pointer border border-white/20"
            title="تحدث مع الدعم الفني"
        >
            <FaWhatsapp size={24} />
        </motion.a>
    );
};
