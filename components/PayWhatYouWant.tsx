'use client';

import { useState } from 'react';
import { FiHeart, FiDollarSign } from 'react-icons/fi';

interface PayWhatYouWantProps {
    productId: string;
    productTitle: string;
    minPrice: number;
    suggestedPrice?: number;
    onPurchase: (amount: number, email?: string) => void;
    currency?: string;
}

export function PayWhatYouWant({
    productId,
    productTitle,
    minPrice,
    suggestedPrice,
    onPurchase,
    currency = 'ج.م'
}: PayWhatYouWantProps) {
    const [customAmount, setCustomAmount] = useState<string>(
        suggestedPrice?.toString() || minPrice?.toString() || '0'
    );
    const [email, setEmail] = useState('');
    const [showEmailInput, setShowEmailInput] = useState(false);

    const amount = parseFloat(customAmount) || 0;
    const isFree = amount === 0 && minPrice === 0;

    const handleSubmit = () => {
        if (amount < minPrice) {
            alert(`الحد الأدنى للسعر هو ${minPrice} ${currency}`);
            return;
        }

        if (isFree && !email) {
            setShowEmailInput(true);
            return;
        }

        onPurchase(amount, email || undefined);
    };

    return (
        <div className="card p-6 space-y-6">
            <div className="text-center">
                <div className="inline-flex items-center gap-2 mb-3 px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full border border-purple-200 dark:border-purple-800">
                    <FiHeart className="text-purple-600 dark:text-purple-400" />
                    <span className="font-semibold text-purple-900 dark:text-purple-200 text-sm">
                        ادفع ما تريد
                    </span>
                </div>
                <h3 className="text-xl font-bold text-primary-charcoal dark:text-white mb-2">
                    اختر السعر المناسب لك
                </h3>
                <p className="text-text-muted text-sm">
                    {minPrice === 0
                        ? 'هذا المنتج مجاني، لكن يمكنك دعم المنشئ 💝'
                        : `الحد الأدنى: ${minPrice} ${currency}`
                    }
                </p>
            </div>

            {/* Quick Amounts */}
            {minPrice === 0 && (
                <div className="flex flex-wrap justify-center gap-2">
                    {[0, 10, 25, 50, 100].map((value) => (
                        <button
                            key={value}
                            onClick={() => setCustomAmount(value.toString())}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${parseFloat(customAmount) === value
                                    ? 'bg-action-blue text-white shadow-md'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                        >
                            {value === 0 ? 'مجاني' : `${value} ${currency}`}
                        </button>
                    ))}
                </div>
            )}

            {/* Custom Amount Input */}
            <div>
                <label className="label">اختر المبلغ (اختياري)</label>
                <div className="relative">
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
                        <FiDollarSign />
                    </div>
                    <input
                        type="number"
                        min={minPrice}
                        step="0.01"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        className="input pr-10"
                        placeholder={`حد أدنى: ${minPrice}`}
                        dir="ltr"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">
                        {currency}
                    </div>
                </div>
                <p className="text-xs text-text-muted mt-1">
                    💡 السعر المقترح: {suggestedPrice || minPrice || 10} {currency}
                </p>
            </div>

            {/* Email Input (for free downloads) */}
            {(isFree || showEmailInput) && (
                <div className="animate-fade-in">
                    <label className="label">البريد الإلكتروني (لإرسال الملف)</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input"
                        placeholder="your@email.com"
                        required={isFree}
                        dir="ltr"
                    />
                </div>
            )}

            {/* Purchase Button */}
            <button
                onClick={handleSubmit}
                disabled={isFree && !email}
                className="btn btn-primary w-full text-lg py-4"
            >
                {isFree ? (
                    <>
                        <FiHeart />
                        <span>احصل عليه مجاناً!</span>
                    </>
                ) : (
                    <>
                        <span>شراء بـ {amount.toFixed(2)} {currency}</span>
                    </>
                )}
            </button>

            {/* Fair Price Message */}
            {amount > (suggestedPrice || minPrice) && (
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-green-800 dark:text-green-200 text-sm font-medium">
                        🙏 شكراً لدعمك السخي!
                    </p>
                </div>
            )}
        </div>
    );
}
