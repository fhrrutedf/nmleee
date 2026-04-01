'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSpeaker, FiInfo, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';

interface NotificationBarProps {
    message: string;
    type?: 'info' | 'warning' | 'success' | 'urgent';
    isActive?: boolean;
    link?: string;
    linkText?: string;
    onDismiss?: () => void;
    brandColor?: string;
}

export default function SellerNotificationBar({ 
    message, 
    type = 'info', 
    isActive = true,
    link,
    linkText = 'اعرف المزيد',
    onDismiss,
    brandColor = '#10B981'
}: NotificationBarProps) {
    const [isVisible, setIsVisible] = useState(isActive);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        setIsVisible(isActive);
    }, [isActive]);

    const handleDismiss = () => {
        setIsVisible(false);
        setIsDismissed(true);
        onDismiss?.();
    };

    const typeStyles = {
        info: {
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/30',
            text: 'text-blue-400',
            icon: FiInfo,
            gradient: 'from-blue-500/20 to-cyan-500/20'
        },
        warning: {
            bg: 'bg-yellow-500/10',
            border: 'border-yellow-500/30',
            text: 'text-yellow-400',
            icon: FiAlertTriangle,
            gradient: 'from-yellow-500/20 to-orange-500/20'
        },
        success: {
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/30',
            text: 'text-emerald-400',
            icon: FiCheckCircle,
            gradient: 'from-emerald-500/20 to-green-500/20'
        },
        urgent: {
            bg: 'bg-red-500/10',
            border: 'border-red-500/30',
            text: 'text-red-400',
            icon: FiSpeaker,
            gradient: 'from-red-500/20 to-pink-500/20'
        }
    };

    const style = typeStyles[type];
    const Icon = style.icon;

    if (isDismissed || !isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className={`relative overflow-hidden rounded-xl border ${style.bg} ${style.border} p-4`}
            >
                {/* Animated gradient background */}
                <motion.div
                    animate={{ 
                        background: `linear-gradient(90deg, ${brandColor}10, ${brandColor}20, ${brandColor}10)` 
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute inset-0 opacity-50"
                />

                <div className="relative flex items-center gap-3">
                    <div className={`flex-shrink-0 p-2 rounded-lg bg-gradient-to-br ${style.gradient}`}>
                        <Icon className={style.text} size={20} />
                    </div>

                    <div className="flex-1 min-w-0">
                        <p className={`text-sm ${style.text} font-medium leading-relaxed`}>
                            {message}
                        </p>
                        {link && (
                            <a 
                                href={link}
                                className="inline-block mt-1 text-xs underline hover:no-underline opacity-80 hover:opacity-100"
                                style={{ color: brandColor }}
                            >
                                {linkText} →
                            </a>
                        )}
                    </div>

                    <button
                        onClick={handleDismiss}
                        className={`flex-shrink-0 p-1.5 rounded-lg hover:bg-white/10 transition-colors ${style.text}`}
                    >
                        <FiX size={18} />
                    </button>
                </div>

                {/* Pulsing indicator for urgent */}
                {type === 'urgent' && (
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"
                    />
                )}
            </motion.div>
        </AnimatePresence>
    );
}
