'use client';

import { motion } from 'framer-motion';
import { FiAlertTriangle, FiPackage } from 'react-icons/fi';

interface LowStockBadgeProps {
    stockLimit: number;
    soldCount: number;
    threshold?: number; // percentage threshold for showing alert
}

export default function LowStockBadge({ stockLimit, soldCount, threshold = 20 }: LowStockBadgeProps) {
    // Calculate remaining stock
    const remaining = stockLimit - soldCount;
    const percentage = (remaining / stockLimit) * 100;
    
    // If unlimited stock or plenty left
    if (!stockLimit || remaining <= 0 || percentage > threshold) return null;

    const isVeryLow = remaining <= 3;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                isVeryLow 
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                    : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
            }`}
        >
            <FiAlertTriangle className={isVeryLow ? 'animate-pulse' : ''} size={12} />
            <span>
                {isVeryLow 
                    ? `متبقي ${remaining} فقط!` 
                    : `المخزون ينفد - ${remaining} متبقي`
                }
            </span>
        </motion.div>
    );
}

// Stock progress bar component
export function StockProgressBar({ stockLimit, soldCount }: { stockLimit: number; soldCount: number }) {
    if (!stockLimit) return null;

    const remaining = Math.max(0, stockLimit - soldCount);
    const percentage = (remaining / stockLimit) * 100;
    const soldPercentage = ((soldCount / stockLimit) * 100);

    let barColor = 'from-emerald-500 to-emerald-400';
    if (percentage <= 20) barColor = 'from-red-500 to-red-400';
    else if (percentage <= 40) barColor = 'from-orange-500 to-yellow-400';

    return (
        <div className="space-y-1">
            <div className="flex justify-between text-xs">
                <span className="text-gray-400">المخزون: {remaining} / {stockLimit}</span>
                <span className={percentage <= 20 ? 'text-red-400' : 'text-gray-400'}>
                    {percentage.toFixed(0)}% متبقي
                </span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${soldPercentage}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className={`h-full bg-gradient-to-r ${barColor}`}
                />
            </div>
            {percentage <= 20 && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-red-400 flex items-center gap-1"
                >
                    <FiPackage size={10} />
                    ينفد بسرعة - اطلب الآن!
                </motion.p>
            )}
        </div>
    );
}
