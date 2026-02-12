'use client';

import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

interface CountdownTimerProps {
    endDate: Date | string;
    onExpire?: () => void;
    showDays?: boolean;
    showHours?: boolean;
    showMinutes?: boolean;
    showSeconds?: boolean;
}

export default function CountdownTimer({
    endDate,
    onExpire,
    showDays = true,
    showHours = true,
    showMinutes = true,
    showSeconds = true,
}: CountdownTimerProps) {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });
    const [expired, setExpired] = useState(false);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = +new Date(endDate) - +new Date();

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                });
            } else {
                setExpired(true);
                onExpire?.();
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [endDate, onExpire]);

    if (expired) {
        return (
            <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 font-semibold">انتهى العرض!</p>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center gap-2">
            {showDays && (
                <div className="text-center">
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-lg p-3 min-w-[60px]">
                        <div className="text-2xl font-bold">{timeLeft.days}</div>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">يوم</div>
                </div>
            )}

            {showDays && showHours && <span className="text-2xl font-bold text-gray-400">:</span>}

            {showHours && (
                <div className="text-center">
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-lg p-3 min-w-[60px]">
                        <div className="text-2xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</div>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">ساعة</div>
                </div>
            )}

            {showHours && showMinutes && <span className="text-2xl font-bold text-gray-400">:</span>}

            {showMinutes && (
                <div className="text-center">
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-lg p-3 min-w-[60px]">
                        <div className="text-2xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</div>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">دقيقة</div>
                </div>
            )}

            {showMinutes && showSeconds && <span className="text-2xl font-bold text-gray-400">:</span>}

            {showSeconds && (
                <div className="text-center">
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-lg p-3 min-w-[60px]">
                        <div className="text-2xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</div>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">ثانية</div>
                </div>
            )}
        </div>
    );
}
