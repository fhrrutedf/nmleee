'use client';

import { useState, useEffect } from 'react';
import { 
    FiCreditCard, FiDollarSign, FiSmartphone, FiCheckCircle, 
    FiAlertCircle, FiSave, FiInfo, FiChevronDown, FiGlobe 
} from 'react-icons/fi';
import { apiGet, apiPut, handleApiError } from '@/lib/safe-fetch';
import toast from 'react-hot-toast';
import { PayoutMethods, getPayoutMethodLabel } from '@/lib/payout-utils';

export default function PayoutSettings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [data, setData] = useState({
        payoutMethod: '',
        bankName: '',
        accountNumber: '',
        accountName: '',
        paypalEmail: '',
        cryptoWallet: '',
        shamCashNumber: '',
        omtNumber: '',
        zainCashNumber: '',
        vodafoneCash: '',
        mtncashNumber: '',
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
                bankName: profile.bankName || '',
                accountNumber: profile.accountNumber || '',
                accountName: profile.accountName || '',
                paypalEmail: profile.paypalEmail || '',
                cryptoWallet: profile.cryptoWallet || '',
                shamCashNumber: profile.shamCashNumber || '',
                omtNumber: profile.omtNumber || '',
                zainCashNumber: profile.zainCashNumber || '',
                vodafoneCash: profile.vodafoneCash || '',
                mtncashNumber: profile.mtncashNumber || '',
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
        // Validation logic
        if (method === PayoutMethods.BANK && (!data.bankName || !data.accountNumber || !data.accountName)) {
            return toast.error('يرجى إكمال جميع بيانات الحساب البنكي');
        }
        if (method === PayoutMethods.PAYPAL && !data.paypalEmail) {
            return toast.error('يرجى إدخال بريد PayPal الإلكتروني');
        }
        if (method === PayoutMethods.CRYPTO && !data.cryptoWallet) {
            return toast.error('يرجى إدخال عنوان محفظة USDT');
        }
        if (method === PayoutMethods.VODAFONE && !data.vodafoneCash) {
            return toast.error('يرجى إدخال رقم محفظة فودافون كاش');
        }
        if (method === PayoutMethods.ZAINCASH && !data.zainCashNumber) {
            return toast.error('يرجى إدخال رقم محفظة زين كاش');
        }
        if (method === PayoutMethods.SHAMCASH && !data.shamCashNumber) {
            return toast.error('يرجى إدخال رقم محفظة شام كاش');
        }
        if (method === PayoutMethods.OMT && !data.omtNumber) {
            return toast.error('يرجى إدخال رقم الـ OMT');
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
        return <div className=" space-y-4">
            <div className="h-10 bg-gray-100 rounded-lg w-1/4"></div>
            <div className="h-64 bg-[#111111] rounded-xl"></div>
        </div>;
    }

    const methods = [
        { id: PayoutMethods.BANK, name: 'تحويل بنكي', icon: FiCreditCard, color: 'blue' },
        { id: PayoutMethods.PAYPAL, name: 'PayPal', icon: FiGlobe, color: 'indigo' },
        { id: PayoutMethods.CRYPTO, name: 'USDT (TRC20)', icon: FiDollarSign, color: 'emerald' },
        { id: PayoutMethods.VODAFONE, name: 'فودافون كاش', icon: FiSmartphone, color: 'red' },
        { id: PayoutMethods.ZAINCASH, name: 'زين كاش (العراق)', icon: FiSmartphone, color: 'orange' },
        { id: PayoutMethods.SHAMCASH, name: 'شام كاش (سيريا)', icon: FiSmartphone, color: 'purple' },
        { id: PayoutMethods.OMT, name: 'OMT (لبنان)', icon: FiSmartphone, color: 'blue' },
    ];

    return (
        <div className="space-y-8">
            <div className="bg-primary-50 border border-primary-100 p-4 rounded-xl flex items-start gap-3">
                <FiInfo className="text-primary-600 mt-1 shrink-0" />
                <p className="text-sm text-primary-800 leading-relaxed">
                    يُرجى اختيار وتفعيل طريقة سحب واحدة على الأقل لتتمكن من طلب سحب أرباحك. سيتم مراجعة البيانات بدقة قبل إرسال الأموال.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {methods.map((method) => {
                    const isActive = activeMethod === method.id;
                    return (
                        <button
                            key={method.id}
                            onClick={() => setActiveMethod(method.id)}
                            className={`p-4 rounded-xl border-2 transition-all flex items-center gap-4 text-right ${
                                isActive 
                                ? 'border-primary-500 bg-primary-50/50 shadow-md ring-2 ring-primary-500/20' 
                                : 'border-gray-100 hover:border-gray-200 bg-[#0A0A0A]'
                            }`}
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${
                                isActive ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-500'
                            }`}>
                                <method.icon />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-white">{method.name}</h3>
                                {isActive && <span className="text-xs text-primary-600 font-medium">نشط الآن</span>}
                            </div>
                            {isActive && <FiCheckCircle className="text-primary-500 text-xl" />}
                        </button>
                    );
                })}
            </div>

            {/* Method Details Form */}
            {activeMethod && (
                <div className="bg-[#0A0A0A] border border-gray-100 p-6 rounded-xl shadow-lg shadow-[#10B981]/20 ">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-primary-500 rounded-xl"></span>
                        بيانات {getPayoutMethodLabel(activeMethod)}
                    </h3>

                    <div className="space-y-6 max-w-2xl">
                        {activeMethod === PayoutMethods.BANK && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="label">اسم البنك</label>
                                    <input 
                                        type="text" 
                                        className="input" 
                                        value={data.bankName}
                                        onChange={e => setData({...data, bankName: e.target.value})}
                                        placeholder="مثال: البنك الأهلي"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="label">رقم الحساب أو IBAN</label>
                                    <input 
                                        type="text" 
                                        className="input text-left" 
                                        dir="ltr"
                                        value={data.accountNumber}
                                        onChange={e => setData({...data, accountNumber: e.target.value})}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="label">اسم صاحب الحساب بالكامل</label>
                                    <input 
                                        type="text" 
                                        className="input" 
                                        value={data.accountName}
                                        onChange={e => setData({...data, accountName: e.target.value})}
                                    />
                                </div>
                            </div>
                        )}

                        {activeMethod === PayoutMethods.PAYPAL && (
                            <div>
                                <label className="label">بريد PayPal الإلكتروني</label>
                                <input 
                                    type="email" 
                                    className="input text-left" 
                                    dir="ltr"
                                    value={data.paypalEmail}
                                    onChange={e => setData({...data, paypalEmail: e.target.value})}
                                    placeholder="your-name@gmail.com"
                                />
                                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                    <FiAlertCircle /> نرجوا التأكد من أن الحساب يستقبل المبالغ
                                </p>
                            </div>
                        )}

                        {activeMethod === PayoutMethods.CRYPTO && (
                            <div>
                                <label className="label">عنوان محفظة USDT (TRC20)</label>
                                <input 
                                    type="text" 
                                    className="input text-left" 
                                    dir="ltr"
                                    value={data.cryptoWallet}
                                    onChange={e => setData({...data, cryptoWallet: e.target.value})}
                                    placeholder="T..."
                                />
                                <p className="text-xs text-[#10B981]-600 mt-2">نرجوا التأكد من أن العنوان يدعم شبكة TRC20 لتجنب ضياع المبلغ.</p>
                            </div>
                        )}

                        {(activeMethod === PayoutMethods.VODAFONE || activeMethod === PayoutMethods.ZAINCASH || activeMethod === PayoutMethods.SHAMCASH || activeMethod === PayoutMethods.OMT) && (
                            <div>
                                <label className="label">رقم المحفظة / الهاتف</label>
                                <input 
                                    type="tel" 
                                    className="input text-left" 
                                    dir="ltr"
                                    value={
                                        activeMethod === PayoutMethods.VODAFONE ? data.vodafoneCash :
                                        activeMethod === PayoutMethods.ZAINCASH ? data.zainCashNumber :
                                        activeMethod === PayoutMethods.SHAMCASH ? data.shamCashNumber :
                                        data.omtNumber
                                    }
                                    onChange={e => {
                                        const val = e.target.value;
                                        if (activeMethod === PayoutMethods.VODAFONE) setData({...data, vodafoneCash: val});
                                        else if (activeMethod === PayoutMethods.ZAINCASH) setData({...data, zainCashNumber: val});
                                        else if (activeMethod === PayoutMethods.SHAMCASH) setData({...data, shamCashNumber: val});
                                        else setData({...data, omtNumber: val});
                                    }}
                                    placeholder="09..."
                                />
                                <p className="text-xs text-gray-500 mt-2">سيتم إرسال المبلغ كرصيد أو تحويل مباشر للرقم المذكور.</p>
                            </div>
                        )}

                        <button 
                            onClick={() => handleSave(activeMethod)}
                            disabled={saving}
                            className={`btn btn-primary w-full md:w-auto px-10 py-3 text-lg ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            <FiSave className="ml-2" />
                            {saving ? 'جاري الحفظ...' : 'حفظ وتفعيل كطريقة أساسية'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
