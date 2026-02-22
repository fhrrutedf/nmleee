'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowRight, FiSave, FiPackage, FiImage, FiX, FiCheckSquare, FiSquare, FiAlertCircle } from 'react-icons/fi';
import Link from 'next/link';
import showToast from '@/lib/toast';
import FileUploader from '@/components/ui/FileUploader';
import RichTextEditor from '@/components/ui/RichTextEditor';

export default function NewBundlePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetchingProducts, setFetchingProducts] = useState(true);
    const [products, setProducts] = useState<any[]>([]);

    // UI controls
    const [showCoverUploader, setShowCoverUploader] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        image: '',
        productIds: [] as string[],
    });

    useEffect(() => {
        // Fetch products to allow bundle selection
        const loadProducts = async () => {
            try {
                const res = await fetch('/api/products');
                if (res.ok) {
                    const data = await res.json();
                    setProducts(data);
                }
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setFetchingProducts(false);
            }
        };
        loadProducts();
    }, []);

    const toggleProduct = (productId: string) => {
        setFormData(prev => {
            const exists = prev.productIds.includes(productId);
            if (exists) {
                return { ...prev, productIds: prev.productIds.filter(id => id !== productId) };
            } else {
                return { ...prev, productIds: [...prev.productIds, productId] };
            }
        });
    };

    const calculateOriginalValue = () => {
        let total = 0;
        formData.productIds.forEach(id => {
            const prod = products.find(p => p.id === id);
            if (prod) total += prod.price || 0;
        });
        return total;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.productIds.length < 2) {
            return showToast.error('يجب اختيار منتجين على الأقل لإنشاء باقة!');
        }

        setLoading(true);
        const toastId = showToast.loading('جاري حفظ الباقة...');

        try {
            const response = await fetch('/api/bundles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                showToast.dismiss(toastId);
                showToast.success('تم إنشاء الباقة بنجاح!');
                router.push('/dashboard/bundles');
            } else {
                throw new Error('فشل إضافة الباقة');
            }
        } catch (error) {
            console.error('Error creating bundle:', error);
            showToast.dismiss(toastId);
            showToast.error('حدث خطأ أثناء حفظ الباقة');
        } finally {
            setLoading(false);
        }
    };

    const originalValue = calculateOriginalValue();
    const currentPrice = parseFloat(formData.price || '0');
    const discountAmount = originalValue - currentPrice;
    const discountPercentage = originalValue > 0 && discountAmount > 0
        ? Math.round((discountAmount / originalValue) * 100)
        : 0;

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="mb-8">
                <Link href="/dashboard/bundles" className="text-text-muted hover:text-action-blue flex items-center gap-2 mb-4 transition-colors font-medium">
                    <FiArrowRight />
                    <span>العودة للباقات</span>
                </Link>
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-action-blue/10 rounded-xl flex items-center justify-center">
                        <FiPackage className="text-xl text-action-blue" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-primary-charcoal dark:text-white">إنشاء باقة جديدة</h1>
                        <p className="text-text-muted mt-1 font-medium">قم بتجميع منتجاتك لبيعها معاً بسعر مخفض ومميز لعملائك</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Right col - Form details */}
                <div className="col-span-1 lg:col-span-2 space-y-6">
                    <div className="card space-y-6 bg-white dark:bg-card-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-800">
                        <div className="space-y-6">
                            <div>
                                <label className="label text-lg font-bold">اسم الباقة الفريد <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    className="input text-lg py-3"
                                    placeholder="مثال: الباقة الذهبية لتعلم التصميم"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="label text-lg font-bold">وصف الباقة <span className="text-red-500">*</span></label>
                                <p className="text-sm text-gray-500 mb-2">اشرح لعميلك لماذا هذه الباقة موفرة وقيمة جداً.</p>
                                <RichTextEditor
                                    value={formData.description}
                                    onChange={(val) => setFormData({ ...formData, description: val })}
                                />
                            </div>

                            <div>
                                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                                    <FiImage className="text-action-blue" />
                                    غلاف الباقة التعريفي
                                </h3>
                                {formData.image ? (
                                    <div className="relative inline-block">
                                        <img src={formData.image} alt="Preview" className="w-full max-w-sm h-64 object-cover rounded-2xl border-2 border-gray-100 shadow-sm" />
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, image: '' })}
                                            className="absolute -top-3 -right-3 bg-red-500 text-white p-2.5 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                                        >
                                            <FiX />
                                        </button>
                                    </div>
                                ) : showCoverUploader ? (
                                    <FileUploader
                                        maxFiles={1}
                                        accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] }}
                                        onUploadSuccess={(urls: string[]) => {
                                            setFormData({ ...formData, image: urls[0] });
                                            setShowCoverUploader(false);
                                        }}
                                    />
                                ) : (
                                    <button type="button" onClick={() => setShowCoverUploader(true)} className="btn btn-outline border-dashed w-full h-32 text-gray-500 hover:text-action-blue hover:border-action-blue">
                                        <FiImage className="text-2xl mb-2" />
                                        رفع صورة غلاف للباقة
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="card space-y-6 bg-white dark:bg-card-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-800">
                        <h2 className="text-xl font-bold border-b border-gray-100 dark:border-gray-800 pb-4 mb-4">المنتجات المشمولة في الباقة</h2>

                        {fetchingProducts ? (
                            <div className="py-8 text-center text-gray-500">جاري تحميل منتجاتك...</div>
                        ) : !products || products.length === 0 ? (
                            <div className="py-8 text-center text-gray-500">
                                لا يوجد لديك منتجات لإضافتها!
                                <br />
                                <Link href="/dashboard/products/new" className="text-action-blue font-bold underline mt-2 block">أضف منتجاتك أولاً</Link>
                            </div>
                        ) : (
                            <div className="grid sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-200">
                                {products?.map((product) => {
                                    const isSelected = formData.productIds.includes(product.id);
                                    return (
                                        <div
                                            key={product.id}
                                            onClick={() => toggleProduct(product.id)}
                                            className={`p-4 rounded-2xl cursor-pointer border-2 transition-all flex items-start gap-4 ${isSelected ? 'border-action-blue bg-action-blue/5' : 'border-gray-100 hover:border-action-blue/30 dark:border-gray-800'}`}
                                        >
                                            <div className="mt-1 flex-shrink-0">
                                                {isSelected ? (
                                                    <FiCheckSquare className="text-xl text-action-blue bg-white rounded" />
                                                ) : (
                                                    <FiSquare className="text-xl text-gray-300" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex gap-2">
                                                    {product.image && (
                                                        <img src={product.image} className="w-12 h-12 object-cover rounded-lg shrink-0" alt="product" />
                                                    )}
                                                    <div>
                                                        <p className={`font-bold line-clamp-2 leading-tight text-sm ${isSelected ? 'text-action-blue' : 'text-gray-900 dark:text-white'}`}>{product.title}</p>
                                                        <p className="text-gray-500 text-xs mt-1 font-bold">{product.price} ج.م</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {formData.productIds.length > 0 && formData.productIds.length < 2 && (
                            <p className="text-red-500 text-sm flex items-center gap-1 font-medium mt-2"><FiAlertCircle /> يرجى تحديد منتج آخر على الأقل لإكمال باقتك.</p>
                        )}
                    </div>
                </div>

                {/* Left col - Pricing and saving summary */}
                <div className="col-span-1 border-gray-100">
                    <div className="sticky top-24 space-y-6">
                        <div className="bg-white dark:bg-card-white rounded-3xl p-6 shadow-xl shadow-gray-100 dark:shadow-gray-900 border border-gray-100 dark:border-gray-800 relative overflow-hidden">
                            {discountPercentage > 0 && (
                                <div className="absolute top-0 right-0 bg-green-500 text-white px-4 py-1 rounded-bl-2xl font-black text-sm shadow-md">
                                    خصم  {discountPercentage}%
                                </div>
                            )}

                            <h3 className="font-bold text-xl mb-4 text-primary-charcoal dark:text-white">تسعير الباقة</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-gray-500 mb-1 block">سعر المنتجات الفردية (إجمالي)</label>
                                    <p className="text-xl font-bold text-gray-400 line-through decoration-red-500/50 decoration-2">{originalValue.toFixed(2)} ج.م</p>
                                </div>

                                <div className="bg-action-blue/5 p-4 rounded-xl border border-action-blue/10">
                                    <label className="text-sm font-bold text-action-blue mb-2 block">سعر الباقة الإجمالي الجديد <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                            <span className="text-gray-500 font-bold">ج.م</span>
                                        </div>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            step="0.01"
                                            className="w-full pl-4 pr-14 py-4 rounded-xl border border-action-blue/20 bg-white dark:bg-gray-800 text-2xl font-black focus:ring-4 ring-action-blue/20 outline-none transition-all shadow-inner"
                                            placeholder="0.00"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2 font-medium">سعر أفضل سيشجع الطلاب على شراء الباقة بأكملها.</p>
                                </div>

                                {discountAmount > 0 && (
                                    <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-3 rounded-lg text-sm font-bold border border-green-100 dark:border-green-800">
                                        سيوفر العميل {discountAmount.toFixed(2)} ج.م !
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || formData.productIds.length < 2 || !formData.price || !formData.title}
                            className="w-full btn btn-primary text-lg py-4 shadow-xl shadow-action-blue/20 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    جاري المعالجة...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2 font-bold">
                                    <FiSave className="text-xl" /> حفظ وإطلاق الباقة
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
