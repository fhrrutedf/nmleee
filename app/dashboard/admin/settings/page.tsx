'use client';

import { useState, useEffect } from 'react';
import { 
    FiSettings, FiPercent, FiClock, FiDollarSign, 
    FiCreditCard, FiSave, FiAlertCircle, FiCheckCircle,
    FiTrendingUp, FiLock, FiGlobe, FiShield
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('commissions');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/settings');
            const data = await res.json();
            setSettings(data);
        } catch (error) {
            toast.error('فشل في جلب الإعدادات');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const toastId = toast.loading('جاري حفظ التغييرات...');
        
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });

            if (!res.ok) throw new Error();
            
            toast.success('تم التحديث بنجاح!', { id: toastId });
        } catch (error) {
            toast.error('فشل في الحفظ، حاول مجدداً', { id: toastId });
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (field: string, value: any) => {
        setSettings({ ...settings, [field]: parseFloat(value) || value });
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-xl h-12 w-12 border-t-2 border-primary-ink"></div>
        </div>
    );

    const tabs = [
        { id: 'commissions', label: 'العمولات و الحزم', icon: FiPercent },
        { id: 'escrow', label: 'أمان الأموال (Escrow)', icon: FiClock },
        { id: 'currencies', label: 'أسعار الصرف', icon: FiGlobe },
        { id: 'payments', label: 'بوابات الدفع', icon: FiCreditCard },
    ];

    return (
        <div className="space-y-8 pb-32 max-w-7xl mx-auto px-4 sm:px-6" dir="rtl">
            
            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white dark:bg-card-white rounded-xl p-8 shadow-sm border border-slate-50 dark:border-gray-800 animate-in fade-in slide-in-from-top-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white leading-tight">إعدادات المنصة المركزية ⚙️</h1>
                    <p className="text-slate-400 font-bold text-xs mt-2 uppercase tracking-widest flex items-center gap-2">
                        <FiShield className="text-primary-ink" /> تحكم في العمولات • أيام الضمان • الربحية
                    </p>
                </div>
                <button 
                    onClick={handleUpdate}
                    disabled={saving}
                    className="px-10 py-4 bg-primary-ink text-white rounded-[1.5rem] font-bold text-sm flex items-center justify-center gap-2 shadow-sm shadow-primary-indigo-100 hover:bg-primary-indigo-700 active:scale-95 transition-all disabled:opacity-50"
                >
                    {saving ? <div className="animate-spin h-5 w-5 border-t-2 border-white rounded-xl"></div> : <FiSave size={18} />}
                    حفظ كافة التغييرات
                </button>
            </div>

            {/* --- TABS --- */}
            <div className="flex bg-slate-100 dark:bg-gray-900/50 p-2 rounded-[1.8rem] gap-2 overflow-x-auto no-scrollbar">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-8 py-3.5 rounded-[1.4rem] font-bold text-xs flex items-center gap-3 transition-all whitespace-nowrap shrink-0 ${activeTab === tab.id ? 'bg-white dark:bg-card-white text-primary-ink shadow-md' : 'text-slate-400 hover:bg-white/50'}`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="mt-8">
                <AnimatePresence mode="wait">
                    {activeTab === 'commissions' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white dark:bg-card-white p-8 rounded-xl border border-slate-50 shadow-sm space-y-6">
                                <h3 className="text-lg font-bold flex items-center gap-3 mb-6"><FiPercent className="text-primary-ink" /> نسب العمولات (%)</h3>
                                <div className="space-y-4">
                                    <label className="block">
                                        <span className="text-xs font-bold text-slate-500 uppercase mb-2 block">باقة البداية (FREE)</span>
                                        <input type="number" value={settings.commissionRate} onChange={(e) => handleChange('commissionRate', e.target.value)} className="w-full h-14 px-5 bg-slate-50 dark:bg-gray-900 border-none rounded-xl text-lg font-bold focus:ring-4 focus:ring-subtle" />
                                    </label>
                                    <label className="block">
                                        <span className="text-xs font-bold text-slate-500 uppercase mb-2 block">باقة النمو (GROWTH)</span>
                                        <input type="number" value={settings.growthCommissionRate} onChange={(e) => handleChange('growthCommissionRate', e.target.value)} className="w-full h-14 px-5 bg-slate-50 dark:bg-gray-900 border-none rounded-xl text-lg font-bold focus:ring-4 focus:ring-subtle" />
                                    </label>
                                    <label className="block">
                                        <span className="text-xs font-bold text-slate-500 uppercase mb-2 block">باقة المحترفين (PRO)</span>
                                        <input type="number" value={settings.proCommissionRate} onChange={(e) => handleChange('proCommissionRate', e.target.value)} className="w-full h-14 px-5 bg-slate-50 dark:bg-gray-900 border-none rounded-xl text-lg font-bold focus:ring-4 focus:ring-subtle" />
                                    </label>
                                    <div className="pt-6 border-t border-slate-100 dark:border-gray-800">
                                        <label className="block">
                                            <span className="text-xs font-bold text-primary-ink uppercase mb-2 block flex items-center gap-2">
                                                <FiTrendingUp size={14} /> نسبة عمولة المسوقين (من عمولة المنصة)
                                            </span>
                                            <input type="number" value={settings.referralCommissionRate || 1} onChange={(e) => handleChange('referralCommissionRate', e.target.value)} className="w-full h-14 px-5 bg-subtle/30 dark:bg-primary-indigo-900/10 border-dashed border-2 border-primary-indigo-100 dark:border-primary-indigo-900/30 rounded-xl text-lg font-bold text-primary-indigo-700" />
                                            <p className="text-[10px] text-slate-400 font-bold mt-2 italic px-2">ملاحظة: هذه النسبة تدفع للمسوق الذي جلب البائع من صافي عمولة المنصة.</p>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-slate-900 text-white p-8 rounded-xl shadow-sm relative overflow-hidden flex flex-col justify-center">
                                <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-xl blur-3xl"></div>
                                <h3 className="text-lg font-bold mb-4">نصيحة المنصة 💡</h3>
                                <p className="text-white/60 text-sm leading-relaxed font-bold">كلما قمت بتقليل عمولة المنصة للباقات الأعلى، زاد تحفيز البائعين على شحن باقاتهم الشهرية بانتظام. فكر في جعل باقة PRO بعمولة رمزية (مثل 2%) لجذب "كبار التجار".</p>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'escrow' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white dark:bg-card-white p-8 rounded-xl border border-slate-50 shadow-sm space-y-6">
                                <h3 className="text-lg font-bold flex items-center gap-3 mb-6"><FiClock className="text-orange-500" /> فترات حجز الأموال (أيام)</h3>
                                <div className="space-y-4">
                                    <label className="block">
                                        <span className="text-xs font-bold text-slate-500 uppercase mb-2 block">باقة FREE</span>
                                        <input type="number" value={settings.freeEscrowDays} onChange={(e) => handleChange('freeEscrowDays', e.target.value)} className="w-full h-14 px-5 bg-slate-50 dark:bg-gray-900 border-none rounded-xl text-lg font-bold" />
                                    </label>
                                    <label className="block">
                                        <span className="text-xs font-bold text-slate-500 uppercase mb-2 block">باقة GROWTH</span>
                                        <input type="number" value={settings.growthEscrowDays} onChange={(e) => handleChange('growthEscrowDays', e.target.value)} className="w-full h-14 px-5 bg-slate-50 dark:bg-gray-900 border-none rounded-xl text-lg font-bold" />
                                    </label>
                                    <label className="block">
                                        <span className="text-xs font-bold text-slate-500 uppercase mb-2 block">باقة PRO</span>
                                        <input type="number" value={settings.proEscrowDays} onChange={(e) => handleChange('proEscrowDays', e.target.value)} className="w-full h-14 px-5 bg-slate-50 dark:bg-gray-900 border-none rounded-xl text-lg font-bold" />
                                    </label>
                                </div>
                            </div>
                            <div className="bg-orange-50 dark:bg-orange-900/10 p-8 rounded-xl border border-orange-100 flex flex-col justify-center">
                                <h3 className="text-lg font-bold text-orange-600 mb-4">ما هو الـ Escrow؟ ⏳</h3>
                                <p className="text-orange-900/60 text-sm leading-relaxed font-bold">هو عدد الأيام التي تبقى فيها أموال الطلب "معلقة" قبل أن تظهر في رصيد البائع المتاح للسحب. تستخدم هذه الفترة لحماية المشتري من الاحتيال (فترة الضمان).</p>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'currencies' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white dark:bg-card-white p-8 rounded-xl border border-slate-50 shadow-sm max-w-2xl">
                             <h3 className="text-lg font-bold flex items-center gap-3 mb-8"><FiGlobe className="text-accent-500" /> أسعار الصرف (مقابل 1 دولار $)</h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <label className="block">
                                    <span className="text-xs font-bold text-slate-500 mb-2 block">سعر الليرة السورية (SYP)</span>
                                    <input type="number" value={settings.usdToSyp || 15000} onChange={(e) => handleChange('usdToSyp', e.target.value)} className="w-full h-14 px-5 bg-slate-50 dark:bg-gray-900 border-none rounded-xl text-lg font-bold" />
                                </label>
                                <label className="block">
                                    <span className="text-xs font-bold text-slate-500 mb-2 block">سعر الدينار العراقي (IQD)</span>
                                    <input type="number" value={settings.usdToIqd || 1310} onChange={(e) => handleChange('usdToIqd', e.target.value)} className="w-full h-14 px-5 bg-slate-50 dark:bg-gray-900 border-none rounded-xl text-lg font-bold" />
                                </label>
                                <label className="block">
                                    <span className="text-xs font-bold text-slate-500 mb-2 block">سعر الجنيه المصري (EGP)</span>
                                    <input type="number" value={settings.usdToEgp || 48} onChange={(e) => handleChange('usdToEgp', e.target.value)} className="w-full h-14 px-5 bg-slate-50 dark:bg-gray-900 border-none rounded-xl text-lg font-bold" />
                                </label>
                             </div>
                        </motion.div>
                    )}

                    {activeTab === 'payments' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white dark:bg-card-white p-8 rounded-xl border border-slate-50 shadow-sm">
                             <h3 className="text-lg font-bold flex items-center gap-3 mb-8"><FiCreditCard className="text-primary-ink" /> أرقام استلام المدفوعات (رسمي)</h3>
                             <div className="space-y-6 max-w-md">
                                <label className="block">
                                    <span className="text-xs font-bold text-slate-500 mb-2 block">شام كاش (ID الحساب)</span>
                                    <input type="text" placeholder="123456" className="w-full h-14 px-5 bg-slate-50 dark:bg-gray-900 border-none rounded-xl font-bold" />
                                </label>
                                <label className="block">
                                    <span className="text-xs font-bold text-slate-500 mb-2 block">سيريتيل كاش (رقم مباشر)</span>
                                    <input type="text" placeholder="09xxxxxx" className="w-full h-14 px-5 bg-slate-50 dark:bg-gray-900 border-none rounded-xl font-bold" />
                                </label>
                                <label className="block">
                                    <span className="text-xs font-bold text-slate-500 mb-2 block">رقم واتساب الدعم الفني</span>
                                    <input type="text" value={settings.supportWhatsapp || '963934360340'} onChange={(e) => handleChange('supportWhatsapp', e.target.value)} className="w-full h-14 px-5 bg-slate-50 dark:bg-gray-900 border-none rounded-xl font-bold" />
                                </label>
                             </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="bg-accent-50 dark:bg-blue-900/10 p-6 rounded-xl border border-blue-100 flex items-center gap-4">
                <FiCheckCircle className="text-accent-500 shrink-0" size={24} />
                <p className="text-blue-900/60 text-xs font-bold leading-relaxed">أي تغييرات هنا ستؤثر فوراً على كافة مبيعات البائعين الجدد. تذكر أن العمولات تحسب عند لحظة إنشاء الطلب وليس عند السحب.</p>
            </div>

        </div>
    );
}
