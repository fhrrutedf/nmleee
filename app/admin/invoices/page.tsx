'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    FiFileText, FiSearch, FiCheckCircle, FiClock,
    FiXCircle, FiExternalLink, FiChevronLeft, FiChevronRight,
    FiUser, FiImage, FiX
} from 'react-icons/fi';

import { ReactNode } from 'react';

interface InvoiceData {
    id: string;
    invoiceNumber: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string | null;
    customerCountry: string | null;
    sellerName: string | null;
    sellerUsername: string | null;
    sellerId: string | null;
    subtotal: number;
    discount: number;
    platformFee: number;
    totalAmount: number;
    currency: string;
    paymentMethod: string | null;
    paymentProvider: string | null;
    transactionRef: string | null;
    paymentProof: string | null;
    status: string;
    notes: string | null;
    createdAt: string;
    order: {
        orderNumber: string;
        status: string;
        paymentMethod: string | null;
        items: Array<{
            product?: { title: string } | null;
            course?: { title: string } | null;
            bundle?: { title: string } | null;
        }>;
    };
}

const STATUS_STYLE: Record<string, { bg: string; icon: ReactNode; label: string }> = {
    pending: { bg: 'bg-blue-100 text-blue-800', icon: <FiClock size={12} />, label: 'قيد الانتظار' },
    verified: { bg: 'bg-blue-100 text-blue-800', icon: <FiCheckCircle size={12} />, label: 'تم التحقق' },
    rejected: { bg: 'bg-red-100 text-red-800', icon: <FiXCircle size={12} />, label: 'مرفوض' },
};

