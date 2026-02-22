'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    FiMail, FiShoppingCart, FiPackage, FiRefreshCw, FiBell,
    FiBarChart2, FiSend, FiBookOpen, FiSave, FiToggleLeft,
    FiToggleRight, FiClock, FiCheck, FiAlertCircle, FiEye
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import Link from 'next/link';

type AutomationSettings = {
    id?: string;
    welcomeEmailEnabled: boolean;
    welcomeEmailSubject: string;
    welcomeEmailBody: string;
    cartReminder1Enabled: boolean;
    cartReminder2Enabled: boolean;
    cartReminder3Enabled: boolean;
    cartReminder3Discount: number | null;
    cartReminder1Body: string;
    cartReminder2Body: string;
    cartReminder3Body: string;
    postPurchase7Enabled: boolean;
    postPurchase30Enabled: boolean;
    postPurchase7Body: string;
    postPurchase30Body: string;
    subRemindersEnabled: boolean;
    notifyOnSale: boolean;
    notifyOnReview: boolean;
    notifyOnQuestion: boolean;
    notifyOnCompletion: boolean;
    notifyOnRefund: boolean;
    notifyMethods: string;
    reportFrequency: string;
    reportEnabled: boolean;
    marketingEnabled: boolean;
    inactiveUserDays: number;
    inactiveUserDiscount: number | null;
    eduFollowupEnabled: boolean;
    inactivityDays: number;
};

const defaultSettings: AutomationSettings = {
    welcomeEmailEnabled: false, welcomeEmailSubject: 'مرحباً بك! 🎉', welcomeEmailBody: '',
    cartReminder1Enabled: false, cartReminder2Enabled: false, cartReminder3Enabled: false,
    cartReminder3Discount: null, cartReminder1Body: '', cartReminder2Body: '', cartReminder3Body: '',
    postPurchase7Enabled: false, postPurchase30Enabled: false, postPurchase7Body: '', postPurchase30Body: '',
    subRemindersEnabled: false,
    notifyOnSale: true, notifyOnReview: true, notifyOnQuestion: true, notifyOnCompletion: true, notifyOnRefund: true,
    notifyMethods: 'both',
    reportFrequency: 'weekly', reportEnabled: false,
    marketingEnabled: false, inactiveUserDays: 30, inactiveUserDiscount: null,
    eduFollowupEnabled: false, inactivityDays: 7,
};

const tabs = [
    { id: 'welcome', label: 'إيميل الترحيب', icon: FiMail },
    { id: 'cart', label: 'السلة المهجورة', icon: FiShoppingCart },
    { id: 'post_purchase', label: 'ما بعد الشراء', icon: FiPackage },
    { id: 'subscriptions', label: 'الاشتراكات', icon: FiRefreshCw },
    { id: 'notifications', label: 'إشعاراتي', icon: FiBell },
    { id: 'reports', label: 'التقارير', icon: FiBarChart2 },
    { id: 'marketing', label: 'التسويق', icon: FiSend },
    { id: 'education', label: 'التعليم', icon: FiBookOpen },
];

function Toggle({ enabled, onToggle, label }: { enabled: boolean; onToggle: () => void; label: string }) {
    return (
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
            <button onClick={onToggle} className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${enabled ? 'bg-action-blue' : 'bg-gray-300 dark:bg-gray-600'}`}>
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${enabled ? 'translate-x-8' : 'translate-x-1'}`} />
            </button>
        </div>
    );
}

function TextareaField({ label, value, onChange, placeholder, hint }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; hint?: string }) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</label>
            {hint && <p className="text-xs text-text-muted">{hint}</p>}
            <textarea
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-bg-light text-sm resize-none focus:outline-none focus:border-action-blue transition-colors"
            />
        </div>
    );
}

