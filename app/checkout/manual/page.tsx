'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
    FiCopy, FiCheck, FiUpload, FiArrowRight, FiShield, FiClock,
    FiCheckCircle, FiX, FiAlertCircle, FiChevronLeft
} from 'react-icons/fi';
import Link from 'next/link';
import {
    paymentMethodsByCountry,
    getPaymentMethodsForCountry,
    convertCurrency,
    formatCurrency,
    type PaymentMethod,
    type CountryPaymentConfig
} from '@/config/paymentMethods';

// ─── Platform Wallet Addresses ────────────────────────────────────
// The student pays directly to the platform admin.
// Replace these with the real admin numbers.
const PLATFORM_WALLETS: Record<string, string> = {
    shamcash: '0933000000',
    omt: '0933000000',
    hawala: '0933000000',
    mtncash: '0955000000',
    zaincash: '07801000000',
    qicard: '07801000000',
    asiahawala: '07801000000',
    vodafonecash: '01000000000',
    fawry: 'FAWRY-1234567',
    instapay: '01000000000',
    stcpay: '0500000000',
    banktransfer: 'SA00 0000 0000 0000 0000 0000',
    westernunion: 'Platform Admin',
};

// ─── Country Flag Mapping ─────────────────────────────────────────
const COUNTRY_FLAGS: Record<string, string> = {
    SY: '🇸🇾', IQ: '🇮🇶', EG: '🇪🇬', SA: '🇸🇦', DEFAULT: '🌍',
};

type Step = 1 | 2 | 3;

