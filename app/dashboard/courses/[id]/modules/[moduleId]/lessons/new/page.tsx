'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiSave, FiX, FiUploadCloud, FiEye, FiCheckCircle } from 'react-icons/fi';
import showToast from '@/lib/toast';
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
                showToast.success('تم حفظ الدرس وإدراجه في المنهج بنجاح! 🎓');
                router.push(`/dashboard/courses/${courseId}/content`);
            } else {
                const data = await response.json();
                showToast.error(data.error || 'حدث خطأ بشع!');
            }
        } catch (error) {
            console.error('Error creating lesson:', error);
            showToast.error('لم نتمكن من الحفظ، حاول ثانية');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen text-slate-800 dir-rtl selection:bg-indigo-300 py-16 px-6">
            <div className="max-w-4xl mx-auto relative">
                <div className="mb-8 cursor-default flex items-center justify-between">
                    <div className="text-right">
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight mb-1 tracking-tighter cursor-pointer relative z-10 hover:text-primary-indigo-600 transition-colors">
                            إضافة درس جديد
                        </h1>
                        <p className="text-sm md:text-base text-slate-500 font-medium mb-2 max-w-xl">
                            قوم بإدراج الفيديوهات والاختبارات والمستندات بضغطة زر.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white rounded-xl p-8 md:p-10 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden group hover:border-primary-indigo-100 transition-all duration-500">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary-indigo-50 rounded-bl-[80px] -z-10 transition-all group-hover:scale-110" />
                        
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold flex items-center gap-3 text-slate-800">تفاصيل الدرس</h2>
                            
                            <div className="relative group/input">
                                <label className="block text-[10px] font-bold text-slate-400 mb-2 tracking-widest uppercase transition-colors group-focus-within/input:text-primary-indigo-500">عنوان الدرس الجذاب</label>
                                <input
                                    type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="مثال: مقدمة في بناء أفكار خارج الصندوق..."
                                    className="w-full bg-slate-50 border-0 rounded-2xl px-6 py-4 text-base font-bold text-slate-800 focus:ring-4 focus:ring-primary-indigo-500/10 focus:bg-white transition-all placeholder:text-slate-300"
                                />
                            </div>

                            <div className="relative group/input">
                                <label className="block text-[10px] font-bold text-slate-400 mb-2 tracking-widest uppercase transition-colors group-focus-within/input:text-primary-indigo-500">وصف تشويقي للدرس</label>
                                <textarea
                                    value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="ماذا سيتعلم الطالب من هذا الدرس؟" rows={2}
                                    className="w-full bg-slate-50 border-0 rounded-2xl px-6 py-4 text-base font-bold text-slate-800 focus:ring-4 focus:ring-primary-indigo-500/10 focus:bg-white transition-all placeholder:text-slate-300"
                                />
                            </div>

                            <div className="relative group/input">
                                <label className="block text-[10px] font-bold text-slate-400 mb-2 tracking-widest uppercase transition-colors group-focus-within/input:text-primary-indigo-500">المحتوى النصي المفصل (Markdown)</label>
                                <textarea
                                    value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    placeholder="اكتب الشرح، أو أضف روابط خارجية هنا..." rows={5}
                                    className="w-full bg-slate-50 border-0 rounded-2xl px-6 py-4 font-medium text-slate-700 focus:ring-4 focus:ring-primary-indigo-500/10 focus:bg-white transition-all placeholder:text-slate-300 h-32"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center justify-center text-center space-y-4 min-h-[300px]">
                            <h3 className="font-bold text-lg">فيديو الدرس 🔥</h3>
                            <div className="w-full flex-1 flex flex-col justify-center">
                                {formData.bunnyVideoId ? (
                                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col items-center text-center gap-3 transition-all animate-in fade-in zoom-in duration-300">
                                        <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-2xl flex items-center justify-center">
                                            <FiCheckCircle size={24} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 text-base">مرفوع على سيرفرات Bunny</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">آمن وجاهز للعرض</p>
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={() => setFormData(p => ({ ...p, bunnyVideoId: '', bunnyLibraryId: '' }))}
                                            className="px-6 py-2 bg-white text-red-500 hover:bg-red-50 rounded-xl transition-colors shadow-sm font-bold text-[10px] border border-red-100"
                                        >
                                            إلغاء الفيديو
                                        </button>
                                    </div>
                                ) : (
                                    <div className="w-full min-h-[160px] flex items-center">
                                        <BunnyUpload
                                            onComplete={(data) => { 
                                                if (data) setFormData(prev => ({ ...prev, bunnyVideoId: data.videoId, bunnyLibraryId: data.libraryId }));
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="w-full mt-2 text-right">
                                <label className="block text-[9px] font-bold text-slate-400 mb-1 tracking-widest uppercase">المدة الزمنية (بالثواني)</label>
                                <input
                                    type="number" min="0" value={formData.videoDuration} onChange={(e) => setFormData({ ...formData, videoDuration: e.target.value })}
                                    placeholder="مثال: 600"
                                    className="w-full bg-slate-50 border-0 rounded-xl px-4 py-2.5 font-bold text-slate-800 text-center focus:ring-4 focus:ring-primary-indigo-500/10 text-sm"
                                />
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col min-h-[300px]">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">ملحقات وموارد الدرس 📚</h3>
                            <div className="flex-1 space-y-4 flex flex-col justify-end">
                                {formData.attachments.filter(a => a.trim() !== '').length > 0 && (
                                    <div className="space-y-2 mb-4 bg-slate-50 p-3 rounded-2xl border border-dashed border-slate-200">
                                        {formData.attachments.filter(a => a.trim() !== '').map((attachment, index) => (
                                            <div key={index} className="flex items-center gap-2 bg-white p-2 rounded-xl shadow-sm border border-slate-100 animate-in slide-in-from-bottom-1 duration-200">
                                                <FiUploadCloud className="text-primary-indigo-500 flex-shrink-0" size={16} />
                                                <span className="flex-1 text-[10px] font-bold text-slate-600 truncate dir-ltr text-left">{attachment.split('/').pop()}</span>
                                                <button
                                                    type="button" onClick={() => removeAttachment(index)}
                                                    className="w-6 h-6 flex items-center justify-center bg-red-50 text-red-600 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                                                >
                                                    <FiX size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="ring-2 ring-slate-50 rounded-[1.5rem] overflow-hidden hover:ring-primary-indigo-100 transition-all h-[140px] flex items-center">
                                    <FileUploader
                                        onUploadSuccess={(urls) => { setFormData(prev => ({ ...prev, attachments: [...prev.attachments.filter(a => a.trim() !== ''), ...urls] })); }}
                                        maxFiles={5} maxSize={100 * 1024 * 1024}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div 
                        className={`flex items-center justify-between p-6 rounded-xl border transition-all cursor-pointer group mt-4 relative overflow-hidden ${formData.isFree ? 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-100' : 'bg-white border-slate-100 shadow-sm'}`} 
                        onClick={() => setFormData({ ...formData, isFree: !formData.isFree })}
                    >
                        {formData.isFree && <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-indigo-700 opacity-50" />}
                        <div className="text-right relative z-10">
                            <h3 className={`font-bold text-base leading-tight transition-colors ${formData.isFree ? 'text-white' : 'text-slate-800'}`}>إتاحة كدرس مجاني (Free Preview) 👀</h3>
                            <p className={`text-[10px] mt-1 max-w-lg leading-relaxed ${formData.isFree ? 'text-indigo-100' : 'text-slate-400 font-bold'}`}>اسمح للزوار بمشاهدة هذا الدرس مجاناً كإعلان تشويقي.</p>
                        </div>
                        <div className={`w-12 h-7 rounded-full flex items-center px-1 transition-all relative z-10 ${formData.isFree ? 'bg-white/20 backdrop-blur-md' : 'bg-slate-100'}`}>
                            <div className={`w-5 h-5 rounded-full transition-all shadow-md ${formData.isFree ? 'translate-x-[20px] bg-blue-400' : 'translate-x-0 bg-white'}`} />
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col md:flex-row items-center justify-between pt-6 border-t border-slate-200 gap-4">
                        <button
                            type="button" onClick={() => router.back()}
                            className="w-full md:w-auto px-6 py-3 text-slate-500 font-bold hover:text-slate-800 border-2 border-slate-200 rounded-xl transition-all hover:bg-slate-100 text-sm"
                        >
                            إلغاء والعودة
                        </button>
                        <button
                            type="submit" disabled={loading}
                            className="w-full md:w-auto px-10 py-3.5 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-95 text-base"
                        >
                            <FiSave size={20} />
                            {loading ? 'جاري رفع الإبداع...' : 'اعتماد الدرس بنجاح'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
