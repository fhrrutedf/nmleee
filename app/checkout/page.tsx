'use client';

import { useState, useEffect, useRef } from 'react';
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

    // Spaceremit Client-Side Form
    const spFormRef = useRef<HTMLFormElement>(null);
    const [spOrderData, setSpOrderData] = useState<any>(null);
    const [spScriptLoaded, setSpScriptLoaded] = useState(false);

    // Load Spaceremit JS when order data is ready
    useEffect(() => {
        if (!spOrderData) return;
        if (spScriptLoaded) return; // Already loaded

        // Save order info on window for the callbacks
        (window as any).__SP_ORDER_ID = spOrderData.orderId;
        (window as any).__SP_ORDER_NUMBER = spOrderData.orderNumber;

        // 1. Set config FIRST (global vars Spaceremit expects)
        (window as any).SP_PUBLIC_KEY = process.env.NEXT_PUBLIC_SPACEREMIT_PUBLIC_KEY || '';
        (window as any).SP_FORM_ID = '#spaceremit-hidden-form';
        (window as any).SP_SELECT_RADIO_NAME = 'sp-pay-type-radio';
        (window as any).LOCAL_METHODS_BOX_STATUS = true;
        (window as any).LOCAL_METHODS_PARENT_ID = '#spaceremit-local-methods-pay';
        (window as any).CARD_BOX_STATUS = true;
        (window as any).CARD_BOX_PARENT_ID = '#spaceremit-card-pay';
        (window as any).SP_FORM_AUTO_SUBMIT_WHEN_GET_CODE = true;

        // Callbacks
        (window as any).SP_SUCCESSFUL_PAYMENT = (spaceremit_code: string) => {
            const orderId = (window as any).__SP_ORDER_ID;
            const orderNumber = (window as any).__SP_ORDER_NUMBER;
            fetch('/api/webhooks/spaceremit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ SP_payment_code: spaceremit_code, notes: orderNumber })
            }).finally(() => {
                window.location.href = `/success?orderId=${orderId}`;
            });
        };
        (window as any).SP_FAILD_PAYMENT = () => {
            const orderId = (window as any).__SP_ORDER_ID;
            window.location.href = `/cancel?orderId=${orderId}`;
        };
        (window as any).SP_RECIVED_MESSAGE = (msg: string) => console.log('[Spaceremit]:', msg);
        (window as any).SP_NEED_AUTH = (link: string) => { window.location.href = link; };

        // 2. Load the Spaceremit JS script AFTER config is set
        const script = document.createElement('script');
        script.src = 'https://spaceremit.com/api/v2/js_script/spaceremit.js';
        script.async = true;
        script.onload = () => {
            console.log('[Spaceremit] JS loaded successfully');
            setSpScriptLoaded(true);
        };
        script.onerror = () => console.error('[Spaceremit] Failed to load JS script');
        document.body.appendChild(script);

        return () => {
            // Cleanup on unmount
            try { document.body.removeChild(script); } catch {}
        };
    }, [spOrderData]);

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
                
                let methodId = selectedLocalMethod.id;
                if (methodId === 'crypto_usdt') methodId = 'usdt_trc20';

                // Step 1: Create the order on our server
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
                    const data = await res.json();
                    // Show the Spaceremit payment overlay
                    setSpOrderData(data);
                    // Spaceremit JS will handle everything from here
                } else {
                    const errData = await res.json().catch(() => ({}));
                    showToast.error(errData.error || 'فشل بدء عملية الدفع');
                }

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
        <div className="min-h-screen bg-[#0a0f1e] text-slate-100 py-12 md:py-24 font-sans selection:bg-blue-500/30">
            {/* Background Accents (Premium Emerald) */}
            <div className="fixed inset-0 pointer-events-none opacity-20">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-600 rounded-full blur-[100px]"></div>
            </div>

            <div className="max-w-6xl mx-auto px-6 relative z-10">
                
                <div className="mb-16 text-center">
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-full text-blue-400 text-xs font-bold uppercase tracking-[0.2em] mb-6">
                        <FiShield /> نظام دفع ذكي ودولي
                    </motion.div>
                    <h1 className="text-4xl md:text-6xl font-bold text-white">إتمام الشراء</h1>
                    <p className="text-slate-400 mt-4 max-w-lg mx-auto font-medium">نظام دفع مؤمن عالمياً يدعم البطاقات البنكية، الكريبتو والمحافظ المحلية.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    <div className="lg:col-span-7 space-y-10">
                        
                        {/* 1. Customer Info */}
                        <div className="bg-[#111827]/60 backdrop-blur-3xl border border-white/5 p-8 rounded-xl shadow-2xl">
                            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                                <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span> البيانات الشخصية والدولة
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 px-1">الدولة *</label>
                                    <select value={customerCountry} onChange={e => handleCountryLogic(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:bg-white/[0.08] focus:border-blue-500 outline-none transition-all font-bold text-white appearance-none">
                                        {Object.entries(paymentMethodsByCountry).map(([code, cfg]) => <option key={code} value={code}>{cfg.nameAr}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 px-1">الاسم الكامل *</label>
                                    <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:bg-white/[0.08] focus:border-blue-500 outline-none transition-all font-bold text-white text-right" placeholder="الأسم..." />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 px-1">البريد الإلكتروني *</label>
                                    <input type="email" dir="ltr" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:bg-white/[0.08] focus:border-blue-500 outline-none transition-all font-bold text-white text-left" placeholder="email@example.com" />
                                </div>
                            </div>
                        </div>

                        {/* 2. Payment Selection Area */}
                        <div className="bg-[#111827]/60 backdrop-blur-3xl border border-white/5 p-8 rounded-xl shadow-2xl">
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
                                                    className={`p-7 rounded-[2.2rem] border-2 text-right transition-all group ${selectedLocalMethod?.id === m.id ? 'border-blue-500 bg-blue-500/5' : 'border-white/5 bg-white/5 hover:border-white/10'}`}
                                                >
                                                    <span className="text-3xl mb-3 block group-hover:scale-110 transition-transform">{m.icon}</span>
                                                    <h5 className="font-bold text-white">{m.nameAr}</h5>
                                                    <p className="text-[10px] text-blue-500 uppercase font-bold mt-1">تفعيل آلي وفوري</p>
                                                </button>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-3 bg-blue-500/5 p-6 rounded-[1.5rem] border border-blue-500/10">
                                            <FiCheckCircle size={18} className="text-blue-500 shrink-0" />
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
                                                    <button key={m.id} onClick={() => setSelectedLocalMethod(m)} className="w-full group bg-white/5 border border-white/5 p-6 rounded-xl flex items-center justify-between transition-all hover:bg-white/[0.08]">
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
                            <input type="checkbox" id="terms_agree" checked={agreeToTerms} onChange={e => setAgreeToTerms(e.target.checked)} className="w-5 h-5 rounded-lg border-white/10 bg-white/5 text-blue-500 focus:ring-blue-500/20 cursor-pointer" />
                            <label htmlFor="terms_agree" className="text-sm text-slate-500 font-medium cursor-pointer">أوافق على شروط الموقع وسياسة الخصوصية</label>
                        </div>
                    </div>

                    <div className="lg:col-span-5">
                        <OrderSummary items={cart} subtotal={subtotal} discount={discount} total={total} couponCode={couponCode} onCouponChange={setCouponCode} onApplyCoupon={() => {}} loading={loading} btnText="إتمام الطلب الآن" onCheckout={handleCheckout} />
                    </div>
                </div>
            </div>

            {/* ═══ Spaceremit V2 Payment Overlay ═══ */}
            <div 
                className={`fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300 ${spOrderData ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
            >
                <div className="bg-[#0f1729] rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-white/10 max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <FiCreditCard className="text-blue-400" /> إتمام الدفع
                        </h3>
                        <button 
                            type="button" 
                            onClick={() => setSpOrderData(null)} 
                            className="w-8 h-8 rounded-full bg-white/10 hover:bg-red-500/20 text-white hover:text-red-400 flex items-center justify-center transition-colors text-sm font-bold"
                        >
                            ✕
                        </button>
                    </div>

                    {spOrderData && (
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 mb-6 text-center">
                            <p className="text-blue-400 text-sm font-bold">المبلغ المطلوب</p>
                            <p className="text-3xl font-bold text-white mt-1">{spOrderData.total} <span className="text-lg text-slate-400">USD</span></p>
                            <p className="text-xs text-slate-500 mt-1 font-mono">#{spOrderData.orderNumber}</p>
                        </div>
                    )}

                    <form
                        id="spaceremit-hidden-form"
                        ref={spFormRef}
                    >
                        <input type="hidden" name="amount" value={spOrderData?.total || 0} />
                        <input type="hidden" name="currency" value="USD" />
                        <input type="hidden" name="fullname" value={spOrderData?.customerName || ''} />
                        <input type="hidden" name="email" value={spOrderData?.customerEmail || ''} />
                        <input type="hidden" name="notes" value={spOrderData?.orderNumber || ''} />

                        <div className="sp-one-type-select mb-4">
                            <input type="radio" name="sp-pay-type-radio" value="local-methods-pay" id="sp_local_methods_radio" defaultChecked />
                            <label htmlFor="sp_local_methods_radio" className="block p-4 rounded-xl border-2 border-blue-500/50 bg-blue-500/5 cursor-pointer mb-3 hover:bg-blue-500/10 transition-colors">
                                <div className="font-bold text-blue-400 flex items-center gap-2">🌍 طرق الدفع المحلية</div>
                                <p className="text-xs text-slate-500 mt-1">فودافون كاش · زين كاش · محافظ إلكترونية</p>
                            </label>
                            <div id="spaceremit-local-methods-pay" className="space-y-2 min-h-[20px]"></div>
                        </div>

                        <div className="sp-one-type-select mb-6">
                            <input type="radio" name="sp-pay-type-radio" value="card-pay" id="sp_card_radio" />
                            <label htmlFor="sp_card_radio" className="block p-4 rounded-xl border-2 border-white/10 bg-white/5 cursor-pointer mb-3 hover:border-blue-500/50 hover:bg-blue-500/5 transition-colors">
                                <div className="font-bold text-white flex items-center gap-2">💳 الدفع بالبطاقة</div>
                                <p className="text-xs text-slate-500 mt-1">Visa · Mastercard · بطاقات دولية</p>
                            </label>
                            <div id="spaceremit-card-pay"></div>
                        </div>

                        <button type="submit" className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl font-bold text-lg transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transform hover:-translate-y-0.5">
                            ادفع الآن
                        </button>
                    </form>

                    <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
                        <FiShield className="text-blue-500" />
                        <span>مدعوم بتشفير SSL من Spaceremit</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PaymentMethodTab({ id, current, onClick, icon, label, desc }: any) {
    const active = current === id;
    return (
        <button onClick={onClick} className={`min-w-[160px] p-6 rounded-[2.2rem] border-2 transition-all text-right relative overflow-hidden group ${active ? 'bg-white/5 border-blue-500' : 'bg-transparent border-white/5 hover:border-white/10'}`}>
            <span className="text-3xl mb-4 block group-hover:scale-110 transition-transform">{icon}</span>
            <h5 className={`font-bold text-xs whitespace-nowrap ${active ? 'text-white' : 'text-slate-500'}`}>{label}</h5>
            <p className={`text-[9px] font-bold mt-1 ${active ? 'text-blue-500' : 'text-slate-600'}`}>{desc}</p>
        </button>
    );
}
