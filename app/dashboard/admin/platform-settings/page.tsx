'use client';

import { useState, useEffect } from 'react';
import { FiSave, FiDollarSign, FiClock, FiGlobe, FiPhone, FiSettings, FiTrendingUp, FiShare2 } from 'react-icons/fi';
import { FaWhatsapp, FaTelegram, FaInstagram, FaFacebook, FaTwitter, FaYoutube } from 'react-icons/fa';
import showToast from '@/lib/toast';

interface PlatformSettings {
    commissionRate: number;
    growthCommissionRate: number;
    proCommissionRate: number;
    escrowDays: number;
    freeEscrowDays: number;
    growthEscrowDays: number;
    proEscrowDays: number;
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
}

export default function AdminPlatformSettingsPage() {
    const [settings, setSettings] = useState<PlatformSettings>({
        commissionRate: 10,
        growthCommissionRate: 5,
        proCommissionRate: 2,
        escrowDays: 7,
        freeEscrowDays: 14,
        growthEscrowDays: 7,
        proEscrowDays: 1,
        referralCommissionRate: 1,
        minPayoutAmount: 50,
        syriatelCash: '',
        mtnCash: '',
        zainCash: '',
        shamCash: '',
        omtNumber: '',
        whishNumber: '',
        usdToSyp: 13000,
        usdToIqd: 1300,
        usdToEgp: 50,
        usdToAed: 3.67,
        platformName: 'منصتي الرقمية',
        supportEmail: '',
        supportWhatsapp: '',
        socialTelegram: '',
        socialInstagram: '',
        socialFacebook: '',
        socialTwitter: '',
        socialYoutube: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

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

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });
            if (res.ok) {
                showToast.success('تم حفظ الإعدادات بنجاح');
            } else {
                showToast.error('فشل الحفظ');
            }
        } catch {
            showToast.error('حدث خطأ');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-action-blue/30 border-t-action-blue rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-primary-charcoal dark:text-white flex items-center gap-2">
                        <FiSettings className="text-action-blue" /> إعدادات المنصة
                    </h1>
                    <p className="text-text-muted text-sm mt-1">تحكم كامل في عمولات وإعدادات المنصة</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn btn-primary flex items-center gap-2 px-6 py-2.5"
                >
                    {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiSave />}
                    حفظ الإعدادات
                </button>
            </div>

            {/* Commission Settings */}
            <div className="card space-y-5">
                <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600">
                        <FiDollarSign className="text-xl" />
                    </div>
                    <div>
                        <h2 className="font-bold text-primary-charcoal dark:text-white">نظام العمولات المتدرج (Tiered)</h2>
                        <p className="text-xs text-text-muted">عمولة مختلفة حسب باقة البائع (FREE / GROWTH / PRO)</p>
                    </div>
                </div>

                {/* Tiered Commission Rates */}
                <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                        <label className="label">🆓 عمولة باقة FREE %</label>
                        <div className="relative">
                            <input
                                type="number"
                                min="0"
                                max="50"
                                step="0.5"
                                value={settings.commissionRate}
                                onChange={e => update('commissionRate', parseFloat(e.target.value))}
                                className="input w-full pl-8"
                            />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                        </div>
                    </div>
                    <div>
                        <label className="label">🚀 عمولة باقة GROWTH %</label>
                        <div className="relative">
                            <input
                                type="number"
                                min="0"
                                max="50"
                                step="0.5"
                                value={settings.growthCommissionRate}
                                onChange={e => update('growthCommissionRate', parseFloat(e.target.value))}
                                className="input w-full pl-8"
                            />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                        </div>
                    </div>
                    <div>
                        <label className="label">👑 عمولة باقة PRO %</label>
                        <div className="relative">
                            <input
                                type="number"
                                min="0"
                                max="50"
                                step="0.5"
                                value={settings.proCommissionRate}
                                onChange={e => update('proCommissionRate', parseFloat(e.target.value))}
                                className="input w-full pl-8"
                            />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                        </div>
                    </div>
                </div>

                {/* Escrow Days per Plan */}
                <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                        <label className="label">🆓 أيام حجز FREE</label>
                        <div className="relative">
                            <input
                                type="number"
                                min="0"
                                max="30"
                                value={settings.freeEscrowDays}
                                onChange={e => update('freeEscrowDays', parseInt(e.target.value))}
                                className="input w-full pl-12"
                            />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">يوم</span>
                        </div>
                    </div>
                    <div>
                        <label className="label">🚀 أيام حجز GROWTH</label>
                        <div className="relative">
                            <input
                                type="number"
                                min="0"
                                max="30"
                                value={settings.growthEscrowDays}
                                onChange={e => update('growthEscrowDays', parseInt(e.target.value))}
                                className="input w-full pl-12"
                            />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">يوم</span>
                        </div>
                    </div>
                    <div>
                        <label className="label">👑 أيام حجز PRO</label>
                        <div className="relative">
                            <input
                                type="number"
                                min="0"
                                max="30"
                                value={settings.proEscrowDays}
                                onChange={e => update('proEscrowDays', parseInt(e.target.value))}
                                className="input w-full pl-12"
                            />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">يوم</span>
                        </div>
                    </div>
                </div>

                {/* Referral + Min Payout */}
                <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                        <label className="label">🌳 عمولة شجرة الإحالات %</label>
                        <div className="relative">
                            <input
                                type="number"
                                min="0"
                                max="20"
                                step="0.1"
                                value={settings.referralCommissionRate}
                                onChange={e => update('referralCommissionRate', parseFloat(e.target.value))}
                                className="input w-full pl-8"
                            />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                        </div>
                        <p className="text-xs text-text-muted mt-1">نسبة من عمولة المنصة تذهب لـ"رأس الشجرة"</p>
                    </div>
                    <div>
                        <label className="label">الحد الأدنى للسحب $</label>
                        <div className="relative">
                            <input
                                type="number"
                                min="0"
                                value={settings.minPayoutAmount}
                                onChange={e => update('minPayoutAmount', parseFloat(e.target.value))}
                                className="input w-full pl-8"
                            />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                        </div>
                    </div>
                </div>

                {/* Live Preview - All 3 Tiers */}
                <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-xl p-4">
                    <p className="text-sm font-semibold text-green-700 dark:text-green-400 mb-3">معاينة تقسيم $100 حسب الباقة:</p>
                    <div className="grid sm:grid-cols-3 gap-3">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-sm">
                            <p className="font-bold text-gray-700 dark:text-gray-300 mb-1">🆓 FREE</p>
                            <p className="text-green-600">البائع: <strong>${(100 - settings.commissionRate).toFixed(0)}</strong></p>
                            <p className="text-action-blue">المنصة: <strong>${settings.commissionRate.toFixed(0)}</strong></p>
                            <p className="text-orange-500 text-xs">حجز: {settings.freeEscrowDays} يوم</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-sm">
                            <p className="font-bold text-emerald-600 mb-1">🚀 GROWTH</p>
                            <p className="text-green-600">البائع: <strong>${(100 - settings.growthCommissionRate).toFixed(0)}</strong></p>
                            <p className="text-action-blue">المنصة: <strong>${settings.growthCommissionRate.toFixed(0)}</strong></p>
                            <p className="text-orange-500 text-xs">حجز: {settings.growthEscrowDays} يوم</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-sm">
                            <p className="font-bold text-purple-600 mb-1">👑 PRO</p>
                            <p className="text-green-600">البائع: <strong>${(100 - settings.proCommissionRate).toFixed(0)}</strong></p>
                            <p className="text-action-blue">المنصة: <strong>${settings.proCommissionRate.toFixed(0)}</strong></p>
                            <p className="text-orange-500 text-xs">حجز: {settings.proEscrowDays} يوم</p>
                        </div>
                    </div>
                    {settings.referralCommissionRate > 0 && (
                        <p className="text-xs text-purple-600 mt-2 font-medium">🌳 من كل $100: عمولة الإحالة = ${((settings.commissionRate * settings.referralCommissionRate) / 100).toFixed(2)} (FREE)</p>
                    )}
                </div>
            </div>

            {/* Currency Rates */}
            <div className="card space-y-5">
                <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-action-blue">
                        <FiGlobe className="text-xl" />
                    </div>
                    <div>
                        <h2 className="font-bold text-primary-charcoal dark:text-white">أسعار صرف العملات</h2>
                        <p className="text-xs text-text-muted">1 دولار = كم وحدة من العملة المحلية</p>
                    </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                    {[
                        { key: 'usdToSyp', label: 'الليرة السورية SYP', flag: '🇸🇾' },
                        { key: 'usdToIqd', label: 'الدينار العراقي IQD', flag: '🇮🇶' },
                        { key: 'usdToEgp', label: 'الجنيه المصري EGP', flag: '🇪🇬' },
                        { key: 'usdToAed', label: 'الدرهم الإماراتي AED', flag: '🇦🇪' },
                    ].map(({ key, label, flag }) => (
                        <div key={key}>
                            <label className="label">{flag} {label}</label>
                            <div className="relative">
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">$1 =</span>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={(settings as any)[key]}
                                    onChange={e => update(key as any, parseFloat(e.target.value))}
                                    className="input w-full pr-16"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Platform Wallets */}
            <div className="card space-y-5">
                <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600">
                        <FiPhone className="text-xl" />
                    </div>
                    <div>
                        <h2 className="font-bold text-primary-charcoal dark:text-white">أرقام محافظ المنصة</h2>
                        <p className="text-xs text-text-muted">تُعرض تلقائياً للمشترين عند الدفع اليدوي</p>
                    </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                    {[
                        { key: 'syriatelCash', label: 'سيريتل كاش' },
                        { key: 'mtnCash', label: 'MTN كاش' },
                        { key: 'zainCash', label: 'زين كاش' },
                        { key: 'shamCash', label: 'شام كاش' },
                        { key: 'omtNumber', label: 'OMT' },
                        { key: 'whishNumber', label: 'Whish Money' },
                    ].map(({ key, label }) => (
                        <div key={key}>
                            <label className="label">{label}</label>
                            <input
                                type="text"
                                placeholder={`رقم ${label}`}
                                value={(settings as any)[key] || ''}
                                onChange={e => update(key as any, e.target.value)}
                                className="input w-full"
                                dir="ltr"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Platform Info */}
            <div className="card space-y-5">
                <h2 className="font-bold text-primary-charcoal dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">
                    معلومات المنصة
                </h2>
                <div className="grid sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-3">
                        <label className="label">اسم المنصة</label>
                        <input
                            type="text"
                            value={settings.platformName}
                            onChange={e => update('platformName', e.target.value)}
                            className="input w-full"
                        />
                    </div>
                    <div>
                        <label className="label">إيميل الدعم</label>
                        <input
                            type="email"
                            value={settings.supportEmail || ''}
                            onChange={e => update('supportEmail', e.target.value)}
                            className="input w-full"
                            dir="ltr"
                        />
                    </div>
                    <div>
                        <label className="label">واتساب الدعم</label>
                        <input
                            type="text"
                            value={settings.supportWhatsapp || ''}
                            onChange={e => update('supportWhatsapp', e.target.value)}
                            className="input w-full"
                            dir="ltr"
                            placeholder="+963..."
                        />
                    </div>
                </div>
            </div>

            {/* Social Media Links */}
            <div className="card space-y-5">
                <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
                    <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg text-pink-600">
                        <FiShare2 className="text-xl" />
                    </div>
                    <div>
                        <h2 className="font-bold text-primary-charcoal dark:text-white">وسائل التواصل الاجتماعي</h2>
                        <p className="text-xs text-text-muted">تُعرض للعملاء في صفحة الدفع والتواصل</p>
                    </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                    {[
                        { key: 'socialTelegram', label: 'تيليجرام', icon: <FaTelegram className="text-blue-500" />, placeholder: '@username أو رابط' },
                        { key: 'socialInstagram', label: 'انستجرام', icon: <FaInstagram className="text-pink-500" />, placeholder: '@username أو رابط' },
                        { key: 'socialFacebook', label: 'فيسبوك', icon: <FaFacebook className="text-blue-700" />, placeholder: 'رابط الصفحة' },
                        { key: 'socialTwitter', label: 'تويتر / X', icon: <FaTwitter className="text-sky-500" />, placeholder: '@username أو رابط' },
                        { key: 'socialYoutube', label: 'يوتيوب', icon: <FaYoutube className="text-red-600" />, placeholder: 'رابط القناة' },
                    ].map(({ key, label, icon, placeholder }) => (
                        <div key={key}>
                            <label className="label flex items-center gap-2">{icon} {label}</label>
                            <input
                                type="text"
                                placeholder={placeholder}
                                value={(settings as any)[key] || ''}
                                onChange={e => update(key as any, e.target.value)}
                                className="input w-full"
                                dir="ltr"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
