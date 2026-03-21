'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiSave, FiX, FiUploadCloud, FiEye, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import FileUploader from '@/components/ui/FileUploader';
import BunnyUpload from '@/components/instructor/BunnyUpload';

export default function NewLessonPage() {
    const params = useParams();
    const router = useRouter();
    const moduleId = params.moduleId as string;
    const courseId = params.id as string;

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        content: '',
        videoUrl: '',
        videoDuration: '',
        isFree: false,
        attachments: [''],
        bunnyVideoId: '',
        bunnyLibraryId: ''
    });

    const addAttachment = () => {
        setFormData({
            ...formData,
            attachments: [...formData.attachments, ''],
        });
    };

    const removeAttachment = (index: number) => {
        const newAttachments = formData.attachments.filter((_, i) => i !== index);
        setFormData({ ...formData, attachments: newAttachments });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`/api/modules/${moduleId}/lessons`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    attachments: formData.attachments.filter(a => a.trim() !== ''),
                }),
            });

            if (response.ok) {
                router.push(`/dashboard/courses/${courseId}/content`);
            } else {
                const data = await response.json();
                toast.error(data.error || 'حدث خطأ بشع!');
            }
        } catch (error) {
            console.error('Error creating lesson:', error);
            toast.error('لم نتمكن من الحفظ، حاول ثانية');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen text-slate-800 dir-rtl selection:bg-indigo-300 py-16 px-6">
            <div className="max-w-4xl mx-auto relative">
                <div className="mb-12 cursor-default flex items-center justify-between">
                    <div>
                        <h1 className="text-5xl font-black text-slate-900 leading-tight mb-2 tracking-tighter cursor-pointer relative z-10 hover:text-primary-indigo-600 transition-colors">
                            إضافة درس جديد
                        </h1>
                        <p className="text-xl text-slate-500 font-medium mb-4 max-w-xl">
                            قوم بإدراج الفيديوهات والاختبارات والمستندات بضغطة زر.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-10">
                    <div className="bg-white rounded-[3rem] p-10 md:p-14 shadow-2xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden group hover:border-primary-indigo-100 transition-all duration-500">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-indigo-50 rounded-bl-[100px] -z-10 transition-all group-hover:scale-110" />
                        
                        <div className="space-y-8">
                            <h2 className="text-2xl font-black flex items-center gap-4 text-slate-800">تفاصيل الدرس</h2>
                            
                            <div className="relative group/input">
                                <label className="block text-sm font-bold text-slate-400 mb-2 tracking-widest uppercase transition-colors group-focus-within/input:text-primary-indigo-500">عنوان الدرس الجذاب</label>
                                <input
                                    type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="مثال: مقدمة في بناء أفكار خارج الصندوق..."
                                    className="w-full bg-slate-50 border-0 rounded-2xl px-6 py-5 text-lg font-bold text-slate-800 focus:ring-4 focus:ring-primary-indigo-500/10 focus:bg-white transition-all placeholder:text-slate-300"
                                />
                            </div>

                            <div className="relative group/input">
                                <label className="block text-sm font-bold text-slate-400 mb-2 tracking-widest uppercase transition-colors group-focus-within/input:text-primary-indigo-500">وصف تشويقي للدرس</label>
                                <textarea
                                    value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="ماذا سيتعلم الطالب من هذا الدرس؟" rows={2}
                                    className="w-full bg-slate-50 border-0 rounded-2xl px-6 py-5 text-lg font-bold text-slate-800 focus:ring-4 focus:ring-primary-indigo-500/10 focus:bg-white transition-all placeholder:text-slate-300"
                                />
                            </div>

                            <div className="relative group/input mt-8">
                                <label className="block text-sm font-bold text-slate-400 mb-2 tracking-widest uppercase transition-colors group-focus-within/input:text-primary-indigo-500">المحتوى النصي المفصل (Markdown)</label>
                                <textarea
                                    value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    placeholder="اكتب الشرح، أو أضف روابط خارجية هنا..." rows={6}
                                    className="w-full bg-slate-50 border-0 rounded-3xl px-6 py-5 font-medium text-slate-700 focus:ring-4 focus:ring-primary-indigo-500/10 focus:bg-white transition-all placeholder:text-slate-300"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-10">
                        <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center justify-center text-center space-y-6">
                            <h3 className="font-black text-xl">فيديو الدرس 🔥</h3>
                            <div className="w-full">
                                {formData.bunnyVideoId ? (
                                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col items-center text-center gap-4">
                                        <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-2xl flex items-center justify-center mb-2">
                                            <FiCheckCircle size={32} />
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-800 text-lg">مرفوع على سيرفرات Bunny</p>
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">آمن وجاهز للعرض</p>
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={() => setFormData(p => ({ ...p, bunnyVideoId: '', bunnyLibraryId: '' }))}
                                            className="px-6 py-2 mt-4 text-sm bg-white text-red-500 hover:bg-red-50 rounded-xl transition-colors shadow-sm font-bold"
                                        >
                                            إلغاء الفيديو
                                        </button>
                                    </div>
                                ) : (
                                    <div className="w-full">
                                        <BunnyUpload
                                            onComplete={(data) => { 
                                                if (data) setFormData(prev => ({ ...prev, bunnyVideoId: data.videoId, bunnyLibraryId: data.libraryId }));
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="w-full mt-4 text-right">
                                <label className="block text-[10px] font-bold text-slate-400 mb-2 tracking-widest uppercase">المدة الزمنية (بالثواني)</label>
                                <input
                                    type="number" min="0" value={formData.videoDuration} onChange={(e) => setFormData({ ...formData, videoDuration: e.target.value })}
                                    placeholder="مثال: 600"
                                    className="w-full bg-slate-50 border-0 rounded-xl px-4 py-3 font-bold text-slate-800 text-center focus:ring-4 focus:ring-primary-indigo-500/10"
                                />
                            </div>
                        </div>

                        <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-slate-200/50 border border-slate-100 flex flex-col">
                            <h3 className="font-black text-xl mb-6 flex items-center gap-2">ملحقات وموارد الدرس 📚</h3>
                            <div className="flex-1 space-y-4 flex flex-col justify-end">
                                {formData.attachments.filter(a => a.trim() !== '').length > 0 && (
                                    <div className="space-y-3 mb-6 bg-slate-50 p-4 rounded-2xl">
                                        {formData.attachments.filter(a => a.trim() !== '').map((attachment, index) => (
                                            <div key={index} className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                                                <FiUploadCloud className="text-primary-indigo-500 flex-shrink-0" size={20} />
                                                <span className="flex-1 text-xs font-bold text-slate-600 truncate dir-ltr text-left">{attachment.split('/').pop()}</span>
                                                <button
                                                    type="button" onClick={() => removeAttachment(index)}
                                                    className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-600 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                                                >
                                                    <FiX />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="ring-4 ring-slate-50 rounded-3xl overflow-hidden hover:ring-primary-indigo-100 transition-all">
                                    <FileUploader
                                        onUploadSuccess={(urls) => { setFormData(prev => ({ ...prev, attachments: [...prev.attachments.filter(a => a.trim() !== ''), ...urls] })); }}
                                        maxFiles={5} maxSize={100 * 1024 * 1024}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-8 bg-blue-900 rounded-[3rem] border border-blue-800 shadow-xl cursor-pointer hover:bg-blue-800 transition-colors group mt-8" onClick={() => setFormData({ ...formData, isFree: !formData.isFree })}>
                        <div className="text-right">
                            <h3 className="font-black text-white text-xl leading-tight transition-colors group-hover:text-amber-400">إتاحة كدرس مجاني (Free Preview) 👀</h3>
                            <p className="text-xs text-blue-200 mt-2 max-w-lg leading-relaxed">اسمح للزوار بمشاهدة هذا الدرس مجاناً كإعلان تشويقي لدفعهم للاشتراك بالدورة الكاملة.</p>
                        </div>
                        <div className={`w-16 h-9 rounded-full flex items-center px-1.5 transition-all outline outline-offset-2 ${formData.isFree ? 'bg-amber-500 outline-amber-500/30' : 'bg-blue-950 outline-blue-900'}`}>
                            <div className={`w-6 h-6 bg-white rounded-full transition-all ${formData.isFree ? 'translate-x-[26px]' : 'translate-x-0'} shadow-sm shadow-black/40`} />
                        </div>
                    </div>

                    <div className="mt-16 flex flex-col md:flex-row items-center justify-between pt-10 border-t border-slate-200 gap-6">
                        <button
                            type="button" onClick={() => router.back()}
                            className="w-full md:w-auto px-8 py-4 text-slate-500 font-bold hover:text-slate-800 border-2 border-slate-200 rounded-2xl transition-all hover:bg-slate-100"
                        >
                            إلغاء والعودة
                        </button>
                        <button
                            type="submit" disabled={loading}
                            className="w-full md:w-auto px-12 py-4 bg-slate-900 text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-black transition-all shadow-2xl shadow-indigo-200 active:scale-95 text-lg"
                        >
                            <FiSave size={24} />
                            {loading ? 'جاري رفع الإبداع...' : 'اعتماد الدرس بنجاح'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
