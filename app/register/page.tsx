'use client';

import { useState, useRef, useEffect, useMemo, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiUser, FiMail, FiLock, FiAlertCircle, FiAtSign, FiArrowLeft, FiCheckCircle, FiChevronDown, FiGlobe, FiShield, FiArrowRight } from 'react-icons/fi';
import { apiPost, apiGet, handleApiError } from '@/lib/safe-fetch';
import { motion, AnimatePresence } from 'framer-motion';
import {
    getCountries,
    getCountryCallingCode,
    isValidPhoneNumber,
    type CountryCode,
} from 'libphonenumber-js';

const COUNTRY_NAMES_AR: Record<string, string> = {
    SY: 'سوريا', IQ: 'العراق', YE: 'اليمن', PS: 'فلسطين', SA: 'السعودية',
    EG: 'مصر', AE: 'الإمارات', JO: 'الأردن', LB: 'لبنان', LY: 'ليبيا',
    SD: 'السودان', TN: 'تونس', DZ: 'الجزائر', MA: 'المغرب', OM: 'عُمان',
    KW: 'الكويت', BH: 'البحرين', QA: 'قطر', MR: 'موريتانيا', SO: 'الصومال',
};

function getFlag(cc: string): string {
    return cc.toUpperCase().replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

const PRIORITY_COUNTRIES: CountryCode[] = ['SY', 'IQ', 'YE', 'PS', 'SA', 'EG', 'AE'];

function getSortedCountries() {
    return getCountries().map(code => ({
        code,
        flag: getFlag(code),
        nameAr: COUNTRY_NAMES_AR[code] || code,
        dialCode: `+${getCountryCallingCode(code)}`,
    })).sort((a, b) => {
        const aPriority = PRIORITY_COUNTRIES.indexOf(a.code);
        const bPriority = PRIORITY_COUNTRIES.indexOf(b.code);
        if (aPriority !== -1 && bPriority !== -1) return aPriority - bPriority;
        if (aPriority !== -1) return -1;
        if (bPriority !== -1) return 1;
        return a.nameAr.localeCompare(b.nameAr, 'ar');
    });
}

const fadeInUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const staggerContainer = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };

