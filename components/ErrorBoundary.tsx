'use client';

import React, { Component, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            return (
                <div className="min-h-[60vh] flex items-center justify-center p-8" dir="rtl">
                    <div className="text-center max-w-md">
                        <div className="text-6xl mb-4">⚠️</div>
                        <h2 className="text-2xl font-bold text-white mb-3">حدث خطأ ما</h2>
                        <p className="text-gray-400 mb-6">
                            نعتذر عن الإزعاج. حدث خطأ غير متوقع. يرجى تحديث الصفحة أو المحاولة لاحقاً.
                        </p>
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="text-left bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-4 text-sm">
                                <summary className="text-red-400 cursor-pointer mb-2">تفاصيل الخطأ (وضع التطوير)</summary>
                                <pre className="text-red-300 overflow-auto text-xs">
                                    {this.state.error.toString()}
                                </pre>
                            </details>
                        )}
                        <button
                            onClick={() => this.setState({ hasError: false, error: null })}
                            className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
                        >
                            إعادة المحاولة
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
