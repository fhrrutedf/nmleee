'use client';

import { useState } from 'react';
import { FiMail, FiPhone, FiMapPin, FiSend } from 'react-icons/fi';

export default function ContactPage() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // محاكاة إرسال
        await new Promise(resolve => setTimeout(resolve, 1500));

        alert('تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.');
        setFormData({ name: '', email: '', subject: '', message: '' });
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold gradient-text mb-4">تواصل معنا</h1>
                    <p className="text-xl text-gray-600">نحن هنا لمساعدتك! تواصل معنا في أي وقت</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Contact Info */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                                <FiMail className="text-2xl text-primary-600" />
                            </div>
                            <h3 className="font-bold text-lg mb-2">البريد الإلكتروني</h3>
                            <p className="text-gray-600">support@tmleen.com</p>
                            <p className="text-gray-600">info@tmleen.com</p>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                <FiPhone className="text-2xl text-green-600" />
                            </div>
                            <h3 className="font-bold text-lg mb-2">الهاتف</h3>
                            <p className="text-gray-600" dir="ltr">+20 123 456 7890</p>
                            <p className="text-gray-600 text-sm mt-2">السبت - الخميس: 9 صباحاً - 6 مساءً</p>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                <FiMapPin className="text-2xl text-blue-600" />
                            </div>
                            <h3 className="font-bold text-lg mb-2">العنوان</h3>
                            <p className="text-gray-600">القاهرة، مصر</p>
                            <p className="text-gray-600">المعادي - شارع 9</p>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm p-8">
                            <h2 className="text-2xl font-bold mb-6">أرسل لنا رسالة</h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            الاسم <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="input w-full"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            البريد الإلكتروني <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="input w-full"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        الموضوع <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        className="input w-full"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        الرسالة <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        className="input w-full"
                                        rows={6}
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn btn-primary w-full text-lg py-4 flex items-center justify-center gap-2"
                                >
                                    <FiSend />
                                    <span>{loading ? 'جاري الإرسال...' : 'إرسال الرسالة'}</span>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
