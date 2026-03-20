'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { FiUser, FiMail, FiLock, FiGlobe, FiBell, FiCreditCard, FiShield, FiSave, FiUpload, FiEye, FiEyeOff, FiLink, FiCheckCircle, FiXCircle, FiCopy } from 'react-icons/fi';
import { apiGet, apiPut, handleApiError } from '@/lib/safe-fetch';
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
                    brandColor: data.brandColor || '#0ea5e9',
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
                });
                setOriginalUsername(data.username || '');
                setPaymentData({
                    bankName: data.bankName || '',
                    accountNumber: data.accountNumber || '',
                    accountName: data.accountName || '',
                    paypalEmail: ''
                });
                setCalendarConnected(data.googleCalendarConnected || false);
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

    const tabs = [
        { id: 'profile', name: 'الملف الشخصي', icon: FiUser },
        { id: 'security', name: 'الأمان', icon: FiLock },
        { id: 'notifications', name: 'الإشعارات', icon: FiBell },
        { id: 'payment', name: 'الدفع', icon: FiCreditCard },
        { id: 'integrations', name: 'التكاملات', icon: FiLink },
        { id: 'privacy', name: 'الخصوصية', icon: FiShield }
    ];

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-primary-charcoal dark:text-white">الإعدادات</h1>
                    <p className="text-sm sm:text-base text-text-muted mt-2">إدارة حسابك وتفضيلاتك</p>
                </div>
                {profileData.username && (
                    <button
                        onClick={() => {
                            const url = `${window.location.origin}/${profileData.username}`;
                            navigator.clipboard.writeText(url);
                            toast.success('تم نسخ رابط متجرك بنجاح!');
                        }}
                        className="btn bg-white dark:bg-card-white border border-gray-200 dark:border-gray-700 hover:border-action-blue text-primary-charcoal dark:text-white shadow-sm flex items-center gap-2 self-start sm:self-auto"
                    >
                        <FiCopy className="text-action-blue" />
                        <span>نسخ رابط المتجر</span>
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar Tabs */}
                <div className="lg:col-span-1 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                    <div className="card flex lg:flex-col gap-2 p-2 sm:p-4 min-w-max lg:min-w-0 bg-white dark:bg-card-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 lg:w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-action-blue text-white font-medium shadow-md'
                                    : 'text-text-muted hover:bg-gray-50 dark:hover:bg-gray-800'
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
                    <div className="card min-h-[500px] bg-white dark:bg-card-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-800">
                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <div className="space-y-8 animate-fade-in">
                                <h2 className="text-xl sm:text-2xl font-bold text-primary-charcoal dark:text-white border-b border-gray-100 dark:border-gray-800 pb-4">الملف الشخصي</h2>

                                {/* Avatar & Cover Upload */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Avatar */}
                                    <div className="space-y-3">
                                        <label className="label">الصورة الشخصية (Avatar)</label>
                                        <div className="flex flex-col items-center gap-4 p-4 border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
                                            <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-action-blue to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg ring-4 ring-white dark:ring-gray-900 border border-gray-100 dark:border-gray-800 shrink-0 relative group">
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
                                        <div className="flex flex-col gap-4 p-4 border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
                                            <div className="h-24 w-full rounded-xl overflow-hidden bg-gradient-to-br from-action-blue to-purple-600 flex items-center justify-center text-white font-bold shadow-inner relative group">
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
                                            <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-500 text-sm">
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
                                            <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2 shadow-sm animate-fade-in">
                                                <FiAlertCircle className="mt-0.5 shrink-0 text-amber-500" />
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
                                            className="input bg-gray-100 dark:bg-gray-800 cursor-not-allowed text-text-muted"
                                        />
                                    </div>

                                    <div>
                                        <label className="label">لون العلامة التجارية</label>
                                        <div className="flex gap-2 items-center">
                                            <input
                                                type="color"
                                                value={profileData.brandColor || '#0ea5e9'}
                                                onChange={(e) => setProfileData({ ...profileData, brandColor: e.target.value })}
                                                className="h-11 w-12 p-1 border border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer bg-white dark:bg-gray-800"
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

                                <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end">
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

                        {/* Security Tab */}
                        {activeTab === 'security' && (
                            <div className="space-y-8 animate-fade-in">
                                <h2 className="text-2xl font-bold text-primary-charcoal dark:text-white border-b border-gray-100 dark:border-gray-800 pb-4">الأمان وكلمة المرور</h2>

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
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
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

                                <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
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
                            <div className="space-y-8 animate-fade-in">
                                <h2 className="text-2xl font-bold text-primary-charcoal dark:text-white border-b border-gray-100 dark:border-gray-800 pb-4">إعدادات الإشعارات</h2>

                                <div className="space-y-4">
                                    {[
                                        { key: 'emailNotifications', label: 'إشعارات البريد الإلكتروني', desc: 'تلقي إشعارات عبر البريد الإلكتروني' },
                                        { key: 'orderNotifications', label: 'إشعارات الطلبات', desc: 'تلقي إشعارات عند استلام طلبات جديدة' },
                                        { key: 'marketingEmails', label: 'رسائل تسويقية', desc: 'تلقي عروض وتحديثات المنتجات' },
                                        { key: 'weeklyReport', label: 'التقرير الأسبوعي', desc: 'تلقي  ملخص أسبوعي بنشاطك' }
                                    ].map((item) => (
                                        <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800">
                                            <div>
                                                <h3 className="font-medium text-primary-charcoal dark:text-white">{item.label}</h3>
                                                <p className="text-sm text-text-muted">{item.desc}</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={notificationSettings[item.key as keyof typeof notificationSettings]}
                                                    onChange={(e) => setNotificationSettings({
                                                        ...notificationSettings,
                                                        [item.key]: e.target.checked
                                                    })}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-action-blue"></div>
                                            </label>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                                    <button className="btn btn-primary">
                                        <FiSave />
                                        <span>حفظ الإعدادات</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Payment Tab */}
                        {activeTab === 'payment' && (
                            <div className="space-y-8 animate-fade-in">
                                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">إعدادات تحويل الأرباح</h2>
                                    <FiTrendingUp className="text-2xl text-primary-500" />
                                </div>
                                <PayoutSettings />
                            </div>
                        )}

                        {/* Integrations Tab */}
                        {activeTab === 'integrations' && (
                            <div className="space-y-8 animate-fade-in">
                                <h2 className="text-2xl font-bold text-primary-charcoal dark:text-white border-b border-gray-100 dark:border-gray-800 pb-4">التكاملات والخدمات المرتبطة</h2>

                                {integrationMsg && (
                                    <div className={`p-4 rounded-xl flex items-center gap-3 font-medium ${integrationMsg.type === 'success'
                                        ? 'bg-green-50 text-green-800 border border-green-200'
                                        : 'bg-red-50 text-red-800 border border-red-200'
                                        }`}>
                                        {integrationMsg.type === 'success' ? <FiCheckCircle className="text-xl flex-shrink-0" /> : <FiXCircle className="text-xl flex-shrink-0" />}
                                        {integrationMsg.text}
                                    </div>
                                )}

                                {/* Google Calendar */}
                                <div className="p-6 border-2 border-gray-100 dark:border-gray-800 rounded-2xl hover:border-action-blue/30 transition-all">
                                    <div className="flex items-center justify-between flex-wrap gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-xl bg-white shadow-md border border-gray-100 flex items-center justify-center">
                                                <svg viewBox="0 0 24 24" className="w-8 h-8">
                                                    <path fill="#4285F4" d="M22 12A10 10 0 1 1 12 2a10 10 0 0 1 10 10z" />
                                                    <path fill="white" d="M12 6.5v5.5l3.5 3.5-1 1L10.5 12V6.5h1.5z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-primary-charcoal dark:text-white">Google Calendar & Meet</h3>
                                                <p className="text-sm text-text-muted">أنشئ مواعيد تلقائياً مع رابط Google Meet عند كل حجز</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            {calendarConnected ? (
                                                <>
                                                    <span className="flex items-center gap-2 text-green-600 font-medium bg-green-50 px-3 py-1.5 rounded-full text-sm">
                                                        <FiCheckCircle />
                                                        متصل
                                                    </span>
                                                    <a href="/api/google/calendar/connect" className="btn btn-outline text-sm border-red-300 text-red-500 hover:bg-red-50">
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
                                <div className="p-6 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl opacity-60">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center">
                                            <span className="text-2xl">🎥</span>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-primary-charcoal dark:text-white">Zoom</h3>
                                            <p className="text-sm text-text-muted">قريباً - ربط حسابك على Zoom</p>
                                        </div>
                                        <span className="mr-auto bg-gray-100 dark:bg-gray-800 text-gray-500 text-xs px-3 py-1 rounded-full">قريباً</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Privacy Tab */}
                        {activeTab === 'privacy' && (
                            <div className="space-y-8 animate-fade-in">
                                <h2 className="text-2xl font-bold text-primary-charcoal dark:text-white border-b border-gray-100 dark:border-gray-800 pb-4">الخصوصية والأمان المتقدم</h2>

                                <div className="space-y-6">
                                    <div className="p-5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                                        <div className="flex items-center gap-2 mb-4 text-primary-charcoal dark:text-white">
                                            <FiEye className="text-action-blue" />
                                            <h3 className="font-bold">رؤية رقم الهاتف</h3>
                                        </div>
                                        <select 
                                            value={profileData.phoneVisibility}
                                            onChange={(e) => setProfileData({ ...profileData, phoneVisibility: e.target.value as any })}
                                            className="input rounded-xl bg-white dark:bg-gray-900 shadow-sm border-gray-200"
                                        >
                                            <option value="PUBLIC">عام - يظهر للجميع في صفحة المبدع</option>
                                            <option value="WHATSAPP_ONLY">عبر واتساب فقط - زر تواصل مباشر</option>
                                            <option value="HIDDEN">مخفي - يظهر للإدارة فقط عند الضرورة</option>
                                        </select>
                                        <p className="mt-2 text-xs text-text-muted">نوصي باختيار "مخفي" أو "واتساب فقط" لخصوصية أفضل.</p>
                                    </div>

                                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                                        <div className="flex items-center gap-2 mb-4">
                                            <FiShield className="text-primary-500" />
                                            <h3 className="font-bold text-gray-900 dark:text-white">التحقق بخطوتين (2FA)</h3>
                                        </div>
                                        <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium">تأمين الحساب عبر تطبيق (TOTP)</p>
                                                <p className="text-xs text-gray-500">
                                                    {profileData.twoFactorEnabled ? 'مفعل - حسابك محمي بكلمة مرور ورمز تطبيق' : 'استخدم Google Authenticator لتأمين دخولك'}
                                                </p>
                                            </div>
                                            {profileData.twoFactorEnabled ? (
                                                <button onClick={disable2FA} className="btn bg-red-50 text-red-600 border-red-100 hover:bg-red-100 py-2 text-sm">تعطيل 2FA</button>
                                            ) : (
                                                <button onClick={setup2FA} className="btn btn-primary py-2 text-sm">تفعيل 2FA</button>
                                            )}
                                        </div>
                                    </div>

                                    {/* 2FA Setup Modal Partial */}
                                    {show2FASetup && (
                                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                                            <div className="bg-white dark:bg-card-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl space-y-6 text-center">
                                                <h3 className="text-2xl font-black text-primary-charcoal dark:text-white">إعداد التحقق بخطوتين</h3>
                                                <p className="text-sm text-text-muted">امسح رمز الـ QR التالي باستخدام تطبيق Authenticator (مثل Google أو Microsoft)</p>
                                                
                                                <div className="bg-white p-4 rounded-3xl inline-block border-4 border-primary-50">
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
                                                            className="btn bg-gray-100 text-gray-600 flex-1 py-4"
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
