import React from 'react';

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
        icon?: React.ReactNode;
    };
    className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    description,
    action,
    className = '',
}) => {
    return (
        <div className={`flex flex-col items-center justify-center text-center p-12 ${className}`}>
            {icon && (
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                    <div className="text-4xl text-gray-400 dark:text-gray-500">
                        {icon}
                    </div>
                </div>
            )}
            <h3 className="text-xl font-bold text-primary-charcoal dark:text-white mb-2">
                {title}
            </h3>
            <p className="text-text-muted max-w-md mb-6">
                {description}
            </p>
            {action && (
                <button
                    onClick={action.onClick}
                    className="btn btn-primary flex items-center gap-2"
                >
                    {action.icon}
                    {action.label}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
