'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FiSave, FiDollarSign } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function PayoutSettingsPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [method, setMethod] = useState<'bank' | 'paypal' | 'crypto'>('bank');

    // Bank details
    const [bankName, setBankName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [accountName, setAccountName] = useState('');
    const [iban, setIban] = useState('');
    const [swiftCode, setSwiftCode] = useState('');

    // PayPal
    const [paypalEmail, setPaypalEmail] = useState('');

    // Crypto
    const [cryptoWallet, setCryptoWallet] = useState('');

    useEffect(() => {
        if (!session) {
            router.push('/login');
            return;
        }
        fetchSettings();
    }, [session]);

    const fetchSettings = async () => {
        try {
            const response = await fetch('/api/seller/payout-settings');
            if (response.ok) {
                const data = await response.json();

                if (data.payoutMethod) {
                    setMethod(data.payoutMethod);
                }

                if (data.bankDetails) {
                    setBankName(data.bankDetails.bankName || '');
                    setAccountNumber(data.bankDetails.accountNumber || '');
                    setAccountName(data.bankDetails.accountName || '');
                    setIban(data.bankDetails.iban || '');
                    setSwiftCode(data.bankDetails.swiftCode || '');
                }

                if (data.paypalEmail) {
                    setPaypalEmail(data.paypalEmail);
                }

                if (data.cryptoWallet) {
                    setCryptoWallet(data.cryptoWallet);
                }
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const bankDetails = method === 'bank' ? {
                bankName,
                accountNumber,
                accountName,
                iban,
                swiftCode,
            } : null;

            const response = await fetch('/api/seller/payout-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    method,
                    bankDetails,
                    paypalEmail: method === 'paypal' ? paypalEmail : null,
                    cryptoWallet: method === 'crypto' ? cryptoWallet : null,
                }),
            });

            if (response.ok) {
                toast.success('تم حفظ الإعدادات بنجاح ✅');
            } else {
                toast.error('حدث خطأ أثناء الحفظ ❌');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('حدث خطأ أثناء الحفظ ❌');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-xl h-12 w-12 border-b-2 border-ink"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">إعدادات السحب</h1>
                    <p className="text-gray-600 mt-2">اختر طريقة استلام أرباحك</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <form onSubmit={handleSubmit}>
                        {/* Method Selection */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                طريقة الدفع
                            </label>
                            <div className="grid grid-cols-3 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setMethod('bank')}
                                    className={`p-4 border-2 rounded-lg text-center transition-colors ${method === 'bank'
                                        ? 'border-ink bg-indigo-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <FiDollarSign className="mx-auto mb-2" size={24} />
                                    <span className="text-sm font-medium">تحويل بنكي</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setMethod('paypal')}
                                    className={`p-4 border-2 rounded-lg text-center transition-colors ${method === 'paypal'
                                        ? 'border-ink bg-indigo-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <span className="text-2xl mb-2 block">💙</span>
                                    <span className="text-sm font-medium">PayPal</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setMethod('crypto')}
                                    className={`p-4 border-2 rounded-lg text-center transition-colors ${method === 'crypto'
                                        ? 'border-ink bg-indigo-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <span className="text-2xl mb-2 block">🪙</span>
                                    <span className="text-sm font-medium">USDT</span>
                                </button>
                            </div>
                        </div>

                        {/* Bank Transfer Fields */}
                        {method === 'bank' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        اسم البنك
                                    </label>
                                    <input
                                        type="text"
                                        value={bankName}
                                        onChange={(e) => setBankName(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ink"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        اسم صاحب الحساب
                                    </label>
                                    <input
                                        type="text"
                                        value={accountName}
                                        onChange={(e) => setAccountName(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ink"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        رقم الحساب
                                    </label>
                                    <input
                                        type="text"
                                        value={accountNumber}
                                        onChange={(e) => setAccountNumber(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ink"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        IBAN (اختياري)
                                    </label>
                                    <input
                                        type="text"
                                        value={iban}
                                        onChange={(e) => setIban(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ink"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        SWIFT Code (اختياري)
                                    </label>
                                    <input
                                        type="text"
                                        value={swiftCode}
                                        onChange={(e) => setSwiftCode(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ink"
                                    />
                                </div>
                            </div>
                        )}

                        {/* PayPal Field */}
                        {method === 'paypal' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    بريد PayPal
                                </label>
                                <input
                                    type="email"
                                    value={paypalEmail}
                                    onChange={(e) => setPaypalEmail(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ink"
                                    placeholder="example@paypal.com"
                                    required
                                />
                            </div>
                        )}

                        {/* Crypto Field */}
                        {method === 'crypto' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    عنوان محفظة USDT (TRC20)
                                </label>
                                <input
                                    type="text"
                                    value={cryptoWallet}
                                    onChange={(e) => setCryptoWallet(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ink"
                                    placeholder="TRxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    تأكد من استخدام عنوان USDT على شبكة TRON (TRC20)
                                </p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="mt-6">
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full px-6 py-3 bg-ink text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <FiSave />
                                {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Info */}
                <div className="mt-6 bg-accent-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-bold text-blue-900 mb-2">💡 معلومات مهمة:</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• يمكنك تغيير طريقة الدفع في أي وقت</li>
                        <li>• تأكد من صحة المعلومات لتجنب تأخير الدفع</li>
                        <li>• التحويل البنكي قد يستغرق 3-5 أيام عمل</li>
                        <li>• PayPal و USDT فوريان</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
