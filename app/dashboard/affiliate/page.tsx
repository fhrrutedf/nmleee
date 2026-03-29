'use client';

import { useState, useEffect } from 'react';
import { 
    FiUsers, FiDollarSign, FiTrendingUp, FiCopy, FiCheck, 
    FiLink, FiLayers, FiShield, FiInfo, FiActivity, FiShare2
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { apiGet, handleApiError } from '@/lib/safe-fetch';
import { toast } from 'react-hot-toast';

export default function AffiliatePage() {
    const [stats, setStats] = useState<any>(null);
    const [affiliates, setAffiliates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [affiliateLink, setAffiliateLink] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchAffiliateData();
    }, []);

    const fetchAffiliateData = async () => {
        try {
            const data = await apiGet('/api/affiliate');
            setStats(data.stats);
            setAffiliates(data.affiliates);
            setAffiliateLink(data.affiliateLink);
        } catch (error) {
            console.error('Affiliate Fetch Error:', handleApiError(error));
        } finally {
            setLoading(false);
        }
    };

    const copyLink = () => {
        navigator.clipboard.writeText(affiliateLink);
        setCopied(true);
        toast.success('تم نسخ رابط شركاء النجاح! 🔥');
        setTimeout(() => setCopied(false), 3000);
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-xl h-12 w-12 border-t-2 border-primary-ink"></div>
        </div>
    );

    return (
        <div className="space-y-8 pb-32 max-w-7xl mx-auto px-4 md:px-0" dir="rtl">
            
            {/* --- HERO / LINK SECTION --- */}
            <div className="relative overflow-hidden bg-white dark:bg-card-white rounded-xl p-1 shadow-lg shadow-emerald-600/20 border border-slate-50 dark:border-gray-800">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-indigo-400/10 blur-[100px] rounded-xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="max-w-xl text-center md:text-right">
                        <span className="px-4 py-1.5 bg-subtle dark:bg-primary-indigo-900/40 text-primary-ink dark:text-primary-indigo-300 rounded-xl text-xs font-bold uppercase tracking-widest mb-6 inline-block">
                            برنامج شركاء النجاح 💎
                        </span>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white leading-[1.2] mb-4">اكسب عمولتك فوراً <br/> مع كل إحالة ناجحة!</h1>
                        <p className="text-slate-400 font-bold leading-relaxed mb-8">شارك رابطك الخاص واربح <span className="text-primary-ink">{stats?.commissionRate || 1}%</span> من إجمالي عمولة المنصة على أي منتج يتم شراؤه عبرك. الأرباح تصلك فورياً دون انتظار.</p>
                        
                        <div className="flex flex-col sm:flex-row items-stretch gap-4">
                             <div className="flex-1 h-16 bg-slate-50 dark:bg-gray-900 rounded-xl flex items-center px-6 border border-slate-100 dark:border-gray-800 relative group overflow-hidden">
                                <FiLink className="text-slate-400 shrink-0" size={20} />
                                <code className="text-sm font-bold text-slate-600 dark:text-slate-300 mr-4 truncate select-all">{affiliateLink}</code>
                             </div>
                             <button 
                                onClick={copyLink}
                                className={`px-10 h-16 rounded-xl font-bold text-sm flex items-center justify-center gap-3 transition-all ${copied ? 'bg-emerald-600-500 text-white shadow-blue-200' : 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 shadow-primary-indigo-100 hover:bg-primary-indigo-700 active:scale-95'}`}
                             >
                                {copied ? <FiCheck size={20} /> : <FiCopy size={20} />}
                                {copied ? 'تم النسخ' : 'نسخ الرابط'}
                             </button>
                        </div>
                    </div>
                    <div className="relative shrink-0 md:ml-12">
                        <div className="w-48 h-48 bg-emerald-600 rounded-xl rotate-12 flex items-center justify-center shadow-lg shadow-emerald-600/20 shadow-primary-indigo-400 -slow">
                             <FiShare2 size={80} className="text-white -rotate-12" />
                        </div>
                        <div className="absolute -bottom-4 -right-4 bg-white dark:bg-gray-900 p-4 rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-3 border border-slate-50 dark:border-gray-800 rotate-[-8deg] ">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-emerald-600-600"><FiTrendingUp size={20} /></div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">اربح حصتك</p>
                                <p className="text-sm font-bold text-emerald-600-600">نسبة {stats?.commissionRate || 1}%</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- STATS GRID --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                 {[
                    { label: 'إجمالي الأرباح', val: `${stats?.totalEarnings?.toFixed(2) || '0.00'} $`, icon: FiDollarSign, color: 'text-emerald-600-500', bg: 'bg-emerald-600-50 dark:bg-blue-900/10' },
                    { label: 'عدد الإحالات', val: stats?.totalReferrals || 0, icon: FiUsers, color: 'text-primary-ink', bg: 'bg-subtle dark:bg-primary-indigo-900/10' },
                    { label: 'معدل التحويل', val: `${stats?.conversionRate || 0}%`, icon: FiActivity, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/10' }
                 ].map((card, i) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        key={i} className="bg-white dark:bg-card-white p-8 rounded-xl border border-slate-50 dark:border-gray-800 shadow-lg shadow-emerald-600/20 flex flex-col items-center text-center group hover:border-primary-indigo-200 transition-colors"
                    >
                        <div className={`w-16 h-16 ${card.bg} rounded-xl flex items-center justify-center ${card.color} mb-6 transition-transform group-hover:scale-110`}>
                            <card.icon size={28} />
                        </div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{card.label}</h4>
                        <p className="text-3xl font-bold text-slate-900 dark:text-white leading-tight">{card.val}</p>
                    </motion.div>
                 ))}
            </div>

            {/* --- REFERRALS TABLE --- */}
            <div className="bg-white dark:bg-card-white rounded-xl border border-slate-50 dark:border-gray-800 shadow-lg shadow-emerald-600/20 overflow-hidden">
                <div className="p-8 border-b border-slate-50 dark:border-gray-800 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">سجل إحالاتك الناجحة 🏆</h3>
                        <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">تتبع أرباحك لحظة بلحظة</p>
                    </div>
                </div>
                
                {affiliates.length === 0 ? (
                    <div className="py-24 flex flex-col items-center text-center">
                        <div className="w-24 h-24 bg-slate-50 dark:bg-gray-900 rounded-xl flex items-center justify-center text-slate-300 mb-6"><FiUsers size={40} /></div>
                        <h4 className="text-xl font-bold text-slate-400">لا توجد مبيعات بعد</h4>
                        <p className="text-sm font-bold text-slate-300 max-w-xs mt-2 italic">ابدأ بمشاركة رابطك في المجموعات المهتمة واكسب أول عمولة لك اليوم!</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto overflow-visible">
                        <table className="w-full text-right border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-gray-900/50">
                                    <th className="py-5 px-8 text-xs font-bold text-slate-500 uppercase">التاريخ</th>
                                    <th className="py-5 px-8 text-xs font-bold text-slate-500 uppercase">المنتج المُباع</th>
                                    <th className="py-5 px-8 text-xs font-bold text-slate-500 uppercase">القيمة</th>
                                    <th className="py-5 px-8 text-xs font-bold text-slate-500 uppercase text-left">عمولتك $</th>
                                </tr>
                            </thead>
                            <tbody>
                                {affiliates.map((aff: any, i: number) => (
                                    <motion.tr 
                                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                                        key={aff.id} className="group hover:bg-slate-50/10 transition-colors border-b last:border-0 border-slate-50 dark:border-gray-800"
                                    >
                                        <td className="py-6 px-8 text-xs font-bold text-slate-400">{new Date(aff.createdAt).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}</td>
                                        <td className="py-6 px-8 font-bold text-slate-900 dark:text-white text-sm">{aff.productTitle}</td>
                                        <td className="py-6 px-8 text-sm font-bold text-slate-500">{aff.amount.toFixed(2)} $</td>
                                        <td className="py-6 px-8 text-left">
                                            <span className="inline-flex items-center h-10 px-6 rounded-xl bg-emerald-600-50 dark:bg-blue-900/20 text-emerald-600-600 font-bold text-sm">
                                                +{aff.commission.toFixed(2)} $
                                            </span>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* --- TIP SECTION --- */}
            <div className="bg-primary-indigo-900 text-white rounded-xl p-12 relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-96 h-96 bg-primary-indigo-800 rounded-xl blur-[120px] -translate-y-1/2 translate-x-1/2 opacity-40"></div>
                <div className="relative flex flex-col md:flex-row items-center gap-12">
                    <div className="w-20 h-20 bg-surface/10 rounded-xl flex items-center justify-center text-primary-indigo-300 shrink-0"><FiInfo size={40} /></div>
                    <div className="flex-1 text-center md:text-right">
                        <h4 className="text-xl font-bold mb-2 leading-tight">كيف تضاعف أرباحك؟ 💰</h4>
                        <p className="text-primary-indigo-200/60 font-bold text-sm leading-relaxed">السر في المحتوى التعليمي. قم بعمل فيديو شرح للمنتج أو الكورس الذي تروّج له على تيك توك أو يوتيوب وضع رابطك في البايو. الزوار الذين يثقون في شرحك هم الأكثر شراءً!</p>
                    </div>
                </div>
            </div>

        </div>
    );
}
