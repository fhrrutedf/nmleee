'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getPaymentMethodsForCountry, convertCurrency, formatCurrency } from '@/config/paymentMethods';
import type { PaymentMethod } from '@/config/paymentMethods';

export default function ManualCheckoutPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // Get items from URL params
    const itemsParam = searchParams.get('items');
    const items = itemsParam ? JSON.parse(decodeURIComponent(itemsParam)) : [];

    const [step, setStep] = useState(1); // 1: Country, 2: Method, 3: Details, 4: Submit
    const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
    const [sellerPaymentInfo, setSellerPaymentInfo] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    // Form data
    const [customerName, setCustomerName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [senderPhone, setSenderPhone] = useState('');
    const [transactionRef, setTransactionRef] = useState('');
    const [paymentProof, setPaymentProof] = useState('');
    const [paymentNotes, setPaymentNotes] = useState('');

    const totalUSD = items.reduce((sum: number, item: any) => sum + (item.price || 0), 0);

    useEffect(() => {
        if (items.length > 0 && items[0].sellerId) {
            fetchSellerInfo(items[0].sellerId);
        }
    }, []);

    const fetchSellerInfo = async (sellerId: string) => {
        try {
            const response = await fetch(`/api/seller/${sellerId}/payment-info`);
            if (response.ok) {
                const data = await response.json();
                setSellerPaymentInfo(data);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const countries = [
        { code: 'SY', name: 'سوريا', flag: '🇸🇾' },
        { code: 'IQ', name: 'العراق', flag: '🇮🇶' },
        { code: 'EG', name: 'مصر', flag: '🇪🇬' },
        { code: 'SA', name: 'السعودية', flag: '🇸🇦' },
        { code: 'DEFAULT', name: 'دول أخرى', flag: '🌍' },
    ];

    const getPaymentNumber = (methodId: string) => {
        if (!sellerPaymentInfo) return null;

        const mapping: Record<string, string> = {
            shamcash: sellerPaymentInfo.shamCash,
            omt: sellerPaymentInfo.omt,
            zaincash: sellerPaymentInfo.zainCash,
            vodafonecash: sellerPaymentInfo.vodafoneCash,
            mtncash: sellerPaymentInfo.mtncash,
        };

        return mapping[methodId] || null;
    };

    const handleSubmit = async () => {
        if (!customerName || !customerEmail || !senderPhone) {
            alert('يرجى ملء جميع الحقول المطلوبة');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/orders/manual', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items,
                    customerName,
                    customerEmail,
                    customerPhone,
                    country: selectedCountry,
                    paymentProvider: selectedMethod?.id,
                    senderPhone,
                    transactionRef,
                    paymentProof,
                    paymentNotes,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                alert(`✅ تم إرسال طلبك بنجاح!\nرقم الطلب: ${data.orderNumber}\nسيتم مراجعته والموافقة عليه قريباً.`);
                router.push('/');
            } else {
                alert('❌ حدث خطأ');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('❌ حدث خطأ');
        } finally {
            setLoading(false);
        }
    };

    const localAmount = convertCurrency(totalUSD, selectedCountry);

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900">إتمام الدفع</h1>
                    <p className="text-gray-600 mt-2">
                        المبلغ الإجمالي: <span className="font-bold text-green-600">${totalUSD.toFixed(2)}</span>
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="mb-8 flex justify-center">
                    <div className="flex items-center gap-4">
                        {[1, 2, 3, 4].map((s) => (
                            <div key={s} className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${s <= step ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
                                    }`}>
                                    {s}
                                </div>
                                {s < 4 && <div className="w-12 h-1 bg-gray-200"></div>}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    {/* Step 1: Select Country */}
                    {step === 1 && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">اختر دولتك</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {countries.map((country) => (
                                    <button
                                        key={country.code}
                                        onClick={() => {
                                            setSelectedCountry(country.code);
                                            setStep(2);
                                        }}
                                        className="p-6 border-2 border-gray-200 rounded-lg hover:border-indigo-600 hover:bg-indigo-50 transition-colors text-center"
                                    >
                                        <div className="text-4xl mb-2">{country.flag}</div>
                                        <div className="font-medium">{country.name}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Select Payment Method */}
                    {step === 2 && selectedCountry && (
                        <div>
                            <button
                                onClick={() => setStep(1)}
                                className="mb-4 text-indigo-600 hover:text-indigo-800"
                            >
                                ← العودة
                            </button>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">اختر طريقة الدفع</h2>

                            <div className="mb-4 bg-blue-50 p-4 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    المبلغ: <strong>{formatCurrency(localAmount.amount, localAmount.currency)}</strong>
                                    {' '}({totalUSD.toFixed(2)} USD)
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {getPaymentMethodsForCountry(selectedCountry).methods.map((method) => {
                                    const paymentNumber = getPaymentNumber(method.id);
                                    const isAvailable = paymentNumber || method.id === 'banktransfer';

                                    return (
                                        <button
                                            key={method.id}
                                            onClick={() => {
                                                if (isAvailable) {
                                                    setSelectedMethod(method);
                                                    setStep(3);
                                                } else {
                                                    alert('البائع لم يفعّل هذه الطريقة بعد');
                                                }
                                            }}
                                            disabled={!isAvailable}
                                            className={`p-6 border-2 rounded-lg transition-colors text-center ${isAvailable
                                                    ? 'border-gray-200 hover:border-indigo-600 hover:bg-indigo-50'
                                                    : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                                                }`}
                                        >
                                            <div className="text-3xl mb-2">{method.icon}</div>
                                            <div className="font-medium">{method.nameAr}</div>
                                            {!isAvailable && (
                                                <div className="text-xs text-red-600 mt-1">غير متاح</div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Payment Instructions */}
                    {step === 3 && selectedMethod && (
                        <div>
                            <button
                                onClick={() => setStep(2)}
                                className="mb-4 text-indigo-600 hover:text-indigo-800"
                            >
                                ← العودة
                            </button>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">تعليمات الدفع</h2>

                            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-lg p-6 mb-6">
                                <div className="text-center mb-4">
                                    <div className="text-4xl mb-2">{selectedMethod.icon}</div>
                                    <h3 className="text-lg font-bold text-gray-900">{selectedMethod.nameAr}</h3>
                                </div>

                                <div className="bg-white rounded-lg p-4 mb-4">
                                    <div className="space-y-2">
                                        <div>
                                            <span className="text-gray-600">الرقم:</span>
                                            <div className="text-2xl font-bold text-indigo-600 font-mono">
                                                {getPaymentNumber(selectedMethod.id) || 'سيتم توفيره'}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">الاسم:</span>
                                            <div className="font-medium">{sellerPaymentInfo?.name}</div>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">المبلغ:</span>
                                            <div className="text-xl font-bold text-green-600">
                                                {formatCurrency(localAmount.amount, localAmount.currency)}
                                            </div>
                                            <div className="text-sm text-gray-500">= ${totalUSD.toFixed(2)} USD</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <h4 className="font-bold text-yellow-900 mb-2">📝 الخطوات:</h4>
                                    <ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside">
                                        <li>افتح تطبيق {selectedMethod.nameAr}</li>
                                        <li>اختر "تحويل لرقم" أو "إرسال"</li>
                                        <li>أدخل الرقم والمبلغ المذكورين أعلاه</li>
                                        <li>أكمل العملية واحتفظ بالإيصال</li>
                                        <li>ارفع رابط صورة الإيصال في الأسفل</li>
                                    </ol>
                                </div>
                            </div>

                            <button
                                onClick={() => setStep(4)}
                                className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                المتابعة لإدخال التفاصيل ←
                            </button>
                        </div>
                    )}

                    {/* Step 4: Submit Details */}
                    {step === 4 && (
                        <div>
                            <button
                                onClick={() => setStep(3)}
                                className="mb-4 text-indigo-600 hover:text-indigo-800"
                            >
                                ← العودة
                            </button>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">أدخل تفاصيل الدفع</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        اسمك *
                                    </label>
                                    <input
                                        type="text"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        بريدك الإلكتروني *
                                    </label>
                                    <input
                                        type="email"
                                        value={customerEmail}
                                        onChange={(e) => setCustomerEmail(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        رقم هاتفك (اختياري)
                                    </label>
                                    <input
                                        type="tel"
                                        value={customerPhone}
                                        onChange={(e) => setCustomerPhone(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        الرقم الذي حولت منه *
                                    </label>
                                    <input
                                        type="tel"
                                        value={senderPhone}
                                        onChange={(e) => setSenderPhone(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        placeholder="+963 XXX XXX XXX"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        رقم العملية (اختياري)
                                    </label>
                                    <input
                                        type="text"
                                        value={transactionRef}
                                        onChange={(e) => setTransactionRef(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        placeholder="مثال: TXN123456"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        رابط صورة الإيصال *
                                    </label>
                                    <input
                                        type="url"
                                        value={paymentProof}
                                        onChange={(e) => setPaymentProof(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        placeholder="https://example.com/receipt.jpg"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        ارفع الصورة على خدمة مثل Imgur أو Imgbb والصق الرابط هنا
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        ملاحظات إضافية (اختياري)
                                    </label>
                                    <textarea
                                        value={paymentNotes}
                                        onChange={(e) => setPaymentNotes(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        rows={3}
                                    />
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'جاري الإرسال...' : '✅ إرسال الطلب'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-bold text-blue-900 mb-2">ℹ️ ملاحظات:</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• سيتم مراجعة طلبك والموافقة عليه خلال 24 ساعة</li>
                        <li>• تأكد من صحة جميع المعلومات لتجنب التأخير</li>
                        <li>• ستصلك رسالة تأكيد عبر البريد الإلكتروني</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