export default function AutomationPage() {
    const [activeTab, setActiveTab] = useState('welcome');
    const [settings, setSettings] = useState<AutomationSettings>(defaultSettings);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch('/api/automation/settings');
                if (res.ok) {
                    const data = await res.json();
                    setSettings({ ...defaultSettings, ...data });
                }
            } catch { /* use defaults */ } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const update = useCallback((key: keyof AutomationSettings, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    }, []);

    const save = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/automation/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });
            if (res.ok) {
                toast.success('تم حفظ إعدادات الأتمتة ✓');
            } else {
                toast.error('فشل الحفظ');
            }
        } catch {
            toast.error('خطأ في الاتصال');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-4 border-action-blue border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-primary-charcoal dark:text-white">🤖 مركز الأتمتة</h1>
                    <p className="text-text-muted mt-1">أتمتة التواصل مع عملائك وطلابك تلقائياً</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/dashboard/automation/logs" className="btn btn-outline flex items-center gap-2">
                        <FiEye /> سجل الإيميلات
                    </Link>
                    <button onClick={save} disabled={saving} className="btn btn-primary flex items-center gap-2">
                        {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FiSave />}
                        {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-800 pb-4">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.id
                                ? 'bg-action-blue text-white shadow-md'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                    >
                        <tab.icon className="text-base" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="bg-white dark:bg-card-white rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-6">

                {/* 1. Welcome Email */}
                {activeTab === 'welcome' && (
                    <div className="space-y-5">
                        <div>
                            <h2 className="text-xl font-bold text-primary-charcoal dark:text-white">📧 إيميل الترحيب التلقائي</h2>
                            <p className="text-sm text-text-muted mt-1">يُرسل تلقائياً لكل مشتري جديد عند إتمام أول عملية شراء منك</p>
                        </div>
                        <Toggle enabled={settings.welcomeEmailEnabled} onToggle={() => update('welcomeEmailEnabled', !settings.welcomeEmailEnabled)} label="تفعيل إيميل الترحيب" />
                        {settings.welcomeEmailEnabled && (
                            <>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">موضوع الإيميل</label>
                                    <input value={settings.welcomeEmailSubject} onChange={e => update('welcomeEmailSubject', e.target.value)} className="input w-full" placeholder="مرحباً بك! 🎉" />
                                </div>
                                <TextareaField label="نص الإيميل (اختياري)" value={settings.welcomeEmailBody} onChange={v => update('welcomeEmailBody', v)} placeholder="اكتب رسالة ترحيب مخصصة... أو اتركها فارغة للرسالة الافتراضية" hint="متغيرات: {{اسم العميل}} {{اسم المنتج}}" />
                            </>
                        )}
                    </div>
                )}

                {/* 2. Abandoned Cart */}
                {activeTab === 'cart' && (
                    <div className="space-y-5">
                        <div>
                            <h2 className="text-xl font-bold text-primary-charcoal dark:text-white">🛒 تذكيرات السلة المهجورة</h2>
                            <p className="text-sm text-text-muted mt-1">أرسل تذكيرات تلقائية للعملاء الذين لم يكملوا الشراء</p>
                        </div>
                        <div className="space-y-4">
                            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3">
                                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300"><FiClock className="text-action-blue" /> تذكير 1 — بعد ساعة</div>
                                <Toggle enabled={settings.cartReminder1Enabled} onToggle={() => update('cartReminder1Enabled', !settings.cartReminder1Enabled)} label="تفعيل التذكير الأول" />
                                {settings.cartReminder1Enabled && <TextareaField label="نص الرسالة (اختياري)" value={settings.cartReminder1Body} onChange={v => update('cartReminder1Body', v)} placeholder="اتركه فارغاً للنص الافتراضي الودي..." />}
                            </div>
                            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3">
                                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300"><FiClock className="text-orange-500" /> تذكير 2 — بعد 24 ساعة</div>
                                <Toggle enabled={settings.cartReminder2Enabled} onToggle={() => update('cartReminder2Enabled', !settings.cartReminder2Enabled)} label="تفعيل التذكير الثاني" />
                                {settings.cartReminder2Enabled && <TextareaField label="نص الرسالة (اختياري)" value={settings.cartReminder2Body} onChange={v => update('cartReminder2Body', v)} placeholder="إبراز قيمة المنتج..." />}
                            </div>
                            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3">
                                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300"><FiClock className="text-red-500" /> تذكير 3 — بعد 3 أيام (الأخير)</div>
                                <Toggle enabled={settings.cartReminder3Enabled} onToggle={() => update('cartReminder3Enabled', !settings.cartReminder3Enabled)} label="تفعيل التذكير الأخير" />
                                {settings.cartReminder3Enabled && (
                                    <>
                                        <TextareaField label="نص الرسالة (اختياري)" value={settings.cartReminder3Body} onChange={v => update('cartReminder3Body', v)} placeholder="عرض أخير..." />
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">نسبة الخصم (اختياري)</label>
                                            <div className="flex items-center gap-3">
                                                <input type="number" min={0} max={90} value={settings.cartReminder3Discount || ''} onChange={e => update('cartReminder3Discount', e.target.value ? Number(e.target.value) : null)} className="input w-32" placeholder="مثلاً: 10" />
                                                <span className="text-text-muted">%</span>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. Post-Purchase */}
                {activeTab === 'post_purchase' && (
                    <div className="space-y-5">
                        <div>
                            <h2 className="text-xl font-bold text-primary-charcoal dark:text-white">📦 إيميلات ما بعد الشراء</h2>
                            <p className="text-sm text-text-muted mt-1">تواصل مع عملائك بعد الشراء لبناء علاقة قوية</p>
                        </div>
                        <div className="space-y-4">
                            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3">
                                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300"><FiCheck className="text-green-500" /> طلب التقييم — بعد 7 أيام</div>
                                <Toggle enabled={settings.postPurchase7Enabled} onToggle={() => update('postPurchase7Enabled', !settings.postPurchase7Enabled)} label="تفعيل طلب التقييم" />
                                {settings.postPurchase7Enabled && <TextareaField label="نص الرسالة (اختياري)" value={settings.postPurchase7Body} onChange={v => update('postPurchase7Body', v)} placeholder="اتركه فارغاً للنص الافتراضي..." />}
                            </div>
                            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3">
                                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300"><FiSend className="text-purple-500" /> منتجات مقترحة (Upsell) — بعد 30 يوم</div>
                                <Toggle enabled={settings.postPurchase30Enabled} onToggle={() => update('postPurchase30Enabled', !settings.postPurchase30Enabled)} label="تفعيل الـ Upsell" />
                                {settings.postPurchase30Enabled && <TextareaField label="نص الرسالة (اختياري)" value={settings.postPurchase30Body} onChange={v => update('postPurchase30Body', v)} placeholder="اقتراح منتجات أخرى..." />}
                            </div>
                        </div>
                    </div>
                )}

                {/* 4. Subscriptions */}
                {activeTab === 'subscriptions' && (
                    <div className="space-y-5">
                        <div>
                            <h2 className="text-xl font-bold text-primary-charcoal dark:text-white">🔄 تذكيرات الاشتراكات</h2>
                            <p className="text-sm text-text-muted mt-1">أرسل تذكيرات لمشتركيك قبل انتهاء اشتراكاتهم</p>
                        </div>
                        <Toggle enabled={settings.subRemindersEnabled} onToggle={() => update('subRemindersEnabled', !settings.subRemindersEnabled)} label="تفعيل تذكيرات التجديد" />
                        {settings.subRemindersEnabled && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 space-y-2">
                                <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">سيتم إرسال تذكير تلقائياً:</p>
                                <ul className="text-sm text-blue-600 dark:text-blue-500 space-y-1 list-disc list-inside">
                                    <li>قبل أسبوع من انتهاء الاشتراك</li>
                                    <li>قبل يوم واحد من الانتهاء</li>
                                    <li>يوم الانتهاء نفسه</li>
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {/* 5. Notifications */}
                {activeTab === 'notifications' && (
                    <div className="space-y-5">
                        <div>
                            <h2 className="text-xl font-bold text-primary-charcoal dark:text-white">🔔 إشعاراتي الفورية</h2>
                            <p className="text-sm text-text-muted mt-1">اختر أي إشعارات تريد استقبالها وبأي طريقة</p>
                        </div>
                        <div className="space-y-3">
                            <Toggle enabled={settings.notifyOnSale} onToggle={() => update('notifyOnSale', !settings.notifyOnSale)} label="💰 عند عملية بيع جديدة" />
                            <Toggle enabled={settings.notifyOnReview} onToggle={() => update('notifyOnReview', !settings.notifyOnReview)} label="⭐ عند تقييم جديد" />
                            <Toggle enabled={settings.notifyOnQuestion} onToggle={() => update('notifyOnQuestion', !settings.notifyOnQuestion)} label="❓ عند سؤال جديد من طالب" />
                            <Toggle enabled={settings.notifyOnCompletion} onToggle={() => update('notifyOnCompletion', !settings.notifyOnCompletion)} label="🎓 عند إكمال طالب للكورس" />
                            <Toggle enabled={settings.notifyOnRefund} onToggle={() => update('notifyOnRefund', !settings.notifyOnRefund)} label="⚠️ عند طلب استرجاع مبالغ" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">طريقة الإشعار</label>
                            <div className="flex gap-3 flex-wrap">
                                {[
                                    { value: 'email', label: '📧 إيميل فقط' },
                                    { value: 'internal', label: '🔔 داخلي فقط' },
                                    { value: 'both', label: '✅ الاثنان' },
                                ].map(opt => (
                                    <button key={opt.value} onClick={() => update('notifyMethods', opt.value)}
                                        className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-colors ${settings.notifyMethods === opt.value ? 'border-action-blue bg-action-blue/10 text-action-blue' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}>
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* 6. Reports */}
                {activeTab === 'reports' && (
                    <div className="space-y-5">
                        <div>
                            <h2 className="text-xl font-bold text-primary-charcoal dark:text-white">📊 التقارير الدورية</h2>
                            <p className="text-sm text-text-muted mt-1">احصل على ملخص دوري بأداء متجرك</p>
                        </div>
                        <Toggle enabled={settings.reportEnabled} onToggle={() => update('reportEnabled', !settings.reportEnabled)} label="تفعيل التقارير الدورية" />
                        {settings.reportEnabled && (
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">تكرار التقرير</label>
                                <div className="flex gap-3 flex-wrap">
                                    {[
                                        { value: 'daily', label: '📅 يومي' },
                                        { value: 'weekly', label: '📅 أسبوعي' },
                                        { value: 'monthly', label: '📅 شهري' },
                                    ].map(opt => (
                                        <button key={opt.value} onClick={() => update('reportFrequency', opt.value)}
                                            className={`px-5 py-2 rounded-xl text-sm font-semibold border-2 transition-colors ${settings.reportFrequency === opt.value ? 'border-action-blue bg-action-blue/10 text-action-blue' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mt-3">
                                    <p className="text-sm text-green-700 dark:text-green-400 font-medium">📈 التقرير يشمل:</p>
                                    <ul className="text-xs text-green-600 dark:text-green-500 mt-2 space-y-1 list-disc list-inside">
                                        <li>عدد المبيعات والإيرادات</li>
                                        <li>العملاء الجدد وأكثر منتج مبيعاً</li>
                                        <li>عدد التقييمات الجديدة</li>
                                        <li>مقارنة مع الفترة السابقة</li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* 7. Marketing */}
                {activeTab === 'marketing' && (
                    <div className="space-y-5">
                        <div>
                            <h2 className="text-xl font-bold text-primary-charcoal dark:text-white">📣 أتمتة التسويق</h2>
                            <p className="text-sm text-text-muted mt-1">أرسل حملات تسويقية وأعد استهداف العملاء الخاملين</p>
                        </div>
                        <Toggle enabled={settings.marketingEnabled} onToggle={() => update('marketingEnabled', !settings.marketingEnabled)} label="إعادة استهداف العملاء الخاملين تلقائياً" />
                        {settings.marketingEnabled && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">اعتبر العميل خاملاً بعد</label>
                                    <div className="flex items-center gap-3">
                                        <input type="number" min={7} max={180} value={settings.inactiveUserDays} onChange={e => update('inactiveUserDays', Number(e.target.value))} className="input w-24" />
                                        <span className="text-text-muted text-sm">يوماً بدون شراء</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">خصم إعادة الاستهداف (اختياري)</label>
                                    <div className="flex items-center gap-3">
                                        <input type="number" min={0} max={90} value={settings.inactiveUserDiscount || ''} onChange={e => update('inactiveUserDiscount', e.target.value ? Number(e.target.value) : null)} className="input w-24" placeholder="0" />
                                        <span className="text-text-muted text-sm">%</span>
                                    </div>
                                </div>
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                    <Link href="/dashboard/automation/campaigns" className="btn btn-outline flex items-center gap-2 w-fit">
                                        <FiSend /> إنشاء حملة تسويقية مجدولة
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* 8. Education */}
                {activeTab === 'education' && (
                    <div className="space-y-5">
                        <div>
                            <h2 className="text-xl font-bold text-primary-charcoal dark:text-white">📚 المتابعة التعليمية</h2>
                            <p className="text-sm text-text-muted mt-1">شجّع طلابك على إكمال الكورسات بتذكيرات تلقائية</p>
                        </div>
                        <Toggle enabled={settings.eduFollowupEnabled} onToggle={() => update('eduFollowupEnabled', !settings.eduFollowupEnabled)} label="تفعيل التذكيرات التعليمية" />
                        {settings.eduFollowupEnabled && (
                            <>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">أرسل تذكيراً إذا لم يفتح الطالب الكورس منذ</label>
                                    <div className="flex items-center gap-3">
                                        <input type="number" min={1} max={30} value={settings.inactivityDays} onChange={e => update('inactivityDays', Number(e.target.value))} className="input w-24" />
                                        <span className="text-text-muted text-sm">أيام</span>
                                    </div>
                                </div>
                                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4 space-y-2">
                                    <p className="text-sm font-semibold text-purple-700 dark:text-purple-400">التذكيرات التلقائية تشمل:</p>
                                    <ul className="text-sm text-purple-600 dark:text-purple-500 space-y-1 list-disc list-inside">
                                        <li>تذكير للطالب الخامل مع شريط التقدم</li>
                                        <li>إيميل تهنئة عند إتمام الكورس مع رابط الشهادة</li>
                                        <li>اقتراح كورس تالٍ عند الإكمال</li>
                                    </ul>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
