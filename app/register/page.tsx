'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiUser, FiMail, FiLock, FiAlertCircle, FiAtSign, FiArrowRight, FiCheckCircle, FiPhone, FiGlobe, FiSearch, FiChevronDown } from 'react-icons/fi';
import { apiPost, apiGet, handleApiError } from '@/lib/safe-fetch';
import { motion, AnimatePresence } from 'framer-motion';
import {
    getCountries,
    getCountryCallingCode,
    isValidPhoneNumber,
    type CountryCode,
} from 'libphonenumber-js';

// ─── All countries with Arabic names ───────────────────────────────
const COUNTRY_NAMES_AR: Record<string, string> = {
    SY: 'سوريا', IQ: 'العراق', YE: 'اليمن', PS: 'فلسطين', SA: 'السعودية',
    EG: 'مصر', AE: 'الإمارات', JO: 'الأردن', LB: 'لبنان', LY: 'ليبيا',
    SD: 'السودان', TN: 'تونس', DZ: 'الجزائر', MA: 'المغرب', OM: 'عُمان',
    KW: 'الكويت', BH: 'البحرين', QA: 'قطر', MR: 'موريتانيا', SO: 'الصومال',
    DJ: 'جيبوتي', KM: 'جزر القمر',
    TR: 'تركيا', IR: 'إيران', PK: 'باكستان', AF: 'أفغانستان',
    US: 'الولايات المتحدة', GB: 'المملكة المتحدة', DE: 'ألمانيا', FR: 'فرنسا',
    CA: 'كندا', AU: 'أستراليا', IN: 'الهند', CN: 'الصين', JP: 'اليابان',
    KR: 'كوريا الجنوبية', BR: 'البرازيل', MX: 'المكسيك', RU: 'روسيا',
    IT: 'إيطاليا', ES: 'إسبانيا', NL: 'هولندا', SE: 'السويد', NO: 'النرويج',
    DK: 'الدنمارك', FI: 'فنلندا', BE: 'بلجيكا', AT: 'النمسا', CH: 'سويسرا',
};

