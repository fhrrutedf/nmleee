'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FiSave, FiDollarSign } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ManualPaymentSettingsPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [shamCashNumber, setShamCashNumber] = useState('');
    const [omtNumber, setOmtNumber] = useState('');
    const [zainCashNumber, setZainCashNumber] = useState('');
    const [vodafoneCash, setVodafoneCash] = useState('');
    const [mtncashNumber, setMtncashNumber] = useState('');

    useEffect(() => {
        if (!session) {
            router.push('/login');
            return;
        }
        fetchSettings();
    }, [session]);

    const fetchSettings = async () => {
        try {
            const response = await fetch('/api/seller/manual-payment-settings');
            if (response.ok) {
                const data = await response.json();
                setShamCashNumber(data.shamCashNumber || '');
                setOmtNumber(data.omtNumber || '');
                setZainCashNumber(data.zainCashNumber || '');
                setVodafoneCash(data.vodafoneCash || '');
                setMtncashNumber(data.mtncashNumber || '');
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
            const response = await fetch('/api/seller/manual-payment-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    shamCashNumber,
                    omtNumber,
                    zainCashNumber,
                    vodafoneCash,
                    mtncashNumber,
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
                    <h1 className="text-3xl font-bold text-gray-900">إعدادات الدفع اليدوي</h1>
                    <p className="text-gray-600 mt-2">أضف أرقامك لاستقبال الدفعات من المشترين</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Syria */}
                        <div className="border-b pb-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                🇸🇾 سوريا
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        💵 رقم شام كاش
                                    </label>
                                    <input
                                        type="text"
                                        value={shamCashNumber}
                                        onChange={(e) => setShamCashNumber(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ink"
                                        placeholder="+963 XXX XXX XXX"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        🏦 رقم OMT
                                    </label>
                                    <input
                                        type="text"
                                        value={omtNumber}
                                        onChange={(e) => setOmtNumber(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ink"
                                        placeholder="+963 XXX XXX XXX"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        📱 رقم MTN Cash
                                    </label>
                                    <input
                                        type="text"
                                        value={mtncashNumber}
                                        onChange={(e) => setMtncashNumber(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ink"
                                        placeholder="+963 XXX XXX XXX"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Iraq */}
                        <div className="border-b pb-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                🇮🇶 العراق
                            </h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    📱 رقم Zain Cash
                                </label>
                                <input
                                    type="text"
                                    value={zainCashNumber}
                                    onChange={(e) => setZainCashNumber(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ink"
                                    placeholder="+964 XXX XXX XXXX"
                                />
                            </div>
                        </div>

                        {/* Egypt */}
                        <div className="pb-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                🇪🇬 مصر
                            </h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    📱 رقم Vodafone Cash
                                </label>
                                <input
                                    type="text"
                                    value={vodafoneCash}
                                    onChange={(e) => setVodafoneCash(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ink"
                                    placeholder="+20 XXX XXX XXXX"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div>
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
                    <h3 className="font-bold text-blue-900 mb-2">💡 ملاحظات:</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• يمكنك إضافة رقم واحد أو أكثر حسب الدول التي تستقبل منها دفعات</li>
                        <li>• تأكد من صحة الأرقام لتجنب مشاكل في استلام الأموال</li>
                        <li>• ستظهر هذه الأرقام للمشترين عند اختيار الدفع اليدوي</li>
                        <li>• يمكنك تحديث الأرقام في أي وقت</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
