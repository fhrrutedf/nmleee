'use client';

import { useState } from 'react';
import { FiUploadCloud, FiCheckCircle, FiLoader, FiAlertCircle } from 'react-icons/fi';

interface BunnyUploadProps {
    lessonId: string;
    onComplete?: () => void;
}

export default function BunnyUpload({ lessonId, onComplete }: BunnyUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState<'idle' | 'init' | 'uploading' | 'complete' | 'error'>('idle');

    const handleUpload = async () => {
        if (!file) return;

        setStatus('init');
        setUploading(true);

        try {
            // 1. Get Upload Details from Backend
            const initRes = await fetch(`/api/lessons/${lessonId}/bunny/upload`, { method: 'POST' });
            const { videoId, libraryId, apiKey } = await initRes.json();

            if (!initRes.ok) throw new Error('Failed to init upload');

            // 2. Direct Upload to Bunny (Using XHR for progress)
            setStatus('uploading');
            const xhr = new XMLHttpRequest();
            xhr.open('PUT', `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`, true);
            xhr.setRequestHeader('AccessKey', apiKey);
            xhr.setRequestHeader('Content-Type', 'application/octet-stream');

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percent = (event.loaded / event.total) * 100;
                    setProgress(Math.round(percent));
                }
            };

            xhr.onload = () => {
                if (xhr.status === 200) {
                    setStatus('complete');
                    if (onComplete) onComplete();
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

    return (
        <div className="bg-white dark:bg-card-white border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-[32px] p-10 text-center transition-all hover:border-action-blue/50">
            {status === 'complete' ? (
                <div className="space-y-4 py-6">
                    <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FiCheckCircle size={40} />
                    </div>
                    <h3 className="text-2xl font-black text-primary-charcoal dark:text-white">تم الرفع بنجاح!</h3>
                    <p className="text-gray-500 font-medium">جاري المعالجة الآن على سيرفرات Bunny Stream...</p>
                </div>
            ) : status === 'error' ? (
                <div className="space-y-4 py-6">
                    <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FiAlertCircle size={40} />
                    </div>
                    <h3 className="text-2xl font-black text-primary-charcoal dark:text-white">خطأ في الرفع</h3>
                    <button onClick={handleUpload} className="px-6 py-3 bg-action-blue text-white rounded-xl font-bold">إعادة المحاولة</button>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="w-24 h-24 bg-action-blue/10 text-action-blue rounded-[32px] flex items-center justify-center mx-auto mb-6">
                        {uploading ? <FiLoader size={40} className="animate-spin" /> : <FiUploadCloud size={40} />}
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-2xl font-black text-primary-charcoal dark:text-white">رفع فيديو جديد</h3>
                        <p className="text-gray-400 font-medium">ارفع الفيديو مباشرة لخدمة Bunny Stream (مثل يوتيوب)</p>
                    </div>

                    {!uploading ? (
                        <>
                            <input 
                                type="file" 
                                accept="video/*" 
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                className="hidden"
                                id="bunny-upload-input"
                            />
                            <label 
                                htmlFor="bunny-upload-input"
                                className="inline-block px-10 py-5 bg-action-blue text-white rounded-2xl font-black text-lg cursor-pointer hover:shadow-2xl hover:shadow-action-blue/30 transition-all active:scale-95"
                            >
                                {file ? file.name : 'اختر ملف الفيديو'}
                            </label>
                            
                            {file && (
                                <button 
                                    onClick={handleUpload}
                                    className="block mx-auto mt-4 text-action-blue font-bold hover:underline"
                                >
                                    اضغط للبدء بالرفع
                                </button>
                            )}
                        </>
                    ) : (
                        <div className="max-w-md mx-auto space-y-4">
                            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden border border-white/5">
                                <div 
                                    className="h-full bg-action-blue transition-all duration-300" 
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <p className="font-black text-action-blue text-xl">{progress}%</p>
                            <p className="text-gray-400 text-sm font-bold animate-pulse uppercase tracking-widest">
                                {status === 'init' ? 'جاري التحضير...' : 'جاري الرفع الآن...'}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
