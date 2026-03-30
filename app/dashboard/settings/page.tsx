'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { FiUser, FiMail, FiLock, FiGlobe, FiBell, FiCreditCard, FiShield, FiSave, FiUpload, FiEye, FiEyeOff, FiLink, FiCheckCircle, FiXCircle, FiCopy, FiDroplet, FiType, FiLayout, FiSquare, FiCheck } from 'react-icons/fi';
import { apiGet, apiPost, apiPut, apiDelete, handleApiError } from '@/lib/safe-fetch';
import FileUploader from '@/components/ui/FileUploader';
import PayoutSettings from '@/components/dashboard/PayoutSettings';
import DangerZone from '@/components/dashboard/DangerZone';
import toast from 'react-hot-toast';
import { FiAlertCircle, FiTrendingUp, FiExternalLink } from 'react-icons/fi';

export default function SettingsPage() {
    const { data: session } = useSession();
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');
    const [saving, setSaving] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [calendarConnected, setCalendarConnected] = useState(false);
    const [integrationMsg, setIntegrationMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Profile Settings
    const [profileData, setProfileData] = useState({
        name: '',
        username: '',
        email: '',
        bio: '',
        avatar: '',
        coverImage: '',
        phone: '',
        website: '',
        brandColor: '',
        brandSecondaryColor: '',
        brandFont: 'default',
        brandButtonStyle: 'rounded',
        brandLayout: 'grid',
        storeBanner: '',
        storeTagline: '',
        facebook: '',
        instagram: '',
        twitter: '',
        payoutMethod: '',
        paypalEmail: '',
        cryptoWallet: '',
        shamCashNumber: '',
        omtNumber: '',
        zainCashNumber: '',
        vodafoneCash: '',
        mtncashNumber: '',
        twoFactorEnabled: false,
        phoneVisibility: 'HIDDEN' as 'PUBLIC' | 'HIDDEN' | 'WHATSAPP_ONLY',
        customDomain: '',
    });

    const [show2FASetup, setShow2FASetup] = useState(false);
    const [qrCode, setQrCode] = useState('');
    const [tempSecret, setTempSecret] = useState('');
    const [userToken, setUserToken] = useState('');
    const [verifying2FA, setVerifying2FA] = useState(false);

    const [originalUsername, setOriginalUsername] = useState('');
    const [showUsernameWarning, setShowUsernameWarning] = useState(false);

    // Password Settings
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Notification Settings
    const [notificationSettings, setNotificationSettings] = useState({
        emailNotifications: true,
        orderNotifications: true,
        marketingEmails: false,
        weeklyReport: true
    });

    // Payment Settings
    const [paymentData, setPaymentData] = useState({
        bankName: '',
        accountNumber: '',
        accountName: '',
        paypalEmail: ''
    });

    // Verification Request (Phase 10)
    const [verificationRequest, setVerificationRequest] = useState<{
        id: string;
        documentUrl: string;
        documentType: string;
        status: 'PENDING' | 'APPROVED' | 'REJECTED';
        rejectionReason?: string;
    } | null>(null);
    const [verifyingDoc, setVerifyingDoc] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await apiGet('/api/user/profile');
                setProfileData({
                    name: data.name || '',
                    username: data.username || '',
                    email: data.email || '',
                    bio: data.bio || '',
                    avatar: data.avatar || '',
                    coverImage: data.coverImage || '',
                    phone: data.phone || '',
                    website: data.website || '',
                    brandColor: data.brandColor || '#10B981',
                    brandSecondaryColor: data.brandSecondaryColor || '#059669',
                    brandFont: data.brandFont || 'default',
                    brandButtonStyle: data.brandButtonStyle || 'rounded',
                    brandLayout: data.brandLayout || 'grid',
                    storeBanner: data.storeBanner || '',
                    storeTagline: data.storeTagline || '',
                    facebook: data.facebook || '',
                    instagram: data.instagram || '',
                    twitter: data.twitter || '',
                    payoutMethod: data.payoutMethod || '',
                    paypalEmail: data.paypalEmail || '',
                    cryptoWallet: data.cryptoWallet || '',
                    shamCashNumber: data.shamCashNumber || '',
                    omtNumber: data.omtNumber || '',
                    zainCashNumber: data.zainCashNumber || '',
                    vodafoneCash: data.vodafoneCash || '',
                    mtncashNumber: data.mtncashNumber || '',
                    twoFactorEnabled: data.twoFactorEnabled || false,
                    phoneVisibility: data.phoneVisibility || 'HIDDEN',
                    customDomain: data.customDomain || '',
                });
                setOriginalUsername(data.username || '');
                setPaymentData({
                    bankName: data.bankName || '',
                    accountNumber: data.accountNumber || '',
                    accountName: data.accountName || '',
                    paypalEmail: ''
                });
                setCalendarConnected(data.googleCalendarConnected || false);

                // Fetch verification status
                const vReq = await apiGet('/api/seller/verification');
                setVerificationRequest(vReq?.request || null);
            } catch (error) {
                console.error('Error fetching profile:', handleApiError(error));
            }
        };

        if (session?.user) {
            fetchProfile();
        }

        // Check URL params for integration status
        const successParam = searchParams.get('success');
        const errorParam = searchParams.get('error');
        if (successParam === 'calendar_connected') {
            setCalendarConnected(true);
            setIntegrationMsg({ type: 'success', text: 'تم ربط Google Calendar بنجاح! ✅' });
        } else if (errorParam) {
            setIntegrationMsg({ type: 'error', text: 'فشل ربط Google Calendar. حاول مرة أخرى.' });
        }
    }, [session, searchParams]);

    const saveProfile = async () => {
        setSaving(true);
        try {
            await apiPut('/api/user/profile', profileData);
            toast.success('تم حفظ الإعدادات بنجاح!');
        } catch (error) {
            console.error('Error saving profile:', handleApiError(error));
            toast.error('حدث خطأ في الحفظ: ' + handleApiError(error));
        } finally {
            setSaving(false);
        }
    };

    const applyPalette = (p: { primary: string, secondary: string }) => {
        setProfileData({ ...profileData, brandColor: p.primary, brandSecondaryColor: p.secondary });
    };

    const savePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('كلمات المرور غير متطابقة');
            return;
        }

        setSaving(true);
        try {
            await apiPut('/api/user/password', passwordData);
            toast.success('تم تغيير كلمة المرور بنجاح!');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            console.error('Error changing password:', handleApiError(error));
            toast.error('فشل تغيير كلمة المرور: ' + handleApiError(error));
        } finally {
            setSaving(false);
        }
    };

    const setup2FA = async () => {
        const loadingToast = toast.loading('جاري تجهيز إعدادات الأمان...');
        try {
            const data = await apiPost<{ qrCode: string, secret: string }>('/api/user/2fa/setup');
            toast.dismiss(loadingToast);
            
            if (data.qrCode) {
                setQrCode(data.qrCode);
                setTempSecret(data.secret);
                setShow2FASetup(true);
            }
        } catch (error) {
            toast.dismiss(loadingToast);
            console.error('2FA fetch error:', error);
            toast.error('حدث خطأ في الاتصال بالخادم');
        }
    };

    const verifyAndEnable2FA = async () => {
        if (!userToken) return toast.error('يرجى إدخال الرمز');
        setVerifying2FA(true);
        try {
            await apiPost('/api/user/2fa/verify', { token: userToken, secret: tempSecret });
            toast.success('تم تفعيل التحقق بخطوتين بنجاح! 🔒');
            setProfileData({ ...profileData, twoFactorEnabled: true });
            setShow2FASetup(false);
            setUserToken('');
        } catch (error) {
            toast.error('خطأ في التحقق');
        } finally {
            setVerifying2FA(false);
        }
    };

    const disable2FA = async () => {
        if (!confirm('هل أنت متأكد من تعطيل التحقق بخطوتين؟ هذا يقلل من أمان حسابك.')) return;
        try {
            await apiDelete('/api/user/2fa/verify');
            toast.success('تم تعطيل التحقق بخطوتين');
            setProfileData({ ...profileData, twoFactorEnabled: false });
        } catch (error) {
            toast.error('فشل التعطيل');
        }
    };

    const submitVerification = async (url: string, type: string) => {
        setVerifyingDoc(true);
        try {
            const res = await apiPost('/api/seller/verification', { documentUrl: url, documentType: type });
            setVerificationRequest(res.request);
            toast.success('تم إرسال طلب التوثيق للمراجعة! ⏳');
        } catch (error) {
            toast.error(handleApiError(error));
        } finally {
            setVerifyingDoc(false);
        }
    };

    // ─── Brand Identity Constants ──────────────────────────────
    const COLOR_PALETTES = [
        { name: 'احترافي زمردي (v4.2)', primary: '#10B981', secondary: '#059669' },
        { name: 'أزرق ملكي', primary: '#1E40AF', secondary: '#1E293B' },
        { name: 'بنفسجي فاخر', primary: '#6D28D9', secondary: '#1E1B4B' },
        { name: 'ذهبي كلاسيكي', primary: '#92400E', secondary: '#1C1917' },
    ];

    const FONT_OPTIONS = [
        { id: 'default', name: 'افتراضي', desc: 'IBM Plex Sans Arabic', preview: 'خط واضح ومهني' },
        { id: 'modern', name: 'عصري', desc: 'Outfit + Inter', preview: 'خط هندسي وحديث' },
        { id: 'elegant', name: 'أنيق', desc: 'Playfair Display', preview: 'خط كلاسيكي فاخر' },
    ];

    const BUTTON_STYLES = [
        { id: 'rounded', name: 'مدور خفيف', radius: '12px' },
        { id: 'pill', name: 'كبسولة', radius: '9999px' },
        { id: 'square', name: 'حاد', radius: '0px' },
    ];

    const btnRadius = BUTTON_STYLES.find(b => b.id === profileData.brandButtonStyle)?.radius || '8px';

    const tabs = [
        { id: 'profile', name: 'الملف الشخصي', icon: FiUser },
        { id: 'brand', name: 'الهوية البصرية', icon: FiDroplet },
        { id: 'security', name: 'الأمان', icon: FiLock },
        { id: 'notifications', name: 'الإشعارات', icon: FiBell },
        { id: 'payment', name: 'الدفع', icon: FiCreditCard },
        { id: 'integrations', name: 'التكاملات', icon: FiLink },
        { id: 'verification', name: 'توثيق الحساب', icon: FiCheckCircle },
        { id: 'privacy', name: 'الخصوصية', icon: FiShield }
    ];

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-[#10B981] dark:text-white">الإعدادات</h1>
                    <p className="text-sm sm:text-base text-text-muted mt-2">إدارة حسابك وتفضيلاتك</p>
                </div>
                {profileData.username && (
                    <button
                        onClick={() => {
                            let url = "";
                            if (profileData.customDomain) {
                                url = profileData.customDomain.startsWith('http') 
                                    ? profileData.customDomain 
                                    : `https://${profileData.customDomain}`;
                            } else {
                                url = `${window.location.origin}/${profileData.username}`;
                            }
                            navigator.clipboard.writeText(url);
                            toast.success('تم نسخ رابط متجرك بنجاح!');
                        }}
                        className="group relative flex items-center gap-2 px-6 py-3 bg-[#0A0A0A] dark:bg-card-white border border-emerald-500/20 dark:border-gray-700 hover:border-emerald-600 text-[#10B981] dark:text-white shadow-lg shadow-[#10B981]/20 transition-all hover:-translate-y-0.5 rounded-xl"
                    >
                        <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white-50 dark:bg-blue-900/20 flex items-center justify-center text-[#10B981] group-hover:bg-emerald-700 text-white group-hover:text-white transition-colors">
                            <FiCopy size={14} />
                        </div>
                        <div className="text-right">
                            <span className="block text-xs text-text-muted font-bold">رابط المتجر المباشر</span>
                            <span className="block text-sm font-bold truncate max-w-[150px]">
                                {profileData.customDomain || `${profileData.username}.tmleen.com`}
                            </span>
                        </div>
                        <FiExternalLink className="text-gray-300 group-hover:text-[#10B981]" size={14} />
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar Tabs */}
                <div className="lg:col-span-1 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                    <div className="card flex lg:flex-col gap-2 p-2 sm:p-4 min-w-max lg:min-w-0 bg-[#0A0A0A] dark:bg-card-white rounded-xl sm:rounded-xl shadow-lg shadow-[#10B981]/20 border border-white/10 dark:border-gray-800">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 lg:w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-emerald-700 text-white font-medium shadow-md'
                                    : 'text-text-muted hover:bg-[#111111] dark:hover:bg-gray-800'
                                    }`}
                            >
                                <tab.icon className="text-xl shrink-0" />
                                <span>{tab.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="lg:col-span-3">
                    <div className="card min-h-[500px] bg-[#0A0A0A] dark:bg-card-white rounded-xl sm:rounded-xl p-6 sm:p-8 shadow-lg shadow-[#10B981]/20 border border-white/10 dark:border-gray-800">
                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <div className="space-y-8 ">
                                <h2 className="text-xl sm:text-2xl font-bold text-[#10B981] dark:text-white border-b border-white/10 dark:border-gray-800 pb-4">الملف الشخصي</h2>

                                {/* Avatar & Cover Upload */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Avatar */}
                                    <div className="space-y-3">
                                        <label className="label">الصورة الشخصية (Avatar)</label>
                                        <div className="flex flex-col items-center gap-4 p-4 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-[#111111] dark:bg-gray-800/50">
                                            <div className="w-24 h-24 rounded-xl overflow-hidden bg-emerald-700 text-white flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-[#10B981]/20 ring-4 ring-white dark:ring-gray-900 border border-white/10 dark:border-gray-800 shrink-0 relative group">
                                                {profileData.avatar ? (
                                                    <img src={profileData.avatar} alt="Avatar" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                                ) : (
                                                    <span>{profileData.name.charAt(0).toUpperCase() || 'U'}</span>
                                                )}
                                            </div>
                                            <div className="w-full">
                                                <FileUploader
                                                    onUploadSuccess={(urls: string[]) => setProfileData({ ...profileData, avatar: urls[0] })}
                                                    maxSize={2 * 1024 * 1024} // 2MB in bytes
                                                    accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Cover Image */}
                                    <div className="space-y-3">
                                        <label className="label">صورة الغلاف (Cover)</label>
                                        <div className="flex flex-col gap-4 p-4 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-[#111111] dark:bg-gray-800/50">
                                            <div className="h-24 w-full rounded-xl overflow-hidden bg-emerald-700 text-white flex items-center justify-center text-white font-bold shadow-inner relative group">
                                                {profileData.coverImage ? (
                                                    <img src={profileData.coverImage} alt="Cover" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                                ) : (
                                                    <span className="opacity-50 text-sm">أضف غلافاً مميزاً لمتجرك</span>
                                                )}
                                            </div>
                                            <div className="w-full">
                                                <FileUploader
                                                    onUploadSuccess={(urls: string[]) => setProfileData({ ...profileData, coverImage: urls[0] })}
                                                    maxSize={5 * 1024 * 1024} // 5MB in bytes
                                                    accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }}
                                                />
                                            </div>
                                            <p className="text-xs text-text-muted text-center">يفضل مقاس غلاف تويتر أو انستقرام المحسن (1920x1080)</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Brand & Social Links */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Personal Info */}
                                    <div>
                                        <label className="label">الاسم الكامل</label>
                                        <input
                                            type="text"
                                            value={profileData.name}
                                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                            className="input"
                                        />
                                    </div>

                                    <div>
                                        <label className="label">اسم المستخدم (الرابط)</label>
                                        <div className="flex" dir="ltr">
                                            <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 dark:border-gray-700 bg-[#111111] dark:bg-gray-800 text-gray-500 text-sm">
                                                platform.com/@
                                            </span>
                                            <input
                                                type="text"
                                                value={profileData.username}
                                                onChange={(e) => {
                                                    const newUsername = e.target.value.replace(/\s+/g, '-').toLowerCase();
                                                    setProfileData({ ...profileData, username: newUsername });
                                                    setShowUsernameWarning(newUsername !== originalUsername);
                                                }}
                                                className={`input rounded-l-none text-left ${showUsernameWarning ? 'border-amber-400 focus:ring-amber-400' : ''}`}
                                            />
                                        </div>
                                        {showUsernameWarning && (
                                            <div className="mt-2 p-3 bg-emerald-700 text-white-50 border border-amber-200 rounded-xl text-xs text-blue-800 flex items-start gap-2 shadow-lg shadow-[#10B981]/20 ">
                                                <FiAlertCircle className="mt-0.5 shrink-0 text-[#10B981]-500" />
                                                <p>
                                                    <strong className="block mb-1">تحذير: تغيير اسم المستخدم</strong>
                                                    سيؤدي هذا إلى تغيير رابط متجرك ومنتجاتك. جميع الروابط الخارجية التي شاركتها سابقاً في تويتر أو انستقرام ستتوقف عن العمل.
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="label">البريد الإلكتروني</label>
                                        <input
                                            type="email"
                                            value={profileData.email}
                                            disabled
                                            className="input bg-emerald-800 dark:bg-gray-800 cursor-not-allowed text-text-muted"
                                        />
                                    </div>

                                    <div>
                                        <label className="label">لون العلامة التجارية</label>
                                        <div className="flex gap-2 items-center">
                                            <input
                                                type="color"
                                                value={profileData.brandColor || '#0ea5e9'}
                                                onChange={(e) => setProfileData({ ...profileData, brandColor: e.target.value })}
                                                className="h-11 w-12 p-1 border border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer bg-[#0A0A0A] dark:bg-gray-800"
                                            />
                                            <input
                                                type="text"
                                                value={profileData.brandColor || '#0ea5e9'}
                                                onChange={(e) => setProfileData({ ...profileData, brandColor: e.target.value })}
                                                className="input flex-1"
                                                placeholder="#000000"
                                                dir="ltr"
                                            />
                                        </div>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="label">الموقع الإلكتروني</label>
                                        <input
                                            type="url"
                                            value={profileData.website}
                                            onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                                            className="input"
                                            placeholder="https://example.com"
                                            dir="ltr"
                                        />
                                    </div>

                                    <div>
                                        <label className="label">Facebook</label>
                                        <input
                                            type="url"
                                            value={profileData.facebook}
                                            onChange={(e) => setProfileData({ ...profileData, facebook: e.target.value })}
                                            className="input"
                                            placeholder="https://facebook.com/username"
                                            dir="ltr"
                                        />
                                    </div>

                                    <div>
                                        <label className="label">Instagram</label>
                                        <input
                                            type="url"
                                            value={profileData.instagram}
                                            onChange={(e) => setProfileData({ ...profileData, instagram: e.target.value })}
                                            className="input"
                                            placeholder="https://instagram.com/username"
                                            dir="ltr"
                                        />
                                    </div>

                                    <div>
                                        <label className="label">Twitter / X</label>
                                        <input
                                            type="url"
                                            value={profileData.twitter}
                                            onChange={(e) => setProfileData({ ...profileData, twitter: e.target.value })}
                                            className="input"
                                            placeholder="https://twitter.com/username"
                                            dir="ltr"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="label">نبذة عنك (Bio)</label>
                                        <textarea
                                            value={profileData.bio}
                                            onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                                            className="input min-h-[120px]"
                                            rows={4}
                                            placeholder="اكتب نبذة مختصرة عن نفسك ومهاراتك..."
                                        />
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-white/10 dark:border-gray-800 flex justify-end">
                                    <button
                                        onClick={saveProfile}
                                        disabled={saving}
                                        className="btn btn-primary px-8"
                                    >
                                        <FiSave />
                                        <span>{saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Brand Tab */}
                        {activeTab === 'brand' && (
                            <div className="space-y-8 animate-in fade-in duration-500">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 dark:border-gray-800 pb-4">
                                    <div>
                                        <h2 className="text-xl sm:text-2xl font-bold text-[#10B981] dark:text-white">الهوية البصرية</h2>
                                        <p className="text-gray-500 mt-1 text-xs font-bold">خصص مظهر متجرك ليعكس احترافيتك</p>
                                    </div>
                                    <button
                                        onClick={saveProfile}
                                        disabled={saving}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-[#10B981]/20 hover:bg-emerald-600 transition-all disabled:opacity-60"
                                    >
                                        <FiSave /> {saving ? 'جاري الحفظ...' : 'حفظ الهوية'}
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
                                    {/* Brand Controls */}
                                    <div className="xl:col-span-3 space-y-8">
                                        {/* Colors */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 text-[#10B981] mb-2">
                                                <div className="w-8 h-8 rounded-lg bg-emerald-900/20 flex items-center justify-center border border-emerald-500/20"><FiDroplet /></div>
                                                <h3 className="font-bold">لوحة الألوان</h3>
                                            </div>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                {COLOR_PALETTES.map((p, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => applyPalette(p)}
                                                        className={`relative p-3 rounded-xl border-2 transition-all text-center hover:scale-[1.02] ${profileData.brandColor === p.primary ? 'border-[#10B981] bg-[#111111]' : 'border-white/5 hover:border-emerald-500/20'}`}
                                                    >
                                                        <div className="flex gap-1 justify-center mb-2">
                                                            <div className="w-6 h-6 rounded-lg" style={{ background: p.primary }} />
                                                            <div className="w-6 h-6 rounded-lg" style={{ background: p.secondary }} />
                                                        </div>
                                                        <span className="text-[10px] font-bold text-gray-400">{p.name}</span>
                                                        {profileData.brandColor === p.primary && (
                                                            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-emerald-700 text-white rounded-lg flex items-center justify-center text-[10px] shadow-lg shadow-[#10B981]/20">
                                                                <FiCheck />
                                                            </div>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                                <div>
                                                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-2 block tracking-wider">اللون الرئيسي</label>
                                                    <div className="flex gap-2 items-center">
                                                        <input
                                                            type="color"
                                                            value={profileData.brandColor}
                                                            onChange={e => setProfileData({ ...profileData, brandColor: e.target.value })}
                                                            className="h-10 w-12 p-1 border border-white/10 rounded-xl cursor-pointer bg-[#0A0A0A]"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={profileData.brandColor}
                                                            onChange={e => setProfileData({ ...profileData, brandColor: e.target.value })}
                                                            className="w-full bg-[#111111] border border-white/10 rounded-xl px-3 py-2 text-xs font-bold font-inter" dir="ltr"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-2 block tracking-wider">لون النصوص</label>
                                                    <div className="flex gap-2 items-center">
                                                        <input
                                                            type="color"
                                                            value={profileData.brandSecondaryColor}
                                                            onChange={e => setProfileData({ ...profileData, brandSecondaryColor: e.target.value })}
                                                            className="h-10 w-12 p-1 border border-white/10 rounded-xl cursor-pointer bg-[#0A0A0A]"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={profileData.brandSecondaryColor}
                                                            onChange={e => setProfileData({ ...profileData, brandSecondaryColor: e.target.value })}
                                                            className="w-full bg-[#111111] border border-white/10 rounded-xl px-3 py-2 text-xs font-bold font-inter" dir="ltr"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Typography */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 text-[#10B981] mb-2">
                                                <div className="w-8 h-8 rounded-lg bg-emerald-900/20 flex items-center justify-center border border-emerald-500/20"><FiType /></div>
                                                <h3 className="font-bold">الخطوط</h3>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                {FONT_OPTIONS.map(f => (
                                                    <button
                                                        key={f.id}
                                                        onClick={() => setProfileData({ ...profileData, brandFont: f.id })}
                                                        className={`relative p-4 rounded-xl border-2 text-center transition-all hover:scale-[1.02] ${profileData.brandFont === f.id ? 'border-[#10B981] bg-[#111111]' : 'border-white/5 hover:border-emerald-500/20'}`}
                                                    >
                                                        <div className="text-xl font-bold text-[#10B981] mb-1">{f.preview.slice(0, 2)}</div>
                                                        <div className="text-xs font-bold text-gray-300">{f.name}</div>
                                                        {profileData.brandFont === f.id && (
                                                            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-emerald-700 text-white rounded-lg flex items-center justify-center text-[10px] shadow-lg shadow-[#10B981]/20"><FiCheck /></div>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Button Styles */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 text-[#10B981] mb-2">
                                                <div className="w-8 h-8 rounded-lg bg-emerald-900/20 flex items-center justify-center border border-emerald-500/20"><FiSquare /></div>
                                                <h3 className="font-bold">نمط الأزرار</h3>
                                            </div>
                                            <div className="grid grid-cols-3 gap-3">
                                                {BUTTON_STYLES.map(b => (
                                                    <button
                                                        key={b.id}
                                                        onClick={() => setProfileData({ ...profileData, brandButtonStyle: b.id })}
                                                        className={`relative p-4 rounded-xl border-2 text-center transition-all ${profileData.brandButtonStyle === b.id ? 'border-[#10B981] bg-[#111111]' : 'border-white/5 hover:border-emerald-500/20'}`}
                                                    >
                                                        <div className="flex justify-center mb-3">
                                                            <div
                                                                className="px-4 py-1.5 text-white text-[10px] font-bold shadow-md"
                                                                style={{ background: profileData.brandColor, borderRadius: b.radius }}
                                                            >
                                                                Buy
                                                            </div>
                                                        </div>
                                                        <div className="text-xs font-bold text-gray-400">{b.name}</div>
                                                        {profileData.brandButtonStyle === b.id && (
                                                            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-emerald-700 text-white rounded-lg flex items-center justify-center text-[10px] shadow-lg shadow-[#10B981]/20"><FiCheck /></div>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Banner & Tagline */}
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="label">الوصف القصير للمتجر (Tagline)</label>
                                                <input
                                                    type="text"
                                                    value={profileData.storeTagline}
                                                    onChange={e => setProfileData({ ...profileData, storeTagline: e.target.value })}
                                                    className="input"
                                                    maxLength={80}
                                                    placeholder='مثال: "نحو احتراف التجارة الرقمية"'
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="label">بانر المتجر</label>
                                                {profileData.storeBanner && (
                                                    <div className="mb-4 rounded-xl overflow-hidden h-32 relative group border border-white/10">
                                                        <img src={profileData.storeBanner} alt="banner" className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <button
                                                                onClick={() => setProfileData({ ...profileData, storeBanner: '' })}
                                                                className="bg-red-500 text-white text-xs px-4 py-1.5 rounded-xl font-bold"
                                                            >حذف</button>
                                                        </div>
                                                    </div>
                                                )}
                                                <FileUploader
                                                    onUploadSuccess={(urls: string[]) => setProfileData({ ...profileData, storeBanner: urls[0] })}
                                                    maxSize={5 * 1024 * 1024}
                                                    accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Live Preview Side Panel */}
                                    <div className="xl:col-span-2">
                                        <div className="sticky top-8 space-y-4">
                                            <div className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-widest pl-2 border-l-2 border-emerald-500">
                                                <span>معاينة حية</span>
                                                <Link href={`/${profileData.username}`} target="_blank" className="flex items-center gap-1 text-[#10B981] hover:underline normal-case">
                                                    <FiEye size={12} /> معاينة المتجر الكامل
                                                </Link>
                                            </div>
                                            
                                            <div className="bg-[#0A0A0A] rounded-2xl border border-white/10 shadow-2xl shadow-emerald-500/5 overflow-hidden transform scale-95 origin-top transition-all">
                                                {/* Store Header Preview */}
                                                <div 
                                                    className="h-28 relative"
                                                    style={{ 
                                                        background: profileData.storeBanner 
                                                            ? `url(${profileData.storeBanner}) center/cover` 
                                                            : `linear-gradient(135deg, ${profileData.brandColor}22 0%, ${profileData.brandSecondaryColor}22 100%)` 
                                                    }}
                                                >
                                                    {!profileData.storeBanner && (
                                                        <div className="absolute inset-0 flex items-center justify-center opacity-20">
                                                            <FiLayout size={40} className="text-[#10B981]" />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="px-5 -mt-8 relative z-10">
                                                    <div className="w-16 h-16 rounded-2xl border-4 border-[#0A0A0A] bg-emerald-800 flex items-center justify-center text-white text-xl font-bold shadow-xl overflow-hidden" style={{ background: profileData.brandColor }}>
                                                        {profileData.avatar ? (
                                                            <img src={profileData.avatar} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            profileData.name?.charAt(0) || 'T'
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="p-5 space-y-4">
                                                    <div>
                                                        <h4 className="font-bold text-gray-100 text-sm">{profileData.name || 'اسمك'}</h4>
                                                        <p className="text-[10px] mt-0.5" style={{ color: profileData.brandSecondaryColor }}>@{profileData.username || 'user'}</p>
                                                        {profileData.storeTagline && (
                                                            <p className="text-[10px] text-gray-400 mt-2 line-clamp-1">{profileData.storeTagline}</p>
                                                        )}
                                                    </div>

                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between p-2 rounded-xl bg-[#111111] border border-white/5">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-8 h-8 rounded-lg bg-[#0A0A0A]" />
                                                                <span className="text-[10px] font-bold text-gray-300">اسم المنتج التجريبي</span>
                                                            </div>
                                                            <button 
                                                                className="px-3 py-1 text-[9px] font-bold text-white shadow-lg"
                                                                style={{ background: profileData.brandColor, borderRadius: btnRadius }}
                                                            >
                                                                BUY
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <button 
                                                        className="w-full py-2.5 text-white text-[10px] font-bold shadow-lg"
                                                        style={{ background: profileData.brandColor, borderRadius: btnRadius }}
                                                    >
                                                        تصفح المتجر
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="bg-[#111111]/50 rounded-xl p-3 border border-white/5 text-[10px] flex justify-center gap-4 text-gray-500 font-mono">
                                                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{ background: profileData.brandColor }} /> {profileData.brandColor}</span>
                                                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{ background: profileData.brandSecondaryColor }} /> {profileData.brandSecondaryColor}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Security Tab */}
                        {activeTab === 'security' && (
                            <div className="space-y-8 ">
                                <h2 className="text-2xl font-bold text-[#10B981] dark:text-white border-b border-white/10 dark:border-gray-800 pb-4">الأمان وكلمة المرور</h2>

                                <div className="space-y-6 max-w-lg">
                                    <div>
                                        <label className="label">كلمة المرور الحالية</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={passwordData.currentPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                className="input pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-400 dark:hover:text-gray-200"
                                            >
                                                {showPassword ? <FiEyeOff /> : <FiEye />}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="label">كلمة المرور الجديدة</label>
                                        <input
                                            type="password"
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                            className="input"
                                        />
                                    </div>

                                    <div>
                                        <label className="label">تأكيد كلمة المرور الجديدة</label>
                                        <input
                                            type="password"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                            className="input"
                                        />
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-white/10 dark:border-gray-800">
                                    <button
                                        onClick={savePassword}
                                        disabled={saving}
                                        className="btn btn-primary"
                                    >
                                        <FiLock />
                                        <span>{saving ? 'جاري التحديث...' : 'تحديث كلمة المرور'}</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Notifications Tab */}
                        {activeTab === 'notifications' && (
                            <div className="space-y-8 ">
                                <h2 className="text-2xl font-bold text-[#10B981] dark:text-white border-b border-white/10 dark:border-gray-800 pb-4">إعدادات الإشعارات</h2>

                                <div className="space-y-4">
                                    {[
                                        { key: 'emailNotifications', label: 'إشعارات البريد الإلكتروني', desc: 'تلقي إشعارات عبر البريد الإلكتروني' },
                                        { key: 'orderNotifications', label: 'إشعارات الطلبات', desc: 'تلقي إشعارات عند استلام طلبات جديدة' },
                                        { key: 'marketingEmails', label: 'رسائل تسويقية', desc: 'تلقي عروض وتحديثات المنتجات' },
                                        { key: 'weeklyReport', label: 'التقرير الأسبوعي', desc: 'تلقي  ملخص أسبوعي بنشاطك' }
                                    ].map((item: any) => (
                                        <div key={item.key} className="flex items-center justify-between p-4 bg-[#111111] dark:bg-gray-800/50 rounded-lg border border-white/10 dark:border-gray-800">
                                            <div>
                                                <h3 className="font-medium text-[#10B981] dark:text-white">{item.label}</h3>
                                                <p className="text-sm text-text-muted">{item.desc}</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={(notificationSettings as any)[item.key]}
                                                    onChange={(e) => setNotificationSettings({
                                                        ...notificationSettings,
                                                        [item.key]: e.target.checked
                                                    })}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-xl peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#0A0A0A] after:border-gray-300 after:border after:rounded-xl after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-700 text-white"></div>
                                            </label>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-6 border-t border-white/10 dark:border-gray-800">
                                    <button className="btn btn-primary">
                                        <FiSave />
                                        <span>حفظ الإعدادات</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Payment Tab */}
                        {activeTab === 'payment' && (
                            <div className="space-y-8 ">
                                <div className="flex items-center justify-between border-b border-white/10 dark:border-gray-800 pb-4">
                                    <h2 className="text-2xl font-bold text-white dark:text-white">إعدادات تحويل الأرباح</h2>
                                    <FiTrendingUp className="text-2xl text-[#10B981]" />
                                </div>
                                <PayoutSettings />
                            </div>
                        )}

                        {/* Integrations Tab */}
                        {activeTab === 'integrations' && (
                            <div className="space-y-8 ">
                                <h2 className="text-2xl font-bold text-[#10B981] dark:text-white border-b border-white/10 dark:border-gray-800 pb-4">التكاملات والخدمات المرتبطة</h2>

                                {integrationMsg && (
                                    <div className={`p-4 rounded-xl flex items-center gap-3 font-medium ${integrationMsg.type === 'success'
                                        ? 'bg-green-50 text-green-800 border border-green-200'
                                        : 'bg-red-500/100/10 text-red-800 border border-red-200'
                                        }`}>
                                        {integrationMsg.type === 'success' ? <FiCheckCircle className="text-xl flex-shrink-0" /> : <FiXCircle className="text-xl flex-shrink-0" />}
                                        {integrationMsg.text}
                                    </div>
                                )}

                                {/* Google Calendar */}
                                <div className="p-6 border-2 border-white/10 dark:border-gray-800 rounded-xl hover:border-emerald-600/30 transition-all">
                                    <div className="flex items-center justify-between flex-wrap gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-xl bg-[#0A0A0A] shadow-md border border-white/10 flex items-center justify-center">
                                                <svg viewBox="0 0 24 24" className="w-8 h-8">
                                                    <path fill="#4285F4" d="M22 12A10 10 0 1 1 12 2a10 10 0 0 1 10 10z" />
                                                    <path fill="white" d="M12 6.5v5.5l3.5 3.5-1 1L10.5 12V6.5h1.5z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-[#10B981] dark:text-white">Google Calendar & Meet</h3>
                                                <p className="text-sm text-text-muted">أنشئ مواعيد تلقائياً مع رابط Google Meet عند كل حجز</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            {calendarConnected ? (
                                                <>
                                                    <span className="flex items-center gap-2 text-green-600 font-medium bg-green-50 px-3 py-1.5 rounded-xl text-sm">
                                                        <FiCheckCircle />
                                                        متصل
                                                    </span>
                                                    <a href="/api/google/calendar/connect" className="btn btn-accent text-sm border-red-300 text-red-500 hover:bg-red-500/100/10">
                                                        قطع الاتصال
                                                    </a>
                                                </>
                                            ) : (
                                                <a
                                                    href="/api/google/calendar/connect"
                                                    className="btn btn-primary flex items-center gap-2 text-sm"
                                                >
                                                    <svg viewBox="0 0 24 24" className="w-4 h-4">
                                                        <path fill="white" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                        <path fill="white" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                    </svg>
                                                    ربط Google Calendar
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    {calendarConnected && (
                                        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-200 dark:border-green-900/30">
                                            <p className="text-sm text-green-700 dark:text-green-400">
                                                🎉 <strong>نشط!</strong> عند حجز أي استشارة، سيتم إنشاء حدث تلقائياً في تقويمك مع رابط Google Meet وإرساله للعميل.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Coming Soon - Zoom */}
                                <div className="p-6 border-2 border-dashed border-emerald-500/20 dark:border-gray-700 rounded-xl opacity-60">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-xl bg-emerald-700 text-white-50 flex items-center justify-center">
                                            <span className="text-2xl">🎥</span>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-[#10B981] dark:text-white">Zoom</h3>
                                            <p className="text-sm text-text-muted">قريباً - ربط حسابك على Zoom</p>
                                        </div>
                                        <span className="mr-auto bg-emerald-800 dark:bg-gray-800 text-gray-500 text-xs px-3 py-1 rounded-xl">قريباً</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Verification Tab (Phase 10) */}
                        {activeTab === 'verification' && (
                            <div className="space-y-8 ">
                                <div className="flex items-center justify-between border-b border-white/10 dark:border-gray-800 pb-4">
                                    <h2 className="text-2xl font-bold text-[#10B981] dark:text-white">توثيق الحساب (Trust Badge)</h2>
                                    <FiCheckCircle className={`text-3xl ${verificationRequest?.status === 'APPROVED' ? 'text-green-500' : 'text-[#10B981]'}`} />
                                </div>

                                <div className="max-w-2xl space-y-6">
                                    {/* Current Status Banner */}
                                    {verificationRequest ? (
                                        <div className={`p-6 rounded-xl border-2 flex items-start gap-4 ${
                                            verificationRequest.status === 'APPROVED' ? 'bg-green-50 border-green-200 text-green-800' :
                                            verificationRequest.status === 'REJECTED' ? 'bg-red-500/100/10 border-red-200 text-red-800' :
                                            'bg-emerald-700 text-white-50 border-blue-200 text-blue-800'
                                        }`}>
                                            <div className="text-3xl mt-1">
                                                {verificationRequest.status === 'APPROVED' ? '✅' : 
                                                 verificationRequest.status === 'REJECTED' ? '❌' : '⏳'}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg">
                                                    {verificationRequest.status === 'APPROVED' ? 'الحساب موثق بنجاح' :
                                                     verificationRequest.status === 'REJECTED' ? 'تم رفض طلب التوثيق' :
                                                     'طلبك قيد المراجعة حالياً'}
                                                </h3>
                                                <p className="text-sm opacity-90 mt-1">
                                                    {verificationRequest.status === 'APPROVED' ? 'متجرك يحمل الآن العلامة الزرقاء لزيادة ثقة المشترين.' :
                                                     verificationRequest.status === 'REJECTED' ? `السبب: ${verificationRequest.rejectionReason}` :
                                                     'يستغرق التدقيق اليدوي من 24 إلى 48 ساعة عمل.'}
                                                </p>
                                                {verificationRequest.status === 'REJECTED' && (
                                                    <button onClick={() => setVerificationRequest(null)} className="mt-4 text-xs font-bold underline">إعادة تقديم الطلب</button>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="bg-emerald-700 text-white/5 p-6 rounded-xl border border-emerald-600/10 space-y-4">
                                                <h3 className="font-bold text-lg text-[#10B981]">لماذا توثيق الحساب؟</h3>
                                                <ul className="space-y-3 text-sm text-text-muted">
                                                    <li className="flex items-center gap-2">🔹 الحصول على الشارة الزرقاء بجانب اسمك.</li>
                                                    <li className="flex items-center gap-2">🔹 زيادة مبيعاتك بنسبة تصل إلى 35% بسبب الثقة.</li>
                                                    <li className="flex items-center gap-2">🔹 أولوية الظهور في نتائج البحث.</li>
                                                    <li className="flex items-center gap-2">🔹 سرعة في عمليات سحب الأرباح.</li>
                                                </ul>
                                            </div>

                                            <div className="space-y-4">
                                                <label className="label">نوع الوثيقة</label>
                                                <select id="docType" className="input bg-[#111111]">
                                                    <option value="ID_CARD">الهوية الشخصية (ID Card)</option>
                                                    <option value="PASSPORT">جواز السفر (Passport)</option>
                                                </select>
                                                
                                                <label className="label">ارفع صورة واضحة للوثيقة (وجه وخلفية أو صفحة المعلومات)</label>
                                                <FileUploader 
                                                    onUploadSuccess={(urls) => {
                                                        const type = (document.getElementById('docType') as HTMLSelectElement).value;
                                                        submitVerification(urls[0], type);
                                                    }}
                                                    maxSize={5 * 1024 * 1024}
                                                    accept={{ 'image/*': ['.jpg', '.png', '.jpeg'] }}
                                                />
                                                <p className="text-xs text-center text-text-muted">نحن نحترم خصوصيتك، سيتم حذف الملف فور الانتهاء من التدقيق اليدوي.</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Privacy Tab */}
                        {activeTab === 'privacy' && (
                            <div className="space-y-8 ">
                                <h2 className="text-2xl font-bold text-[#10B981] dark:text-white border-b border-white/10 dark:border-gray-800 pb-4">الخصوصية والأمان المتقدم</h2>

                                <div className="space-y-6">
                                    <div className="p-5 bg-[#111111] dark:bg-gray-800/50 rounded-xl border border-white/10 dark:border-gray-800">
                                        <div className="flex items-center gap-2 mb-4 text-[#10B981] dark:text-white">
                                            <FiEye className="text-[#10B981]" />
                                            <h3 className="font-bold">رؤية رقم الهاتف</h3>
                                        </div>
                                        <select 
                                            value={profileData.phoneVisibility}
                                            onChange={(e) => setProfileData({ ...profileData, phoneVisibility: e.target.value as any })}
                                            className="input rounded-xl bg-[#0A0A0A] dark:bg-gray-900 shadow-lg shadow-[#10B981]/20 border-emerald-500/20"
                                        >
                                            <option value="PUBLIC">عام - يظهر للجميع في صفحة المبدع</option>
                                            <option value="WHATSAPP_ONLY">عبر واتساب فقط - زر تواصل مباشر</option>
                                            <option value="HIDDEN">مخفي - يظهر للإدارة فقط عند الضرورة</option>
                                        </select>
                                        <p className="mt-2 text-xs text-text-muted">نوصي باختيار "مخفي" أو "واتساب فقط" لخصوصية أفضل.</p>
                                    </div>

                                    <div className="p-4 bg-[#111111] dark:bg-gray-800/50 rounded-xl border border-white/10 dark:border-gray-800">
                                        <div className="flex items-center gap-2 mb-4">
                                            <FiShield className="text-[#10B981]" />
                                            <h3 className="font-bold text-white dark:text-white">التحقق بخطوتين (2FA)</h3>
                                        </div>
                                        <div className="bg-[#0A0A0A] dark:bg-gray-900 p-4 rounded-xl border border-emerald-500/20 dark:border-gray-800 flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium">تأمين الحساب عبر تطبيق (TOTP)</p>
                                                <p className="text-xs text-gray-500">
                                                    {profileData.twoFactorEnabled ? 'مفعل - حسابك محمي بكلمة مرور ورمز تطبيق' : 'استخدم Google Authenticator لتأمين دخولك'}
                                                </p>
                                            </div>
                                            {profileData.twoFactorEnabled ? (
                                                <button onClick={disable2FA} className="btn bg-red-500/100/10 text-red-600 border-red-100 hover:bg-red-100 py-2 text-sm">تعطيل 2FA</button>
                                            ) : (
                                                <button onClick={setup2FA} className="btn btn-primary py-2 text-sm">تفعيل 2FA</button>
                                            )}
                                        </div>
                                    </div>

                                    {/* 2FA Setup Modal Partial */}
                                    {show2FASetup && (
                                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60  ">
                                            <div className="bg-[#0A0A0A] dark:bg-card-white rounded-xl p-8 max-w-md w-full shadow-lg shadow-[#10B981]/20 space-y-6 text-center">
                                                <h3 className="text-2xl font-bold text-[#10B981] dark:text-white">إعداد التحقق بخطوتين</h3>
                                                <p className="text-sm text-text-muted">امسح رمز الـ QR التالي باستخدام تطبيق Authenticator (مثل Google أو Microsoft)</p>
                                                
                                                <div className="bg-[#0A0A0A] p-4 rounded-xl inline-block border-4 border-primary-50">
                                                    <img src={qrCode} alt="QR Code" className="w-48 h-48 mx-auto" />
                                                </div>

                                                <div className="space-y-4">
                                                    <label className="label text-right">أدخل الرمز المكون من 6 أرقام</label>
                                                    <input 
                                                        type="text" 
                                                        placeholder="000000" 
                                                        className="input text-center text-2xl tracking-[0.5em] font-mono" 
                                                        maxLength={6}
                                                        value={userToken}
                                                        onChange={(e) => setUserToken(e.target.value)}
                                                    />
                                                    <div className="flex gap-4 pt-4">
                                                        <button 
                                                            onClick={verifyAndEnable2FA} 
                                                            disabled={verifying2FA}
                                                            className="btn btn-primary flex-1 py-4"
                                                        >
                                                            {verifying2FA ? 'جاري التحقق...' : 'تفعيل الآن'}
                                                        </button>
                                                        <button 
                                                            onClick={() => setShow2FASetup(false)} 
                                                            className="btn bg-emerald-800 text-gray-400 flex-1 py-4"
                                                        >
                                                            إلغاء
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <DangerZone />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
