'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiUser, FiMail, FiLock, FiAlertCircle, FiAtSign, FiArrowRight, FiCheckCircle, FiPhone, FiGlobe, FiSearch, FiChevronDown } from 'react-icons/fi';
import { apiPost, handleApiError } from '@/lib/safe-fetch';
import { motion, AnimatePresence } from 'framer-motion';
import {
    getCountries,
    getCountryCallingCode,
    parsePhoneNumber,
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
    // Common non-Arab
    TR: 'تركيا', IR: 'إيران', PK: 'باكستان', AF: 'أفغانستان',
    US: 'الولايات المتحدة', GB: 'المملكة المتحدة', DE: 'ألمانيا', FR: 'فرنسا',
    CA: 'كندا', AU: 'أستراليا', IN: 'الهند', CN: 'الصين', JP: 'اليابان',
    KR: 'كوريا الجنوبية', BR: 'البرازيل', MX: 'المكسيك', RU: 'روسيا',
    IT: 'إيطاليا', ES: 'إسبانيا', NL: 'هولندا', SE: 'السويد', NO: 'النرويج',
    DK: 'الدنمارك', FI: 'فنلندا', BE: 'بلجيكا', AT: 'النمسا', CH: 'سويسرا',
    PL: 'بولندا', CZ: 'التشيك', PT: 'البرتغال', GR: 'اليونان', IE: 'أيرلندا',
    NZ: 'نيوزيلندا', SG: 'سنغافورة', MY: 'ماليزيا', ID: 'إندونيسيا',
    TH: 'تايلاند', VN: 'فيتنام', PH: 'الفلبين', BD: 'بنغلاديش',
    NG: 'نيجيريا', KE: 'كينيا', ZA: 'جنوب أفريقيا', GH: 'غانا',
    ET: 'إثيوبيا', TZ: 'تنزانيا', UG: 'أوغندا', CI: 'كوت ديفوار',
    SN: 'السنغال', CM: 'الكاميرون', AO: 'أنغولا', MZ: 'موزمبيق',
    UA: 'أوكرانيا', RO: 'رومانيا', HU: 'المجر', BG: 'بلغاريا',
    HR: 'كرواتيا', RS: 'صربيا', SK: 'سلوفاكيا', SI: 'سلوفينيا',
    LT: 'ليتوانيا', LV: 'لاتفيا', EE: 'إستونيا',
    AR: 'الأرجنتين', CL: 'تشيلي', CO: 'كولومبيا', PE: 'بيرو',
    VE: 'فنزويلا', EC: 'الإكوادور', UY: 'أوروغواي',
    CU: 'كوبا', DO: 'الدومينيكان', GT: 'غواتيمالا', CR: 'كوستاريكا',
    PA: 'بنما', JM: 'جامايكا', HN: 'هندوراس', SV: 'السلفادور',
    NI: 'نيكاراغوا', BO: 'بوليفيا', PY: 'باراغواي',
    IL: 'إسرائيل', GE: 'جورجيا', AZ: 'أذربيجان', AM: 'أرمينيا',
    KZ: 'كازاخستان', UZ: 'أوزبكستان', TM: 'تركمانستان',
    KG: 'قرغيزستان', TJ: 'طاجيكستان', MN: 'منغوليا',
    NP: 'نيبال', LK: 'سريلانكا', MM: 'ميانمار', KH: 'كمبوديا',
    LA: 'لاوس', BN: 'بروناي', TL: 'تيمور الشرقية', MV: 'المالديف',
    IS: 'آيسلندا', LU: 'لوكسمبورغ', MT: 'مالطا', CY: 'قبرص',
    AL: 'ألبانيا', ME: 'الجبل الأسود', MK: 'مقدونيا الشمالية',
    BA: 'البوسنة', XK: 'كوسوفو', MD: 'مولدوفا', BY: 'بيلاروسيا',
    RW: 'رواندا', MG: 'مدغشقر', MW: 'مالاوي', ZM: 'زامبيا',
    ZW: 'زيمبابوي', BW: 'بوتسوانا', NA: 'ناميبيا', SZ: 'إسواتيني',
    LS: 'ليسوتو', BF: 'بوركينا فاسو', ML: 'مالي', NE: 'النيجر',
    TD: 'تشاد', CF: 'أفريقيا الوسطى', CG: 'الكونغو', CD: 'الكونغو الديمقراطية',
    GA: 'الغابون', GQ: 'غينيا الاستوائية', ST: 'ساو تومي وبرينسيبي',
    GM: 'غامبيا', GN: 'غينيا', GW: 'غينيا بيساو', SL: 'سيراليون',
    LR: 'ليبيريا', TG: 'توغو', BJ: 'بنين', ER: 'إريتريا',
    BI: 'بوروندي', SS: 'جنوب السودان', SC: 'سيشيل', MU: 'موريشيوس',
    CV: 'الرأس الأخضر', FJ: 'فيجي', PG: 'بابوا غينيا الجديدة',
    WS: 'ساموا', TO: 'تونغا', VU: 'فانواتو', SB: 'جزر سليمان',
    HT: 'هايتي', TT: 'ترينيداد وتوباغو', BB: 'باربادوس',
    BS: 'الباهاماس', BZ: 'بليز', GY: 'غيانا', SR: 'سورينام',
    AG: 'أنتيغوا و باربودا', DM: 'دومينيكا', GD: 'غرينادا',
    KN: 'سانت كيتس ونيفيس', LC: 'سانت لوسيا', VC: 'سانت فينسنت',
    HK: 'هونغ كونغ', MO: 'ماكاو', TW: 'تايوان',
};

