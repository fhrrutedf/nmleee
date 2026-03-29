'use client';

import { useState } from 'react';
import { FiAlertTriangle, FiTrash2, FiX, FiLock, FiInfo } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { apiPost, handleApiError } from '@/lib/safe-fetch';

export default function DangerZone() {
    const [isDeleting, setIsDeleting] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const [password, setPassword] = useState('');
    const [showModal, setShowModal] = useState(false);
    const CONFIRM_PHRASE = 'DELETE';

    const handleDelete = async () => {
        if (confirmText !== CONFIRM_PHRASE) {
            toast.error('يُرجى كتابة النص التأكيدي بشكل صحيح');
            return;
        }

        if (!password) {
            toast.error('يُرجى إدخال كلمة المرور للتأكيد');
            return;
        }

        setIsDeleting(true);
        try {
            await apiPost('/api/user/delete-account', { password });
            toast.success('تم حذف الحساب بنجاح. سنشتاق إليك!');
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        } catch (error) {
            toast.error('فشل حذف الحساب: ' + handleApiError(error));
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="p-6 bg-red-50/50 border border-red-100 rounded-xl">
                <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-red-500/10 text-red-600 rounded-xl flex items-center justify-center shrink-0">
                        <FiAlertTriangle className="text-2xl" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-red-900 mb-2">منطقة الخطر</h3>
                        <p className="text-sm text-red-700 leading-relaxed">
                            جميع العمليات في هذا القسم لا يمكن التراجع عنها. سيتم حذف جميع المنتجات، الدورات، والبيانات المالية بشكل نهائي.
                        </p>
                    </div>
                </div>

                <div className="space-y-3">
                    <button 
                        onClick={() => toast.success('تم إرسال طلب تجميد الحساب لمراجعة الإدارة')}
                        className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 border border-red-200 rounded-xl transition-all group"
                    >
                        <span className="font-bold text-gray-700 group-hover:text-red-900">تعطيل الحساب مؤقتاً</span>
                        <FiAlertTriangle className="text-red-300 group-hover:text-red-500" />
                    </button>

                    <button 
                        onClick={() => setShowModal(true)}
                        className="w-full flex items-center justify-between p-4 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all shadow-md active:scale-[0.98]"
                    >
                        <span className="font-bold">حذف الحساب نهائياً</span>
                        <FiTrash2 className="text-red-200" />
                    </button>
                </div>
            </div>

            {/* Delete Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60  ">
                    <div className="bg-white rounded-xl shadow-lg shadow-emerald-600/20 w-full max-w-lg overflow-hidden animate-scale-in">
                        <div className="p-6 bg-red-600 text-white flex justify-between items-center">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <FiTrash2 /> تأكيد حذف الحساب
                            </h3>
                            <button onClick={() => setShowModal(false)} className="hover:rotate-90 transition-transform">
                                <FiX className="text-2xl" />
                            </button>
                        </div>
                        
                        <div className="p-8 space-y-6">
                            <div className="bg-emerald-600-50 border-r-4 border-blue-400 p-4 text-blue-800 text-sm">
                                <FiInfo className="inline ml-1" /> ستقوم هذه العملية بحذف كافة بياناتك المالية وملفاتك المرفوعة، ولن يتمكن العملاء من تحميل ما اشتروه سابقاً.
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="label text-gray-900 font-bold mb-2">كلمة المرور للتأكيد</label>
                                    <div className="relative">
                                        <FiLock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input 
                                            type="password" 
                                            className="input pr-12 text-left" 
                                            dir="ltr"
                                            placeholder="أدخل كلمة المرور"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <h4 className="font-bold text-gray-900 mb-2">أمنيتي الأخيرة قبل الحذف</h4>
                                <p className="text-sm text-gray-500 mb-4">
                                    هذا الإجراء سيقوم بحذف متجرك ومنتجاتك وسجل مبيعاتك وأرباحك **نهائياً**. لتأكيد العملية، يرجى كتابة <span className="font-mono font-bold text-red-600 bg-red-50 px-1 rounded">DELETE</span> بالأسفل:
                                </p>
                                
                                <input 
                                    type="text"
                                    className="input mb-4"
                                    placeholder="اكتب DELETE هنا"
                                    value={confirmText}
                                    onChange={(e) => setConfirmText(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-4">
                                <button 
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 btn bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold transition-all"
                                >
                                    إلغاء التراجع
                                </button>
                                <button 
                                    onClick={handleDelete}
                                    disabled={isDeleting || confirmText !== CONFIRM_PHRASE}
                                    className={`flex-1 btn bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {isDeleting ? 'جاري الحذف...' : 'تأكيد الحذف'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
