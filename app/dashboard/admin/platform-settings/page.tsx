'use client';

import { useState, useEffect } from 'react';
import { FiSave, FiDollarSign, FiClock, FiGlobe, FiPhone, FiSettings, FiTrendingUp } from 'react-icons/fi';
import showToast from '@/lib/toast';

interface PlatformSettings {
    commissionRate: number;
    escrowDays: number;
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
}

export default function AdminPlatformSettingsPage() {
    const [settings, setSettings] = useState<PlatformSettings>({
        commissionRate: 10,
        escrowDays: 7,
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
                        <h2 className="font-bold text-primary-charcoal dark:text-white">نظام العمولات والـ Escrow</h2>
                        <p className="text-xs text-text-muted">يُطبق تلقائياً على كل طلب</p>
                    </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                        <label className="label">نسبة عمولة المنصة %</label>
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
                        <p className="text-xs text-text-muted mt-1">
                            على كل $100: البائع يأخذ ${(100 - settings.commissionRate).toFixed(0)} والمنصة ${settings.commissionRate}
                        </p>
                    </div>

                    <div>
                        <label className="label">أيام الحجز (Escrow)</label>
                        <div className="relative">
                            <input
                                type="number"
                                min="0"
                                max="30"
                                value={settings.escrowDays}
                                onChange={e => update('escrowDays', parseInt(e.target.value))}
                                className="input w-full pl-12"
                            />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">يوم</span>
                        </div>
                        <p className="text-xs text-text-muted mt-1">المدة قبل نقل الأرباح للرصيد المتاح</p>
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

                {/* Live Preview */}
                <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-xl p-4">
                    <p className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2">معاينة تقسيم $100:</p>
                    <div className="flex gap-4 text-sm">
                        <span className="text-gray-600 dark:text-gray-300">البائع: <strong className="text-green-600">${(100 - settings.commissionRate).toFixed(2)}</strong></span>
                        <span className="text-gray-600 dark:text-gray-300">المنصة: <strong className="text-action-blue">${settings.commissionRate.toFixed(2)}</strong></span>
                        <span className="text-gray-600 dark:text-gray-300">يتاح بعد: <strong className="text-orange-500">{settings.escrowDays} أيام</strong></span>
                    </div>
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
        </div>
    );
}
