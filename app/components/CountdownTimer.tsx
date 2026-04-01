'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiClock, FiAlertCircle } from 'react-icons/fi';

interface CountdownTimerProps {
    expiresAt: string;
    brandColor?: string;
}

export default function CountdownTimer({ expiresAt, brandColor = '#10B981' }: CountdownTimerProps) {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            const expiry = new Date(expiresAt).getTime();
            const difference = expiry - now;

            if (difference <= 0) {
                setIsExpired(true);
                return { days: 0, hours: 0, minutes: 0, seconds: 0 };
            }

            return {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((difference % (1000 * 60)) / 1000)
            };
        };

        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [expiresAt]);

    if (isExpired) return null;

    const timeBlocksRaw = [
        { value: timeLeft.days, label: 'أيام' },
        { value: timeLeft.hours, label: 'ساعات' },
        { value: timeLeft.minutes, label: 'دقائق' },
        { value: timeLeft.seconds, label: 'ثواني' }
    ];
    const timeBlocks = timeBlocksRaw.filter((block, index) => block.value > 0 || index > 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-lg"
        >
            <FiClock className="text-red-400" size={16} />
            <span className="text-xs text-red-300 font-medium">ينتهي العرض خلال:</span>
            <div className="flex gap-1">
                {timeBlocks.map((block, index) => (
                    <div key={block.label} className="flex items-center gap-1">
                        <span 
                            className="px-2 py-1 bg-black/30 rounded text-sm font-bold text-white min-w-[28px] text-center"
                        >
                            {String(block.value).padStart(2, '0')}
                        </span>
                        <span className="text-[10px] text-red-300">{block.label}</span>
                        {index < timeBlocks.length - 1 && (
                            <span className="text-red-400 mx-0.5">:</span>
                        )}
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
