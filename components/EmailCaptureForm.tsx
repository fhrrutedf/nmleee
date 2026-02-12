'use client';

import { useState } from 'react';
import { FiMail, FiCheck, FiX } from 'react-icons/fi';

interface EmailCaptureFormProps {
    onSubmit?: (email: string) => void;
    title?: string;
    description?: string;
    buttonText?: string;
    placeholder?: string;
    successMessage?: string;
    backgroundColor?: string;
    textColor?: string;
    buttonColor?: string;
}

export default function EmailCaptureForm({
    onSubmit,
    title = 'انضم إلى قائمتنا البريدية',
    description = 'احصل على آخر التحديثات والعروض الحصرية',
    buttonText = 'اشترك الآن',
    placeholder = 'أدخل بريدك الإلكتروني',
    successMessage = 'شكراً! تم الاشتراك بنجاح',
    backgroundColor = '#4f46e5',
    textColor = '#ffffff',
    buttonColor = '#6366f1',
}: EmailCaptureFormProps) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email || !email.includes('@')) {
            setError('يرجى إدخال بريد إلكتروني صحيح');
            return;
        }

        setLoading(true);

        try {
            // Call API or custom handler
            if (onSubmit) {
                await onSubmit(email);
            } else {
                // Default: Save to database
                const response = await fetch('/api/email-subscribers', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email }),
                });

                if (!response.ok) {
                    throw new Error('Failed to subscribe');
                }
            }

            setSubmitted(true);
            setEmail('');
        } catch (error) {
            console.error('Error subscribing:', error);
            setError('حدث خطأ، يرجى المحاولة مرة أخرى');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div
                className="rounded-lg p-8 text-center"
                style={{ backgroundColor, color: textColor }}
            >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-full mb-4">
                    <FiCheck size={32} />
                </div>
                <h3 className="text-xl font-bold mb-2">{successMessage}</h3>
                <p className="opacity-90">تحقق من بريدك الإلكتروني</p>
            </div>
        );
    }

    return (
        <div
            className="rounded-lg p-8"
            style={{ backgroundColor, color: textColor }}
        >
            <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-full mb-4">
                    <FiMail size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-2">{title}</h3>
                <p className="opacity-90">{description}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={placeholder}
                        className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-white focus:outline-none"
                        required
                    />
                    {error && (
                        <p className="text-sm text-red-200 mt-2 flex items-center gap-1">
                            <FiX size={14} />
                            {error}
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-6 py-3 rounded-lg font-semibold transition-all hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: buttonColor, color: textColor }}
                >
                    {loading ? 'جاري الاشتراك...' : buttonText}
                </button>

                <p className="text-xs text-center opacity-75">
                    لن نشارك بريدك الإلكتروني مع أي شخص
                </p>
            </form>
        </div>
    );
}