function RegisterContent() {
    const router = useRouter();
    const countries = useMemo(() => getSortedCountries(), []);

    const [formData, setFormData] = useState({ name: '', email: '', username: '', password: '', confirmPassword: '' });
    const [selectedCountry, setSelectedCountry] = useState<CountryCode>('SY');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [phoneError, setPhoneError] = useState('');

    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const detectGeo = async () => {
            try {
                const res = await apiGet('/api/geo');
                if (res.country && COUNTRY_NAMES_AR[res.country]) {
                    setSelectedCountry(res.country as CountryCode);
                }
            } catch { /* Silent fail */ }
        };
        detectGeo();
    }, []);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setCountryDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const currentCountry = countries.find(c => c.code === selectedCountry);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        if (formData.password !== formData.confirmPassword) return setError('كلمات المرور غير متطابقة');
        if (formData.password.length < 6) return setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
        
        setLoading(true);

        try {
            const affiliateRef = typeof window !== 'undefined' ? (sessionStorage.getItem('affiliate_ref') || localStorage.getItem('affiliate_ref')) : undefined;

            await apiPost('/api/auth/register', {
                ...formData,
                phone: phoneNumber ? `+${getCountryCallingCode(selectedCountry)}${phoneNumber.replace(/^0+/, '')}` : undefined,
                country: currentCountry?.nameAr,
                countryCode: selectedCountry,
                ref: affiliateRef || undefined,
            });

            setSuccessMsg('تم إنشاء حسابك بنجاح! جاري تحويلك...');
            setTimeout(() => { router.push('/login?registered=true'); }, 2000);
        } catch (err: any) {
            setError(handleApiError(err));
            setLoading(false);
        }
    };

    const inputClass = "block w-full px-5 py-4 text-ink bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-ink focus:ring-4 focus:ring-ink/5 transition-all font-bold text-sm";

    return (
        <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden py-16 px-6 selection:bg-accent/20">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-accent/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>

            <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="max-w-xl w-full relative z-10">
                <motion.div variants={fadeInUp} className="text-center mb-12">
                     <Link href="/" className="inline-block mb-8 group">
                        <div className="w-16 h-16 mx-auto rounded-3xl bg-ink flex items-center justify-center text-white text-3xl font-black shadow-2xl shadow-ink/20 group-hover:scale-110 transition-transform">
                            ت
                        </div>
                    </Link>
                    <h1 className="text-4xl font-black text-ink mb-3 tracking-tighter">أنشئ حسابك المجاني</h1>
                    <p className="text-gray-400 font-bold">انضم لمئات المبدعين العرب وابدأ رحلتك التجارية اليوم.</p>
                </motion.div>

                <motion.div variants={fadeInUp} className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-2xl shadow-gray-200/50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-bl-[80px] pointer-events-none"></div>

                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        <AnimatePresence>
                            {error && <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-red-50 text-red-700 p-4 rounded-xl text-xs font-bold border border-red-100 flex items-center gap-3"><FiAlertCircle size={16} /> {error}</motion.div>}
                            {successMsg && <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-green-50 text-green-700 p-4 rounded-xl text-xs font-bold border border-green-100 flex items-center gap-3"><FiCheckCircle size={16} /> {successMsg}</motion.div>}
                        </AnimatePresence>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative">
                                <FiUser className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                                <input type="text" required placeholder="الاسم الكامل" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={`${inputClass} pr-12`} />
                            </div>
                            <div className="relative focus-within:z-10">
                                <FiAtSign className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                                <input type="text" required placeholder="اسم المستخدم" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase() })} className={`${inputClass} pr-12`} dir="ltr" />
                            </div>
                        </div>

                        <div className="relative">
                            <FiMail className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                            <input type="email" required placeholder="البريد الإلكتروني" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={`${inputClass} pr-12`} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative" ref={dropdownRef}>
                                <button type="button" onClick={() => setCountryDropdownOpen(!countryDropdownOpen)} className={`${inputClass} text-right flex items-center justify-between`}>
                                    <span className="flex items-center gap-2">
                                        <FiGlobe className="text-gray-300" />
                                        <span>{currentCountry?.nameAr}</span>
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <span className="text-xl">{currentCountry?.flag}</span>
                                        <FiChevronDown className={`text-gray-300 transition-transform ${countryDropdownOpen ? 'rotate-180' : ''}`} />
                                    </span>
                                </button>
                                <AnimatePresence>
                                    {countryDropdownOpen && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute z-50 mt-2 w-full bg-white border border-gray-100 rounded-2xl shadow-2xl max-h-60 overflow-y-auto p-2 space-y-1">
                                            {countries.map(c => (
                                                <button key={c.code} type="button" onClick={() => { setSelectedCountry(c.code as CountryCode); setCountryDropdownOpen(false); }} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${selectedCountry === c.code ? 'bg-accent text-white' : 'text-gray-500 hover:bg-gray-50 hover:text-ink'}`}>
                                                    <span className="flex items-center gap-2"><span>{c.flag}</span> <span>{c.nameAr}</span></span>
                                                    <span className="opacity-50">{c.dialCode}</span>
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black font-inter text-gray-400">{currentCountry?.dialCode}</div>
                                <input type="tel" placeholder="رقم الهاتف" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value.replace(/[^\d]/g, ''))} className={`${inputClass} pl-16`} dir="ltr" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative">
                                <FiLock className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                                <input type="password" required placeholder="كلمة المرور" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className={`${inputClass} pr-12`} />
                            </div>
                            <div className="relative">
                                <FiLock className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                                <input type="password" required placeholder="تأكيد المرور" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} className={`${inputClass} pr-12`} />
                            </div>
                        </div>

                        <motion.button 
                            whileHover={{ scale: 1.01 }} 
                            whileTap={{ scale: 0.99 }} 
                            type="submit" 
                            disabled={loading} 
                            className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all duration-300 flex items-center justify-center gap-3 shadow-2xl
                                ${loading ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-ink text-white hover:bg-black shadow-ink/20'}
                            `}
                        >
                            {loading ? <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" /> : <>Create My Account <FiArrowLeft className="rotate-180" size={16} /></>}
                        </motion.button>
                    </form>

                    <div className="mt-10 pt-10 border-t border-gray-50 text-center">
                        <p className="text-gray-400 text-xs font-bold">
                            هل تملك حساباً بالفعل؟ {' '}
                            <Link href="/login" className="text-accent underline underline-offset-4 decoration-accent/30 hover:decoration-accent transition-all">
                                سجل دخولك الآن
                            </Link>
                        </p>
                    </div>
                </motion.div>

                <motion.div variants={fadeInUp} className="text-center mt-12 space-y-6">
                    <p className="flex items-center justify-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <FiShield className="text-accent" /> Institutional Grade Security Protected
                    </p>
                </motion.div>
            </motion.div>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white"><div className="w-8 h-8 border-2 border-gray-100 border-t-accent rounded-full animate-spin"></div></div>}>
            <RegisterContent />
        </Suspense>
    );
}
