'use client';

import { FiCheckCircle } from 'react-icons/fi';

interface VerifiedBadgeProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    showTooltip?: boolean;
}

export function VerifiedBadge({
    size = 'md',
    className = '',
    showTooltip = true
}: VerifiedBadgeProps) {
    const sizeClasses = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg'
    };

    return (
        <div className={`inline-flex items-center ${className}`} title={showTooltip ? 'منشئ موثق' : undefined}>
            <FiCheckCircle
                className={`${sizeClasses[size]} text-blue-500 dark:text-blue-400 fill-blue-500 dark:fill-blue-400`}
                style={{ fill: 'currentColor' }}
            />
        </div>
    );
}

interface CreatorNameWithBadgeProps {
    name: string;
    isVerified: boolean;
    className?: string;
    badgeSize?: 'sm' | 'md' | 'lg';
}

export function CreatorNameWithBadge({
    name,
    isVerified,
    className = '',
    badgeSize = 'md'
}: CreatorNameWithBadgeProps) {
    return (
        <div className={`inline-flex items-center gap-2 ${className}`}>
            <span>{name}</span>
            {isVerified && <VerifiedBadge size={badgeSize} />}
        </div>
    );
}
