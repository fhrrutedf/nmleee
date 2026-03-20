'use client';

import { motion } from 'framer-motion';
import { FaWhatsapp } from 'react-icons/fa';

export const WhatsAppButton = () => {
    // Replace with your real support number
    const whatsappNumber = '201012345678'; 
    const message = 'مرحباً، أحتاج للمساعدة في منصة تمالين';

    return (
        <motion.a
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            className="fixed bottom-8 right-8 z-50 w-16 h-16 bg-[#25D366] text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-green-500/40 cursor-pointer lg:bottom-10 lg:right-10"
        >
            <FaWhatsapp size={32} />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping"></span>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full"></span>
        </motion.a>
    );
};