export default function ManualCheckoutPage() {
    const { data: session } = useSession();
    const searchParams = useSearchParams();
    const router = useRouter();

    const itemsParam = searchParams.get('items');

    // ─── State ─────────────────────────────────────────────────────
    const [step, setStep] = useState<Step>(1);
    const [country, setCountry] = useState('');
    const [countryConfig, setCountryConfig] = useState<CountryPaymentConfig | null>(null);
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
    const [senderPhone, setSenderPhone] = useState('');
    const [transactionRef, setTransactionRef] = useState('');
    const [paymentNotes, setPaymentNotes] = useState('');
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [proofPreview, setProofPreview] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderResult, setOrderResult] = useState<{ orderNumber: string } | null>(null);
    const [error, setError] = useState('');
    const [items, setItems] = useState<any[]>([]);
    const [totalUSD, setTotalUSD] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ─── Detect Country ────────────────────────────────────────────
    useEffect(() => {
        fetch('/api/geo')
            .then(r => r.ok ? r.json() : { country: 'DEFAULT' })
            .then(d => setCountry(d.country || 'DEFAULT'))
            .catch(() => setCountry('DEFAULT'));
    }, []);

    // ─── Parse Items ───────────────────────────────────────────────
    useEffect(() => {
        if (itemsParam) {
            try {
                const parsed = JSON.parse(decodeURIComponent(itemsParam));
                setItems(parsed);
                setTotalUSD(parsed.reduce((s: number, i: any) => s + (i.price || 0), 0));
            } catch { setItems([]); }
        }
    }, [itemsParam]);

    // ─── Country Config ────────────────────────────────────────────
    useEffect(() => {
        if (country) setCountryConfig(getPaymentMethodsForCountry(country));
    }, [country]);

    const localPrice = country
        ? convertCurrency(totalUSD, country)
        : { amount: totalUSD, currency: 'USD' };

    // ─── Handlers ──────────────────────────────────────────────────
    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { setError('حجم الصورة أكبر من 5MB'); return; }
        setProofFile(file);
        const reader = new FileReader();
        reader.onload = () => setProofPreview(reader.result as string);
        reader.readAsDataURL(file);
        setError('');
    };

    const handleSubmit = async () => {
        if (!selectedMethod || !transactionRef) {
            setError('يرجى ملء رقم العملية');
            return;
        }
        setIsSubmitting(true);
        setError('');

        try {
            // Upload proof
            let proofUrl = '';
            if (proofFile) {
                const fd = new FormData();
                fd.append('file', proofFile);
                fd.append('type', 'image');
                const upRes = await fetch('/api/upload', { method: 'POST', body: fd });
                if (upRes.ok) { const d = await upRes.json(); proofUrl = d.url; }
            }

            // Create order
            const res = await fetch('/api/orders/manual', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items,
                    customerName: session?.user?.name || 'عميل',
                    customerEmail: session?.user?.email || '',
                    customerPhone: senderPhone,
                    country,
                    paymentProvider: selectedMethod.id,
                    senderPhone,
                    transactionRef,
                    paymentProof: proofUrl,
                    paymentNotes,
                    userId: (session?.user as any)?.id,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setOrderResult({ orderNumber: data.orderNumber });
                setStep(3);
            } else {
                const d = await res.json();
                setError(d.error || 'حدث خطأ أثناء إنشاء الطلب');
            }
        } catch { setError('حدث خطأ في الاتصال'); }
        finally { setIsSubmitting(false); }
    };

    // ─── Stepper Labels ────────────────────────────────────────────
    const stepLabels = ['اختر الطريقة', 'حوّل وأرفق', 'تأكيد'];

    // ────────────────────────────────────────────────────────────────
    //  RENDER
    // ────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A]">
            {/* ── Sticky Header ────────────────────────────────────── */}
            <header className="bg-white dark:bg-[#1e293b] shadow-sm sticky top-0 z-20 border-b border-gray-100 dark:border-gray-800">
                <div className="max-w-xl mx-auto px-4 py-3.5 flex items-center gap-3">
                    <Link href="/" className="text-gray-400 hover:text-[#0052FF] transition-colors">
                        <FiChevronLeft size={22} />
                    </Link>
                    <h1 className="text-base font-bold text-gray-900 dark:text-white">الدفع اليدوي — Escrow</h1>
                    <div className="mr-auto flex items-center gap-1.5 text-[11px] text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full font-semibold">
                        <FiShield size={12} />
                        <span>آمن</span>
                    </div>
                </div>
            </header>

            <div className="max-w-xl mx-auto px-4 py-5 pb-20">
                {/* ── Progress Stepper ─────────────────────────────── */}
                <div className="flex items-center justify-between mb-7 px-2">
                    {stepLabels.map((label, i) => {
                        const n = (i + 1) as Step;
                        const done = step > n;
                        const active = step === n;
                        return (
                            <div key={i} className="flex-1 flex flex-col items-center relative">
                                {/* connector line */}
                                {i < 2 && (
                                    <div className="absolute top-[18px] w-full h-[2px] -z-10" style={{ left: '50%' }}>
                                        <div className={`h-full transition-colors duration-300 ${step > n ? 'bg-[#0052FF]' : 'bg-gray-200 dark:bg-gray-700'}`} />
                                    </div>
                                )}
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all
                                    ${done ? 'bg-[#0052FF] text-white' : active ? 'bg-[#0052FF] text-white ring-4 ring-[#0052FF]/20' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'}`}>
                                    {done ? <FiCheck size={16} /> : n}
                                </div>
                                <span className={`text-[11px] mt-1.5 font-medium ${done || active ? 'text-[#0052FF]' : 'text-gray-400'}`}>{label}</span>
                            </div>
                        );
                    })}
                </div>

                {/* ── Order Summary ────────────────────────────────── */}
                <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 mb-5">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400 font-medium">المبلغ المطلوب</span>
                        <div className="text-left">
                            <p className="text-xl font-black text-gray-900 dark:text-white">
                                {formatCurrency(localPrice.amount, localPrice.currency)}
                            </p>
                            {localPrice.currency !== 'USD' && (
                                <p className="text-[10px] text-gray-400 mt-0.5">≈ ${totalUSD.toFixed(2)} USD</p>
                            )}
                        </div>
                    </div>
                    {items.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 space-y-1">
                            {items.map((item: any, i: number) => (
                                <div key={i} className="flex items-center justify-between text-xs">
                                    <span className="text-gray-500 truncate flex-1">{item.title || item.name || 'منتج'}</span>
                                    <span className="text-gray-700 dark:text-gray-300 font-semibold mr-3">${item.price}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ═══════════════════════════════════════════════════
                    STEP 1 — Select Payment Method
                ═══════════════════════════════════════════════════ */}
                {step === 1 && countryConfig && (
                    <div className="space-y-4 animate-in fade-in">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-bold text-gray-900 dark:text-white">اختر طريقة الدفع</h2>
                            <span className="text-[11px] bg-gray-100 dark:bg-gray-800 text-gray-500 px-2.5 py-1 rounded-full font-medium">
                                {COUNTRY_FLAGS[country] || '🌍'} {countryConfig.nameAr}
                            </span>
                        </div>

                        <div className="grid gap-2.5">
                            {countryConfig.methods.filter(m => m.enabled).map(method => (
                                <button
                                    key={method.id}
                                    onClick={() => { setSelectedMethod(method); setStep(2); }}
                                    className="w-full bg-white dark:bg-[#1e293b] rounded-2xl border-2 border-gray-100 dark:border-gray-800 p-4 flex items-center gap-3.5 transition-all duration-200 hover:border-[#0052FF]/40 hover:shadow-md active:scale-[0.99] group"
                                >
                                    <span className="text-2xl">{method.icon}</span>
                                    <div className="text-right flex-1">
                                        <p className="font-bold text-gray-900 dark:text-white text-sm group-hover:text-[#0052FF] transition-colors">{method.nameAr}</p>
                                        <p className="text-[11px] text-gray-400">{method.name}</p>
                                    </div>
                                    <FiArrowRight className="text-gray-300 group-hover:text-[#0052FF] transition-colors rotate-180" size={16} />
                                </button>
                            ))}
                        </div>

                        {/* Country Override */}
                        <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                            <label className="text-[11px] text-gray-400 font-medium block mb-1.5">لست في {countryConfig.nameAr}؟</label>
                            <select
                                value={country}
                                onChange={e => setCountry(e.target.value)}
                                className="w-full bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0052FF]/20 focus:border-[#0052FF] outline-none"
                            >
                                {Object.entries(paymentMethodsByCountry).map(([code, cfg]) => (
                                    <option key={code} value={code}>{COUNTRY_FLAGS[code] || '🌍'} {cfg.nameAr}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════
                    STEP 2 — Transfer & Upload Proof
                ═══════════════════════════════════════════════════ */}
                {step === 2 && selectedMethod && (
                    <div className="space-y-4 animate-in fade-in">
                        <button
                            onClick={() => { setStep(1); setSelectedMethod(null); }}
                            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#0052FF] transition-colors font-medium"
                        >
                            <FiArrowRight size={14} />
                            تغيير الطريقة
                        </button>

                        {/* Instructions */}
                        <div className="bg-gradient-to-br from-[#0052FF]/5 to-purple-500/5 rounded-2xl border border-[#0052FF]/10 p-4">
                            <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-3 flex items-center gap-2">
                                <FiClock className="text-[#0052FF]" size={16} />
                                خطوات الدفع — {selectedMethod.nameAr}
                            </h3>
                            <div className="space-y-2.5">
                                {[
                                    <>حوّل <strong className="text-gray-900 dark:text-white">{formatCurrency(localPrice.amount, localPrice.currency)}</strong> إلى الرقم أدناه</>,
                                    'خذ لقطة شاشة لرسالة التأكيد',
                                    'أدخل رقم العملية وارفع الإيصال',
                                ].map((text, i) => (
                                    <div key={i} className="flex gap-2.5">
                                        <div className="w-6 h-6 shrink-0 rounded-full bg-[#0052FF] text-white flex items-center justify-center text-[10px] font-bold">{i + 1}</div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 pt-0.5">{text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Wallet Copy Box */}
                        <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
                            <label className="text-[11px] text-gray-400 font-medium block mb-1.5">رقم محفظة المنصة ({selectedMethod.nameAr})</label>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-50 dark:bg-gray-800/60 rounded-xl px-3.5 py-3 font-mono text-base font-bold text-gray-900 dark:text-white tracking-wider text-left" dir="ltr">
                                    {PLATFORM_WALLETS[selectedMethod.id] || '—'}
                                </div>
                                <button
                                    onClick={() => handleCopy(PLATFORM_WALLETS[selectedMethod.id] || '')}
                                    className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-[#0052FF] text-white hover:bg-[#0052FF]/90 active:scale-95'}`}
                                >
                                    {copied ? <FiCheck size={18} /> : <FiCopy size={16} />}
                                </button>
                            </div>
                            {copied && <p className="text-[11px] text-emerald-500 mt-1.5 font-medium">✓ تم النسخ</p>}
                        </div>

                        {/* Form */}
                        <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-gray-100 dark:border-gray-800 p-4 space-y-3.5">
                            {/* Sender Phone */}
                            <div>
                                <label className="text-xs font-semibold text-gray-900 dark:text-white block mb-1">رقم هاتف المُرسل</label>
                                <input
                                    type="tel"
                                    value={senderPhone}
                                    onChange={e => setSenderPhone(e.target.value)}
                                    placeholder="الرقم الذي حوّلت منه"
                                    className="w-full bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-[#0052FF]/20 focus:border-[#0052FF] outline-none" dir="ltr"
                                />
                            </div>

                            {/* Transaction ID */}
                            <div>
                                <label className="text-xs font-semibold text-gray-900 dark:text-white block mb-1">
                                    رقم العملية <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={transactionRef}
                                    onChange={e => setTransactionRef(e.target.value)}
                                    placeholder="Transaction ID / رقم المرجع"
                                    className="w-full bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-[#0052FF]/20 focus:border-[#0052FF] outline-none" dir="ltr"
                                    required
                                />
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="text-xs font-semibold text-gray-900 dark:text-white block mb-1">إثبات الدفع</label>
                                <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileChange} className="hidden" />
                                {proofPreview ? (
                                    <div className="relative">
                                        <img src={proofPreview} alt="إثبات" className="w-full rounded-xl border border-gray-200 dark:border-gray-700 max-h-44 object-cover" />
                                        <button
                                            onClick={() => { setProofFile(null); setProofPreview(null); }}
                                            className="absolute top-2 left-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg"
                                        >
                                            <FiX size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-6 flex flex-col items-center gap-2 hover:border-[#0052FF]/40 hover:bg-[#0052FF]/5 transition-all group"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-[#0052FF]/10 transition-colors">
                                            <FiUpload className="text-gray-400 group-hover:text-[#0052FF]" size={20} />
                                        </div>
                                        <p className="text-xs text-gray-400 group-hover:text-[#0052FF] font-medium">اضغط لرفع صورة الإيصال</p>
                                        <p className="text-[10px] text-gray-300">PNG, JPG حتى 5MB</p>
                                    </button>
                                )}
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="text-xs font-semibold text-gray-900 dark:text-white block mb-1">ملاحظات (اختياري)</label>
                                <textarea
                                    value={paymentNotes}
                                    onChange={e => setPaymentNotes(e.target.value)}
                                    placeholder="أي معلومات إضافية..."
                                    rows={2}
                                    className="w-full bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-[#0052FF]/20 focus:border-[#0052FF] outline-none resize-none"
                                />
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-xl text-xs font-medium">
                                <FiAlertCircle size={14} />
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !transactionRef}
                            className="w-full bg-[#0052FF] text-white py-3.5 rounded-2xl font-bold text-sm hover:bg-[#0052FF]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#0052FF]/20 flex items-center justify-center gap-2 active:scale-[0.98]"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    جاري الإرسال...
                                </>
                            ) : (
                                <>
                                    <FiCheckCircle size={18} />
                                    تأكيد الدفع
                                </>
                            )}
                        </button>
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════
                    STEP 3 — Success
                ═══════════════════════════════════════════════════ */}
                {step === 3 && orderResult && (
                    <div className="text-center py-6 animate-in fade-in">
                        <div className="w-16 h-16 mx-auto bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4">
                            <FiCheckCircle className="text-emerald-500" size={34} />
                        </div>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white mb-1.5">تم إرسال طلبك!</h2>
                        <p className="text-gray-400 text-xs mb-5 leading-relaxed max-w-xs mx-auto">
                            سيتم مراجعة الدفعة من قبل فريقنا وتفعيل طلبك خلال ساعات قليلة.
                        </p>

                        <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-gray-100 dark:border-gray-800 p-4 inline-block mb-5">
                            <p className="text-[10px] text-gray-400 font-medium mb-0.5">رقم الطلب</p>
                            <p className="text-lg font-mono font-bold text-[#0052FF]">{orderResult.orderNumber}</p>
                        </div>

                        <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-2xl p-3.5 text-xs font-medium flex items-start gap-2.5 text-right max-w-sm mx-auto mb-6">
                            <FiClock className="text-amber-500 mt-0.5 shrink-0" size={16} />
                            <span>احتفظ برقم الطلب. ستصلك رسالة تأكيد على بريدك الإلكتروني فور الموافقة.</span>
                        </div>

                        <div className="flex gap-2.5 justify-center">
                            <Link href="/dashboard" className="bg-[#0052FF] text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-[#0052FF]/90 transition-colors">
                                لوحة التحكم
                            </Link>
                            <Link href="/explore" className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                تابع التسوق
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
