'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiGlobe, FiShield, FiAlertTriangle, FiArrowRight, FiCheckCircle, FiCreditCard } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import showToast from '@/lib/toast';
import {
    getPaymentMethodsForCountry,
    convertCurrency,
    paymentMethodsByCountry,
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
    
    // Selection Logic: All Countries except SY use Spaceremit by default
    const [paymentMethod, setPaymentMethod] = useState<'spaceremit' | 'manual'>('spaceremit');
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

    // Geo-Detect
    useEffect(() => {
        fetch('/api/geo')
            .then(r => r.ok ? r.json() : { country: 'DEFAULT' })
            .then(d => {
                const code = d.country || 'DEFAULT';
                handleCountryLogic(code);
            }).catch(() => handleCountryLogic('DEFAULT'));
    }, []);

    const handleCountryLogic = (code: string) => {
        setCustomerCountry(code);
        if (code === 'SY') {
            setIsSyria(true);
            setPaymentMethod('manual');
        } else {
            setIsSyria(false);
            setPaymentMethod('spaceremit');
            // Auto-select first method if global
            const methods = getPaymentMethodsForCountry(code).methods;
            if (methods.length > 0) setSelectedLocalMethod(methods[0]);
        }
    };

    const handleCheckout = async () => {
        if (!formData.name || !formData.email) return showToast.error('يرجى ملء الاسم والبريد');
        if (!agreeToTerms) return showToast.error('يرجى الموافقة على الشروط');

        setLoading(true);
        try {
            const affRef = getCookie('aff_code') || sessionStorage.getItem('affiliate_ref');
            
            if (paymentMethod === 'spaceremit') {
                if (!selectedLocalMethod) return showToast.error('يرجى اختيار وسيلة الدفع');
                
                // Map frontend IDs to Spaceremit backend IDs
                let methodId = selectedLocalMethod.id;
                if (methodId === 'crypto_usdt') methodId = 'usdt_trc20';

                const res = await fetch('/api/checkout/spaceremit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        items: cart,
                        customerInfo: formData,
                        paymentMethod: methodId,
                        couponCode: discount > 0 ? couponCode : null,
                        affiliateRef: affRef
                    })
                });
                if (res.ok) {
                    const d = await res.json();
                    window.location.href = d.paymentUrl; // Use paymentUrl from SPR API
                } else showToast.error('فشل بدء عملية الدفع التلقائي');

            } else if (paymentMethod === 'manual' && isSyria) {
                if (!selectedLocalMethod || !manualData.transactionRef || !manualData.proofFile) {
                    return showToast.error('يرجى اختيار وسيلة وإدخال رقم المرجع وصورة الإيصال');
                }
                
                const fd = new FormData();
                fd.append('file', manualData.proofFile);
                fd.append('type', 'image');
                const upRes = await fetch('/api/upload', { method: 'POST', body: fd });
                if (!upRes.ok) throw new Error('فشل رفع الإيصال');
                const upD = await upRes.json();

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
            showToast.error('حدث خطأ أثناء معالجة الدفع');
        } finally {
            setLoading(false);
        }
    };

    const subtotal = cart.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
    const total = subtotal - discount;
    const countryMethods = getPaymentMethodsForCountry(customerCountry || 'DEFAULT');
    const localPrice = customerCountry ? convertCurrency(total, customerCountry) : { amount: total, currency: 'USD' };

    return (
        <div className="min-h-screen bg-[#0a0f1e] text-slate-100 py-12 md:py-24 font-sans selection:bg-emerald-500/30">
            {/* Background Accents (Premium Emerald) */}
            <div className="fixed inset-0 pointer-events-none opacity-20">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-600 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-600 rounded-full blur-[100px]"></div>
            </div>

            <div className="max-w-6xl mx-auto px-6 relative z-10">
                
                <div className="mb-16 text-center">
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full text-emerald-400 text-xs font-black uppercase tracking-[0.2em] mb-6">
                        <FiShield /> نظام دفع ذكي ودولي
                    </motion.div>
                    <h1 className="text-4xl md:text-6xl font-black text-white">إتمام الشراء</h1>
                    <p className="text-slate-400 mt-4 max-w-lg mx-auto font-medium">نظام دفع مؤمن عالمياً يدعم البطاقات البنكية، الكريبتو والمحافظ المحلية.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    <div className="lg:col-span-7 space-y-10">
                        
                        {/* 1. Customer Info */}
                        <div className="bg-[#111827]/60 backdrop-blur-3xl border border-white/5 p-8 rounded-[2.5rem] shadow-2xl">
                            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                                <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span> البيانات الشخصية والدولة
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 px-1">الدولة *</label>
                                    <select value={customerCountry} onChange={e => handleCountryLogic(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:bg-white/[0.08] focus:border-emerald-500 outline-none transition-all font-bold text-white appearance-none">
                                        {Object.entries(paymentMethodsByCountry).map(([code, cfg]) => <option key={code} value={code}>{cfg.nameAr}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 px-1">الاسم الكامل *</label>
                                    <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:bg-white/[0.08] focus:border-emerald-500 outline-none transition-all font-bold text-white text-right" placeholder="الأسم..." />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 px-1">البريد الإلكتروني *</label>
                                    <input type="email" dir="ltr" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:bg-white/[0.08] focus:border-emerald-500 outline-none transition-all font-bold text-white text-left" placeholder="email@example.com" />
                                </div>
                            </div>
                        </div>

                        {/* 2. Payment Selection Area */}
                        <div className="bg-[#111827]/60 backdrop-blur-3xl border border-white/5 p-8 rounded-[2.5rem] shadow-2xl">
                            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                                <span className="w-1.5 h-6 bg-amber-500 rounded-full"></span> اختيار طريقة الدفع
                            </h3>

                            <div className="flex gap-4 mb-10 overflow-x-auto pb-4 custom-scrollbar">
                                {!isSyria ? (
                                    <PaymentMethodTab id="spaceremit" current={paymentMethod} onClick={() => setPaymentMethod('spaceremit')} icon="🌍" label="دفع إلكتروني فوري" desc="عبر Spaceremit Global" />
                                ) : (
                                    <PaymentMethodTab id="manual" current={paymentMethod} onClick={() => setPaymentMethod('manual')} icon="🇸🇾" label="دفع محلي يدوي" desc="سوريا فقط" />
                                )}
                            </div>

                            <AnimatePresence mode="wait">
                                {paymentMethod === 'spaceremit' && (
                                    <motion.div key="spaceremit-box" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {countryMethods.methods.map(m => (
                                                <button 
                                                    key={m.id} 
                                                    onClick={() => setSelectedLocalMethod(m)} 
                                                    className={`p-7 rounded-[2.2rem] border-2 text-right transition-all group ${selectedLocalMethod?.id === m.id ? 'border-emerald-500 bg-emerald-500/5' : 'border-white/5 bg-white/5 hover:border-white/10'}`}
                                                >
                                                    <span className="text-3xl mb-3 block group-hover:scale-110 transition-transform">{m.icon}</span>
                                                    <h5 className="font-black text-white">{m.nameAr}</h5>
                                                    <p className="text-[10px] text-emerald-500 uppercase font-black mt-1">تفعيل آلي وفوري</p>
                                                </button>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-3 bg-emerald-500/5 p-6 rounded-[1.5rem] border border-emerald-500/10">
                                            <FiCheckCircle size={18} className="text-emerald-500 shrink-0" />
                                            <p className="text-xs text-slate-400 leading-relaxed font-medium">
                                                جميع عمليات الدفع تتم عبر بوابة **Spaceremit** الآمنة. ندعم أكثر من 70 وسيلة دفع حول العالم.
                                            </p>
                                        </div>
                                    </motion.div>
                                )}

                                {paymentMethod === 'manual' && isSyria && (
                                    <motion.div key="manual-box" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                        {!selectedLocalMethod ? (
                                            <div className="space-y-3">
                                                {countryMethods.methods.map(m => (
                                                    <button key={m.id} onClick={() => setSelectedLocalMethod(m)} className="w-full group bg-white/5 border border-white/5 p-6 rounded-[2rem] flex items-center justify-between transition-all hover:bg-white/[0.08]">
                                                        <div className="flex items-center gap-4">
                                                            <span className="text-3xl">{m.icon}</span>
                                                            <div className="text-right">
                                                                <h5 className="font-bold text-white">{m.nameAr}</h5>
                                                                <p className="text-[10px] text-slate-500 uppercase tracking-widest">{m.id}</p>
                                                            </div>
                                                        </div>
                                                        <FiArrowRight className="text-slate-600 group-hover:text-amber-500 transition-colors" />
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <ManualPaymentCard method={selectedLocalMethod} walletAddress={selectedLocalMethod.id === 'shamcash' ? '09xxxxxx' : '09yyyyyy'} localPrice={localPrice} usdTotal={total} onDataChange={setManualData} onBack={() => setSelectedLocalMethod(null)} />
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="flex items-center gap-3 px-8">
                            <input type="checkbox" id="terms_agree" checked={agreeToTerms} onChange={e => setAgreeToTerms(e.target.checked)} className="w-5 h-5 rounded-lg border-white/10 bg-white/5 text-emerald-500 focus:ring-emerald-500/20 cursor-pointer" />
                            <label htmlFor="terms_agree" className="text-sm text-slate-500 font-medium cursor-pointer">أوافق على شروط الموقع وسياسة الخصوصية</label>
                        </div>
                    </div>

                    <div className="lg:col-span-5">
                        <OrderSummary items={cart} subtotal={subtotal} discount={discount} total={total} couponCode={couponCode} onCouponChange={setCouponCode} onApplyCoupon={() => {}} loading={loading} btnText="إتمام الطلب الآن" onCheckout={handleCheckout} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function PaymentMethodTab({ id, current, onClick, icon, label, desc }: any) {
    const active = current === id;
    return (
        <button onClick={onClick} className={`min-w-[160px] p-6 rounded-[2.2rem] border-2 transition-all text-right relative overflow-hidden group ${active ? 'bg-white/5 border-emerald-500' : 'bg-transparent border-white/5 hover:border-white/10'}`}>
            <span className="text-3xl mb-4 block group-hover:scale-110 transition-transform">{icon}</span>
            <h5 className={`font-black text-xs whitespace-nowrap ${active ? 'text-white' : 'text-slate-500'}`}>{label}</h5>
            <p className={`text-[9px] font-bold mt-1 ${active ? 'text-emerald-500' : 'text-slate-600'}`}>{desc}</p>
        </button>
    );
}
