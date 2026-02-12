'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FiUser, FiMail, FiLock, FiGlobe, FiBell, FiCreditCard, FiShield, FiSave, FiUpload, FiEye, FiEyeOff } from 'react-icons/fi';
import { apiGet, apiPut, handleApiError } from '@/lib/safe-fetch';

export default function SettingsPage() {
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState('profile');
    const [saving, setSaving] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Profile Settings
    const [profileData, setProfileData] = useState({
        name: '',
        username: '',
        email: '',
        bio: '',
        avatar: '',
        phone: '',
        website: '',
        brandColor: '',
        facebook: '',
        instagram: '',
        twitter: ''
    });

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
                    phone: data.phone || '',
                    website: data.website || '',
                    brandColor: data.brandColor || '#0ea5e9',
                    facebook: data.facebook || '',
                    instagram: data.instagram || '',
                    twitter: data.twitter || ''
                });
                setPaymentData({
                    bankName: data.bankName || '',
                    accountNumber: data.accountNumber || '',
                    accountName: data.accountName || '',
                    paypalEmail: ''
                });
            } catch (error) {
                console.error('Error fetching profile:', handleApiError(error));
            }
        };

        if (session?.user) {
            fetchProfile();
        }
    }, [session]);

    const saveProfile = async () => {
        setSaving(true);
        try {
            await apiPut('/api/user/profile', profileData);
            alert('تم حفظ الإعدادات بنجاح!');
        } catch (error) {
            console.error('Error saving profile:', handleApiError(error));
            alert('حدث خطأ في الحفظ: ' + handleApiError(error));
        } finally {
            setSaving(false);
        }
    };

    const savePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert('كلمات المرور غير متطابقة');
            return;
        }

        setSaving(true);
        try {
            await apiPut('/api/user/password', passwordData);
            alert('تم تغيير كلمة المرور بنجاح!');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            console.error('Error changing password:', handleApiError(error));
            alert('فشل تغيير كلمة المرور: ' + handleApiError(error));
        } finally {
            setSaving(false);
        }
    };

    const tabs = [
        { id: 'profile', name: 'الملف الشخصي', icon: FiUser },
        { id: 'security', name: 'الأمان', icon: FiLock },
        { id: 'notifications', name: 'الإشعارات', icon: FiBell },
        { id: 'payment', name: 'الدفع', icon: FiCreditCard },
        { id: 'privacy', name: 'الخصوصية', icon: FiShield }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-primary-charcoal dark:text-white">الإعدادات</h1>
                <p className="text-text-muted mt-2">إدارة حسابك وتفضيلاتك</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar Tabs */}
                <div className="lg:col-span-1">
                    <div className="card space-y-2 p-4">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === tab.id
                                    ? 'bg-action-blue text-white font-medium shadow-md'
                                    : 'text-text-muted hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                            >
                                <tab.icon className="text-xl" />
                                <span>{tab.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="lg:col-span-3">
                    <div className="card min-h-[500px]">
                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <div className="space-y-8 animate-fade-in">
                                <h2 className="text-2xl font-bold text-primary-charcoal dark:text-white border-b border-gray-100 dark:border-gray-800 pb-4">الملف الشخصي</h2>

                                {/* Avatar Upload */}
                                <div className="flex items-center gap-6">
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-action-blue to-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                                        {profileData.name.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <div>
                                        <button className="btn btn-outline flex items-center gap-2">
                                            <FiUpload />
                                            <span>تحميل صورة</span>
                                        </button>
                                        <p className="text-sm text-text-muted mt-2">JPG, PNG أو GIF (الحد الأقصى 2MB)</p>
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
                                                onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                                                className="input rounded-l-none text-left"
                                            />
                                        </div>
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
                                <h2 className="text-2xl font-bold text-primary-charcoal dark:text-white border-b border-gray-100 dark:border-gray-800 pb-4">إعدادات الدفع</h2>

                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                    <p className="text-blue-800 dark:text-blue-200">
                                        <strong>ملاحظة:</strong> سنستخدم هذه المعلومات لتحويل أرباحك
                                    </p>
                                </div>

                                <div className="space-y-6 max-w-2xl">
                                    <div>
                                        <label className="label">اسم البنك</label>
                                        <input
                                            type="text"
                                            value={paymentData.bankName}
                                            onChange={(e) => setPaymentData({ ...paymentData, bankName: e.target.value })}
                                            className="input"
                                            placeholder="البنك الأهلي المصري"
                                        />
                                    </div>

                                    <div>
                                        <label className="label">رقم الحساب</label>
                                        <input
                                            type="text"
                                            value={paymentData.accountNumber}
                                            onChange={(e) => setPaymentData({ ...paymentData, accountNumber: e.target.value })}
                                            className="input"
                                            placeholder="1234567890"
                                        />
                                    </div>

                                    <div>
                                        <label className="label">اسم صاحب الحساب</label>
                                        <input
                                            type="text"
                                            value={paymentData.accountName}
                                            onChange={(e) => setPaymentData({ ...paymentData, accountName: e.target.value })}
                                            className="input"
                                        />
                                    </div>

                                    <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
                                        <h3 className="font-medium mb-3 text-primary-charcoal dark:text-white">بديل: PayPal</h3>
                                        <label className="label">بريد PayPal الإلكتروني</label>
                                        <input
                                            type="email"
                                            value={paymentData.paypalEmail}
                                            onChange={(e) => setPaymentData({ ...paymentData, paypalEmail: e.target.value })}
                                            className="input"
                                            placeholder="your@email.com"
                                        />
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                                    <button className="btn btn-primary">
                                        <FiSave />
                                        <span>حفظ معلومات الدفع</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Privacy Tab */}
                        {activeTab === 'privacy' && (
                            <div className="space-y-8 animate-fade-in">
                                <h2 className="text-2xl font-bold text-primary-charcoal dark:text-white border-b border-gray-100 dark:border-gray-800 pb-4">الخصوصية والأمان</h2>

                                <div className="space-y-6">
                                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800">
                                        <h3 className="font-medium text-primary-charcoal dark:text-white mb-2">رؤية الملف الشخصي</h3>
                                        <select className="input">
                                            <option>عام - يمكن لأي شخص رؤية ملفك الشخصي</option>
                                            <option>خاص - فقط من تتابعهم</option>
                                        </select>
                                    </div>

                                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800">
                                        <h3 className="font-medium text-primary-charcoal dark:text-white mb-2">رقم الهاتف</h3>
                                        <select className="input">
                                            <option>إظهار للجميع</option>
                                            <option>إخفاء رقم الهاتف</option>
                                        </select>
                                    </div>

                                    <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-lg">
                                        <h3 className="font-medium text-red-900 dark:text-red-400 mb-2">منطقة الخطر</h3>
                                        <p className="text-sm text-red-700 dark:text-red-300 mb-4">العمليات التالية لا يمكن التراجع عنها</p>
                                        <div className="space-y-2">
                                            <button className="btn bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white w-full border-none">
                                                تعطيل الحساب مؤقتاً
                                            </button>
                                            <button className="btn btn-outline border-red-500 text-red-500 hover:bg-red-500 hover:text-white dark:border-red-500 dark:text-red-500 dark:hover:bg-red-900/20 w-full">
                                                حذف الحساب نهائياً
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
