'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FiDroplet, FiType, FiLayout, FiSquare, FiSave, FiEye, FiRefreshCw, FiImage, FiEdit3, FiCheck } from 'react-icons/fi';
import { apiGet, apiPut, handleApiError } from '@/lib/safe-fetch';
import FileUploader from '@/components/ui/FileUploader';
import toast from 'react-hot-toast';
import Link from 'next/link';

// ─── Preset Color Palettes ────────────────────────────────
const COLOR_PALETTES = [
    { name: 'احترافي زمردي (افتراضي)', primary: '#0A0A0A', secondary: '#065f46' },
    { name: 'أزرق ملكي', primary: '#1E40AF', secondary: '#1E293B' },
    { name: 'بنفسجي فاخر', primary: '#6D28D9', secondary: '#1E1B4B' },
    { name: 'وردي عصري', primary: '#BE185D', secondary: '#1C1917' },
    { name: 'ذهبي كلاسيكي', primary: '#92400E', secondary: '#1C1917' },
    { name: 'أحمر جريء', primary: '#991B1B', secondary: '#18181B' },
    { name: 'تركوازي', primary: '#0D9488', secondary: '#134E4A' },
    { name: 'رمادي أنيق', primary: '#374151', secondary: '#111827' },
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

const LAYOUT_OPTIONS = [
    { id: 'grid', name: 'شبكة', icon: '⊞', desc: 'الأفضل لعرض المنتجات' },
    { id: 'list', name: 'قائمة', icon: '☰', desc: 'أفضل للوصف الطويل' },
];

export default function BrandEditorPage() {
    const { data: session } = useSession();
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    const [brand, setBrand] = useState({
        brandColor: '#0A0A0A',
        brandSecondaryColor: '#065f46',
        brandFont: 'default',
        brandButtonStyle: 'rounded',
        brandLayout: 'grid',
        storeBanner: '',
        storeTagline: '',
        avatar: '',
        coverImage: '',
        name: '',
        username: '',
    });

    useEffect(() => {
        const load = async () => {
            try {
                const data = await apiGet('/api/user/profile');
                setBrand({
                    brandColor: data.brandColor || '#0A0A0A',
                    brandSecondaryColor: data.brandSecondaryColor || '#065f46',
                    brandFont: data.brandFont || 'default',
                    brandButtonStyle: data.brandButtonStyle || 'rounded',
                    brandLayout: data.brandLayout || 'grid',
                    storeBanner: data.storeBanner || '',
                    storeTagline: data.storeTagline || '',
                    avatar: data.avatar || '',
                    coverImage: data.coverImage || '',
                    name: data.name || '',
                    username: data.username || '',
                });
            } catch (e) {
                console.error(handleApiError(e));
            } finally {
                setLoading(false);
            }
        };
        if (session?.user) load();
    }, [session]);

    const saveBrand = async () => {
        setSaving(true);
        try {
            await apiPut('/api/user/profile', brand);
            toast.success('تم حفظ الهوية البصرية بنجاح! ✨');
        } catch (e) {
            toast.error('حدث خطأ: ' + handleApiError(e));
        } finally {
            setSaving(false);
        }
    };

    const applyPalette = (p: typeof COLOR_PALETTES[0]) => {
        setBrand({ ...brand, brandColor: p.primary, brandSecondaryColor: p.secondary });
    };

    const btnRadius = BUTTON_STYLES.find(b => b.id === brand.brandButtonStyle)?.radius || '8px';

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <FiRefreshCw className="text-4xl text-emerald-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-16">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-emerald-600">🎨 الهوية البصرية</h1>
                    <p className="text-gray-500 mt-1 text-sm font-bold">خصص مظهر متجرك ليعكس احترافيتك</p>
                </div>
                <div className="flex gap-3">
                    {brand.username && (
                        <Link
                            href={`/${brand.username}`}
                            target="_blank"
                            className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 rounded-xl font-bold text-sm text-gray-600 hover:border-gray-300 transition-all shadow-lg shadow-emerald-600/20"
                        >
                            <FiEye /> معاينة المتجر
                        </Link>
                    )}
                    <button
                        onClick={saveBrand}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-600/20 shadow-ink/10 hover:bg-gray-800 transition-all disabled:opacity-60"
                    >
                        <FiSave /> {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* ─── Left Column: Controls ─── */}
                <div className="lg:col-span-2 space-y-8">

                    {/* ══ Section 1: Colors ══ */}
                    <div className="bg-white rounded-xl border border-gray-100 p-6 sm:p-8 shadow-lg shadow-emerald-600/20">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-emerald-600 border border-gray-100"><FiDroplet /></div>
                            <div>
                                <h2 className="text-lg font-bold text-emerald-600">الألوان</h2>
                                <p className="text-xs text-gray-400 font-bold">اختر لوحة ألوان جاهزة أو حدد ألوانك يدوياً</p>
                            </div>
                        </div>

                        {/* Preset Palettes */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                            {COLOR_PALETTES.map((p, i) => (
                                <button
                                    key={i}
                                    onClick={() => applyPalette(p)}
                                    className={`relative p-4 rounded-xl border-2 transition-all text-center hover:scale-[1.02] ${brand.brandColor === p.primary ? 'border-ink bg-gray-50' : 'border-gray-50 hover:border-gray-200'}`}
                                >
                                    <div className="flex gap-1.5 justify-center mb-3">
                                        <div className="w-8 h-8 rounded-lg shadow-lg shadow-emerald-600/20" style={{ background: p.primary }} />
                                        <div className="w-8 h-8 rounded-lg shadow-lg shadow-emerald-600/20" style={{ background: p.secondary }} />
                                    </div>
                                    <span className="text-[11px] font-bold text-emerald-600">{p.name}</span>
                                    {brand.brandColor === p.primary && (
                                        <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-emerald-600 rounded-xl flex items-center justify-center text-white text-[12px] shadow-lg shadow-emerald-600/20">
                                            <FiCheck />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Manual Color Pickers */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">اللون الرئيسي</label>
                                <div className="flex gap-3 items-center">
                                    <input
                                        type="color"
                                        value={brand.brandColor}
                                        onChange={e => setBrand({ ...brand, brandColor: e.target.value })}
                                        className="h-12 w-16 p-1 border border-gray-200 rounded-xl cursor-pointer bg-white"
                                    />
                                    <input
                                        type="text"
                                        value={brand.brandColor}
                                        onChange={e => setBrand({ ...brand, brandColor: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold font-inter" dir="ltr"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">ألوان النصوص والعناوين</label>
                                <div className="flex gap-3 items-center">
                                    <input
                                        type="color"
                                        value={brand.brandSecondaryColor}
                                        onChange={e => setBrand({ ...brand, brandSecondaryColor: e.target.value })}
                                        className="h-12 w-16 p-1 border border-gray-200 rounded-xl cursor-pointer bg-white"
                                    />
                                    <input
                                        type="text"
                                        value={brand.brandSecondaryColor}
                                        onChange={e => setBrand({ ...brand, brandSecondaryColor: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold font-inter" dir="ltr"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ══ Section 2: Typography ══ */}
                    <div className="bg-white rounded-xl border border-gray-100 p-6 sm:p-8 shadow-lg shadow-emerald-600/20">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-emerald-600 border border-gray-100"><FiType /></div>
                            <div>
                                <h2 className="text-lg font-bold text-emerald-600">الخطوط</h2>
                                <p className="text-xs text-gray-400 font-bold">اختر نمط الخط الذي يناسب هوية متجرك</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {FONT_OPTIONS.map(f => (
                                <button
                                    key={f.id}
                                    onClick={() => setBrand({ ...brand, brandFont: f.id })}
                                    className={`relative p-6 rounded-xl border-2 text-center transition-all hover:scale-[1.02] ${brand.brandFont === f.id ? 'border-ink bg-gray-50' : 'border-gray-50 hover:border-gray-200'}`}
                                >
                                    <div className="text-2xl font-bold text-emerald-600 mb-2">{f.preview.slice(0, 2)}</div>
                                    <div className="text-sm font-bold text-emerald-600">{f.name}</div>
                                    <div className="text-[10px] text-gray-400 mt-1 font-bold">{f.desc}</div>
                                    {brand.brandFont === f.id && (
                                        <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-emerald-600 rounded-xl flex items-center justify-center text-white text-[12px] shadow-lg shadow-emerald-600/20"><FiCheck /></div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ══ Section 3: Button Style ══ */}
                    <div className="bg-white rounded-xl border border-gray-100 p-6 sm:p-8 shadow-lg shadow-emerald-600/20">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-emerald-600 border border-gray-100"><FiSquare /></div>
                            <div>
                                <h2 className="text-lg font-bold text-emerald-600">شكل الأزرار</h2>
                                <p className="text-xs text-gray-400 font-bold">حدد نمط الزوايا لأزرار متجرك</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-6">
                            {BUTTON_STYLES.map(b => (
                                <button
                                    key={b.id}
                                    onClick={() => setBrand({ ...brand, brandButtonStyle: b.id })}
                                    className={`relative p-6 rounded-xl border-2 text-center transition-all ${brand.brandButtonStyle === b.id ? 'border-ink bg-gray-50' : 'border-gray-50 hover:border-gray-200'}`}
                                >
                                    <div className="flex justify-center mb-4">
                                        <div
                                            className="px-6 py-2.5 text-white text-xs font-bold shadow-md"
                                            style={{ background: brand.brandColor, borderRadius: b.radius }}
                                        >
                                            Buy Now
                                        </div>
                                    </div>
                                    <div className="text-sm font-bold text-emerald-600">{b.name}</div>
                                    {brand.brandButtonStyle === b.id && (
                                        <div className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-emerald-600 rounded-xl flex items-center justify-center text-white text-[12px] shadow-lg shadow-emerald-600/20"><FiCheck /></div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ══ Section 5: Store Banner & Tagline ══ */}
                    <div className="bg-white rounded-xl border border-gray-100 p-6 sm:p-8 shadow-lg shadow-emerald-600/20">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-emerald-600 border border-gray-100"><FiEdit3 /></div>
                            <div>
                                <h2 className="text-lg font-bold text-emerald-600">شعار المتجر والوصف</h2>
                                <p className="text-xs text-gray-400 font-bold">حدد الوصف والبانر المميز لواجهة متجرك</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">الوصف القصير (Tagline)</label>
                                <input
                                    type="text"
                                    value={brand.storeTagline}
                                    onChange={e => setBrand({ ...brand, storeTagline: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-sm font-bold font-inter focus:ring-4 focus:ring-ink/5 focus:border-ink transition-all"
                                    maxLength={80}
                                    placeholder='مثال: "نحو احتراف التجارة الرقمية"'
                                />
                                <p className="text-[10px] text-gray-400 mt-2 font-bold">{brand.storeTagline.length}/80 حرف</p>
                            </div>

                            <div>
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">بانر المتجر (اختياري)</label>
                                {brand.storeBanner && (
                                    <div className="mb-4 rounded-xl overflow-hidden h-40 relative group">
                                        <img src={brand.storeBanner} alt="banner" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button
                                                onClick={() => setBrand({ ...brand, storeBanner: '' })}
                                                className="bg-red-500 text-white text-xs px-5 py-2 rounded-xl font-bold shadow-lg shadow-emerald-600/20"
                                            >حذف الصورة</button>
                                        </div>
                                    </div>
                                )}
                                <FileUploader
                                    onUploadSuccess={(urls: string[]) => setBrand({ ...brand, storeBanner: urls[0] })}
                                    maxSize={5 * 1024 * 1024}
                                    accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── Right Column: Live Preview ─── */}
                <div className="lg:col-span-1">
                    <div className="sticky top-28 space-y-6">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] border-r-4 border-ink pr-3">المعاينة الحية</h3>

                        {/* Mini Storefront Preview */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-lg shadow-emerald-600/20 overflow-hidden transition-all duration-500">
                            {/* Cover */}
                            <div
                                className="h-32 relative"
                                style={{
                                    background: brand.storeBanner
                                        ? `url(${brand.storeBanner}) center/cover`
                                        : `linear-gradient(135deg, ${brand.brandColor} 0%, ${brand.brandSecondaryColor} 100%)`
                                }}
                            >
                                <div className="absolute inset-0 bg-emerald-600" />
                            </div>

                            {/* Avatar */}
                            <div className="px-6 -mt-10 relative z-10">
                                <div
                                    className="w-20 h-20 rounded-xl border-4 border-white shadow-lg shadow-emerald-600/20 overflow-hidden flex items-center justify-center text-white text-2xl font-bold"
                                    style={{ background: brand.brandColor }}
                                >
                                    {brand.avatar ? (
                                        <img src={brand.avatar} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        brand.name?.charAt(0) || 'T'
                                    )}
                                </div>
                            </div>

                            {/* Info */}
                            <div className="px-6 pt-4 pb-8">
                                <h4 className="font-bold text-emerald-600 text-lg tracking-tight">{brand.name || 'اسم متجرك'}</h4>
                                <p className="text-xs font-bold mt-1" style={{ color: brand.brandSecondaryColor }}>@{brand.username || 'username'}</p>
                                {brand.storeTagline && (
                                    <p className="text-xs text-gray-400 mt-2 leading-relaxed font-bold">{brand.storeTagline}</p>
                                )}

                                {/* Mini Product Cards */}
                                <div className="mt-6 space-y-3">
                                    {['دورة احترافية الرقمية', 'كتاب استراتيجيات البيع'].map((t, i) => (
                                        <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                            <div className="w-12 h-12 rounded-lg flex-shrink-0 bg-white border border-gray-100 flex items-center justify-center">
                                                <div className="w-6 h-6 rounded-xl" style={{ background: `${brand.brandSecondaryColor}20` }} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[11px] font-bold text-emerald-600 truncate">{t}</div>
                                                <div className="text-[10px] font-bold mt-0.5" style={{ color: brand.brandSecondaryColor }}>$49.00</div>
                                            </div>
                                            <div
                                                className="px-4 py-1.5 text-[9px] font-bold text-white flex-shrink-0"
                                                style={{ background: brand.brandColor, borderRadius: btnRadius }}
                                            >BUY</div>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    className="w-full mt-6 py-3.5 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition-transform active:scale-95"
                                    style={{ background: brand.brandColor, borderRadius: btnRadius }}
                                >
                                    عرض كافة المنتجات
                                </button>
                            </div>
                        </div>

                        {/* Color Code Card */}
                        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                             <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-xl" style={{ background: brand.brandColor }} />
                                <span className="text-[10px] font-bold font-inter text-emerald-600 uppercase tracking-widest">{brand.brandColor}</span>
                             </div>
                             <div className="flex items-center gap-3 mt-2">
                                <div className="w-3 h-3 rounded-xl" style={{ background: brand.brandSecondaryColor }} />
                                <span className="text-[10px] font-bold font-inter text-emerald-600 uppercase tracking-widest">{brand.brandSecondaryColor}</span>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
