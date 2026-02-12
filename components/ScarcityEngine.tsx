'use client';

import { useState, useEffect } from 'react';
import { FiClock, FiAlertCircle } from 'react-icons/fi';

interface ScarcityEngineProps {
    // Quantity Limits
    stockLimit?: number | null;
    soldCount?: number;

    // Time Limits
    offerExpiresAt?: Date | string | null;

    // Styling
    position?: 'inline' | 'sticky';
    className?: string;
}

export function ScarcityEngine({
    stockLimit,
    soldCount = 0,
    offerExpiresAt,
    position = 'inline',
    className = ''
}: ScarcityEngineProps) {
    const [timeLeft, setTimeLeft] = useState<{
        hours: number;
        minutes: number;
        seconds: number;
    } | null>(null);

    const [isExpired, setIsExpired] = useState(false);

    // Calculate remaining stock
    const remaining = stockLimit !== null && stockLimit !== undefined
        ? Math.max(0, stockLimit - soldCount)
        : null;

    // Countdown timer logic
    useEffect(() => {
        if (!offerExpiresAt) return;

        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            const expiry = new Date(offerExpiresAt).getTime();
            const difference = expiry - now;

            if (difference <= 0) {
                setIsExpired(true);
                setTimeLeft(null);
                return;
            }

            const hours = Math.floor(difference / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            setTimeLeft({ hours, minutes, seconds });
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [offerExpiresAt]);

    // Don't render if no scarcity indicators
    if (!remaining && !timeLeft && !isExpired) {
        return null;
    }

    const containerClasses = position === 'sticky'
        ? 'fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-t-2 border-red-200 dark:border-red-800 backdrop-blur-sm'
        : 'bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/10 dark:to-orange-900/10 border border-red-200 dark:border-red-800 rounded-lg';

    return (
        <div className={`${containerClasses} ${className}`}>
            <div className="container-custom py-3 px-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                    {/* Quantity Scarcity */}
                    {remaining !== null && remaining > 0 && (
                        <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                            <FiAlertCircle className="text-lg flex-shrink-0" />
                            <span className="font-semibold text-sm md:text-base">
                                {remaining <= 5 ? (
                                    <>
                                        ⚠️ متبقي <span className="text-xl font-bold mx-1">{remaining}</span> فقط بهذا السعر!
                                    </>
                                ) : (
                                    <>
                                        متبقي {remaining} من {stockLimit}
                                    </>
                                )}
                            </span>
                        </div>
                    )}

                    {/* Stock Depleted */}
                    {remaining === 0 && (
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <FiAlertCircle className="text-lg" />
                            <span className="font-semibold">نفد المخزون 😢</span>
                        </div>
                    )}

                    {/* Time Scarcity */}
                    {timeLeft && !isExpired && (
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                                <FiClock className="text-lg animate-pulse" />
                                <span className="font-semibold text-sm">ينتهي العرض خلال:</span>
                            </div>
                            <div className="flex items-center gap-1" dir="ltr">
                                {/* Hours */}
                                <div className="bg-red-600 dark:bg-red-700 text-white rounded px-2 py-1 min-w-[42px] text-center">
                                    <span className="text-lg font-bold tabular-nums">
                                        {String(timeLeft.hours).padStart(2, '0')}
                                    </span>
                                    <div className="text-[10px] opacity-80">ساعة</div>
                                </div>
                                <span className="text-red-700 dark:text-red-400 font-bold">:</span>

                                {/* Minutes */}
                                <div className="bg-red-600 dark:bg-red-700 text-white rounded px-2 py-1 min-w-[42px] text-center">
                                    <span className="text-lg font-bold tabular-nums">
                                        {String(timeLeft.minutes).padStart(2, '0')}
                                    </span>
                                    <div className="text-[10px] opacity-80">دقيقة</div>
                                </div>
                                <span className="text-red-700 dark:text-red-400 font-bold">:</span>

                                {/* Seconds */}
                                <div className="bg-red-600 dark:bg-red-700 text-white rounded px-2 py-1 min-w-[42px] text-center">
                                    <span className="text-lg font-bold tabular-nums">
                                        {String(timeLeft.seconds).padStart(2, '0')}
                                    </span>
                                    <div className="text-[10px] opacity-80">ثانية</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Expired */}
                    {isExpired && (
                        <div className="text-gray-600 dark:text-gray-400 font-semibold">
                            انتهى العرض ⏰
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
