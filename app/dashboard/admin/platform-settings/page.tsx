'use client';

import { useState, useEffect } from 'react';
import { FiSave, FiDollarSign, FiClock, FiGlobe, FiPhone, FiSettings, FiTrendingUp, FiShare2, FiZap, FiKey } from 'react-icons/fi';
import { FaWhatsapp, FaTelegram, FaInstagram, FaFacebook, FaTwitter, FaYoutube } from 'react-icons/fa';
import showToast from '@/lib/toast';

interface PlatformSettings {
    commissionRate: number;
    growthCommissionRate: number;
    proCommissionRate: number;
    agencyCommissionRate: number; // Added
    escrowDays: number;
    freeEscrowDays: number;
    growthEscrowDays: number;
    proEscrowDays: number;
    agencyEscrowDays: number; // Added
    referralCommissionRate: number;
    minPayoutAmount: number;
    syriatelCash: string;
    mtnCash: string;
    zainCash: string;
    shamCash: string;
    omtNumber: string;
    whishNumber: string;
    usdToSyp: number;
    usdToIqd: number;
    usdToEgp: number;
    usdToAed: number;
    platformName: string;
    supportEmail: string;
    supportWhatsapp: string;
    socialTelegram: string;
    socialInstagram: string;
    socialFacebook: string;
    socialTwitter: string;
    socialYoutube: string;
    // Spaceremit Configuration
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
        mtnCash: '',
        zainCash: '',
        shamCash: '',
        omtNumber: '',
        whishNumber: '',
        usdToSyp: 15000,
        usdToIqd: 1500,
        usdToEgp: 50,
        usdToAed: 3.67,
        platformName: 'تمالين - Tmleen',
        supportEmail: '',
        supportWhatsapp: '',
        socialTelegram: '',
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
        fetch('/api/admin/settings')
            .then(r => r.json())
            .then(data => {
                setSettings(s => ({ ...s, ...data }));
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
            const res = await fetch('/api/cron/reconcile-payments');
            const data = await res.json();
            if (data.success) {
                showToast.success(`تم فحص ${data.stats.found} طلبات وتعويض ${data.stats.fulfilled} منها.`);
            }
        } catch {
            showToast.error('فشل اتصال الموظف الرقمي');
        } finally {
            setAuditing(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });
            if (res.ok) {
                showToast.success('تم حفظ الإعدادات والربط بنجاح');
            } else {
                showToast.error('فشل في حفظ البيانات');
            }
        } catch {
            showToast.error('خطأ غير متوقع');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-emerald-600-500/30 border-t-accent-500 rounded-xl animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20 px-4">
            {/* Header / Central Dashboard */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white dark:bg-gray-900 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-5">
                    <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-emerald-600-600">
                        <FiSettings className="text-3xl" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">مركز القيادة والسيولة</h1>
                        <p className="text-gray-500 text-sm mt-1">الموظف الرقمي نشط ويراقب البوابات المالية الآن</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleAuditorCheck}
                        disabled={auditing}
                        className="bg-indigo-50 dark:bg-indigo-900/20 text-ink px-6 py-4 rounded-xl font-bold text-sm flex items-center gap-3 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {auditing ? <div className="w-4 h-4 border-2 border-ink border-t-transparent rounded-xl animate-spin" /> : <FiZap />}
                        جرد المدفوعات (الموظف الرقمي)
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-emerald-600-600 hover:bg-ink text-white font-bold px-8 py-4 rounded-xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-sm shadow-accent-500/20 disabled:opacity-50"
                    >
                        {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-xl animate-spin" /> : <FiSave />}
                        تحديث الإمبراطورية
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Right Column: Key Financial Controls */}
                <div className="lg:col-span-8 space-y-8">
                    
                    {/* 1. Quick Financial Actions (Panic Button & High Value Alert) */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Panic Button */}
                        <div className={`p-8 rounded-xl border shadow-sm transition-all ${settings.withdrawalsEnabled ? 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/50'}`}>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-gray-900 dark:text-white">تجميد السيولة (Panic Button)</h3>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer" 
                                        checked={settings.withdrawalsEnabled}
                                        onChange={e => update('withdrawalsEnabled', e.target.checked)}
                                    />
                                    <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-xl peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-xl after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600-600"></div>
                                </label>
                            </div>
                            <p className="text-xs text-gray-500">عند التعطيل، يتم إيقاف جميع طلبات سحب الأرباح من البائعين فوراً.</p>
                        </div>

                        {/* High Value Alert Threshold */}
                        <div className="bg-white dark:bg-gray-900 p-8 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-4">حد التنبيه للعمليات الكبيرة</h3>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600-500 font-bold">$</span>
                                <input
                                    type="number"
                                    value={settings.highValueAlertThreshold}
                                    onChange={e => update('highValueAlertThreshold', parseFloat(e.target.value))}
                                    className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-10 py-4 font-bold text-lg text-emerald-600-600 focus:ring-2 focus:ring-accent-500/20 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 2. Spaceremit Integration & Gateway Fee */}
                    <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-8">
                        <div className="flex items-center justify-between border-b border-gray-50 dark:border-gray-800 pb-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-emerald-600-600">
                                    <FiZap className="text-2xl" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">بوابة Spaceremit ورسوم الموقع</h2>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-left">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">رسوم بوابة الدفع %</label>
                                    <input 
                                        type="number" 
                                        step="0.1"
                                        value={settings.gatewayFee}
                                        onChange={e => update('gatewayFee', parseFloat(e.target.value))}
                                        className="w-20 bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-2 py-2 font-bold text-ink text-center focus:ring-2 focus:ring-ink/20"
                                    />
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer" 
                                        checked={settings.spaceremitEnabled}
                                        onChange={e => update('spaceremitEnabled', e.target.checked)}
                                    />
                                    <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-xl peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-xl after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600-600"></div>
                                </label>
                            </div>
                        </div>

