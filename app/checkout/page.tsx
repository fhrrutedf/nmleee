'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiGlobe, FiShield, FiAlertTriangle, FiArrowRight, FiCheckCircle, FiCreditCard, FiLock } from 'react-icons/fi';
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

    useEffect(() => {
        if (!spOrderData) return;
        if (spScriptLoaded) return;

        (window as any).__SP_ORDER_ID = spOrderData.orderId;
        (window as any).__SP_ORDER_NUMBER = spOrderData.orderNumber;

        (window as any).SP_PUBLIC_KEY = process.env.NEXT_PUBLIC_SPACEREMIT_PUBLIC_KEY || '';
        (window as any).SP_FORM_ID = '#spaceremit-hidden-form';
        (window as any).SP_SELECT_RADIO_NAME = 'sp-pay-type-radio';
        (window as any).LOCAL_METHODS_BOX_STATUS = true;
        (window as any).LOCAL_METHODS_PARENT_ID = '#spaceremit-local-methods-pay';
        (window as any).CARD_BOX_STATUS = true;
        (window as any).CARD_BOX_PARENT_ID = '#spaceremit-card-pay';
        (window as any).SP_FORM_AUTO_SUBMIT_WHEN_GET_CODE = true;

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
            try { document.body.removeChild(script); } catch {}
        };
    }, [spOrderData]);

    useEffect(() => {
        const items = isDirect 
            ? JSON.parse(sessionStorage.getItem('direct_checkout_items') || '[]')
            : JSON.parse(localStorage.getItem('cart') || '[]');
        if (!items || items.length === 0) router.push('/market');
        setCart(items);
    }, [isDirect, router]);

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
                    setSpOrderData(data);
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
        <div className="min-h-screen bg-bg-light text-ink py-16 md:py-24 font-sans selection:bg-emerald-600/30">
            {/* Minimalist Background Detail */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-emerald-600/5 rounded-xl blur-[150px] -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-gray-100 rounded-xl blur-[120px] translate-y-1/2 -translate-x-1/4"></div>
            </div>

            <div className="max-w-6xl mx-auto px-6 relative z-10">
                
                <div className="mb-20 text-center max-w-2xl mx-auto">
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-2 bg-emerald-600/10 border border-emerald-600/20 px-5 py-2 rounded-xl text-emerald-600 text-[10px] font-bold uppercase tracking-[0.2em] mb-6 shadow-sm">
                        <FiLock size={14} /> بوابة دفع مؤمنة 256-Bit
                    </motion.div>
                    <h1 className="text-4xl md:text-6xl font-bold text-ink tracking-tight mb-6">إتمام الطلب والدفع</h1>
                    <p className="text-gray-500 text-lg font-bold leading-relaxed">يرجى مراجعة بياناتك واختيار وسيلة الدفع المناسبة لإتمام عملية الشراء بنجاح.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    <div className="lg:col-span-7 space-y-10">
                        
                        {/* 1. Personal Information */}
                        <div className="bg-white border border-gray-100 p-8 sm:p-10 rounded-xl shadow-sm shadow-gray-200/20 ring-1 ring-gray-50">
                            <h3 className="text-xl font-bold text-ink mb-10 flex items-center gap-4">
                                <span className="w-1.5 h-6 bg-ink rounded-xl"></span> البيانات الشخصية والدولة
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3 md:col-span-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">الدولة أو الإقليم *</label>
                                    <select value={customerCountry} onChange={e => handleCountryLogic(e.target.value)} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-6 py-4 focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-accent/5 outline-none transition-all font-bold text-ink appearance-none cursor-pointer">
                                        {Object.entries(paymentMethodsByCountry).map(([code, cfg]) => <option key={code} value={code}>{cfg.nameAr}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">الاسم الكامل *</label>
                                    <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-6 py-4 focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-accent/5 outline-none transition-all font-bold text-ink text-right" placeholder="أدخل اسمك الكامل..." />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">البريد الإلكتروني *</label>
                                    <input type="email" dir="ltr" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-6 py-4 focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-accent/5 outline-none transition-all font-bold text-ink text-left" placeholder="email@example.com" />
                                </div>
                            </div>
                        </div>

                        {/* 2. Payment Gateway Section */}
                        <div className="bg-white border border-gray-100 p-8 sm:p-10 rounded-xl shadow-sm shadow-gray-200/20 ring-1 ring-gray-50">
                            <h3 className="text-xl font-bold text-ink mb-10 flex items-center gap-4">
                                <span className="w-1.5 h-6 bg-emerald-600 rounded-xl"></span> اختيار وسيلة الدفع
                            </h3>

                            <div className="flex gap-4 mb-10 overflow-x-auto pb-4 hide-scrollbar">
                                {!isSyria ? (
                                    <PaymentMethodTab id="spaceremit" current={paymentMethod} onClick={() => setPaymentMethod('spaceremit')} icon="🌍" label="دفع إلكتروني آمن" desc="بطاقات، محافظ دولية، USSD" />
                                ) : (
                                    <PaymentMethodTab id="manual" current={paymentMethod} onClick={() => setPaymentMethod('manual')} icon="🇸🇾" label="دفع محلي يدوي" desc="خاص بسوريا فقط" />
                                )}
                            </div>

                            <AnimatePresence mode="wait">
                                {paymentMethod === 'spaceremit' && (
                                    <motion.div key="spaceremit-box" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {countryMethods.methods.map(m => (
                                                <button 
                                                    key={m.id} 
                                                    onClick={() => setSelectedLocalMethod(m)} 
                                                    className={`p-8 rounded-xl border-2 text-right transition-all group relative overflow-hidden ${selectedLocalMethod?.id === m.id ? 'border-emerald-600 bg-emerald-600/5 ring-4 ring-accent/5' : 'border-gray-50 bg-gray-50/50 hover:border-gray-200'}`}
                                                >
                                                    <span className="text-4xl mb-4 block group-hover:scale-110 transition-transform origin-right">{m.icon}</span>
                                                    <h5 className="font-bold text-ink text-lg">{m.nameAr}</h5>
                                                    <p className="text-[10px] text-emerald-600 uppercase font-bold mt-1.5 tracking-wider">تفعيل فوري للمحتوى</p>
                                                    
                                                    {selectedLocalMethod?.id === m.id && (
                                                        <div className="absolute top-4 left-4 text-emerald-600">
                                                            <FiCheckCircle size={20} />
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="flex items-start gap-4 bg-gray-50 p-6 rounded-xl border border-gray-100">
                                            <FiShield size={22} className="text-emerald-600 shrink-0 mt-0.5" />
                                            <p className="text-xs text-gray-500 leading-relaxed font-bold">
                                                يتم الدفع عبر بوابة **Spaceremit V2** المشفرة. سيتم توجيهك الآن لإكمال الدفع وتفعيل طلبك بمجرد الانتهاء مباشرة.
                                            </p>
                                        </div>
                                    </motion.div>
                                )}

                                {paymentMethod === 'manual' && isSyria && (
                                    <motion.div key="manual-box" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                        {!selectedLocalMethod ? (
                                            <div className="space-y-3">
                                                {countryMethods.methods.map(m => (
                                                    <button key={m.id} onClick={() => setSelectedLocalMethod(m)} className="w-full group bg-gray-50 border border-gray-100 p-6 rounded-xl flex items-center justify-between transition-all hover:bg-white hover:border-emerald-600/40 shadow-sm">
                                                        <div className="flex items-center gap-5">
                                                            <span className="text-3xl">{m.icon}</span>
                                                            <div className="text-right">
                                                                <h5 className="font-bold text-ink text-lg">{m.nameAr}</h5>
                                                                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{m.id}</p>
                                                            </div>
                                                        </div>
                                                        <FiArrowRight className="text-gray-300 group-hover:text-emerald-600 group-hover:translate-x-[-10px] transition-all" />
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

                        <div className="flex items-center gap-4 px-8">
                            <input type="checkbox" id="terms_agree" checked={agreeToTerms} onChange={e => setAgreeToTerms(e.target.checked)} className="w-5 h-5 rounded-lg border-gray-200 bg-white text-emerald-600 focus:ring-accent/20 cursor-pointer shadow-sm" />
                            <label htmlFor="terms_agree" className="text-xs text-gray-500 font-bold cursor-pointer select-none">أوافق على جميع <span className="text-ink underline">أحكام وشروط</span> الموقع العام وسياسة الاستخدام العادل.</label>
                        </div>
                    </div>

                    <div className="lg:col-span-5 sticky top-24">
                        <OrderSummary items={cart} subtotal={subtotal} discount={discount} total={total} couponCode={couponCode} onCouponChange={setCouponCode} onApplyCoupon={() => {}} loading={loading} btnText="إتمام العملية الآن" onCheckout={handleCheckout} />
                    </div>
                </div>
            </div>

            {/* ═══ Professional Spaceremit V2 Payment Overlay ═══ */}
            <div 
                className={`fixed inset-0 z-[9999] bg-ink/60  flex items-center justify-center p-4 transition-all duration-500 ${spOrderData ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
            >
                <div className="bg-white rounded-[2.5rem] p-10 max-w-lg w-full shadow-sm border border-gray-100 max-h-[90vh] overflow-y-auto relative">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-sm shadow-accent/20">
                                <FiCreditCard />
                            </div>
                            <h3 className="text-xl font-bold text-ink tracking-tight">إتمام الدفع الآمن</h3>
                        </div>
                        <button 
                            type="button" 
                            onClick={() => setSpOrderData(null)} 
                            className="w-10 h-10 rounded-xl bg-gray-50 hover:bg-gray-100 text-ink flex items-center justify-center transition-all text-sm font-bold"
                        >
                            ✕
                        </button>
                    </div>

                    {spOrderData && (
                        <div className="bg-gray-50 rounded-xl p-8 mb-10 text-center border border-gray-100">
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2">إجمالي المطلوب سداده</p>
                            <p className="text-5xl font-bold text-ink font-inter tracking-tighter">${spOrderData.total}</p>
                            <p className="text-[10px] text-emerald-600 mt-4 font-mono font-bold tracking-widest">ORDER #{spOrderData.orderNumber}</p>
                        </div>
                    )}

                    <form
                        id="spaceremit-hidden-form"
                        ref={spFormRef}
                        className="space-y-4"
                    >
                        <input type="hidden" name="amount" value={spOrderData?.total || 0} />
                        <input type="hidden" name="currency" value="USD" />
                        <input type="hidden" name="fullname" value={spOrderData?.customerName || ''} />
                        <input type="hidden" name="email" value={spOrderData?.customerEmail || ''} />
                        <input type="hidden" name="notes" value={spOrderData?.orderNumber || ''} />

                        <div className="sp-one-type-select">
                            <input type="radio" name="sp-pay-type-radio" value="local-methods-pay" id="sp_local_methods_radio" defaultChecked className="hidden" />
                            <label htmlFor="sp_local_methods_radio" className="block p-5 rounded-xl border-2 border-emerald-600 bg-emerald-600/5 cursor-pointer mb-4 transition-all">
                                <div className="font-bold text-ink flex items-center gap-2 text-sm">🌍 الدفع المحلي (بينانس/زين/فودافون)</div>
                                <p className="text-[10px] text-gray-500 font-bold mt-1">يُوصى به للمستخدمين في الشرق الأوسط</p>
                            </label>
                            <div id="spaceremit-local-methods-pay" className="space-y-2 min-h-[40px] px-2"></div>
                        </div>

                        <div className="sp-one-type-select">
                            <input type="radio" name="sp-pay-type-radio" value="card-pay" id="sp_card_radio" className="hidden" />
                            <label htmlFor="sp_card_radio" className="block p-5 rounded-xl border-2 border-gray-50 bg-gray-50 cursor-pointer mb-4 hover:border-emerald-600/30 transition-all">
                                <div className="font-bold text-ink flex items-center gap-2 text-sm">💳 البطاقة البنكية الدولية</div>
                                <p className="text-[10px] text-gray-500 font-bold mt-1">Visa, Mastercard, American Express</p>
                            </label>
                            <div id="spaceremit-card-pay" className="px-2"></div>
                        </div>

                        <button type="submit" className="w-full py-5 bg-ink text-white rounded-xl font-bold text-lg transition-all shadow-sm shadow-ink/20 hover:bg-gray-800 hover:shadow-ink/30 transform hover:-translate-y-0.5 mt-6 mb-4">
                            ادفع الآن آمن
                        </button>
                    </form>

                    <div className="flex items-center justify-center gap-3 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        <FiShield className="text-emerald-600" />
                        <span>SECURED BY SPACEREMIT CLOUD</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PaymentMethodTab({ id, current, onClick, icon, label, desc }: any) {
    const active = current === id;
    return (
        <button onClick={onClick} className={`min-w-[180px] p-6 rounded-xl border-2 transition-all text-right relative overflow-hidden group ${active ? 'bg-white border-emerald-600 shadow-sm shadow-accent/5' : 'bg-gray-50 border-gray-100 hover:border-gray-200 shadow-sm'}`}>
            <span className="text-4xl mb-4 block group-hover:scale-110 transition-transform origin-right">{icon}</span>
            <h5 className={`font-bold text-sm whitespace-nowrap mb-1 ${active ? 'text-ink' : 'text-gray-500'}`}>{label}</h5>
            <p className={`text-[10px] font-bold tracking-tight leading-tight ${active ? 'text-emerald-600' : 'text-gray-400'}`}>{desc}</p>
            {active && (
                <div className="absolute top-4 left-4 text-emerald-600">
                    <FiCheckCircle size={18} />
                </div>
            )}
        </button>
    );
}
