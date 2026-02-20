'use client';

import { useState, useEffect } from 'react';
import { FiLink, FiTrendingUp, FiDollarSign, FiUsers, FiCopy, FiCheckCircle } from 'react-icons/fi';
import { apiGet, apiPost } from '@/lib/safe-fetch';

export default function AffiliatesDashboard() {
    const [stats, setStats] = useState<any>({
        totalClicks: 0,
        totalSales: 0,
        totalRevenue: 0,
        totalCommission: 0
    });
    const [links, setLinks] = useState<any[]>([]);
    const [recentReferrals, setRecentReferrals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [isGenerating, setIsGenerating] = useState(false);
    const [formUrl, setFormUrl] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);

    useEffect(() => {
        fetchAffiliateData();
    }, []);

    const fetchAffiliateData = async () => {
        try {
            const data = await apiGet('/api/affiliates');
            if (data && !data.error) {
                setStats(data.stats);
                setLinks(data.links || []);
                setRecentReferrals(data.recentReferrals || []);
            }
        } catch (error) {
            console.error('Failed to fetch affiliate data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateLink = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formUrl) return;

        setIsGenerating(true);
        try {
            // Simplified logic: user pastes domain.com/product/xyz
            // In a deeper implementation, we'd extract the PRD ID from the URL accurately.
            // For now, let's just create a generic store link that sets the ref code.
            const response = await apiPost('/api/affiliates/generate', {
                targetUrl: formUrl,
                // Hardcoded dummy ID for generic links if url doesn't match a specific product routing pattern
                productId: 'generic-store-link',
                commissionRate: 10
            });

            if (response && response.success) {
                setFormUrl('');
                fetchAffiliateData(); // Refresh list
            } else {
                alert(response.error || 'فشل توليد الرابط');
            }
        } catch (error) {
            console.error('Error generating link:', error);
            alert('حدث خطأ غير متوقع');
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">نظام التسويق بالعمولة (Affiliate)</h1>
                    <p className="text-gray-500">تابع أرباحك وروابط التسويق الخاصة بك من مكان واحد.</p>
                </div>
            </div>

            {/* الإحصائيات (Stats) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <FiLink size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium font-cairo">عدد النقرات</p>
                        <p className="text-2xl font-bold text-gray-900 font-cairo">{stats.totalClicks}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                        <FiUsers size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium font-cairo">المبيعات المؤكدة</p>
                        <p className="text-2xl font-bold text-gray-900 font-cairo">{stats.totalSales}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                        <FiTrendingUp size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium font-cairo">إجمالي المبيعات</p>
                        <p className="text-2xl font-bold text-gray-900 font-cairo">{stats.totalRevenue.toFixed(2)} ج.م</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                        <FiDollarSign size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium font-cairo">عمولتي (الأرباح)</p>
                        <p className="text-2xl font-bold text-gray-900 font-cairo">{stats.totalCommission.toFixed(2)} ج.م</p>
                    </div>
                </div>
            </div>

            {/* توليد رابط جديد */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FiLink className="text-primary-600" />
                    توليد رابط تسويق مخصص
                </h2>
                <form onSubmit={handleGenerateLink} className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1 font-cairo">رابط المنتج المُراد تسويقه</label>
                        <input
                            type="url"
                            placeholder="https://tmleen.com/product/..."
                            value={formUrl}
                            onChange={(e) => setFormUrl(e.target.value)}
                            className="input-field w-full font-sans text-left"
                            dir="ltr"
                            required
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            type="submit"
                            disabled={isGenerating || !formUrl}
                            className={`btn btn-primary px-8 h-[42px] ${isGenerating ? 'opacity-70' : ''}`}
                        >
                            {isGenerating ? 'جاري التوليد...' : 'توليد الرابط'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* الروابط النشطة */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900">روابطي التسويقية</h2>
                    </div>
                    {links.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            لا توجد روابط تسويقية بعد. قم بإنشاء أول رابط لك بالأعلى!
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-right">
                                <thead className="bg-gray-50 text-gray-600 text-sm">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">الرابط</th>
                                        <th className="px-6 py-3 font-medium">النقرات</th>
                                        <th className="px-6 py-3 font-medium">المبيعات</th>
                                        <th className="px-6 py-3 font-medium">العمولة</th>
                                        <th className="px-6 py-3 font-medium w-24">نسخ</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    {links.map((link) => (
                                        <tr key={link.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 max-w-[200px] truncate" dir="ltr" title={link.url}>
                                                <a href={link.url} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline">
                                                    {link.url}
                                                </a>
                                            </td>
                                            <td className="px-6 py-4 font-bold">{link.clicks}</td>
                                            <td className="px-6 py-4 font-bold text-green-600">{link.salesCount}</td>
                                            <td className="px-6 py-4 text-orange-600 font-bold">{link.commission.toFixed(2)} ج.م</td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => copyToClipboard(link.url, link.id)}
                                                    className={`p-2 rounded-md transition-colors ${copiedId === link.id ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600 hover:bg-primary-50 hover:text-primary-600'}`}
                                                    title="نسخ الرابط"
                                                >
                                                    {copiedId === link.id ? <FiCheckCircle /> : <FiCopy />}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* أحدث الإحالات (Recent Referrals) */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900">أحدث الإحالات والمبيعات</h2>
                    </div>
                    {recentReferrals.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            لا توجد إحالات مسجلة حتى الآن.
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {recentReferrals.map((ref) => (
                                <div key={ref.id} className="p-4 flex flex-col gap-1">
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-gray-900">طلب #{ref.order?.orderNumber?.replace('ORD-', '')}</span>
                                        <span className={`text-xs px-2 py-1 rounded-full ${ref.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                            {ref.status === 'PAID' ? 'مؤكدة' : 'في الانتظار'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500">الإجمالي: {ref.order?.totalAmount?.toFixed(2)} ج.م</span>
                                        <span className="font-bold text-primary-600">عمولتك: +{ref.commission.toFixed(2)} ج.م</span>
                                    </div>
                                    <span className="text-xs text-gray-400 mt-1">
                                        {new Date(ref.createdAt).toLocaleDateString('ar-EG')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
