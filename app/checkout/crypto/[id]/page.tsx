'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiCopy, FiCheckCircle, FiClock, FiAlertTriangle } from 'react-icons/fi';

export default function CryptoCheckoutPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = params.id as string;

    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [copiedContent, setCopiedContent] = useState('');
    const [timeLeft, setTimeLeft] = useState(1800); // 30 mins in seconds

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                // You will need to create this API endpoint to fetch order details securely
                // Or adapt the existing order fetch logic. For now assuming an endpoint exists:
                const res = await fetch(`/api/orders/${orderId}`);
                if (res.ok) {
                    const data = await res.json();
                    setOrder(data);

                    // Calculate expiration based on creation date
                    const created = new Date(data.createdAt).getTime();
                    const now = new Date().getTime();
                    const diffSeconds = Math.floor((now - created) / 1000);
                    const remaining = Math.max(0, 1800 - diffSeconds);
                    setTimeLeft(remaining);
                } else {
                    alert('لم يتم العثور على الطلب');
                    router.push('/');
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (orderId) {
            fetchOrder();
        }
    }, [orderId]);

    useEffect(() => {
        if (timeLeft <= 0) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    // Polling to check if payment is completed
    useEffect(() => {
        if (!order || order.status === 'COMPLETED' || timeLeft <= 0) return;

        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/orders/${orderId}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.status === 'COMPLETED' || data.isPaid) {
                        setOrder(data);
                        clearInterval(interval);
                    }
                }
            } catch (e) {
                console.error(e);
            }
        }, 10000); // Poll every 10 seconds

        return () => clearInterval(interval);
    }, [order, orderId, timeLeft]);

    const handleCopy = (text: string, type: string) => {
        navigator.clipboard.writeText(text);
        setCopiedContent(type);
        setTimeout(() => setCopiedContent(''), 2000);
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>;
    if (!order) return null;

    if (order.status === 'COMPLETED' || order.isPaid) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border-t-8 border-green-500">
                    <FiCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-black mb-2 text-primary-charcoal">تم الدفع بنجاح!</h2>
                    <p className="text-gray-600 mb-6">شكراً لك، تمت العملية بنجاح. سيتم توجيهك للمنتج...</p>
                    <button onClick={() => router.push('/dashboard/purchases')} className="btn btn-primary w-full">الانتقال للمشتريات</button>
                </div>
            </div>
        );
    }

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="bg-gradient-to-r from-primary-charcoal to-gray-800 p-6 text-center text-white">
                        <h1 className="text-2xl font-black mb-1">دفع العملات الرقمية</h1>
                        <p className="text-gray-300 text-sm">أرسل المبلغ بدقة إلى العنوان أدناه باستخدام شبكة TRC20</p>
                    </div>

                    <div className="p-8">
                        {timeLeft <= 0 ? (
                            <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-200 text-center">
                                <FiAlertTriangle className="text-5xl mx-auto mb-3" />
                                <h3 className="text-xl font-bold mb-2">انتهت صلاحية الفاتورة</h3>
                                <p className="mb-4">انتهى الوقت المسموح به للدفع التلقائي لهذه الفاتورة.</p>
                                <button onClick={() => router.push('/checkout')} className="btn btn-primary bg-red-600 hover:bg-red-700">حاول مرة أخرى</button>
                            </div>
                        ) : (
                            <>
                                <div className="flex flex-col md:flex-row gap-8 items-center justify-center mb-8">
                                    <div className="bg-white p-4 rounded-xl shadow border border-gray-100 pb-2">
                                        <img
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${order.walletAddress}`}
                                            alt="QR Code"
                                            className="w-48 h-48 mx-auto"
                                        />
                                        <p className="text-center text-xs mt-2 text-gray-400 font-medium tracking-widest uppercase">
                                            {order.cryptoCoin}
                                        </p>
                                    </div>

                                    <div className="flex-1 space-y-6 w-full">
                                        <div className="bg-orange-50 text-orange-700 p-4 justify-center rounded-xl flex items-center gap-3">
                                            <FiClock className="text-2xl animate-pulse" />
                                            <div>
                                                <p className="text-sm font-bold opacity-80">الوقت المتبقي للدفع</p>
                                                <p className="text-2xl font-black font-mono">
                                                    {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-sm text-gray-500 mb-1 font-medium">المبلغ المطلوب بدقة ({order.cryptoCoin}):</p>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 bg-gray-50 border border-gray-200 p-3 rounded-xl font-mono text-lg font-bold text-primary-charcoal">
                                                        {order.cryptoAmount}
                                                    </div>
                                                    <button
                                                        onClick={() => handleCopy(order.cryptoAmount.toString(), 'amount')}
                                                        className={`p-3 rounded-xl border transition-all ${copiedContent === 'amount' ? 'bg-green-500 text-white border-green-500' : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-600'}`}
                                                    >
                                                        {copiedContent === 'amount' ? <FiCheckCircle /> : <FiCopy />}
                                                    </button>
                                                </div>
                                            </div>

                                            <div>
                                                <p className="text-sm text-gray-500 mb-1 font-medium">عنوان المحفظة (TRC20):</p>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 bg-gray-50 border border-gray-200 p-3 rounded-xl font-mono text-sm sm:text-base break-words text-primary-charcoal">
                                                        {order.walletAddress}
                                                    </div>
                                                    <button
                                                        onClick={() => handleCopy(order.walletAddress, 'address')}
                                                        className={`p-3 rounded-xl border transition-all flex-shrink-0 ${copiedContent === 'address' ? 'bg-green-500 text-white border-green-500' : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-600'}`}
                                                    >
                                                        {copiedContent === 'address' ? <FiCheckCircle /> : <FiCopy />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl text-blue-800 text-sm leading-relaxed mb-6">
                                    <h4 className="font-bold flex items-center gap-2 mb-2">
                                        <FiAlertTriangle /> ملاحظات هامة:
                                    </h4>
                                    <ul className="list-disc pr-5 space-y-1">
                                        <li>تأكد من اختيار شبكة <strong>Tron (TRC20)</strong> عند التحويل.</li>
                                        <li>أرسل المبلغ المطلوب تماماً دون نقص أو زيادة (تأكد من تغطية رسوم الشبكة من جهتك).</li>
                                        <li>التحقق من الدفع يتم بشكل آلي خلال 1-3 دقائق من الإرسال.</li>
                                    </ul>
                                </div>

                                <div className="text-center">
                                    <p className="text-gray-500 mb-3 text-sm flex items-center justify-center gap-2">
                                        <span className="w-2 h-2 bg-yellow-500 rounded-full animate-ping"></span>
                                        نحن بانتظار الدفع... هذه الصفحة ستتحدث تلقائياً.
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
