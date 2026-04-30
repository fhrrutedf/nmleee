'use client';

import { useState, useRef } from 'react';
import { FiUploadCloud, FiCheckCircle, FiLoader, FiAlertCircle } from 'react-icons/fi';

interface ImageKitUploadProps {
    lessonId?: string;
    onComplete?: (data?: { fileId: string; url: string }) => void;
}

export default function ImageKitUpload({ lessonId, onComplete }: ImageKitUploadProps) {
    const [file, setFile]         = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress]  = useState(0);
    const [status, setStatus]      = useState<'idle' | 'init' | 'uploading' | 'complete' | 'error'>('idle');
    const [errorMsg, setErrorMsg]  = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async () => {
        if (!file) return;

        setStatus('init');
        setUploading(true);
        setProgress(0);
        setErrorMsg('');

        try {
            // ─── 1. الحصول على بيانات التوثيق من الخادم ────────────────
            const authEndpoint = lessonId
                ? `/api/lessons/${lessonId}/imagekit/upload`
                : '/api/imagekit/auth';

            const authRes = await fetch(authEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: file.name }) });
            const authData = await authRes.json();

            if (!authRes.ok) throw new Error(authData.error || 'فشل إنشاء توكن الرفع');

            const { token, expire, signature, publicKey, urlEndpoint, folder, fileName } = authData;

            // ─── 2. رفع الملف مباشرةً إلى ImageKit عبر XHR (للتقدم) ──
            setStatus('uploading');

            const formData = new FormData();
            formData.append('file',      file);
            formData.append('fileName',  fileName || file.name);
            formData.append('publicKey', publicKey);
            formData.append('signature', signature);
            formData.append('expire',    String(expire));
            formData.append('token',     token);
            if (folder) formData.append('folder', folder);

            // خيارات الحماية
            formData.append('isPrivateFile', 'false'); // نستخدم Signed URLs بدلاً منه
            formData.append('useUniqueFileName', 'true');

            const uploadResult = await new Promise<{ fileId: string; url: string; name: string }>(
                (resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    xhr.open('POST', 'https://upload.imagekit.io/api/v1/files/upload', true);

                    xhr.upload.onprogress = (event) => {
                        if (event.lengthComputable) {
                            setProgress(Math.round((event.loaded / event.total) * 100));
                        }
                    };

                    xhr.onload = () => {
                        if (xhr.status === 200) {
                            const data = JSON.parse(xhr.responseText);
                            resolve({ fileId: data.fileId, url: data.url, name: data.name });
                        } else {
                            reject(new Error(`رمز الخطأ: ${xhr.status}`));
                        }
                    };

                    xhr.onerror = () => reject(new Error('فشل الاتصال بخوادم ImageKit'));
                    xhr.send(formData);
                }
            );

            // ─── 3. إخبار الخادم بالنجاح وحفظ البيانات في قاعدة البيانات ─
            if (lessonId) {
                const confirmRes = await fetch(`/api/lessons/${lessonId}/imagekit/confirm`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        fileId: uploadResult.fileId,
                        url:    uploadResult.url,
                        name:   uploadResult.name,
                    }),
                });
                if (!confirmRes.ok) {
                    const err = await confirmRes.json();
                    throw new Error(err.error || 'فشل حفظ بيانات الفيديو');
                }
            }

            setStatus('complete');
            if (onComplete) onComplete({ fileId: uploadResult.fileId, url: uploadResult.url });

        } catch (error: any) {
            console.error('[ImageKit Upload Failed]', error);
            setErrorMsg(error?.message || 'حدث خطأ أثناء الرفع');
            setStatus('error');
        } finally {
            setUploading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected) {
            setFile(selected);
            setStatus('idle');
            setTimeout(() => handleUpload(), 100);
        }
    };

    return (
        <div className="relative group transition-all w-full">
            <div
                className={`bg-[#0A0A0A] dark:bg-card-white border-2 border-dashed rounded-[32px] p-6 sm:p-8 text-center transition-all ${
                    uploading
                        ? 'border-emerald-600 bg-emerald-700/10 shadow-inner'
                        : 'border-emerald-500/20 dark:border-gray-800 hover:border-emerald-600/50 hover:bg-[#111111]'
                }`}
            >
                {/* ── حالة النجاح ── */}
                {status === 'complete' ? (
                    <div className="space-y-4 py-4 animate-in fade-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <FiCheckCircle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-[#10B981] dark:text-white">تم الرفع بنجاح!</h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest italic">
                            الفيديو جاهز على ImageKit
                        </p>
                    </div>

                ) : status === 'error' ? (
                    /* ── حالة الخطأ ── */
                    <div className="space-y-4 py-4 animate-in fade-in duration-300">
                        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <FiAlertCircle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-red-400">خطأ في الرفع</h3>
                        {errorMsg && <p className="text-xs text-red-300/70">{errorMsg}</p>}
                        <button
                            type="button"
                            onClick={() => { setStatus('idle'); setFile(null); if (inputRef.current) inputRef.current.value = ''; }}
                            className="px-6 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl font-bold text-xs hover:scale-105 transition-transform"
                        >
                            إعادة المحاولة
                        </button>
                    </div>

                ) : (
                    /* ── حالة الرفع أو الانتظار ── */
                    <div className="space-y-4">
                        <div className={`w-16 h-16 bg-emerald-700/20 text-[#10B981] rounded-xl flex items-center justify-center mx-auto mb-2 transition-transform ${uploading ? 'scale-90' : 'group-hover:scale-110'}`}>
                            {uploading ? <FiLoader size={32} className="animate-spin" /> : <FiUploadCloud size={32} />}
                        </div>

                        {!uploading ? (
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <h3 className="text-sm font-bold text-[#10B981] dark:text-white">اسحب ملف الفيديو هنا</h3>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                                        أو انقر لاختيار الفيديو • مدعوم: MP4, MOV, AVI
                                    </p>
                                </div>
                                <input
                                    ref={inputRef}
                                    type="file"
                                    accept="video/*"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className="relative inline-block px-8 py-3 bg-emerald-700 text-white rounded-xl font-bold text-[10px] shadow-lg shadow-[#10B981]/20 uppercase tracking-widest">
                                    {file ? file.name : 'اختيار فيديو الدرس'}
                                </div>
                            </div>
                        ) : (
                            /* شريط التقدم */
                            <div className="max-w-xs mx-auto space-y-3">
                                <div className="h-2.5 bg-emerald-800 dark:bg-gray-800 rounded-xl overflow-hidden border border-white/5 shadow-inner">
                                    <div
                                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-300 rounded-xl"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-tighter">
                                    <span className="text-[#10B981]">{progress}%</span>
                                    <span className="text-gray-400">
                                        {status === 'init' ? 'تجهيز الاتصال...' : 'رفع إلى ImageKit...'}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