                        <div className="bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                            <p className="text-xs text-ink dark:text-indigo-400 font-medium leading-relaxed">
                                💡 يتم إدارة مفاتيح الربط (API Keys) و (Merchant ID) بشكل آمن عبر متغيرات البيئة في الاستضافة (Vercel Envs). 
                                يمكنك فقط تفعيل/تعطيل البوابة وتعديل الرسوم من هنا.
                            </p>
                        </div>
                    </div>

                    {/* 3. Commissions - 4 Tiers */}
                    <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-8">
                        <div className="flex items-center gap-4 border-b border-gray-50 dark:border-gray-800 pb-6">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-emerald-600-600">
                                <FiDollarSign className="text-2xl" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">باقات البائعين والعمولات</h2>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <CommissionInput label="FREE Tier %" value={settings.commissionRate} days={settings.freeEscrowDays} onRateChange={(v: number) => update('commissionRate', v)} onDaysChange={(v: number) => update('freeEscrowDays', v)} color="text-gray-400" />
                            <CommissionInput label="GROWTH Tier %" value={settings.growthCommissionRate} days={settings.growthEscrowDays} onRateChange={(v: number) => update('growthCommissionRate', v)} onDaysChange={(v: number) => update('growthEscrowDays', v)} color="text-ink" />
                            <CommissionInput label="PRO Tier %" value={settings.proCommissionRate} days={settings.proEscrowDays} onRateChange={(v: number) => update('proCommissionRate', v)} onDaysChange={(v: number) => update('proEscrowDays', v)} color="text-emerald-600-500" />
                            <CommissionInput label="AGENCY Tier %" value={settings.agencyCommissionRate} days={settings.agencyEscrowDays} onRateChange={(v: number) => update('agencyCommissionRate', v)} onDaysChange={(v: number) => update('agencyEscrowDays', v)} color="text-emerald-600-500" />
                        </div>
                    </div>

                    {/* 3. Exchange Rates */}
                    <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-8">
                        <div className="flex items-center justify-between gap-4 border-b border-gray-50 dark:border-gray-800 pb-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-ink">
                                    <FiGlobe className="text-2xl" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">أسعار الصرف المحلية ($1 =)</h2>
                            </div>
                            <button 
                                onClick={async () => {
                                    showToast.loading('جاري تحديث الأسعار...');
                                    const res = await fetch('/api/admin/rates/sync', { method: 'POST' });
                                    if (res.ok) {
                                        const d = await res.json();
                                        setSettings(s => ({ ...s, ...d.updatedRates }));
                                        showToast.success('تم تحديث العمولات بنجاح');
                                    }
                                }}
                                className="text-xs font-bold text-ink hover:text-ink flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-xl transition-all"
                            >
                                <FiTrendingUp /> مزامنة عالمية
                            </button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                            <RateInput label="SYP سوريا" value={settings.usdToSyp} onChange={(v: number) => update('usdToSyp', v)} flag="🇸🇾" />
                            <RateInput label="IQD العراق" value={settings.usdToIqd} onChange={(v: number) => update('usdToIqd', v)} flag="🇮🇶" />
                            <RateInput label="EGP مصر" value={settings.usdToEgp} onChange={(v: number) => update('usdToEgp', v)} flag="🇪🇬" />
                            <RateInput label="AED الإمارات" value={settings.usdToAed} onChange={(v: number) => update('usdToAed', v)} flag="🇦🇪" />
                        </div>
                    </div>
                </div>

