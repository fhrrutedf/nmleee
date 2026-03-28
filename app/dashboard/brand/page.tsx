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
    { name: 'زمردي (افتراضي)', primary: '#064E3B', secondary: '#0F172A' },
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
    { id: 'bold', name: 'جريء', desc: 'Black Ops One', preview: 'خط قوي ومؤثر' },
];

const BUTTON_STYLES = [
    { id: 'rounded', name: 'مدور', radius: '12px' },
    { id: 'pill', name: 'كبسولة', radius: '9999px' },
    { id: 'square', name: 'حاد', radius: '4px' },
];

const LAYOUT_OPTIONS = [
    { id: 'grid', name: 'شبكة', icon: '⊞', desc: '3 أعمدة — الأفضل لعرض المنتجات' },
    { id: 'list', name: 'قائمة', icon: '☰', desc: 'عمود واحد — أفضل للوصف الطويل' },
    { id: 'masonry', name: 'ديناميكي', icon: '◫', desc: 'مثل Pinterest — حديث ومرن' },
];

export default function BrandEditorPage() {
    const { data: session } = useSession();
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    const [brand, setBrand] = useState({
        brandColor: '#064E3B',
        brandSecondaryColor: '#0F172A',
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
                    brandColor: data.brandColor || '#064E3B',
                    brandSecondaryColor: data.brandSecondaryColor || '#0F172A',
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

    const btnRadius = BUTTON_STYLES.find(b => b.id === brand.brandButtonStyle)?.radius || '12px';

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <FiRefreshCw className="text-4xl text-brand-900 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-16">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-primary-charcoal">🎨 الهوية البصرية</h1>
                    <p className="text-text-muted mt-1 text-sm">خصص مظهر متجرك ليعكس علامتك التجارية الفريدة</p>
                </div>
                <div className="flex gap-3">
                    {brand.username && (
                        <Link
                            href={`/${brand.username}`}
                            target="_blank"
                            className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 rounded-2xl font-bold text-sm text-gray-600 hover:border-brand-700 hover:text-brand-900 transition-all shadow-sm"
                        >
                            <FiEye /> معاينة متجري
                        </Link>
                    )}
                    <button
                        onClick={saveBrand}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-3 bg-brand-900 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-900/20 hover:bg-brand-800 transition-all disabled:opacity-60"
                    >
                        <FiSave /> {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* ─── Left Column: Controls ─── */}
                <div className="lg:col-span-2 space-y-8">

                    {/* ══ Section 1: Colors ══ */}
                    <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-900"><FiDroplet /></div>
                            <div>
                                <h2 className="text-lg font-bold text-navy-900">الألوان</h2>
                                <p className="text-xs text-text-muted">اختر لوحة ألوان جاهزة أو حدد ألوانك يدوياً</p>
                            </div>
                        </div>

                        {/* Preset Palettes */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                            {COLOR_PALETTES.map((p, i) => (
                                <button
                                    key={i}
                                    onClick={() => applyPalette(p)}
                                    className={`relative p-3 rounded-2xl border-2 transition-all text-center hover:scale-[1.02] ${brand.brandColor === p.primary ? 'border-brand-900 shadow-lg ring-2 ring-brand-200' : 'border-gray-100 hover:border-gray-200'}`}
                                >
                                    <div className="flex gap-1 justify-center mb-2">
                                        <div className="w-8 h-8 rounded-lg shadow-sm" style={{ background: p.primary }} />
                                        <div className="w-8 h-8 rounded-lg shadow-sm" style={{ background: p.secondary }} />
                                    </div>
                                    <span className="text-[11px] font-bold text-gray-600">{p.name}</span>
                                    {brand.brandColor === p.primary && (
                                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-brand-900 rounded-full flex items-center justify-center text-white text-[10px]">
                                            <FiCheck />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Manual Color Pickers */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-1.5 block">اللون الرئيسي</label>
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="color"
                                        value={brand.brandColor}
                                        onChange={e => setBrand({ ...brand, brandColor: e.target.value })}
                                        className="h-11 w-14 p-1 border border-gray-200 rounded-xl cursor-pointer bg-white"
                                    />
                                    <input
                                        type="text"
                                        value={brand.brandColor}
                                        onChange={e => setBrand({ ...brand, brandColor: e.target.value })}
                                        className="input flex-1 text-sm" dir="ltr" placeholder="#064E3B"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-1.5 block">اللون الثانوي</label>
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="color"
                                        value={brand.brandSecondaryColor}
                                        onChange={e => setBrand({ ...brand, brandSecondaryColor: e.target.value })}
                                        className="h-11 w-14 p-1 border border-gray-200 rounded-xl cursor-pointer bg-white"
                                    />
                                    <input
                                        type="text"
                                        value={brand.brandSecondaryColor}
                                        onChange={e => setBrand({ ...brand, brandSecondaryColor: e.target.value })}
                                        className="input flex-1 text-sm" dir="ltr" placeholder="#0F172A"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ══ Section 2: Typography ══ */}
                    <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-900"><FiType /></div>
                            <div>
                                <h2 className="text-lg font-bold text-navy-900">الخطوط</h2>
                                <p className="text-xs text-text-muted">اختر نمط الخط الذي يناسب هوية متجرك</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {FONT_OPTIONS.map(f => (
                                <button
                                    key={f.id}
                                    onClick={() => setBrand({ ...brand, brandFont: f.id })}
                                    className={`relative p-4 rounded-2xl border-2 text-center transition-all hover:scale-[1.02] ${brand.brandFont === f.id ? 'border-brand-900 bg-brand-50/50 shadow-md' : 'border-gray-100 hover:border-gray-200'}`}
                                >
                                    <div className="text-2xl font-bold text-navy-900 mb-1">{f.preview.slice(0, 2)}</div>
                                    <div className="text-sm font-bold text-gray-800">{f.name}</div>
                                    <div className="text-[10px] text-text-muted mt-0.5">{f.desc}</div>
                                    {brand.brandFont === f.id && (
                                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-brand-900 rounded-full flex items-center justify-center text-white text-[10px]"><FiCheck /></div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ══ Section 3: Button Style ══ */}
                    <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-900"><FiSquare /></div>
                            <div>
                                <h2 className="text-lg font-bold text-navy-900">شكل الأزرار</h2>
                                <p className="text-xs text-text-muted">حدد نمط الزوايا لأزرار متجرك</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            {BUTTON_STYLES.map(b => (
                                <button
                                    key={b.id}
                                    onClick={() => setBrand({ ...brand, brandButtonStyle: b.id })}
                                    className={`relative p-4 rounded-2xl border-2 text-center transition-all ${brand.brandButtonStyle === b.id ? 'border-brand-900 bg-brand-50/50 shadow-md' : 'border-gray-100 hover:border-gray-200'}`}
                                >
                                    <div className="flex justify-center mb-3">
                                        <div
                                            className="px-6 py-2 text-white text-xs font-bold shadow-md"
                                            style={{ background: brand.brandColor, borderRadius: b.radius }}
                                        >
                                            اشتري الآن
                                        </div>
                                    </div>
                                    <div className="text-sm font-bold text-gray-800">{b.name}</div>
                                    {brand.brandButtonStyle === b.id && (
                                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-brand-900 rounded-full flex items-center justify-center text-white text-[10px]"><FiCheck /></div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ══ Section 4: Layout ══ */}
                    <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-900"><FiLayout /></div>
                            <div>
                                <h2 className="text-lg font-bold text-navy-900">تخطيط المنتجات</h2>
                                <p className="text-xs text-text-muted">اختر طريقة عرض منتجاتك في واجهة المتجر</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            {LAYOUT_OPTIONS.map(l => (
                                <button
                                    key={l.id}
                                    onClick={() => setBrand({ ...brand, brandLayout: l.id })}
                                    className={`relative p-4 rounded-2xl border-2 text-center transition-all ${brand.brandLayout === l.id ? 'border-brand-900 bg-brand-50/50 shadow-md' : 'border-gray-100 hover:border-gray-200'}`}
                                >
                                    <div className="text-3xl mb-2">{l.icon}</div>
                                    <div className="text-sm font-bold text-gray-800">{l.name}</div>
                                    <div className="text-[10px] text-text-muted mt-0.5 leading-tight">{l.desc}</div>
                                    {brand.brandLayout === l.id && (
                                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-brand-900 rounded-full flex items-center justify-center text-white text-[10px]"><FiCheck /></div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ══ Section 5: Store Banner & Tagline ══ */}
                    <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-900"><FiEdit3 /></div>
                            <div>
                                <h2 className="text-lg font-bold text-navy-900">بانر المتجر والشعار الكتابي</h2>
                                <p className="text-xs text-text-muted">شعار نصي قصير ظاهر تحت اسمك + بانر مخصص</p>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-1.5 block">الشعار النصي (Tagline)</label>
                                <input
                                    type="text"
                                    value={brand.storeTagline}
                                    onChange={e => setBrand({ ...brand, storeTagline: e.target.value })}
                                    className="input"
                                    maxLength={80}
                                    placeholder='مثال: "خبراتك الرقمية، مصدر ربحك الأول"'
                                />
                                <p className="text-[10px] text-text-muted mt-1">{brand.storeTagline.length}/80 حرف</p>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-1.5 block">بانر المتجر (اختياري)</label>
                                {brand.storeBanner && (
                                    <div className="mb-3 rounded-2xl overflow-hidden h-32 relative">
                                        <img src={brand.storeBanner} alt="banner" className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => setBrand({ ...brand, storeBanner: '' })}
                                            className="absolute top-2 left-2 bg-red-500 text-white text-xs px-3 py-1 rounded-full font-bold"
                                        >حذف</button>
                                    </div>
                                )}
                                <FileUploader
                                    onUploadSuccess={(urls: string[]) => setBrand({ ...brand, storeBanner: urls[0] })}
                                    maxSize={5 * 1024 * 1024}
                                    accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }}
                                />
                                <p className="text-[10px] text-text-muted mt-1">المقاس المثالي: 1920×400 بكسل</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── Right Column: Live Preview ─── */}
                <div className="lg:col-span-1">
                    <div className="sticky top-28 space-y-4">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">معاينة حية</h3>

                        {/* Mini Storefront Preview */}
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden">
                            {/* Cover */}
                            <div
                                className="h-28 relative"
                                style={{
                                    background: brand.coverImage
                                        ? `url(${brand.coverImage}) center/cover`
                                        : `linear-gradient(135deg, ${brand.brandColor}ee 0%, ${brand.brandSecondaryColor}aa 100%)`
                                }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />
                            </div>

                            {/* Avatar */}
                            <div className="px-5 -mt-8 relative z-10">
                                <div
                                    className="w-16 h-16 rounded-2xl border-4 border-white shadow-xl overflow-hidden flex items-center justify-center text-white text-xl font-bold"
                                    style={{ background: `linear-gradient(135deg, ${brand.brandColor}, ${brand.brandSecondaryColor})` }}
                                >
                                    {brand.avatar ? (
                                        <img src={brand.avatar} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        brand.name?.charAt(0) || 'T'
                                    )}
                                </div>
                            </div>

                            {/* Info */}
                            <div className="px-5 pt-3 pb-5">
                                <h4 className="font-bold text-gray-900 text-base">{brand.name || 'اسم المتجر'}</h4>
                                <p className="text-[10px] font-bold mt-0.5" style={{ color: brand.brandColor }}>@{brand.username || 'username'}</p>
                                {brand.storeTagline && (
                                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{brand.storeTagline}</p>
                                )}

                                {/* Mini Product Cards */}
                                <div className="mt-4 space-y-2">
                                    {['دورة تصميم UX/UI', 'كتاب التسويق الرقمي'].map((t, i) => (
                                        <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                                            <div className="w-10 h-10 rounded-lg flex-shrink-0" style={{ background: `${brand.brandColor}15` }} />
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[11px] font-bold text-gray-800 truncate">{t}</div>
                                                <div className="text-[10px] font-bold" style={{ color: brand.brandColor }}>{i === 0 ? '49$' : 'مجاني'}</div>
                                            </div>
                                            <div
                                                className="px-2.5 py-1 text-[9px] font-bold text-white flex-shrink-0"
                                                style={{ background: brand.brandColor, borderRadius: btnRadius }}
                                            >شراء</div>
                                        </div>
                                    ))}
                                </div>

                                {/* CTA Preview */}
                                <button
                                    className="w-full mt-4 py-2.5 text-white text-xs font-bold shadow-md"
                                    style={{ background: brand.brandColor, borderRadius: btnRadius }}
                                >
                                    تواصل مع البائع
                                </button>
                            </div>
                        </div>

                        {/* Color Summary */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                            <div className="flex gap-2">
                                <div className="flex-1 h-8 rounded-lg shadow-sm" style={{ background: brand.brandColor }} />
                                <div className="flex-1 h-8 rounded-lg shadow-sm" style={{ background: brand.brandSecondaryColor }} />
                                <div className="flex-1 h-8 rounded-lg shadow-sm bg-white border border-gray-200" />
                            </div>
                            <p className="text-[10px] text-center text-text-muted mt-2 font-bold">ألوانك الحالية</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
