'use client';

import { useState, useEffect } from 'react';
import { FiZap, FiMail, FiShoppingCart, FiClock, FiCheckCircle, FiEdit3, FiPercent, FiSave, FiAlertCircle } from 'react-icons/fi';
import { apiGet, apiPut, handleApiError } from '@/lib/safe-fetch';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function AutomationPage() {
    const [settings, setSettings] = useState<any>(null);
    const [carts, setCarts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [settingsData, cartsData] = await Promise.all([
                    apiGet('/api/seller/automation-settings'),
                    apiGet('/api/seller/abandoned-carts')
                ]);
                setSettings(settingsData);
                setCarts(cartsData || []);
            } catch (err) {
                handleApiError(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await apiPut('/api/seller/automation-settings', settings);
            toast.success('تم حفظ إعدادات الأتمتة بنجاح');
        } catch (err) {
            handleApiError(err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-xl h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white dark:text-white flex items-center gap-2">
                        <FiZap className="text-[#10B981]-500" />
                        مركز الأتمتة والنمو
                    </h1>
                    <p className="text-gray-500 dark:text-slate-400 mt-1">قم بزيادة مبيعاتك تلقائياً باستخدام "دروع تمالين" للنمو.</p>
                </div>
                <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50"
                >
                    <FiSave />
                    {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Automation Toggles */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Welcome Email */}
                    <section className="bg-[#0A0A0A] dark:bg-emerald-700/50 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-lg shadow-[#10B981]/20">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-sky-100 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 rounded-xl">
                                    <FiMail className="text-xl" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">رسالة الترحيب الآلية</h3>
                                    <p className="text-xs text-gray-500">تُرسل فوراً عند تسجيل أي طالب جديد في نظامك.</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer"
                                    checked={settings.welcomeEmailEnabled}
                                    onChange={(e) => setSettings({ ...settings, welcomeEmailEnabled: e.target.checked })}
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-xl peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#0A0A0A] after:border-gray-300 after:border after:rounded-xl after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                            </label>
                        </div>
                        {settings.welcomeEmailEnabled && (
                            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 opacity-70">عنوان الرسالة</label>
                                    <input 
                                        type="text" 
                                        value={settings.welcomeEmailSubject}
                                        onChange={(e) => setSettings({ ...settings, welcomeEmailSubject: e.target.value })}
                                        className="w-full bg-[#111111] dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        placeholder="مرحباً بك في أكاديميتي!"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5 opacity-70">محتوى الرسالة</label>
                                    <textarea 
                                        value={settings.welcomeEmailBody}
                                        onChange={(e) => setSettings({ ...settings, welcomeEmailBody: e.target.value })}
                                        rows={3}
                                        className="w-full bg-[#111111] dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        placeholder="شكراً لانضمامك إلينا..."
                                    />
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Abandoned Cart Engine */}
                    <section className="bg-[#0A0A0A] dark:bg-emerald-700/50 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-lg shadow-[#10B981]/20 overflow-hidden relative">
                        <div className="absolute top-4 left-4">
                             <div className="flex items-center gap-1.5 bg-blue-100 dark:bg-emerald-700/20 text-[#10B981] dark:text-amber-400 px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider">
                                <FiZap />
                                نظام ذكي
                             </div>
                        </div>

                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2.5 bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded-xl">
                                <FiShoppingCart className="text-xl" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">نظام استعادة السلال المفقودة</h3>
                                <p className="text-xs text-gray-500">تحويل الأشخاص الذين لم يكملوا الشراء إلى عملاء حقيقيين.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            {/* Reminder 1 */}
                            <div className={`p-4 rounded-xl border transition-all ${settings.cartReminder1Enabled ? 'border-primary bg-primary/5' : 'border-slate-100 dark:border-slate-800 opacity-60'}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-xs font-bold text-primary italic">#تذكير 1</span>
                                    <input 
                                        type="checkbox" 
                                        checked={settings.cartReminder1Enabled}
                                        onChange={(e) => setSettings({ ...settings, cartReminder1Enabled: e.target.checked })}
                                        className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                                    />
                                </div>
                                <h4 className="font-bold text-sm mb-1">بعد 60 دقيقة</h4>
                                <p className="text-[10px] opacity-60">تذكير لطيف بالمنتجات التي لم تصل ليد العميل.</p>
                            </div>

                            {/* Reminder 2 */}
                            <div className={`p-4 rounded-xl border transition-all ${settings.cartReminder2Enabled ? 'border-primary bg-primary/5' : 'border-slate-100 dark:border-slate-800 opacity-60'}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-xs font-bold text-primary italic">#تذكير 2</span>
                                    <input 
                                        type="checkbox" 
                                        checked={settings.cartReminder2Enabled}
                                        onChange={(e) => setSettings({ ...settings, cartReminder2Enabled: e.target.checked })}
                                        className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                                    />
                                </div>
                                <h4 className="font-bold text-sm mb-1">بعد 24 ساعة</h4>
                                <p className="text-[10px] opacity-60">تذكير بصور المنتجات وتاريخ الشراء الأصلي.</p>
                            </div>

                            {/* Reminder 3 (The Ultimate) */}
                            <div className={`p-4 rounded-xl border transition-all ${settings.cartReminder3Enabled ? 'border-emerald-600-500 bg-emerald-700-500/5' : 'border-slate-100 dark:border-slate-800 opacity-60'}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-xs font-bold text-[#10B981]-600 italic">#تذكير 3 (الأخير)</span>
                                    <input 
                                        type="checkbox" 
                                        checked={settings.cartReminder3Enabled}
                                        onChange={(e) => setSettings({ ...settings, cartReminder3Enabled: e.target.checked })}
                                        className="w-4 h-4 rounded border-slate-300 text-[#10B981]-500 focus:ring-accent-500"
                                    />
                                </div>
                                <h4 className="font-bold text-sm mb-1">بعد 3 أيام</h4>
                                <div className="flex items-center gap-2 mt-2">
                                     <FiPercent className="text-[#10B981]-500" />
                                     <span className="text-[10px] font-bold text-[#10B981]-600">خصم 10% تلقائي</span>
                                </div>
                            </div>
                        </div>

                        {settings.cartReminder3Enabled && (
                            <div className="bg-emerald-700-50 dark:bg-emerald-700-500/10 p-4 rounded-xl border border-blue-100 dark:border-emerald-600-500/20 flex items-start gap-3">
                                <FiAlertCircle className="text-[#10B981]-500 mt-1 shrink-0" />
                                <div>
                                    <h5 className="font-bold text-sm text-blue-700 dark:text-blue-400 mb-1">استراتيجية الخصم التلقائي مفعلة</h5>
                                    <p className="text-xs text-[#10B981]-600 dark:text-[#10B981]-500/80 leading-relaxed">
                                        سيقوم النظام تلقائياً بتوليد كود خصم بنسبة 10% (لمرة واحدة) لهذا العميل وإرساله في الرسالة الأخيرة لتحفيزه على إتمام الدفعة فوراً.
                                    </p>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Inactive User Recovery (Phase 7) */}
                    <section className="bg-[#0A0A0A] dark:bg-emerald-700/50 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-lg shadow-[#10B981]/20 overflow-hidden relative">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-blue-100 dark:bg-emerald-700-500/20 text-[#10B981]-600 dark:text-blue-400 rounded-xl">
                                    <FiZap className="text-xl" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">نظام استعادة العملاء الخاملين</h3>
                                    <p className="text-xs text-gray-500">ميزة ذكية لملاحقة العملاء الذين انقطعوا عن الشراء وإعادتهم لمتجرك.</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer"
                                    checked={settings.marketingEnabled}
                                    onChange={(e) => setSettings({ ...settings, marketingEnabled: e.target.checked })}
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-xl peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#0A0A0A] after:border-gray-300 after:border after:rounded-xl after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-700-600"></div>
                            </label>
                        </div>

                        {settings.marketingEnabled && (
                            <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-300">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5 opacity-70">مدة الخمول (بالأيام)</label>
                                        <div className="relative">
                                            <FiClock className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input 
                                                type="number" 
                                                value={settings.inactiveUserDays}
                                                onChange={(e) => setSettings({ ...settings, inactiveUserDays: parseInt(e.target.value) })}
                                                className="w-full bg-[#111111] dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl px-10 py-2.5 text-sm focus:ring-2 focus:ring-accent-500/20 outline-none transition-all"
                                                placeholder="30"
                                            />
                                        </div>
                                        <p className="text-[10px] text-gray-500 mt-1.5">سيتم إرسال الإيميل بعد مرور هذه المدة من آخر طلب ناجح.</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5 opacity-70">نسبة الخصم المحفزة (%)</label>
                                        <div className="relative">
                                            <FiPercent className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input 
                                                type="number" 
                                                value={settings.inactiveUserDiscount || ''}
                                                onChange={(e) => setSettings({ ...settings, inactiveUserDiscount: parseFloat(e.target.value) })}
                                                className="w-full bg-[#111111] dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl px-10 py-2.5 text-sm focus:ring-2 focus:ring-accent-500/20 outline-none transition-all"
                                                placeholder="10"
                                            />
                                        </div>
                                        <p className="text-[10px] text-gray-500 mt-1.5">سيقوم النظام بتوليد كود خصم تلقائي بهذه النسبة صالح لمدة 7 أيام.</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1.5 opacity-70">"رسالة الاشتياق" (محتوى الإيميل)</label>
                                    <textarea 
                                        value={settings.inactiveUserMessage || ''}
                                        onChange={(e) => setSettings({ ...settings, inactiveUserMessage: e.target.value })}
                                        rows={3}
                                        className="w-full bg-[#111111] dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-accent-500/20 outline-none transition-all"
                                        placeholder="مثلاً: مرحباً! لقد مر وقت طويل منذ آخر جلسة تعليمية لنا، تفضل هذا الخصم للعودة..."
                                    />
                                    <div className="mt-2 flex items-center gap-2 text-[10px] text-[#10B981]-600 font-medium">
                                        <FiEdit3 />
                                        <span>نصيحة: اجعل الرسالة شخصية وجذابة لزيادة معدل التحويل.</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>
                </div>

                {/* Live Activity Feed (Abandoned Carts) */}
                <div className="space-y-6">
                    <section className="bg-emerald-700 border border-slate-800 rounded-xl p-6 shadow-lg shadow-[#10B981]/20 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <FiClock className="text-orange-500" />
                                سلال مفقودة حالياً
                            </h3>
                            <span className="bg-slate-800 text-slate-400 text-[10px] px-2.5 py-1 rounded-xl">{carts.length}</span>
                        </div>

                        <div className="space-y-4 flex-1 overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-slate-700">
                            {carts.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center opacity-40">
                                    <FiShoppingCart className="text-4xl mb-3" />
                                    <p className="text-xs font-medium text-white">لا توجد سلال مهجورة حالياً</p>
                                </div>
                            ) : (
                                carts.map((cart: any) => (
                                    <div key={cart.id} className="bg-slate-800/50 border border-slate-700 p-3.5 rounded-xl hover:bg-emerald-700 transition-colors group">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-bold text-xs text-white truncate max-w-[140px]">{cart.customerEmail}</span>
                                            <span className="text-[10px] text-gray-500">{new Date(cart.createdAt).toLocaleDateString('ar-EG', { day: '2-digit', month: 'short' })}</span>
                                        </div>
                                        <p className="text-[10px] text-slate-400 mb-3 truncate leading-relaxed">🏷️ {cart.productNames.join(', ')}</p>
                                        <div className="flex items-center justify-between gap-2 border-t border-slate-700/50 pt-2.5 mt-2.5">
                                            <div className="flex items-center gap-1.5 bg-emerald-700 px-2 py-0.5 rounded-lg border border-slate-700">
                                                <span className="text-xs font-bold text-white">${cart.totalAmount.toFixed(2)}</span>
                                            </div>
                                            {cart.isConverted ? (
                                                <span className="flex items-center gap-1 text-[9px] font-bold text-blue-400">
                                                    <FiCheckCircle />
                                                    تمت استعادته
                                                </span>
                                            ) : (
                                                <div className="flex gap-1">
                                                    {[1,2,3].map(n => (
                                                        <div 
                                                            key={n} 
                                                            className={`w-2 h-2 rounded-xl ${(cart[`reminder${n}SentAt`]) ? 'bg-primary shadow-[0_0_8px_rgba(14,165,233,0.5)]' : 'bg-slate-700'}`}
                                                            title={cart[`reminder${n}SentAt`] ? `تم إرسال التذكير ${n}` : `لم يُرسل التذكير ${n} بعد`}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-800">
                             <div className="flex items-center gap-2 text-xs text-gray-500">
                                <FiAlertCircle />
                                <span>يتم تحديث هذه القائمة تلقائياً كل 15 دقيقة.</span>
                             </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
