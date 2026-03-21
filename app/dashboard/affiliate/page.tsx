'use client';

import { useState, useEffect } from 'react';
import { FiUsers, FiDollarSign, FiTrendingUp, FiCopy, FiCheck, FiLink } from 'react-icons/fi';
import { apiGet, handleApiError } from '@/lib/safe-fetch';

export default function AffiliatePage() {
    const [stats, setStats] = useState<any>(null);
    const [affiliates, setAffiliates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [affiliateLink, setAffiliateLink] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchAffiliateData();
    }, []);

    const fetchAffiliateData = async () => {
        try {
            const data = await apiGet('/api/affiliate');
            setStats(data.stats);
            setAffiliates(data.affiliates);
            setAffiliateLink(data.affiliateLink);
        } catch (error) {
            console.error('Error fetching affiliate data:', handleApiError(error));
        } finally {
            setLoading(false);
        }
    };

    const copyLink = () => {
        navigator.clipboard.writeText(affiliateLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">برنامج الأفلييت (التسويق بالعمولة)</h1>
                <p className="text-gray-600 mt-1">اكسب عمولات من كل عملية بيع تتم عبر رابطك</p>
            </div>

            {/* Your Affiliate Link */}
            <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <FiLink />
                    رابط الأفلييت الخاص بك
                </h2>
                <div className="bg-white/10 backdrop-blur rounded-lg p-4 mb-4">
                    <code className="text-sm break-all">{affiliateLink}</code>
                </div>
                <button
                    onClick={copyLink}
                    className="btn bg-white text-primary-600 hover:bg-gray-100 w-full"
                >
                    {copied ? (
                        <>
                            <FiCheck className="inline ml-2" />
                            تم النسخ!
                        </>
                    ) : (
                        <>
                            <FiCopy className="inline ml-2" />
                            نسخ الرابط
                        </>
                    )}
                </button>
                <p className="text-sm text-primary-100 mt-4">
                    شارك هذا الرابط مع أصدقائك واحصل على عمولة {stats?.commissionRate || 10}% من كل عملية شراء!
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-6">
                <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-green-100">إجمالي العمولات</span>
                        <FiDollarSign className="text-2xl" />
                    </div>
                    <div className="text-3xl font-bold">
                        {stats?.totalEarnings?.toFixed(2) || '0.00'} $
                    </div>
                </div>

                <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-blue-100">عدد الإحالات</span>
                        <FiUsers className="text-2xl" />
                    </div>
                    <div className="text-3xl font-bold">{stats?.totalReferrals || 0}</div>
                </div>

                <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-purple-100">معدل التحويل</span>
                        <FiTrendingUp className="text-2xl" />
                    </div>
                    <div className="text-3xl font-bold">{stats?.conversionRate || 0}%</div>
                </div>
            </div>

            {/* How It Works */}
            <div className="card">
                <h2 className="text-2xl font-bold mb-6">كيف يعمل البرنامج؟</h2>
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl font-bold text-primary-600">1</span>
                        </div>
                        <h3 className="font-bold mb-2">شارك رابطك</h3>
                        <p className="text-gray-600 text-sm">
                            شارك رابط الأفلييت الخاص بك على السوشيال ميديا أو مع أصدقائك
                        </p>
                    </div>

                    <div className="text-center">
                        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl font-bold text-primary-600">2</span>
                        </div>
                        <h3 className="font-bold mb-2">يقوم الزوار بالشراء</h3>
                        <p className="text-gray-600 text-sm">
                            عندما يشتري شخص ما منتجاً عبر رابطك
                        </p>
                    </div>

                    <div className="text-center">
                        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl font-bold text-primary-600">3</span>
                        </div>
                        <h3 className="font-bold mb-2">احصل على عمولتك</h3>
                        <p className="text-gray-600 text-sm">
                            احصل على {stats?.commissionRate || 10}% من قيمة كل عملية بيع
                        </p>
                    </div>
                </div>
            </div>

            {/* Referrals Table */}
            <div className="card">
                <h2 className="text-xl font-bold mb-6">سجل الإحالات</h2>
                {affiliates.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <FiUsers className="text-6xl text-gray-300 mx-auto mb-4" />
                        <p>لا توجد إحالات بعد</p>
                        <p className="text-sm mt-2">ابدأ بمشاركة رابطك للحصول على عمولات!</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-right py-3 px-4">التاريخ</th>
                                    <th className="text-right py-3 px-4">المنتج</th>
                                    <th className="text-right py-3 px-4">المبلغ</th>
                                    <th className="text-right py-3 px-4">العمولة</th>
                                    <th className="text-right py-3 px-4">الحالة</th>
                                </tr>
                            </thead>
                            <tbody>
                                {affiliates.map((affiliate: any) => (
                                    <tr key={affiliate.id} className="border-b hover:bg-gray-50">
                                        <td className="py-3 px-4">
                                            {new Date(affiliate.createdAt).toLocaleDateString('ar-EG')}
                                        </td>
                                        <td className="py-3 px-4">{affiliate.productTitle}</td>
                                        <td className="py-3 px-4">{affiliate.amount.toFixed(2)} $</td>
                                        <td className="py-3 px-4 font-bold text-green-600">
                                            +{affiliate.commission.toFixed(2)} $
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-3 py-1 rounded-full text-sm ${affiliate.status === 'paid'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {affiliate.status === 'paid' ? 'مدفوع' : 'قيد الانتظار'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Tips */}
            <div className="card bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200">
                <h3 className="font-bold text-lg mb-4 text-orange-800">💡 نصائح لزيادة أرباحك:</h3>
                <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                        <span className="text-orange-600 mt-1">•</span>
                        <span>شارك رابطك على حساباتك على السوشيال ميديا بانتظام</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-orange-600 mt-1">•</span>
                        <span>اكتب مراجعة صادقة عن المنتجات التي تسوّق لها</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-orange-600 mt-1">•</span>
                        <span>استهدف المجموعات والمجتمعات المهتمة بالمحتوى الذي تروّج له</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-orange-600 mt-1">•</span>
                        <span>قدّم قيمة حقيقية لجمهورك قبل طلب الشراء</span>
                    </li>
                </ul>
            </div>
        </div>
    );
}
