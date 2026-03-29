'use client';

import { useState } from 'react';
import { FiUploadCloud, FiCheckCircle, FiLoader, FiAlertCircle } from 'react-icons/fi';

interface BunnyUploadProps {
    lessonId?: string;
    onComplete?: (data?: { videoId: string; libraryId: string }) => void;
}

export default function BunnyUpload({ lessonId, onComplete }: BunnyUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState<'idle' | 'init' | 'uploading' | 'complete' | 'error'>('idle');
    const [instanceId] = useState(() => Math.random().toString(36).substring(7));

    const handleUpload = async () => {
        if (!file) return;

        setStatus('init');
        setUploading(true);

        try {
            // 1. Get Upload Details from Backend (either edit existing lesson or init draft)
            const endpoint = lessonId ? `/api/lessons/${lessonId}/bunny/upload` : '/api/bunny/init';
            const initRes = await fetch(endpoint, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: file.name })
            });
            const { videoId, libraryId, apiKey, hostname, error } = await initRes.json();

            if (!initRes.ok) throw new Error(error || 'Failed to init upload');

            // 2. Direct Upload to Bunny (Using XHR for progress)
            setStatus('uploading');
            const xhr = new XMLHttpRequest();
            const uploadHost = hostname || 'video.bunnycdn.com';
            xhr.open('PUT', `https://${uploadHost}/library/${libraryId}/videos/${videoId}`, true);
            xhr.setRequestHeader('AccessKey', apiKey);
            xhr.setRequestHeader('Content-Type', 'application/octet-stream');

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percent = (event.loaded / event.total) * 100;
                    setProgress(Math.round(percent));
                }
            };

            xhr.onload = () => {
                if (xhr.status === 200 || xhr.status === 201) {
                    setStatus('complete');
                    if (onComplete) onComplete({ videoId, libraryId });
                } else {
                    setStatus('error');
                }
                setUploading(false);
            };

            xhr.onerror = () => {
                setStatus('error');
                setUploading(false);
            };

            xhr.send(file);

        } catch (error) {
            console.error('Upload Failed:', error);
            setStatus('error');
            setUploading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            // Auto-start upload for better UX
            setTimeout(() => {
                const btn = document.getElementById(`start-upload-${instanceId}`);
                if (btn) btn.click();
            }, 100);
        }
    };

    return (
        <div className="relative group transition-all w-full">
            <div className={`bg-white dark:bg-card-white border-2 border-dashed rounded-[32px] p-6 sm:p-8 text-center transition-all ${uploading ? 'border-emerald-600 bg-emerald-600/5 shadow-inner' : 'border-gray-200 dark:border-gray-800 hover:border-emerald-600/50 hover:bg-slate-50'}`}>
                {status === 'complete' ? (
                    <div className="space-y-4 py-4 animate-in fade-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <FiCheckCircle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-ink dark:text-white">تم الرفع!</h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest italic">جاري المعالجة الرقمية الآن</p>
                    </div>
                ) : status === 'error' ? (
                    <div className="space-y-4 py-4 animate-in fade-in duration-300">
                        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <FiAlertCircle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-ink dark:text-white">خطأ في الرفع</h3>
                        <button 
                            type="button"
                            onClick={handleUpload} 
                            className="px-6 py-2 bg-red-500 text-white rounded-xl font-bold text-xs hover:scale-105 transition-transform"
                        >
                            إعادة المحاولة
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className={`w-16 h-16 bg-emerald-600/10 text-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-2 transition-transform ${uploading ? ' scale-90' : 'group-hover:scale-110'}`}>
                            {uploading ? <FiLoader size={32} className="animate-spin" /> : <FiUploadCloud size={32} />}
                        </div>

                        {!uploading ? (
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <h3 className="text-sm font-bold text-ink dark:text-white">اسحب ملف الفيديو هنا</h3>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">أو انقر لاختيار المحتوى</p>
                                </div>
                                <input 
                                    type="file" 
                                    accept="video/*" 
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    id={`bunny-upload-${instanceId}`}
                                />
                                <div className="relative inline-block px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold text-[10px] shadow-sm shadow-accent/20 uppercase tracking-widest">
                                    {file ? file.name : 'اختيار فيديو المعاملة'}
                                </div>
                                
                                {file && (
                                    <button 
                                        type="button"
                                        id={`start-upload-${instanceId}`}
                                        onClick={(e) => { e.stopPropagation(); handleUpload(); }}
                                        className="hidden"
                                    >
                                        Start
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="max-w-xs mx-auto space-y-3">
                                <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden border border-white/5 shadow-inner">
                                    <div 
                                        className="h-full bg-emerald-600 transition-all duration-300" 
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-tighter">
                                    <span className="text-emerald-600">{progress}%</span>
                                    <span className="text-gray-400">
                                        {status === 'init' ? 'تجهيز المنفذ...' : 'نقل البيانات...'}
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
