'use client';

import { useState, useEffect } from 'react';
import { FiSave, FiDollarSign, FiClock, FiGlobe, FiPhone, FiSettings, FiTrendingUp, FiShare2, FiZap, FiKey } from 'react-icons/fi';
import { FaWhatsapp, FaInstagram, FaFacebook, FaTwitter, FaYoutube } from 'react-icons/fa';
import showToast from '@/lib/toast';
import { apiGet, apiPut, apiPost, handleApiError } from '@/lib/safe-fetch';

interface PlatformSettings {
    commissionRate: number;
    growthCommissionRate: number;
    proCommissionRate: number;
    agencyCommissionRate: number;
    escrowDays: number;
    freeEscrowDays: number;
    growthEscrowDays: number;
    proEscrowDays: number;
    agencyEscrowDays: number;
    referralCommissionRate: number;
    minPayoutAmount: number;
    syriatelCash: string;
    shamCash: string;
    usdToSyp: number;
    usdToSypCrypto: number;
    platformName: string;
    supportEmail: string;
    supportWhatsapp: string;
    socialInstagram: string;
    socialFacebook: string;
    socialTwitter: string;
    socialYoutube: string;
    spaceremitEnabled: boolean;
    gatewayFee: number;
    withdrawalsEnabled: boolean;
    highValueAlertThreshold: number;
}