export default function AdminInvoicesPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const highlightId = searchParams.get('id');

    const [invoices, setInvoices] = useState<InvoiceData[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Detail modal
    const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);
    const [proofImage, setProofImage] = useState<string | null>(null);

    useEffect(() => {
        if (!session) return;
        fetchInvoices();
    }, [session, page, statusFilter]);

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.set('page', String(page));
            if (search) params.set('search', search);
            if (statusFilter !== 'all') params.set('status', statusFilter);

            const res = await fetch(`/api/admin/invoices?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setInvoices(data.invoices);
                setTotalPages(data.pages);
            }
        } catch (error) {
            console.error('Error fetching invoices:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setPage(1);
        fetchInvoices();
    };

    return (
        <div className="min-h-screen bg-[#111111] dark:bg-gray-900">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white dark:text-white">🧾 الفواتير</h1>
                    <p className="text-gray-500 mt-1">إدارة وعرض فواتير المنصة</p>
                </div>

                {/* Filters */}
                <div className="bg-[#0A0A0A] dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 mb-6 shadow-lg shadow-[#10B981]/20">
                    <div className="flex flex-wrap gap-3 items-center">
                        <div className="flex-1 min-w-[200px]">
                            <div className="relative">
                                <FiSearch className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="بحث بالرقم أو الاسم أو البريد..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                    className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-emerald-500/20 dark:border-gray-700 bg-[#111111] dark:bg-gray-900 text-sm outline-none focus:ring-2 focus:ring-ink/20"
                                />
                            </div>
                        </div>
                        <select
                            value={statusFilter}
                            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                            className="px-3 py-2.5 rounded-xl border border-emerald-500/20 dark:border-gray-700 bg-[#111111] dark:bg-gray-900 text-sm outline-none"
                        >
                            <option value="all">كل الحالات</option>
                            <option value="pending">قيد الانتظار</option>
                            <option value="verified">تم التحقق</option>
                            <option value="rejected">مرفوض</option>
                        </select>
                        <button
                            onClick={handleSearch}
                            className="px-4 py-2.5 bg-emerald-700 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors"
                        >
                            بحث
                        </button>
                    </div>
                </div>

                {/* Invoices Table */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-xl h-12 w-12 border-b-2 border-ink"></div>
                    </div>
                ) : invoices.length === 0 ? (
                    <div className="bg-[#0A0A0A] dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-100 dark:border-gray-700">
                        <FiFileText className="mx-auto text-gray-300 mb-4" size={48} />
                        <p className="text-gray-500 text-lg">لا توجد فواتير</p>
                    </div>
                ) : (
                    <div className="bg-[#0A0A0A] dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-lg shadow-[#10B981]/20 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-[#111111] dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                                        <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase">رقم الفاتورة</th>
                                        <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase">رقم الطلب</th>
                                        <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase">المشتري</th>
                                        <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase">البائع</th>
                                        <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase">المبلغ</th>
                                        <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase">وسيلة الدفع</th>
                                        <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase">رقم العملية</th>
                                        <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase">إيصال</th>
                                        <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase">الحالة</th>
                                        <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase">التاريخ</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {invoices.map((inv) => {
                                        const st = STATUS_STYLE[inv.status] || STATUS_STYLE.pending;
                                        return (
                                            <tr
                                                key={inv.id}
                                                className={`hover:bg-[#111111] dark:hover:bg-gray-800/50 transition-colors cursor-pointer ${highlightId === inv.id ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}
                                                onClick={() => setSelectedInvoice(inv)}
                                            >
                                                <td className="px-4 py-3">
                                                    <span className="font-mono text-xs font-bold text-[#10B981]">{inv.invoiceNumber}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="font-mono text-xs text-gray-500">{inv.order.orderNumber}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="text-xs font-bold text-white dark:text-white">{inv.customerName}</p>
                                                    <p className="text-[11px] text-gray-400">{inv.customerEmail}</p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="text-xs font-bold text-white dark:text-white">{inv.sellerName || '—'}</p>
                                                    {inv.sellerUsername && <p className="text-[11px] text-gray-400">@{inv.sellerUsername}</p>}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="font-bold text-sm text-white dark:text-white">
                                                        ${inv.totalAmount.toFixed(2)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-xs">{inv.paymentProvider || inv.paymentMethod || '—'}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="font-mono text-xs">{inv.transactionRef || '—'}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {inv.paymentProof ? (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setProofImage(inv.paymentProof); }}
                                                            className="w-10 h-10 rounded-lg border overflow-hidden hover:ring-2 hover:ring-ink transition-all"
                                                        >
                                                            <img src={inv.paymentProof} alt="" className="w-full h-full object-cover" />
                                                        </button>
                                                    ) : (
                                                        <span className="text-gray-300">—</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-xl flex items-center gap-1 w-fit ${st.bg}`}>
                                                        {st.icon} {st.label}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(inv.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                    </p>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-700">
                                <p className="text-xs text-gray-400">صفحة {page} من {totalPages}</p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="px-3 py-1.5 rounded-lg border border-emerald-500/20 dark:border-gray-700 text-sm disabled:opacity-30"
                                    >
                                        <FiChevronRight size={16} />
                                    </button>
                                    <button
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="px-3 py-1.5 rounded-lg border border-emerald-500/20 dark:border-gray-700 text-sm disabled:opacity-30"
                                    >
                                        <FiChevronLeft size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedInvoice && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedInvoice(null)}>
                    <div className="bg-[#0A0A0A] dark:bg-gray-800 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-lg shadow-[#10B981]/20" onClick={e => e.stopPropagation()}>
                        <div className="p-6 space-y-5">
                            {/* Header */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-white dark:text-white">🧾 {selectedInvoice.invoiceNumber}</h3>
                                    <p className="text-xs text-gray-400">طلب: {selectedInvoice.order.orderNumber}</p>
                                </div>
                                <button onClick={() => setSelectedInvoice(null)} className="w-8 h-8 rounded-xl bg-emerald-800 dark:bg-gray-700 flex items-center justify-center">
                                    <FiX size={16} />
                                </button>
                            </div>

                            {/* Buyer */}
                            <div className="bg-[#111111] dark:bg-gray-900 rounded-xl p-4">
                                <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">المشتري</h4>
                                <p className="font-bold text-white dark:text-white">{selectedInvoice.customerName}</p>
                                <p className="text-xs text-gray-500">{selectedInvoice.customerEmail}</p>
                                {selectedInvoice.customerPhone && <p className="text-xs text-gray-500" dir="ltr">{selectedInvoice.customerPhone}</p>}
                                {selectedInvoice.customerCountry && <p className="text-xs text-gray-400 mt-1">الدولة: {selectedInvoice.customerCountry}</p>}
                            </div>

                            {/* Seller */}
                            <div className="bg-[#111111] dark:bg-gray-900 rounded-xl p-4">
                                <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">البائع / المدرب</h4>
                                <p className="font-bold text-white dark:text-white">{selectedInvoice.sellerName || '—'}</p>
                                {selectedInvoice.sellerUsername && <p className="text-xs text-gray-500">@{selectedInvoice.sellerUsername}</p>}
                            </div>

                            {/* Financial */}
                            <div className="bg-[#111111] dark:bg-gray-900 rounded-xl p-4 space-y-2">
                                <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">التفاصيل المالية</h4>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">المجموع الفرعي</span>
                                    <span className="font-medium">${selectedInvoice.subtotal.toFixed(2)}</span>
                                </div>
                                {selectedInvoice.discount > 0 && (
                                    <div className="flex justify-between text-sm text-green-600">
                                        <span>الخصم</span>
                                        <span>-${selectedInvoice.discount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">عمولة المنصة</span>
                                    <span>${selectedInvoice.platformFee.toFixed(2)}</span>
                                </div>
                                <div className="h-px bg-gray-200 dark:bg-gray-700"></div>
                                <div className="flex justify-between text-base font-bold">
                                    <span>الإجمالي</span>
                                    <span className="text-[#10B981]">${selectedInvoice.totalAmount.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Payment Info */}
                            <div className="bg-[#111111] dark:bg-gray-900 rounded-xl p-4 space-y-2">
                                <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">تفاصيل الدفع</h4>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">وسيلة الدفع</span>
                                    <span>{selectedInvoice.paymentProvider || selectedInvoice.paymentMethod || '—'}</span>
                                </div>
                                {selectedInvoice.transactionRef && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">رقم العملية</span>
                                        <span className="font-mono">{selectedInvoice.transactionRef}</span>
                                    </div>
                                )}
                            </div>

                            {/* Proof Image */}
                            {selectedInvoice.paymentProof && (
                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">إيصال الدفع</h4>
                                    <a href={selectedInvoice.paymentProof} target="_blank" rel="noopener noreferrer">
                                        <img src={selectedInvoice.paymentProof} alt="إيصال" className="w-full rounded-xl border border-emerald-500/20 dark:border-gray-700 max-h-60 object-contain bg-[#111111]" />
                                    </a>
                                </div>
                            )}

                            {/* Products */}
                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">المنتجات</h4>
                                <div className="space-y-1">
                                    {selectedInvoice.order.items.map((item, i) => (
                                        <p key={i} className="text-sm text-gray-700 dark:text-gray-300">
                                            • {item.product?.title || item.course?.title || item.bundle?.title || 'منتج'}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Proof Image Modal */}
            {proofImage && (
                <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4" onClick={() => setProofImage(null)}>
                    <div className="relative max-w-2xl bg-[#0A0A0A] dark:bg-gray-800 rounded-xl overflow-hidden" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setProofImage(null)} className="absolute top-3 left-3 w-8 h-8 bg-black/50 text-white rounded-xl flex items-center justify-center z-10">
                            <FiX size={16} />
                        </button>
                        <img src={proofImage} alt="إيصال" className="max-w-full max-h-[80vh] object-contain" />
                    </div>
                </div>
            )}
        </div>
    );
}