// English names as fallback
const COUNTRY_NAMES_EN: Record<string, string> = {
    SY: 'Syria', IQ: 'Iraq', YE: 'Yemen', PS: 'Palestine', SA: 'Saudi Arabia',
    EG: 'Egypt', AE: 'UAE', JO: 'Jordan', LB: 'Lebanon', LY: 'Libya',
    SD: 'Sudan', TN: 'Tunisia', DZ: 'Algeria', MA: 'Morocco', OM: 'Oman',
    KW: 'Kuwait', BH: 'Bahrain', QA: 'Qatar', MR: 'Mauritania', SO: 'Somalia',
    US: 'United States', GB: 'United Kingdom', DE: 'Germany', FR: 'France',
    CA: 'Canada', AU: 'Australia', IN: 'India', CN: 'China', JP: 'Japan',
    TR: 'Turkey', IR: 'Iran', PK: 'Pakistan',
};

// Flag emoji from country code
function getFlag(cc: string): string {
    return cc
        .toUpperCase()
        .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

// Priority countries for the top of the list
const PRIORITY_COUNTRIES: CountryCode[] = ['SY', 'IQ', 'YE', 'PS', 'SA', 'EG', 'AE'];

// Get all countries sorted properly
function getSortedCountries(): { code: CountryCode; flag: string; nameAr: string; nameEn: string; dialCode: string }[] {
    const allCodes = getCountries();

    return allCodes
        .map(code => ({
            code,
            flag: getFlag(code),
            nameAr: COUNTRY_NAMES_AR[code] || code,
            nameEn: COUNTRY_NAMES_EN[code] || code,
            dialCode: `+${getCountryCallingCode(code)}`,
        }))
        .sort((a, b) => {
            const aPriority = PRIORITY_COUNTRIES.indexOf(a.code);
            const bPriority = PRIORITY_COUNTRIES.indexOf(b.code);
            if (aPriority !== -1 && bPriority !== -1) return aPriority - bPriority;
            if (aPriority !== -1) return -1;
            if (bPriority !== -1) return 1;
            return a.nameAr.localeCompare(b.nameAr, 'ar');
        });
}

// ─── Animations ────────────────────────────────────────────────────
const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
};