                {/* Left Column: Wallets & Social */}
                <div className="lg:col-span-4 space-y-8">
                    
                    {/* Platform Wallets (Manual SY) */}
                    <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <FiPhone className="text-emerald-600-500" /> محافظ الدفع اليدوي
                        </h3>
                        <div className="space-y-4">
                            <WalletInput label="شام كاش" value={settings.shamCash} onChange={(v: string) => update('shamCash', v)} />
                            <WalletInput label="زين كاش" value={settings.zainCash} onChange={(v: string) => update('zainCash', v)} />
                            <WalletInput label="MTN كاش" value={settings.mtnCash} onChange={(v: string) => update('mtnCash', v)} />
                            <WalletInput label="OMT" value={settings.omtNumber} onChange={(v: string) => update('omtNumber', v)} />
                        </div>
                    </div>

                    {/* Social Media */}
                    <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <FiShare2 className="text-pink-500" /> التواصل الاجتماعي
                        </h3>
                        <div className="space-y-4">
                            <SocialInput icon={<FaTelegram />} label="Telegram" value={settings.socialTelegram} onChange={(v: string) => update('socialTelegram', v)} />
                            <SocialInput icon={<FaInstagram />} label="Instagram" value={settings.socialInstagram} onChange={(v: string) => update('socialInstagram', v)} />
                            <SocialInput icon={<FaWhatsapp />} label="Support WhatsApp" value={settings.supportWhatsapp} onChange={(v: string) => update('supportWhatsapp', v)} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper Components
interface CommissionInputProps {
    label: string;
    value: number;
    days: number;
    onRateChange: (v: number) => void;
    onDaysChange: (v: number) => void;
    color: string;
}

function CommissionInput({ label, value, days, onRateChange, onDaysChange, color }: CommissionInputProps) {
    return (
        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-100 dark:border-gray-800 text-center">
            <p className={`text-[10px] font-bold uppercase tracking-widest mb-4 ${color}`}>{label}</p>
            <div className="space-y-4">
                <div className="relative">
                    <input type="number" step="0.5" value={value} onChange={e => onRateChange(parseFloat(e.target.value))} className="w-full bg-white dark:bg-gray-800 border-none rounded-xl text-center font-bold text-lg py-2 focus:ring-2 focus:ring-accent-500/20" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">%</span>
                </div>
                <div className="relative">
                    <input type="number" value={days} onChange={e => onDaysChange(parseInt(e.target.value))} className="w-full bg-white dark:bg-gray-800 border-none rounded-xl text-center font-bold text-sm py-2 focus:ring-2 focus:ring-accent-500/20" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">يوم</span>
                </div>
            </div>
        </div>
    );
}

function RateInput({ label, value, onChange, flag }: { label: string; value: number; onChange: (v: number) => void; flag: string }) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{flag} {label}</label>
            <input type="number" step="0.01" value={value} onChange={e => onChange(parseFloat(e.target.value))} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl px-4 py-3 text-center font-bold text-gray-900 dark:text-white focus:border-emerald-600-500 outline-none transition-all" />
        </div>
    );
}

function WalletInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
    return (
        <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">{label}</label>
            <input type="text" value={value || ''} onChange={e => onChange(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl px-4 py-3 font-bold text-gray-700 dark:text-white focus:border-amber-500 outline-none transition-all" dir="ltr" />
        </div>
    );
}

function SocialInput({ icon, label, value, onChange }: { icon: any; label: string; value: string; onChange: (v: string) => void }) {
    return (
        <div className="flex items-center gap-3">
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-gray-400">{icon}</div>
            <input type="text" value={value || ''} onChange={e => onChange(e.target.value)} placeholder={label} className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 dark:text-white focus:border-pink-500 outline-none transition-all" dir="ltr" />
        </div>
    );
}
