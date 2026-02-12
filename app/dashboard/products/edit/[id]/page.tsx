'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
    FiEdit,
    FiTrash2,
    FiEye,
    FiEyeOff,
    FiArrowUp,
    FiArrowDown,
    FiSave,
    FiImage,
    FiPackage,
    FiDollarSign,
    FiSettings
} from 'react-icons/fi';

export default function EditProductPage() {
    const params = useParams();
    const [activeTab, setActiveTab] = useState('basics');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        category: '',
        image: '',
        fileUrl: '',
        fileType: 'pdf',
        tags: '',
        isActive: true,
        isFree: false,
        displayOrder: 0,
        duration: '',
        sessions: '',
        features: [''],
    });

    useEffect(() => {
        fetchProduct();
    }, [params.id]);

    const fetchProduct = async () => {
        try {
            const response = await fetch(`/api/products/${params.id}`);
            if (response.ok) {
                const data = await response.json();
                setFormData({
                    title: data.title || '',
                    description: data.description || '',
                    price: data.price?.toString() || '',
                    category: data.category || '',
                    image: data.image || '',
                    fileUrl: data.fileUrl || '',
                    fileType: data.fileType || 'pdf',
                    tags: data.tags?.join(', ') || '',
                    isActive: data.isActive ?? true,
                    isFree: data.isFree ?? false,
                    displayOrder: data.displayOrder || 0,
                    duration: data.duration || '',
                    sessions: data.sessions?.toString() || '',
                    features: data.features || [''],
                });
            }
        } catch (error) {
            console.error('Error fetching product:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await fetch(`/api/products/${params.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    price: parseFloat(formData.price),
                    sessions: formData.sessions ? parseInt(formData.sessions) : null,
                    tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
                    features: formData.features.filter(f => f.trim()),
                }),
            });

            if (response.ok) {
                alert('تم حفظ التغييرات بنجاح! ✅');
            } else {
                alert('حدث خطأ أثناء الحفظ');
            }
        } catch (error) {
            console.error('Error saving product:', error);
            alert('حدث خطأ أثناء الحفظ');
        } finally {
            setSaving(false);
        }
    };

    const addFeature = () => {
        setFormData({
            ...formData,
            features: [...formData.features, ''],
        });
    };

    const removeFeature = (index: number) => {
        const newFeatures = formData.features.filter((_, i) => i !== index);
        setFormData({ ...formData, features: newFeatures });
    };

    const updateFeature = (index: number, value: string) => {
        const newFeatures = [...formData.features];
        newFeatures[index] = value;
        setFormData({ ...formData, features: newFeatures });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl">
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold">تعديل المنتج</h1>
                        <p className="text-gray-600 mt-1">{formData.title}</p>
                    </div>
                    <Link href="/dashboard/products" className="btn btn-outline">
                        إلغاء
                    </Link>
                </div>
            </div>

            {/* Tabs */}
            <div className="card mb-6">
                <div className="flex gap-2 border-b pb-0 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('basics')}
                        className={`px-6 py-3 font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'basics'
                                ? 'border-primary-600 text-primary-600'
                                : 'border-transparent text-gray-600 hover:text-primary-600'
                            }`}
                    >
                        <FiPackage className="inline ml-2" />
                        بيانات المنتج
                    </button>
                    <button
                        onClick={() => setActiveTab('media')}
                        className={`px-6 py-3 font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'media'
                                ? 'border-primary-600 text-primary-600'
                                : 'border-transparent text-gray-600 hover:text-primary-600'
                            }`}
                    >
                        <FiImage className="inline ml-2" />
                        الملفات المرفقة
                    </button>
                    <button
                        onClick={() => setActiveTab('pricing')}
                        className={`px-6 py-3 font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'pricing'
                                ? 'border-primary-600 text-primary-600'
                                : 'border-transparent text-gray-600 hover:text-primary-600'
                            }`}
                    >
                        <FiDollarSign className="inline ml-2" />
                        السعر
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`px-6 py-3 font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'settings'
                                ? 'border-primary-600 text-primary-600'
                                : 'border-transparent text-gray-600 hover:text-primary-600'
                            }`}
                    >
                        <FiSettings className="inline ml-2" />
                        إعدادات العرض
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            <div className="card">
                {activeTab === 'basics' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold">بيانات المنتج الأساسية</h2>

                        <div>
                            <label className="label">عنوان المنتج *</label>
                            <input
                                type="text"
                                className="input"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="label">الوصف *</label>
                            <textarea
                                rows={6}
                                className="input"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="label">التصنيف</label>
                                <select
                                    className="input"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="">اختر التصنيف</option>
                                    <option value="courses">دورات تدريبية</option>
                                    <option value="ebooks">كتب إلكترونية</option>
                                    <option value="templates">قوالب</option>
                                    <option value="software">برامج</option>
                                    <option value="graphics">تصاميم</option>
                                    <option value="other">أخرى</option>
                                </select>
                            </div>

                            <div>
                                <label className="label">الوسوم (Tags)</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="افصل بفاصلة"
                                    value={formData.tags}
                                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="label">المدة (اختياري)</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="مثال: ساعتان"
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="label">عدد الجلسات/المحاضرات (اختياري)</label>
                                <input
                                    type="number"
                                    className="input"
                                    placeholder="مثال: 10"
                                    value={formData.sessions}
                                    onChange={(e) => setFormData({ ...formData, sessions: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Features */}
                        <div>
                            <label className="label">المميزات (ماذا سيحصل العميل؟)</label>
                            <div className="space-y-3">
                                {formData.features.map((feature, index) => (
                                    <div key={index} className="flex gap-2">
                                        <input
                                            type="text"
                                            className="input flex-1"
                                            placeholder="أدخل ميزة"
                                            value={feature}
                                            onChange={(e) => updateFeature(index, e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeFeature(index)}
                                            className="btn btn-outline text-red-600 hover:bg-red-50"
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addFeature}
                                    className="btn btn-outline w-full"
                                >
                                    + إضافة ميزة
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'media' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold">الملفات المرفقة</h2>

                        <div>
                            <label className="label">صورة المنتج</label>
                            <input
                                type="url"
                                className="input"
                                placeholder="https://example.com/image.jpg"
                                value={formData.image}
                                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                            />
                            {formData.image && (
                                <img
                                    src={formData.image}
                                    alt="Preview"
                                    className="mt-4 w-full max-w-md rounded-lg"
                                />
                            )}
                        </div>

                        <div>
                            <label className="label">رابط الملف الرقمي *</label>
                            <input
                                type="url"
                                className="input"
                                placeholder="https://drive.google.com/file/..."
                                value={formData.fileUrl}
                                onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="label">نوع الملف</label>
                            <select
                                className="input"
                                value={formData.fileType}
                                onChange={(e) => setFormData({ ...formData, fileType: e.target.value })}
                            >
                                <option value="pdf">PDF</option>
                                <option value="video">فيديو</option>
                                <option value="zip">ملف مضغوط (ZIP)</option>
                                <option value="audio">صوت</option>
                                <option value="document">مستند</option>
                                <option value="other">أخرى</option>
                            </select>
                        </div>
                    </div>
                )}

                {activeTab === 'pricing' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold">تسعير المنتج</h2>

                        <div>
                            <label className="label">السعر (ج.م)</label>
                            <input
                                type="number"
                                step="0.01"
                                className="input text-2xl font-bold"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            />
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                            <input
                                type="checkbox"
                                id="isFree"
                                className="w-5 h-5"
                                checked={formData.isFree}
                                onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })}
                            />
                            <label htmlFor="isFree" className="font-bold cursor-pointer">
                                متاح مجاناً (يمكن تحميله بدون دفع)
                            </label>
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold">إعدادات العرض</h2>

                        <div>
                            <label className="label">ترتيب ظهور المنتج في قائمة المنتجات</label>
                            <input
                                type="number"
                                className="input"
                                placeholder="0"
                                value={formData.displayOrder}
                                onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                المنتجات ذات الأرقام الأصغر تظهر أولاً
                            </p>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                            <input
                                type="checkbox"
                                id="isActive"
                                className="w-5 h-5"
                                checked={!formData.isActive}
                                onChange={(e) => setFormData({ ...formData, isActive: !e.target.checked })}
                            />
                            <div>
                                <label htmlFor="isActive" className="font-bold cursor-pointer block">
                                    منتج غير مدرج
                                </label>
                                <p className="text-sm text-gray-600">
                                    فعل هذا الخيار إذا كنت لا تريد إخفاء المنتج من صفحتك ويصبح فقط متاح عبر الرابط
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Save Button */}
                <div className="flex gap-4 mt-8 pt-6 border-t">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="btn btn-primary flex-1"
                    >
                        <FiSave className="inline ml-2" />
                        {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                    </button>
                    <Link href="/dashboard/products" className="btn btn-outline flex-1 text-center">
                        إلغاء
                    </Link>
                </div>
            </div>
        </div>
    );
}
