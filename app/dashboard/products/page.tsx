'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
    FiPlus, FiEdit2, FiTrash2, FiPackage, FiEye, FiSearch, 
    FiMoreVertical, FiCheck, FiX, FiExternalLink, FiDollarSign,
    FiFilter, FiRefreshCw
} from 'react-icons/fi';
import Link from 'next/link';
import Image from 'next/image';
import { apiGet, apiDelete, apiPost, handleApiError } from '@/lib/safe-fetch';
import showToast from '@/lib/toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductsPage() {
    const { data: session } = useSession();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
    const [tempPrice, setTempPrice] = useState('');
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const data = await apiGet('/api/products');
            setProducts(data);
        } catch (error) {
            console.error('Error:', handleApiError(error));
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (product: any) => {
        const toastId = showToast.loading('جاري تحديث الحالة...');
        try {
            const response = await fetch(`/api/products/${product.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...product, isActive: !product.isActive }),
            });
            if (response.ok) {
                showToast.dismiss(toastId);
                showToast.success('تم تحديث حالة المنتج بنجاح');
                fetchProducts();
            }
        } catch (error) {
            showToast.dismiss(toastId);
            showToast.error('فشل التحديث');
        }
    };

    const updatePrice = async (id: string) => {
        if (!tempPrice || isNaN(parseFloat(tempPrice))) return;
        const toastId = showToast.loading('جاري تحديث السعر...');
        try {
            const product = products.find(p => p.id === id);
            const response = await fetch(`/api/products/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...product, price: parseFloat(tempPrice) }),
            });
            if (response.ok) {
                showToast.dismiss(toastId);
                showToast.success('تم تحديث السعر ✅');
                setEditingPriceId(null);
                fetchProducts();
            }
        } catch (error) {
            showToast.dismiss(toastId);
            showToast.error('خطأ في التحديث');
        }
    };

    const deleteProduct = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا المنتج نهائياً؟')) return;
        try {
            await apiDelete(`/api/products/${id}`);
            showToast.success('تم الحذف بنجاح');
            fetchProducts();
        } catch (error) {
            showToast.error('فشل في الحذف');
        }
    };

    const filtered = products.filter(p => {
        const matchesSearch = p.title?.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = filterCategory === '' || p.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));

    // --- COMMERCIAL STATS LOGIC ---
    const totalSales = products.reduce((acc, p) => acc + (p.soldCount || 0), 0);
    const totalInventoryValue = products.reduce((acc, p) => acc + (p.price * (p.soldCount || 0)), 0);
    const topProduct = products.length > 0 ? [...products].sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0))[0] : null;

    return (
        <div className="space-y-8 pb-32 text-right px-2 md:px-6" dir="rtl">
            
            {/* --- TOP PERFORMERS SUMMARY --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="bg-white dark:bg-card-white p-6 rounded-xl border border-slate-50 dark:border-gray-800 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-600-50 dark:bg-blue-900/10 rounded-xl blur-2xl group-hover:scale-150 transition-transform"></div>
                    <div className="relative">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">تقدير صافي الأرباح 💰</p>
                        <h4 className="text-3xl font-bold text-slate-900 dark:text-white">{(totalInventoryValue * 0.85).toFixed(2)} <span className="text-sm font-bold text-slate-400">$</span></h4>
                        <p className="text-[10px] text-emerald-600-500 font-bold mt-2 flex items-center gap-1">بعد خصم عمولة المنصة التقريبية</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-card-white p-6 rounded-xl border border-slate-50 dark:border-gray-800 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-subtle dark:bg-indigo-900/10 rounded-xl blur-2xl group-hover:scale-150 transition-transform"></div>
                    <div className="relative">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">المنتج النجم (الأكثر مبيلاً) ⭐</p>
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white truncate">{topProduct?.title || 'لا يوجد مبيعات بعد'}</h4>
                        <p className="text-[10px] text-primary-ink font-bold mt-2 uppercase tracking-tighter">باع {topProduct?.soldCount || 0} نسخة إجمالاً</p>
                    </div>
                </div>

                <div className="bg-slate-900 text-white p-6 rounded-xl shadow-sm relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-xl blur-2xl group-hover:scale-150 transition-transform"></div>
                    <div className="relative">
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">إجمالي قيمة المبيعات (GMV)</p>
                        <h4 className="text-3xl font-bold">{totalInventoryValue.toFixed(0)} <span className="text-sm font-bold text-white/30">$</span></h4>
                        <p className="text-[10px] text-white/60 font-bold mt-2">لديك {products.length} منتجات في متجرك</p>
                    </div>
                </div>
            </div>

            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white dark:bg-card-white rounded-xl p-8 shadow-sm border border-slate-50 dark:border-gray-800">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white leading-tight">إدارة المنتجات الرقمية 📦</h1>
                    <p className="text-slate-400 font-bold text-xs mt-2 uppercase tracking-widest">تعديل سريع • تحكم شامل • إحصائيات الأرباح</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={fetchProducts}
                        className="w-12 h-12 flex items-center justify-center bg-slate-50 dark:bg-gray-800 text-slate-400 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-700 transition-all border border-slate-100 dark:border-gray-700"
                    >
                        <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                    </button>
                    <Link
                        href="/dashboard/products/new?new=true"
                        className="px-8 py-3.5 bg-primary-ink text-white rounded-[1.5rem] font-bold text-sm flex items-center justify-center gap-2 shadow-sm shadow-primary-indigo-100 hover:bg-primary-indigo-700 active:scale-95 transition-all"
                    >
                        <FiPlus /> إضافة منتج جديد
                    </Link>
                </div>
            </div>

            {/* --- FILTERS BAR --- */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2 relative">
                    <FiSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input 
                        type="text" 
                        placeholder="ابحث عن منتج..."
                        className="w-full h-14 pr-12 pl-4 bg-white dark:bg-card-white border border-slate-100 dark:border-gray-800 rounded-[1.2rem] text-sm font-bold shadow-sm focus:ring-4 focus:ring-subtle/50 outline-none transition-all dark:text-white"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div>
                    <select 
                        className="w-full h-14 bg-white dark:bg-card-white border border-slate-100 dark:border-gray-800 rounded-[1.2rem] px-4 text-xs font-bold text-slate-500 outline-none shadow-sm cursor-pointer"
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                    >
                        <option value="">جميع التصنيفات</option>
                        {categories.map((cat: any) => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
                <div className="bg-slate-900 text-white flex items-center justify-center rounded-[1.2rem] h-14 shadow-sm">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-center px-4">إجمالي المنتجات: {products.length}</p>
                </div>
            </div>

            {/* --- PRODUCTS TABLE --- */}
            <div className="bg-white dark:bg-card-white rounded-xl shadow-sm border border-slate-50 dark:border-gray-800 overflow-hidden">
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-right border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-gray-900/50 border-b border-slate-100 dark:border-gray-800">
                                <th className="p-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">المنتج والاسم التجاري</th>
                                <th className="p-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">التصنيف</th>
                                <th className="p-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">السعر ($)</th>
                                <th className="p-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">الأرباح (الصافي)</th>
                                <th className="p-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">تاريخ النشر</th>
                                <th className="p-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">الحالة</th>
                                <th className="p-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            <AnimatePresence>
                                {filtered.map((product) => (
                                    <motion.tr 
                                        key={product.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-slate-50/20 transition-colors group"
                                    >
                                        <td className="p-6">
                                            <div className="flex items-center gap-4 min-w-[250px]">
                                                <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 shrink-0 shadow-sm">
                                                    <img src={product.image || '/placeholder-product.png'} className="w-full h-full object-cover" alt="" />
                                                </div>
                                                <div>
                                                    <h3 className={`text-sm font-bold line-clamp-1 ${product.title?.includes('Screenshot') ? 'text-red-500 italic' : 'text-slate-900'}`}>
                                                        {product.title || 'بدون اسم'}
                                                    </h3>
                                                    {product.title?.includes('Screenshot') && (
                                                        <p className="text-[9px] text-red-400 font-bold mt-1">⚠️ اسم غير احترافي (يجب تعديله)</p>
                                                    )}
                                                    <p className="text-[10px] text-slate-400 mt-1 font-bold">Slug: {product.slug || 'لا يوجد'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6 text-center">
                                            <span className="px-3 py-1 bg-white border border-slate-100 rounded-lg text-[10px] font-bold text-slate-500 shadow-sm lowercase">
                                                {product.category || 'غير مصنف'}
                                            </span>
                                        </td>
                                        <td className="p-6 text-center">
                                            {editingPriceId === product.id ? (
                                                <div className="flex items-center justify-center gap-2 animate-in zoom-in-95 duration-200">
                                                    <input 
                                                        autoFocus
                                                        type="number"
                                                        className="w-20 h-9 p-2 text-center text-xs font-bold border-2 border-primary-indigo-100 rounded-lg focus:ring-0 outline-none"
                                                        value={tempPrice}
                                                        onChange={(e) => setTempPrice(e.target.value)}
                                                        onKeyPress={(e) => e.key === 'Enter' && updatePrice(product.id)}
                                                    />
                                                    <button onClick={() => updatePrice(product.id)} className="w-8 h-8 bg-emerald-600-500 text-white rounded-lg flex items-center justify-center hover:bg-emerald-600-600 transition-colors"><FiCheck size={14} /></button>
                                                    <button onClick={() => setEditingPriceId(null)} className="w-8 h-8 bg-slate-100 text-slate-400 rounded-lg flex items-center justify-center"><FiX size={14} /></button>
                                                </div>
                                            ) : (
                                                <button 
                                                    onClick={() => { setEditingPriceId(product.id); setTempPrice(product.price.toString()); }}
                                                    className="inline-flex items-center gap-2 group/price"
                                                >
                                                    <span className="text-lg font-bold text-slate-900">{product.price}</span>
                                                    <span className="text-[10px] font-bold text-primary-ink bg-subtle px-1.5 py-0.5 rounded opacity-100 sm:opacity-0 group-hover/price:opacity-100 transition-opacity">تعديل</span>
                                                </button>
                                            )}
                                        </td>
                                        <td className="p-6 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-sm font-bold text-emerald-600-600 dark:text-emerald-600-500">{(product.price * (product.soldCount || 0) * 0.85).toFixed(2)}</span>
                                                    <span className="text-[10px] font-bold text-slate-400">$</span>
                                                </div>
                                                <p className="text-[9px] text-slate-300 dark:text-slate-600 font-bold uppercase tracking-tighter">باع {product.soldCount || 0} مرات</p>
                                            </div>
                                        </td>
                                        <td className="p-6 text-center">
                                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                                                {new Date(product.createdAt).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}
                                            </span>
                                        </td>
                                        <td className="p-6 text-center">
                                            <button 
                                                onClick={() => toggleStatus(product)}
                                                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all ${product.isActive ? 'bg-emerald-600-50 text-emerald-600-600 border border-blue-100 dark:bg-blue-900/20 dark:border-blue-900' : 'bg-slate-50 text-slate-400 border border-slate-100 dark:bg-gray-800 dark:border-gray-700'}`}
                                            >
                                                {product.isActive ? '● نشط' : '○ مسودة'}
                                            </button>
                                        </td>
                                        <td className="p-6 text-center relative">
                                            <div className="flex items-center justify-center gap-2">
                                                <Link 
                                                    href={`/dashboard/products/edit/${product.id}`}
                                                    className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-primary-ink hover:bg-subtle transition-all shadow-sm"
                                                    title="تعديل كامل"
                                                >
                                                    <FiEdit2 size={16} />
                                                </Link>
                                                <button 
                                                    onClick={() => setOpenMenuId(openMenuId === product.id ? null : product.id)}
                                                    className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-all"
                                                >
                                                    <FiMoreVertical size={18} />
                                                </button>

                                                {/* Dropdown Menu */}
                                                {openMenuId === product.id && (
                                                    <>
                                                        <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />
                                                        <div className="absolute left-6 top-[80%] z-50 w-44 bg-white rounded-xl shadow-sm border border-slate-50 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                                            <Link 
                                                                href={`/@${(session?.user as any)?.username || 'user'}/${product.slug || product.id}`}
                                                                target="_blank"
                                                                className="flex items-center gap-3 w-full p-3 hover:bg-slate-50 rounded-xl text-slate-600 font-bold text-xs transition-colors"
                                                            >
                                                                <FiExternalLink /> صفحة المنتج
                                                            </Link>
                                                            <button 
                                                                onClick={() => { setOpenMenuId(null); deleteProduct(product.id); }}
                                                                className="flex items-center gap-3 w-full p-3 hover:bg-red-50 rounded-xl text-red-500 font-bold text-xs transition-colors border-t border-slate-50 mt-1 pt-3"
                                                            >
                                                                <FiTrash2 /> حذف نهائياً
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {!loading && filtered.length === 0 && (
                    <div className="text-center py-20 bg-white">
                        <FiPackage size={48} className="mx-auto text-slate-100 mb-4" />
                        <h3 className="text-slate-400 font-bold">لا توجد منتجات مطابقة للبحث</h3>
                    </div>
                )}
            </div>

            {/* --- QUICK ACTION BAR --- */}
            <div className="fixed bottom-8 left-0 right-0 z-[100] px-4 pointer-events-none">
                <div className="max-w-md mx-auto bg-slate-900 text-white p-4 rounded-xl shadow-sm flex items-center justify-between border border-white/10 pointer-events-auto ">
                    <div className="pr-6">
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 leading-none mb-1">تعديل سريع</p>
                        <p className="text-xs font-bold italic">اضغط على "السعر" لتعديله فوراً</p>
                    </div>
                    <div className="w-12 h-12 bg-primary-ink rounded-xl flex items-center justify-center text-xl shadow-sm shadow-primary-ink/20">
                        <FiDollarSign />
                    </div>
                </div>
            </div>
        </div>
    );
}