export default function AdminPlatformSettingsPage() {
    const [settings, setSettings] = useState<PlatformSettings>({
        commissionRate: 10,
        growthCommissionRate: 5,
        proCommissionRate: 2,
        agencyCommissionRate: 0,
        escrowDays: 7,
        freeEscrowDays: 14,
        growthEscrowDays: 7,
        proEscrowDays: 1,
        agencyEscrowDays: 1,
        referralCommissionRate: 1,
        minPayoutAmount: 50,
        syriatelCash: '',
        shamCash: '',
        usdToSyp: 15000,
        usdToSypCrypto: 16000,
        platformName: 'منصتك الرقمية',
        supportEmail: '',
        supportWhatsapp: '',
        socialInstagram: '',
        socialFacebook: '',
        socialTwitter: '',
        socialYoutube: '',
        spaceremitEnabled: false,
        gatewayFee: 2.5,
        withdrawalsEnabled: true,
        highValueAlertThreshold: 500,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [auditing, setAuditing] = useState(false);

    useEffect(() => {
        apiGet('/api/admin/settings')
            .then(data => {
                if (data) setSettings(s => ({ ...s, ...data }));
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const update = (key: keyof PlatformSettings, value: any) => {
        setSettings(s => ({ ...s, [key]: value }));
    };

    const handleAuditorCheck = async () => {
        setAuditing(true);
        try {
            const data = await apiGet('/api/cron/reconcile-payments');
            if (data.success) {
                showToast.success(`تم فحص ${data.stats.found} طلبات وتعويض ${data.stats.fulfilled} منها.`);
            }
        } catch (error) {
            showToast.error(handleApiError(error) || 'فشل اتصال الموظف الرقمي');
        } finally {
            setAuditing(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await apiPut('/api/admin/settings', settings);
            showToast.success('تم حفظ الإعدادات والربط بنجاح');
        } catch (error) {
            showToast.error(handleApiError(error) || 'خطأ غير متوقع');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-emerald-600/30 border-t-emerald-600 rounded-xl animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20 px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-[#0A0A0A] p-8 rounded-xl shadow-lg shadow-emerald-500/5 border border-white/5">
                <div className="flex items-center gap-5">
                    <div className="p-4 bg-emerald-900/20 rounded-xl text-emerald-500">
                        <FiSettings className="text-3xl" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">مركز القيادة والسيولة</h1>
                        <p className="text-gray-500 text-sm mt-1">المنصة تعمل بالبوابات المعتمدة (Syriatel, Sham, Crypto)</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleAuditorCheck}
                        disabled={auditing}
                        className="bg-emerald-900/10 text-emerald-500 px-6 py-4 rounded-xl font-bold text-sm flex items-center gap-3 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {auditing ? <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-xl animate-spin" /> : <FiZap />}
                        جرد المدفوعات
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-emerald-600 text-white font-bold px-8 py-4 rounded-xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                    >
                        {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-xl animate-spin" /> : <FiSave />}
                        حفظ الإعدادات
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-8">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className={`p-8 rounded-xl border transition-all ${settings.withdrawalsEnabled ? 'bg-[#0A0A0A] border-white/5' : 'bg-red-900/10 border-red-900/50'}`}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-white">تجميد السحب (Panic Button)</h3>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer" 
                                        checked={settings.withdrawalsEnabled}
                                        onChange={e => update('withdrawalsEnabled', e.target.checked)}
                                    />
                                    <div className="w-14 h-7 bg-gray-800 rounded-full peer peer-checked:bg-emerald-600 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:after:translate-x-full"></div>
                                </label>
                            </div>
                            <p className="text-xs text-gray-500">تعطيل طلبات السحب في حالات الطوارئ.</p>
                        </div>

                        <div className="bg-[#0A0A0A] p-8 rounded-xl border border-white/5">
                            <h3 className="font-bold text-white mb-4">تنبيه العمليات الكبيرة</h3>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 font-bold">$</span>
                                <input
                                    type="number"
                                    value={settings.highValueAlertThreshold}
                                    onChange={e => update('highValueAlertThreshold', parseFloat(e.target.value))}
                                    className="w-full bg-[#111111] border-none rounded-xl px-10 py-4 font-bold text-lg text-white focus:ring-2 focus:ring-emerald-500/20"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#0A0A0A] p-8 rounded-xl border border-white/5 space-y-8">
                        <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                            <div className="p-3 bg-emerald-900/20 rounded-xl text-emerald-500">
                                <FiDollarSign className="text-2xl" />
                            </div>
                            <h2 className="text-xl font-bold text-white">عمولات المنصة وباقات البائعين</h2>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <CommissionInput label="FREE %" value={settings.commissionRate} days={settings.freeEscrowDays} onRateChange={(v: number) => update('commissionRate', v)} onDaysChange={(v: number) => update('freeEscrowDays', v)} color="text-gray-500" />
                            <CommissionInput label="GROWTH %" value={settings.growthCommissionRate} days={settings.growthEscrowDays} onRateChange={(v: number) => update('growthCommissionRate', v)} onDaysChange={(v: number) => update('growthEscrowDays', v)} color="text-emerald-500" />
                            <CommissionInput label="PRO %" value={settings.proCommissionRate} days={settings.proEscrowDays} onRateChange={(v: number) => update('proCommissionRate', v)} onDaysChange={(v: number) => update('proEscrowDays', v)} color="text-emerald-400" />
                            <CommissionInput label="AGENCY %" value={settings.agencyCommissionRate} days={settings.agencyEscrowDays} onRateChange={(v: number) => update('agencyCommissionRate', v)} onDaysChange={(v: number) => update('agencyEscrowDays', v)} color="text-emerald-300" />
                        </div>
                    </div>

                    <div className="bg-[#0A0A0A] p-8 rounded-xl border border-white/5 space-y-8">
                        <div className="flex items-center justify-between border-b border-white/5 pb-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-emerald-900/20 rounded-xl text-emerald-500">
                                    <FiGlobe className="text-2xl" />
                                </div>
                                <h2 className="text-xl font-bold text-white">أسعار الصرف (1$ =)</h2>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 text-center">
                            <RateInput label="SYP آلي (سيريتل)" value={settings.usdToSyp} onChange={(v: number) => update('usdToSyp', v)} flag="🇸🇾" />
                            <RateInput label="SYP تتر (USDT)" value={settings.usdToSypCrypto} onChange={(v: number) => update('usdToSypCrypto', v)} flag="🪙" />
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-[#0A0A0A] p-8 rounded-xl border border-white/5 space-y-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <FiPhone className="text-emerald-500" /> محافظ الاستلام
                        </h3>
                        <div className="space-y-4">
                            <WalletInput label="رقم سيريتل كاش" value={settings.syriatelCash} onChange={(v: string) => update('syriatelCash', v)} />
                            <WalletInput label="رقم شام كاش" value={settings.shamCash} onChange={(v: string) => update('shamCash', v)} />
                        </div>
                    </div>

                    <div className="bg-[#0A0A0A] p-8 rounded-xl border border-white/5 space-y-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <FiShare2 className="text-emerald-500" /> التواصل الاجتماعي
                        </h3>
                        <div className="space-y-4">
                            <SocialInput icon={<FaInstagram />} label="Instagram" value={settings.socialInstagram} onChange={(v: string) => update('socialInstagram', v)} />
                            <SocialInput icon={<FaWhatsapp />} label="Support WhatsApp" value={settings.supportWhatsapp} onChange={(v: string) => update('supportWhatsapp', v)} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CommissionInput({ label, value, days, onRateChange, onDaysChange, color }: any) {
    return (
        <div className="bg-[#111111] p-6 rounded-xl border border-white/5 text-center">
            <p className={`text-[10px] font-bold uppercase tracking-widest mb-4 ${color}`}>{label}</p>
            <div className="space-y-4">
                <div className="relative">
                    <input type="number" step="0.5" value={value} onChange={e => onRateChange(parseFloat(e.target.value))} className="w-full bg-[#0A0A0A] border-none rounded-xl text-center font-bold text-lg py-2 focus:ring-2 focus:ring-emerald-500/20" />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-[10px]">%</span>
                </div>
                <div className="relative">
                    <input type="number" value={days} onChange={e => onDaysChange(parseInt(e.target.value))} className="w-full bg-[#0A0A0A] border-none rounded-xl text-center font-bold text-sm py-2 focus:ring-2 focus:ring-emerald-500/20" />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-[10px]">يوم</span>
                </div>
            </div>
        </div>
    );
}

function RateInput({ label, value, onChange, flag }: any) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{flag} {label}</label>
            <input type="number" step="0.01" value={value} onChange={e => onChange(parseFloat(e.target.value))} className="w-full bg-[#111111] border border-white/5 rounded-xl px-4 py-3 text-center font-bold text-white focus:border-emerald-500 outline-none transition-all" />
        </div>
    );
}

function WalletInput({ label, value, onChange }: any) {
    return (
        <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">{label}</label>
            <input type="text" value={value || ''} onChange={e => onChange(e.target.value)} className="w-full bg-[#111111] border border-white/5 rounded-xl px-4 py-3 font-bold text-white focus:border-emerald-500 outline-none transition-all" dir="ltr" />
        </div>
    );
}

function SocialInput({ icon, label, value, onChange }: any) {
    return (
        <div className="flex items-center gap-3">
            <div className="p-3 bg-[#111111] rounded-xl text-emerald-500">{icon}</div>
            <input type="text" value={value || ''} onChange={e => onChange(e.target.value)} placeholder={label} className="flex-1 bg-[#111111] border border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-emerald-500 outline-none transition-all" dir="ltr" />
        </div>
    );
}