const COUNTRY_NAMES_EN: Record<string, string> = {
    SY: 'Syria', IQ: 'Iraq', YE: 'Yemen', PS: 'Palestine', SA: 'Saudi Arabia',
    EG: 'Egypt', AE: 'UAE', JO: 'Jordan', LB: 'Lebanon', LY: 'Libya',
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
        nameEn: COUNTRY_NAMES_EN[code] || code,
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

export default function RegisterPage() {
    const router = useRouter();
    const countries = useMemo(() => getSortedCountries(), []);

    const [formData, setFormData] = useState({ name: '', email: '', username: '', password: '', confirmPassword: '' });
    const [selectedCountry, setSelectedCountry] = useState<CountryCode>('SY');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
    const [countrySearch, setCountrySearch] = useState('');
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [phoneError, setPhoneError] = useState('');

    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // ─── 🌍 GEO-IP & COOKIE SYNC ──────────────────────────────
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

    const updateCountry = (code: CountryCode) => {
        setSelectedCountry(code);
        document.cookie = `user_country=${code}; path=/; max-age=${60*60*24*30}`;
    };

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setCountryDropdownOpen(false);
                setCountrySearch('');
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const filteredCountries = useMemo(() => {
        if (!countrySearch) return countries;
        const q = countrySearch.toLowerCase();
        return countries.filter(c => c.nameAr.includes(q) || c.nameEn.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || c.dialCode.includes(q));
    }, [countries, countrySearch]);

    const currentCountry = countries.find(c => c.code === selectedCountry);

    const validatePhone = (num: string, cc: CountryCode): string => {
        if (!num) return '';
        const full = `+${getCountryCallingCode(cc)}${num.replace(/^0+/, '')}`;
        try {
            if (!isValidPhoneNumber(full)) return 'رقم الهاتف غير صالح لهذه الدولة';
        } catch { return 'رقم الهاتف غير صالح'; }
        return '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        if (formData.password !== formData.confirmPassword) return setError('كلمات المرور غير متطابقة');
        if (formData.password.length < 6) return setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
        
        if (phoneNumber) {
            const pErr = validatePhone(phoneNumber, selectedCountry);
            if (pErr) { setPhoneError(pErr); return; }
        }

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

    const inputClass = "block w-full px-5 py-4 text-primary-charcoal bg-gray-50 border border-gray-200 rounded-2xl appearance-none focus:outline-none focus:ring-2 focus:ring-action-blue focus:border-transparent transition-all peer";
    const labelClass = "absolute text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-transparent px-2 peer-focus:px-2 peer-focus:text-action-blue peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 right-4 flex items-center gap-2";

    return (
        <div className="min-h-screen flex items-center justify-center bg-bg-light relative overflow-hidden py-12 px-4 shadow-inner transtion-all duration-500">
            <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="max-w-md w-full relative z-10">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-primary-charcoal mb-2 font-heading">أنشئ حسابك المجاني</h1>
                    <p className="text-text-muted text-base">ابدأ رحلتك في بيع المنتجات الرقمية بسهولة</p>
                </div>

                <motion.div variants={fadeInUp} className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 p-8 sm:p-10 relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-transparent rounded-bl-[100px] pointer-events-none" />
                    <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                        <AnimatePresence>
                            {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 text-red-700 px-5 py-3 rounded-xl flex items-center gap-3 text-sm font-medium"><FiAlertCircle /> {error}</motion.div>}
                            {successMsg && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-green-50 text-green-700 px-5 py-3 rounded-xl flex items-center gap-3 text-sm font-medium"><FiCheckCircle /> {successMsg}</motion.div>}
                        </AnimatePresence>

                        <div className="relative group">
                            <input type="text" id="name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClass} placeholder=" " />
                            <label htmlFor="name" className={labelClass}><FiUser /> الاسم الكامل</label>
                        </div>

                        <div className="relative group">
                            <input type="text" id="username" required value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase() })} className={inputClass} placeholder=" " dir="ltr" />
                            <label htmlFor="username" className={labelClass}><FiAtSign /> اسم المستخدم</label>
                        </div>

                        <div className="relative group">
                            <input type="email" id="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={inputClass} placeholder=" " />
                            <label htmlFor="email" className={labelClass}><FiMail /> البريد الإلكتروني</label>
                        </div>

                        <div className="space-y-3">
                            <div className="relative" ref={dropdownRef}>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">الدولة</label>
                                <button type="button" onClick={() => setCountryDropdownOpen(!countryDropdownOpen)} className="w-full flex items-center gap-3 px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl transition-all">
                                    <span className="text-xl">{currentCountry?.flag}</span>
                                    <span className="flex-1 text-right text-sm">{currentCountry?.nameAr}</span>
                                    <FiChevronDown className={`transition-transform ${countryDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>
                                <AnimatePresence>
                                    {countryDropdownOpen && (
                                        <motion.div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-2xl shadow-2xl max-h-72 overflow-y-auto">
                                            <div className="sticky top-0 bg-white p-2.5 border-b">
                                                <input type="text" value={countrySearch} onChange={(e) => setCountrySearch(e.target.value)} placeholder="ابحث عن دولة..." className="w-full bg-gray-50 border rounded-xl p-2.5 text-sm outline-none" />
                                            </div>
                                            {filteredCountries.map(c => (
                                                <button key={c.code} type="button" onClick={() => { updateCountry(c.code as CountryCode); setCountryDropdownOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-blue-50 ${selectedCountry === c.code ? 'bg-blue-50 text-blue-600 font-bold' : ''}`}>
                                                    <span>{c.flag}</span> <span className="flex-1 text-right">{c.nameAr}</span> <span className="text-xs text-gray-400">{c.dialCode}</span>
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1 block">رقم الهاتف (اختياري)</label>
                                <div className="flex gap-2">
                                    <div className="bg-gray-100 border rounded-2xl px-4 py-3.5 text-sm font-bold text-gray-600">{currentCountry?.dialCode}</div>
                                    <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value.replace(/[^\d]/g, ''))} className={`flex-1 bg-gray-50 border rounded-2xl px-4 py-3.5 text-sm outline-none font-mono ${phoneError ? 'border-red-300' : 'border-gray-200'}`} placeholder="رقم الهاتف" dir="ltr" />
                                </div>
                                {phoneError && <p className="text-xs text-red-500 mt-1">{phoneError}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <input type="password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className={inputClass} placeholder="الباسورد" />
                            <input type="password" required value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} className={inputClass} placeholder="تأكيد الباسورد" />
                        </div>

                        <motion.button whileHover={{ scale: 1.02 }} type="submit" disabled={loading} className="w-full py-5 rounded-2xl bg-action-blue text-white font-bold shadow-lg hover:shadow-action-blue/30 transition-all flex items-center justify-center gap-3">
                            {loading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>إنشاء حساب مجاني <FiArrowRight className="rotate-180" /></>}
                        </motion.button>
                    </form>
                    <div className="mt-8 text-center pt-6 border-t border-gray-100">
                        <Link href="/login" className="text-action-blue font-bold">لديك حساب؟ سجل دخولك</Link>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}
