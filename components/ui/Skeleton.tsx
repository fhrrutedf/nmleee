import React from 'react';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular';
    width?: string | number;
    height?: string | number;
    animation?: 'pulse' | 'wave';
}

export const Skeleton: React.FC<SkeletonProps> = ({
    className = '',
    variant = 'rectangular',
    width,
    height,
    animation = 'pulse',
}) => {
    const baseClasses = 'bg-gray-200 dark:bg-gray-700';

    const variantClasses = {
        text: 'rounded h-4',
        circular: 'rounded-full',
        rectangular: 'rounded-lg',
    };

    const animationClasses = {
        pulse: 'animate-pulse',
        wave: 'animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700',
    };

    const style: React.CSSProperties = {
        width: width || (variant === 'text' ? '100%' : undefined),
        height: height || (variant === 'text' ? undefined : '100%'),
    };

    return (
        <div
            className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
            style={style}
        />
    );
};

// Card Skeleton
export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
    <div className={`card space-y-4 ${className}`}>
        <Skeleton variant="rectangular" height={200} />
        <div className="space-y-2">
            <Skeleton variant="text" width="80%" />
            <Skeleton variant="text" width="60%" />
        </div>
        <div className="flex justify-between items-center">
            <Skeleton variant="text" width={100} />
            <Skeleton variant="rectangular" width={80} height={32} />
        </div>
    </div>
);

// Table Row Skeleton
export const TableRowSkeleton: React.FC<{ columns?: number }> = ({ columns = 4 }) => (
    <tr>
        {Array.from({ length: columns }).map((_, i) => (
            <td key={i} className="px-4 py-3">
                <Skeleton variant="text" />
            </td>
        ))}
    </tr>
);

// Product Card Skeleton
export const ProductCardSkeleton: React.FC = () => (
    <div className="card overflow-hidden">
        <Skeleton variant="rectangular" height={200} className="rounded-t-lg" />
        <div className="p-4 space-y-3">
            <Skeleton variant="text" width="90%" height={24} />
            <Skeleton variant="text" width="70%" />
            <div className="flex justify-between items-center pt-2">
                <Skeleton variant="text" width={80} height={28} />
                <Skeleton variant="circular" width={40} height={40} />
            </div>
        </div>
    </div>
);

// Dashboard Stats Skeleton
export const StatCardSkeleton: React.FC = () => (
    <div className="card">
        <div className="flex justify-between items-start mb-4">
            <Skeleton variant="rectangular" width={48} height={48} className="rounded-xl" />
            <Skeleton variant="rectangular" width={60} height={24} className="rounded-full" />
        </div>
        <Skeleton variant="text" width="60%" className="mb-2" />
        <Skeleton variant="text" width="40%" height={32} />
    </div>
);

// Profile Skeleton
export const ProfileSkeleton: React.FC = () => (
    <div className="flex items-center gap-4">
        <Skeleton variant="circular" width={64} height={64} />
        <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="40%" height={24} />
            <Skeleton variant="text" width="60%" />
        </div>
    </div>
);

export default Skeleton;