// ═══════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════
export default function RegisterPage() {
    const router = useRouter();
    const countries = useMemo(() => getSortedCountries(), []);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
    });
    const [selectedCountry, setSelectedCountry] = useState<CountryCode>('SY');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
    const [countrySearch, setCountrySearch] = useState('');
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [phoneError, setPhoneError] = useState('');

    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Close dropdown on outside click
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

    // Focus search when dropdown opens
    useEffect(() => {
        if (countryDropdownOpen) searchInputRef.current?.focus();
    }, [countryDropdownOpen]);

    // Filter countries by search
    const filteredCountries = useMemo(() => {
        if (!countrySearch) return countries;
        const q = countrySearch.toLowerCase();
        return countries.filter(c =>
            c.nameAr.includes(q) ||
            c.nameEn.toLowerCase().includes(q) ||
            c.code.toLowerCase().includes(q) ||
            c.dialCode.includes(q)
        );
    }, [countries, countrySearch]);

    const currentCountry = countries.find(c => c.code === selectedCountry);

    // Validate phone
    const validatePhone = (num: string, cc: CountryCode): string => {
        if (!num) return '';
        const full = `+${getCountryCallingCode(cc)}${num.replace(/^0+/, '')}`;
        try {
            if (!isValidPhoneNumber(full)) return 'رقم الهاتف غير صالح لهذه الدولة';
        } catch {
            return 'رقم الهاتف غير صالح';
        }
        return '';
    };

    const getFullPhone = (): string => {
        if (!phoneNumber) return '';
        return `+${getCountryCallingCode(selectedCountry)}${phoneNumber.replace(/^0+/, '')}`;
    };

    const handleGoogleSignIn = async () => {
        setGoogleLoading(true);
        await signIn('google', { callbackUrl: '/dashboard' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        if (formData.password !== formData.confirmPassword) {
            setError('كلمات المرور غير متطابقة');
            return;
        }
        if (formData.password.length < 6) {
            setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
            return;
        }
        if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
            setError('اسم المستخدم يجب أن يحتوي على أحرف وأرقام فقط');
            return;
        }
        // Validate phone if provided
        if (phoneNumber) {
            const pErr = validatePhone(phoneNumber, selectedCountry);
            if (pErr) { setPhoneError(pErr); return; }
        }

        setLoading(true);
        try {
            await apiPost('/api/auth/register', {
                name: formData.name,
                email: formData.email,
                username: formData.username.toLowerCase(),
                password: formData.password,
                phone: phoneNumber ? getFullPhone() : undefined,
                country: currentCountry?.nameAr,
                countryCode: selectedCountry,
            });

            setSuccessMsg('تم إنشاء حسابك بنجاح! جاري تحويلك لتسجيل الدخول...');
            setTimeout(() => { router.push('/login?registered=true'); }, 2000);
        } catch (err: any) {
            setError(handleApiError(err));
            setLoading(false);
        }
    };

    // ─── Input class helper ────────────────────────────────────────
    const inputClass = "block w-full px-5 py-4 text-primary-charcoal bg-gray-50 border border-gray-200 rounded-2xl appearance-none focus:outline-none focus:ring-2 focus:ring-action-blue focus:border-transparent transition-all peer";
    const labelClass = "absolute text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-transparent px-2 peer-focus:px-2 peer-focus:text-action-blue peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 right-4 flex items-center gap-2";

    return (
        <div className="min-h-screen flex items-center justify-center bg-bg-light relative overflow-hidden py-12 px-4 transition-colors duration-300">
            {/* Background blobs */}
            <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-action-blue/10 rounded-full blur-[80px] -z-10 pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

            <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="max-w-md w-full relative z-10">
                {/* Logo */}
                <motion.div variants={fadeInUp} className="text-center mb-8">
                    <Link href="/" className="inline-block mb-4">
                        <motion.div
                            whileHover={{ rotate: 180, scale: 1.1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 10 }}
                            className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-action-blue to-purple-600 flex items-center justify-center text-white shadow-xl shadow-action-blue/20"
                        >
                            <span className="text-3xl font-bold">م</span>
                        </motion.div>
                    </Link>
                    <h1 className="text-4xl font-bold text-primary-charcoal mb-2 font-heading">أنشئ حسابك المجاني</h1>
                    <p className="text-text-muted text-base">ابدأ رحلتك في بيع المنتجات الرقمية بسهولة</p>
                </motion.div>

                {/* Card */}
                <motion.div variants={fadeInUp} className="bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-gray-100 p-8 sm:p-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-action-blue/5 to-transparent rounded-bl-[100px] pointer-events-none" />

                    {/* Google Sign-In */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={googleLoading}
                        className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl border-2 border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-bold text-gray-700 shadow-sm mb-6"
                    >
                        {googleLoading ? (
                            <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
                        ) : (
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                        )}
                        {googleLoading ? 'جاري التسجيل...' : 'إنشاء حساب بواسطة Google'}
                    </motion.button>

                    {/* Divider */}
                    <div className="relative flex items-center mb-6">
                        <div className="flex-1 border-t border-gray-200" />
                        <span className="px-4 text-sm text-gray-400 font-medium">أو ملء البيانات</span>
                        <div className="flex-1 border-t border-gray-200" />
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                        {/* Error / Success */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                                    className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl flex items-start gap-3 shadow-sm shadow-red-100"
                                >
                                    <FiAlertCircle className="text-xl flex-shrink-0 mt-0.5" />
                                    <p className="font-medium text-sm leading-relaxed">{error}</p>
                                </motion.div>
                            )}
                            {successMsg && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                                    className="bg-green-50 border border-green-200 text-green-700 px-5 py-4 rounded-xl flex items-start gap-3 shadow-sm shadow-green-100"
                                >
                                    <FiCheckCircle className="text-xl flex-shrink-0 mt-0.5" />
                                    <p className="font-medium text-sm leading-relaxed">{successMsg}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Name */}
                        <div className="relative group">
                            <input type="text" id="name" required value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className={inputClass} placeholder=" " />
                            <label htmlFor="name" className={labelClass}>
                                <FiUser className="text-lg" />الاسم الكامل
                            </label>
                        </div>

                        {/* Username */}
                        <div>
                            <div className="relative group">
                                <input type="text" id="username" required value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
                                    className={inputClass} placeholder=" " dir="ltr" />
                                <label htmlFor="username" className={labelClass}>
                                    <FiAtSign className="text-lg" />اسم المستخدم
                                </label>
                            </div>
                            <p className="text-xs text-text-muted mt-2 dir-ltr text-right">
                                platform.com/<span className="font-bold text-action-blue">{formData.username || 'username'}</span>
                            </p>
                        </div>

                        {/* Email */}
                        <div className="relative group">
                            <input type="email" id="email" required value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className={inputClass} placeholder=" " />
                            <label htmlFor="email" className={labelClass}>
                                <FiMail className="text-lg" />البريد الإلكتروني
                            </label>
                        </div>

                        {/* ══════════════════════════════════════════
                            COUNTRY + PHONE (NEW)
                        ══════════════════════════════════════════ */}
                        <div className="space-y-3">
                            {/* Country Selector */}
                            <div className="relative" ref={dropdownRef}>
                                <label className="text-xs font-semibold text-gray-500 mb-1.5 block flex items-center gap-1.5">
                                    <FiGlobe className="text-action-blue" size={14} />
                                    الدولة
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                                    className="w-full flex items-center gap-3 px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl hover:border-action-blue/40 focus:ring-2 focus:ring-action-blue/20 focus:border-action-blue transition-all text-right"
                                >
                                    <span className="text-2xl">{currentCountry?.flag}</span>
                                    <span className="flex-1 font-medium text-primary-charcoal text-sm">{currentCountry?.nameAr}</span>
                                    <span className="text-xs text-gray-400 font-mono dir-ltr">{currentCountry?.dialCode}</span>
                                    <FiChevronDown className={`text-gray-400 transition-transform ${countryDropdownOpen ? 'rotate-180' : ''}`} size={16} />
                                </button>

                                {/* Dropdown */}
                                <AnimatePresence>
                                    {countryDropdownOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -8, scale: 0.97 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -8, scale: 0.97 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-2xl shadow-2xl shadow-black/10 overflow-hidden max-h-72"
                                        >
                                            {/* Search */}
                                            <div className="sticky top-0 bg-white border-b border-gray-100 px-3 py-2.5">
                                                <div className="relative">
                                                    <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                                    <input
                                                        ref={searchInputRef}
                                                        type="text"
                                                        value={countrySearch}
                                                        onChange={(e) => setCountrySearch(e.target.value)}
                                                        placeholder="ابحث عن دولة..."
                                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 pr-10 py-2.5 text-sm text-primary-charcoal placeholder:text-gray-400 focus:ring-2 focus:ring-action-blue/20 focus:border-action-blue outline-none"
                                                    />
                                                </div>
                                            </div>

                                            {/* Country list */}
                                            <div className="overflow-y-auto max-h-52">
                                                {filteredCountries.length === 0 ? (
                                                    <p className="text-center text-sm text-gray-400 py-6">لم يتم العثور على نتائج</p>
                                                ) : (
                                                    <>
                                                        {/* Priority separator */}
                                                        {!countrySearch && (
                                                            <div className="px-4 pt-2 pb-1">
                                                                <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">الدول الرئيسية</span>
                                                            </div>
                                                        )}
                                                        {filteredCountries.map((c, idx) => {
                                                            const isPriority = PRIORITY_COUNTRIES.includes(c.code);
                                                            const showSeparator = !countrySearch && idx === PRIORITY_COUNTRIES.length &&
                                                                filteredCountries[idx - 1] && PRIORITY_COUNTRIES.includes(filteredCountries[idx - 1].code);
                                                            return (
                                                                <div key={c.code}>
                                                                    {showSeparator && (
                                                                        <div className="border-t border-gray-100 mx-4 my-1">
                                                                            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block pt-2 pb-1">جميع الدول</span>
                                                                        </div>
                                                                    )}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setSelectedCountry(c.code);
                                                                            setCountryDropdownOpen(false);
                                                                            setCountrySearch('');
                                                                            setPhoneNumber('');
                                                                            setPhoneError('');
                                                                        }}
                                                                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-action-blue/5 transition-colors ${selectedCountry === c.code ? 'bg-action-blue/10 text-action-blue font-semibold' : 'text-gray-700'}`}
                                                                    >
                                                                        <span className="text-xl">{c.flag}</span>
                                                                        <span className="flex-1 text-right">{c.nameAr}</span>
                                                                        <span className="text-xs text-gray-400 font-mono dir-ltr">{c.dialCode}</span>
                                                                        {selectedCountry === c.code && <FiCheckCircle className="text-action-blue" size={14} />}
                                                                    </button>
                                                                </div>
                                                            );
                                                        })}
                                                    </>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Phone Input */}
                            <div>
                                <label className="text-xs font-semibold text-gray-500 mb-1.5 block flex items-center gap-1.5">
                                    <FiPhone className="text-action-blue" size={14} />
                                    رقم الهاتف <span className="text-gray-300 font-normal">(اختياري)</span>
                                </label>
                                <div className="flex gap-2">
                                    {/* Dial code badge */}
                                    <div className="flex items-center gap-1.5 bg-gray-100 border border-gray-200 rounded-2xl px-4 py-3.5 shrink-0">
                                        <span className="text-lg">{currentCountry?.flag}</span>
                                        <span className="text-sm font-mono font-bold text-gray-600 dir-ltr">{currentCountry?.dialCode}</span>
                                    </div>
                                    {/* Phone field */}
                                    <input
                                        type="tel"
                                        value={phoneNumber}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/[^\d]/g, '');
                                            setPhoneNumber(val);
                                            setPhoneError('');
                                        }}
                                        onBlur={() => {
                                            if (phoneNumber) setPhoneError(validatePhone(phoneNumber, selectedCountry));
                                        }}
                                        placeholder="رقم الهاتف بدون الصفر"
                                        className={`flex-1 bg-gray-50 border rounded-2xl px-4 py-3.5 text-sm text-primary-charcoal placeholder:text-gray-400 focus:ring-2 focus:ring-action-blue/20 focus:border-action-blue outline-none transition-all dir-ltr text-left font-mono ${phoneError ? 'border-red-300 focus:ring-red-200' : 'border-gray-200'}`}
                                        dir="ltr"
                                    />
                                </div>
                                {phoneError && (
                                    <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                                        <FiAlertCircle size={12} />{phoneError}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Passwords */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative group">
                                <input type="password" id="password" required value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className={inputClass} placeholder=" " />
                                <label htmlFor="password" className={labelClass}>
                                    <FiLock className="text-lg" />كلمة المرور
                                </label>
                            </div>
                            <div className="relative group">
                                <input type="password" id="confirmPassword" required value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    className={inputClass} placeholder=" " />
                                <label htmlFor="confirmPassword" className={labelClass}>
                                    <FiLock className="text-lg" />تأكيد المرور
                                </label>
                            </div>
                        </div>

                        {/* Submit */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading || !!successMsg}
                            className={`w-full text-lg py-5 rounded-2xl flex items-center justify-center gap-3 font-bold transition-all duration-300 shadow-xl text-white mt-4
                                ${successMsg ? 'bg-green-500 cursor-not-allowed shadow-none' : loading ? 'bg-blue-400 cursor-not-allowed shadow-none' : 'bg-action-blue hover:bg-blue-700 shadow-action-blue/30'}
                            `}
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : successMsg ? (
                                <>تم إنشاء الحساب <FiCheckCircle /></>
                            ) : (
                                <>إنشاء حساب مجاني <FiArrowRight className="rotate-180" /></>
                            )}
                        </motion.button>
                    </form>

                    {/* Login Link */}
                    <div className="mt-8 text-center border-t border-gray-100 pt-6">
                        <p className="text-text-muted font-medium">
                            لديك حساب بالفعل؟{' '}
                            <Link href="/login" className="text-action-blue hover:text-blue-700 font-bold transition-colors">
                                سجل دخولك الآن
                            </Link>
                        </p>
                    </div>
                </motion.div>

                {/* Back to Home */}
                <motion.div variants={fadeInUp} className="text-center mt-8">
                    <Link href="/" className="text-text-muted hover:text-primary-charcoal transition-colors text-sm font-medium flex items-center justify-center gap-2 group">
                        <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                        العودة للمنصة
                    </Link>
                </motion.div>
            </motion.div>
        </div>
    );
}
