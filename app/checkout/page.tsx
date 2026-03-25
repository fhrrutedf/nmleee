'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiGlobe, FiShield, FiAlertTriangle, FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import showToast from '@/lib/toast';
import {
    getPaymentMethodsForCountry,
    convertCurrency,
    type PaymentMethod,
} from '@/config/paymentMethods';
import { getCookie } from '@/lib/marketing';

// Components
import OrderSummary from '@/components/checkout/OrderSummary';
import ManualPaymentCard from '@/components/checkout/ManualPaymentCard';

export default function CheckoutPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isDirect = searchParams.get('direct') === 'true';

    // State
    const [cart, setCart] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    
    // User Info
    const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
    const [customerCountry, setCustomerCountry] = useState('');
    const [isSyria, setIsSyria] = useState(false);
    
    // Selection Logic
    const [paymentMethod, setPaymentMethod] = useState<'crypto' | 'manual'>('crypto');
    const [selectedLocalMethod, setSelectedLocalMethod] = useState<PaymentMethod | null>(null);
    const [agreeToTerms, setAgreeToTerms] = useState(false);
    
    // Manual/Syria Data
    const [manualData, setManualData] = useState({
        senderPhone: '',
        transactionRef: '',
        proofFile: null as File | null,
        notes: ''
    });

    // Subtotals
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState(0);

    // Load Cart
    useEffect(() => {
        const items = isDirect 
            ? JSON.parse(sessionStorage.getItem('direct_checkout_items') || '[]')
            : JSON.parse(localStorage.getItem('cart') || '[]');
        if (!items || items.length === 0) router.push('/market');
        setCart(items);
    }, [isDirect, router]);

    // Geo-Detect (Nawaf requested auto-detection for Syria)
    useEffect(() => {
        fetch('/api/geo')
            .then(r => r.ok ? r.json() : { country: 'DEFAULT' })
            .then(d => {
                const code = d.country || 'DEFAULT';
                setCustomerCountry(code);
                if (code === 'SY') {
                    setIsSyria(true);
                    setPaymentMethod('manual');
                } else {
                    setIsSyria(false);
                    setPaymentMethod('crypto');
                }
            }).catch(() => { setCustomerCountry('DEFAULT'); setPaymentMethod('crypto'); });
    }, []);

    const handleCheckout = async () => {
        if (!formData.name || !formData.email) return showToast.error('يرجى ملء الاسم والبريد');
        if (!agreeToTerms) return showToast.error('يرجى الموافقة على الشروط');

        setLoading(true);
        try {
            const affRef = getCookie('aff_code') || sessionStorage.getItem('affiliate_ref');
            
            if (paymentMethod === 'crypto') {
                // Automated Coinremitter Logic
                const res = await fetch('/api/coinremitter/checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        items: cart,
                        customerInfo: formData,
                        affiliateRef: affRef,
                        discount
                    })
                });
                if (res.ok) {
                    const data = await res.json();
                    window.location.href = data.url;
                } else showToast.error('فشل بدء عملية دفع الكريبتو');

            } else if (paymentMethod === 'manual' && isSyria) {
                if (!selectedLocalMethod || !manualData.transactionRef || !manualData.proofFile) {
                    return showToast.error('يرجى اختيار وسيلة وإدخال رقم المرجع وصورة الإيصال');
                }
                
                // Upload Proof
                const fd = new FormData();
                fd.append('file', manualData.proofFile);
                fd.append('type', 'image');
                const upRes = await fetch('/api/upload', { method: 'POST', body: fd });
                if (!upRes.ok) throw new Error('فشل رفع الإيصال');
                const upD = await upRes.json();

                // Create Order (Pending Admin Approval)
                const res = await fetch('/api/orders/manual', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        items: cart,
                        customerName: formData.name,
                        customerEmail: formData.email,
                        customerPhone: formData.phone,
                        country: 'SY',
                        paymentProvider: selectedLocalMethod.id,
                        transactionRef: manualData.transactionRef,
                        paymentProof: upD.url,
                        paymentNotes: manualData.notes,
                        affiliateRef: affRef,
                    })
                });
                if (res.ok) {
                    const d = await res.json();
                    if (!isDirect) localStorage.removeItem('cart');
                    router.push(`/success?order_id=${d.orderId}&manual=true`);
                } else showToast.error('فشل إرسال الطلب اليدوي');
            }
        } catch (err) {
            console.error(err);
            showToast.error('حدث خطأ أثناء المعالجة');
        } finally {
            setLoading(false);
        }
    };

    const subtotal = cart.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
    const total = subtotal - discount;
    const countryMethods = getPaymentMethodsForCountry(isSyria ? 'SY' : 'DEFAULT');
    const localPrice = isSyria ? convertCurrency(total, 'SY') : { amount: total, currency: 'USD' };

    return (
        <div className="min-h-screen bg-[#0a0f1e] text-slate-100 py-12 md:py-24 font-sans selection:bg-emerald-500/30">
            {/* Background Accents */}
            <div className="fixed inset-0 pointer-events-none opacity-20">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-600 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-600 rounded-full blur-[100px]"></div>
            </div>

            <div className="max-w-6xl mx-auto px-6 relative z-10">
                
                {/* Simplified Header */}
                <div className="mb-16 text-center">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full text-emerald-400 text-xs font-black uppercase tracking-[0.2em] mb-6"
                    >
                        <FiShield /> نظام دفع مشفر وآمن
                    </motion.div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white tracking-tight">إتمام الشراء</h1>
                    <p className="text-slate-400 mt-4 max-w-lg mx-auto font-medium">خطوة واحدة تفصلك عن المحتوى الرقمي المتميز. تفعيل فوري ومضمون.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    
                    {/* Main Form Area */}
                    <div className="lg:col-span-7 space-y-10">
                        
                        {/* 1. Customer Info */}
                        <div className="bg-[#111827]/60 backdrop-blur-3xl border border-white/5 p-8 rounded-[2.5rem] shadow-2xl">
                            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                                <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
                                البيانات الشخصية
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 px-1">الاسم الكامل *</label>
                                    <input 
                                        type="text" 
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:bg-white/[0.08] focus:border-emerald-500 outline-none transition-all font-bold text-white"
                                        placeholder="الاسم الثلاثي..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 px-1">البريد الإلكتروني *</label>
                                    <input 
                                        type="email" 
                                        dir="ltr"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:bg-white/[0.08] focus:border-emerald-500 outline-none transition-all font-bold text-white text-left"
                                        placeholder="email@example.com"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 2. Payment Strategy Selection */}
                        <div className="bg-[#111827]/60 backdrop-blur-3xl border border-white/5 p-8 rounded-[2.5rem] shadow-2xl">
                            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                                <span className="w-1.5 h-6 bg-amber-500 rounded-full"></span>
                                اختيار طريقة الدفع
                            </h3>

                            <div className="flex gap-4 mb-10 overflow-x-auto pb-4 custom-scrollbar">
                                {/* Crypto is available to Everyone */}
                                <PaymentMethodTab 
                                    id="crypto" 
                                    current={paymentMethod} 
                                    onClick={() => setPaymentMethod('crypto')}
                                    icon="🪙"
                                    label="عملات رقمية"
                                    desc="USDT (TRC20)"
                                />

                                {/* Manual is ONLY for Syria as requested */}
                                {isSyria && (
                                    <PaymentMethodTab 
                                        id="manual" 
                                        current={paymentMethod} 
                                        onClick={() => setPaymentMethod('manual')}
                                        icon="🇸🇾"
                                        label="دفع محلي"
                                        desc="تحويل يدوي"
                                    />
                                )}
                            </div>

                            {/* Payment Method Content */}
                            <AnimatePresence mode="wait">
                                {paymentMethod === 'crypto' && (
                                    <motion.div 
                                        key="crypto-box"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.98 }}
                                        className="p-8 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10 text-center space-y-6"
                                    >
                                        <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-[2rem] flex items-center justify-center mx-auto text-4xl">🪙</div>
                                        <div>
                                            <h4 className="text-xl font-black text-white">دفع آمن بالـ USDT</h4>
                                            <p className="text-sm text-slate-400 mt-2 leading-relaxed">سيتم توجيهك إلى بوابة Coinremitter لإتمام الدفع. تفعيل فوري بمجرد تأكيد المعاملة.</p>
                                        </div>
                                        <div className="pt-4 flex flex-wrap justify-center gap-4">
                                            <span className="bg-emerald-500/10 px-4 py-2 rounded-xl text-xs font-bold text-emerald-400">تشفير AES-256</span>
                                            <span className="bg-emerald-500/10 px-4 py-2 rounded-xl text-xs font-bold text-emerald-400">أقل رسوم غاز</span>
                                        </div>
                                    </motion.div>
                                )}

                                {paymentMethod === 'manual' && (
                                    <motion.div 
                                        key="manual-box"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.98 }}
                                    >
                                        {!selectedLocalMethod ? (
                                            <div className="space-y-3">
                                                {countryMethods.methods.map(m => (
                                                    <button 
                                                        key={m.id}
                                                        onClick={() => setSelectedLocalMethod(m)}
                                                        className="w-full group bg-white/5 hover:bg-white/[0.08] hover:border-amber-500/50 border border-white/5 p-6 rounded-[1.5rem] flex items-center justify-between transition-all"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <span className="text-3xl grayscale group-hover:grayscale-0 transition-all">{m.icon}</span>
                                                            <div className="text-right">
                                                                <h5 className="font-bold text-white mb-0.5">{m.nameAr}</h5>
                                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{m.id.replace('cash', '')}</p>
                                                            </div>
                                                        </div>
                                                        <FiArrowRight className="text-slate-600 group-hover:text-amber-500 transition-colors" />
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <ManualPaymentCard 
                                                method={selectedLocalMethod}
                                                walletAddress={selectedLocalMethod.id === 'shamcash' ? '09xxxxx' : '09yyyyy'} // In prod, fetch from plat settings
                                                localPrice={localPrice}
                                                usdTotal={total}
                                                onDataChange={setManualData}
                                                onBack={() => setSelectedLocalMethod(null)}
                                                theme="dark"
                                            />
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Agreement */}
                        <div className="flex items-center gap-3 px-8">
                            <input 
                                type="checkbox" 
                                id="terms_agree" 
                                checked={agreeToTerms}
                                onChange={e => setAgreeToTerms(e.target.checked)}
                                className="w-5 h-5 rounded-lg border-white/10 bg-white/5 text-emerald-500 focus:ring-emerald-500/20 cursor-pointer"
                            />
                            <label htmlFor="terms_agree" className="text-sm text-slate-500 font-medium cursor-pointer">
                                أوافق على شروط الموقع وسياسة الخصوصية
                            </label>
                        </div>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="lg:col-span-5 relative">
                        {/* Summary for Dark Theme */}
                        <div className="bg-[#111827]/80 backdrop-blur-3xl border border-white/5 p-8 rounded-[2.5rem] shadow-3xl sticky top-24 space-y-8">
                            <h3 className="text-2xl font-black text-white">ملخص الطلب</h3>
                            
                            <div className="space-y-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {cart.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-emerald-500 font-black">#</div>
                                            <div className="min-w-0">
                                                <h4 className="text-sm font-bold text-white truncate w-40">{item.title}</h4>
                                                <p className="text-[10px] text-slate-500 uppercase font-black">{item.type}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-mono text-white font-black">{item.price.toFixed(2)} $</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-8 border-t border-white/5 space-y-4">
                                <div className="flex justify-between text-slate-400 text-sm font-bold">
                                    <span>المجموع</span>
                                    <span>{subtotal.toFixed(2)} $</span>
                                </div>
                                <div className="flex justify-between items-end">
                                    <span className="text-slate-400 text-sm font-bold">الإجمالي</span>
                                    <span className="text-4xl font-black text-white">{total.toFixed(2)} <span className="text-lg text-emerald-500">$</span></span>
                                </div>
                            </div>
                            
                            <button
                                onClick={handleCheckout}
                                disabled={loading}
                                className={`w-full group h-20 relative overflow-hidden rounded-[2.5rem] font-black text-xl transition-all shadow-2xl ${loading ? 'opacity-50' : 'active:scale-95 shadow-emerald-500/20'}`}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-400"></div>
                                <div className="relative flex items-center justify-center gap-3 text-white">
                                    {loading ? (
                                        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>إتمام الطلب الآن <FiArrowRight className="group-hover:translate-x-[-10px] transition-transform" /></>
                                    )}
                                </div>
                            </button>
                            
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl">
                                    <FiCheckCircle className="text-emerald-500 shrink-0" />
                                    <p className="text-[10px] font-bold text-slate-400 leading-relaxed">سيتم تفعيل طلبك آلياً (للكريبتو) أو خلال ساعة (للدفع اليدوي) بعد مراجعة الإيصال.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Sub-component for Dark Selection Tabs
function PaymentMethodTab({ id, current, onClick, icon, label, desc }: any) {
    const active = current === id;
    return (
        <button 
            onClick={onClick}
            className={`min-w-[140px] p-4 rounded-3xl border-2 transition-all text-right relative overflow-hidden group ${active ? 'bg-white/5 border-emerald-500' : 'bg-transparent border-white/5 hover:border-white/10'}`}
        >
            <div className="relative z-10">
                <span className="text-2xl mb-4 block group-hover:scale-110 transition-transform">{icon}</span>
                <h5 className={`font-black text-sm whitespace-nowrap ${active ? 'text-white' : 'text-slate-500'}`}>{label}</h5>
                <p className={`text-[10px] font-bold mt-1 ${active ? 'text-emerald-500' : 'text-slate-600'}`}>{desc}</p>
            </div>
            {active && <div className="absolute top-0 right-0 w-8 h-8 bg-emerald-500/10 rounded-bl-3xl"></div>}
        </button>
    );
}
