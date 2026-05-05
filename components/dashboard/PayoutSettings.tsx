'use client';

import { useState, useEffect } from 'react';
import { 
    FiDollarSign, FiSmartphone, FiCheckCircle, 
    FiSave, FiInfo 
} from 'react-icons/fi';
import { apiGet, apiPut, handleApiError } from '@/lib/safe-fetch';
import toast from 'react-hot-toast';
import { PayoutMethods, getPayoutMethodLabel } from '@/lib/payout-utils';

export default function PayoutSettings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [data, setData] = useState({
        payoutMethod: '',
        cryptoWallet: '',
        shamCashNumber: '',
        syriatelCashNumber: '',
    });

    const [activeMethod, setActiveMethod] = useState<string | null>(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const profile = await apiGet('/api/user/profile');
            setData({
                payoutMethod: profile.payoutMethod || '',
                cryptoWallet: profile.cryptoWallet || '',
                shamCashNumber: profile.shamCashNumber || '',
                syriatelCashNumber: profile.syriatelCashNumber || '',
            });
            setActiveMethod(profile.payoutMethod);
        } catch (error) {
            console.error('Error fetching payout settings:', handleApiError(error));
            toast.error('فشل تحميل إعدادات السحب');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (method: string) => {
        if (method === PayoutMethods.CRYPTO && !data.cryptoWallet) {
            return toast.error('يرجى إدخال عنوان محفظة USDT');
        }
        if (method === PayoutMethods.SHAMCASH && !data.shamCashNumber) {
            return toast.error('يرجى إدخال رقم محفظة شام كاش');
        }
        if (method === PayoutMethods.SYRIATELCASH && !data.syriatelCashNumber) {
            return toast.error('يرجى إدخال رقم محفظة سيريتل كاش');
        }

        setSaving(true);
        try {
            const payload = { ...data, payoutMethod: method };
            await apiPut('/api/user/profile', payload);
            setActiveMethod(method);
            toast.success(`تم تفعيل طريقة السحب: ${getPayoutMethodLabel(method)}`);
        } catch (error) {
            toast.error('فشل حفظ الإعدادات: ' + handleApiError(error));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="space-y-4">
            <div className="h-10 bg-emerald-800 rounded-lg w-1/4 animate-pulse"></div>
            <div className="h-64 bg-[#111111] rounded-xl animate-pulse"></div>
        </div>;
    }

    const methods = [
        { id: PayoutMethods.CRYPTO, name: 'USDT (TRC20)', icon: FiDollarSign, color: 'emerald' },
        { id: PayoutMethods.SHAMCASH, name: 'شام كاش (سيريا)', icon: FiSmartphone, color: 'purple' },
        { id: PayoutMethods.SYRIATELCASH, name: 'سيريتل كاش (سيريا)', icon: FiSmartphone, color: 'emerald' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-[#111111] border border-emerald-500/10 p-4 rounded-xl flex items-start gap-3">
                <FiInfo className="text-[#10B981] mt-1 shrink-0" />
                <p className="text-sm text-gray-400 leading-relaxed">
                    يُرجى اختيار وتفعيل طريقة سحب واحدة لتتمكن من تلقي أرباحك. سيتم معالجة الطلبات خلال 24-48 ساعة عمل.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {methods.map((method) => {
                    const isActive = activeMethod === method.id;
                    return (
                        <button
                            key={method.id}
                            onClick={() => setActiveMethod(method.id)}
                            className={`p-6 rounded-xl border-2 transition-all flex flex-col items-center gap-4 text-center ${
                                isActive 
                                ? 'border-emerald-500 bg-emerald-500/5 shadow-lg shadow-emerald-500/10' 
                                : 'border-white/5 hover:border-emerald-500/20 bg-[#0A0A0A]'
                            }`}
                        >
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${
                                isActive ? 'bg-emerald-500 text-white' : 'bg-emerald-900/20 text-gray-500'
                            }`}>
                                <method.icon />
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-bold text-white text-lg">{method.name}</h3>
                                {isActive && <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">الطريقة النشطة</span>}
                            </div>
                        </button>
                    );
                })}
            </div>

            {activeMethod && (
                <div className="bg-[#0A0A0A] border border-white/10 p-8 rounded-2xl shadow-2xl shadow-emerald-500/5">
                    <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                        إعدادات {getPayoutMethodLabel(activeMethod)}
                    </h3>

                    <div className="space-y-8 max-w-2xl">
                        {activeMethod === PayoutMethods.CRYPTO && (
                            <div className="space-y-4">
                                <label className="text-sm font-bold text-gray-400 block">عنوان محفظة USDT (TRC20)</label>
                                <input 
                                    type="text" 
                                    className="input py-4 text-left font-mono" 
                                    dir="ltr"
                                    value={data.cryptoWallet}
                                    onChange={e => setData({...data, cryptoWallet: e.target.value})}
                                    placeholder="T..."
                                />
                                <div className="p-4 bg-emerald-900/10 border border-emerald-500/10 rounded-xl">
                                    <p className="text-[10px] text-emerald-500 font-bold">⚠️ تنبيه أمني:</p>
                                    <p className="text-[10px] text-gray-500 mt-1">تأكد من صحة العنوان واختيار شبكة **TRC20** حصراً. المنصة غير مسؤولة عن التحويل لعناوين خاطئة.</p>
                                </div>
                            </div>
                        )}

                        {(activeMethod === PayoutMethods.SHAMCASH || activeMethod === PayoutMethods.SYRIATELCASH) && (
                            <div className="space-y-4">
                                <label className="text-sm font-bold text-gray-400 block">رقم محفظة {getPayoutMethodLabel(activeMethod)}</label>
                                <input 
                                    type="tel" 
                                    className="input py-4 text-left" 
                                    dir="ltr"
                                    value={activeMethod === PayoutMethods.SHAMCASH ? data.shamCashNumber : data.syriatelCashNumber}
                                    onChange={e => {
                                        const val = e.target.value;
                                        if (activeMethod === PayoutMethods.SHAMCASH) setData({...data, shamCashNumber: val});
                                        else setData({...data, syriatelCashNumber: val});
                                    }}
                                    placeholder="09..."
                                />
                                <p className="text-xs text-gray-500">سيتم تحويل الأرباح مباشرة إلى حسابك في {getPayoutMethodLabel(activeMethod)}.</p>
                            </div>
                        )}

                        <button 
                            onClick={() => handleSave(activeMethod)}
                            disabled={saving}
                            className="w-full md:w-auto px-12 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            <FiSave size={20} />
                            {saving ? 'جاري الحفظ...' : 'حفظ وتفعيل الطريقة'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
