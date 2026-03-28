'use client';

import { useState, useRef } from 'react';
import { FiCopy, FiCheck, FiUpload, FiX, FiInfo, FiArrowRight } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import showToast from '@/lib/toast';

interface ManualPaymentCardProps {
    method: {
        id: string;
        name: string;
        nameAr: string;
        icon: string;
        exchangeRate?: number;
    };
    walletAddress: string;
    localPrice: {
        amount: number;
        currency: string;
    };
    usdTotal: number;
    onDataChange: (data: {
        senderPhone: string;
        transactionRef: string;
        proofFile: File | null;
        notes: string;
    }) => void;
    onBack: () => void;
    theme?: 'light' | 'dark';
}

export default function ManualPaymentCard({
    method,
    walletAddress,
    localPrice,
    usdTotal,
    onDataChange,
    onBack,
    theme = 'dark'
}: ManualPaymentCardProps) {
    const [copied, setCopied] = useState(false);
    const [senderPhone, setSenderPhone] = useState('');
    const [transactionRef, setTransactionRef] = useState('');
    const [notes, setNotes] = useState('');
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [proofPreview, setProofPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleCopy = () => {
        navigator.clipboard.writeText(walletAddress);
        setCopied(true);
        showToast.success('تم نسخ الرقم بنجاح');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            showToast.error('حجم الملف كبير جداً (الأقصى 5MB)');
            return;
        }
        setProofFile(file);
        const reader = new FileReader();
        reader.onload = () => setProofPreview(reader.result as string);
        reader.readAsDataURL(file);
        updateParent(senderPhone, transactionRef, file, notes);
    };

    const updateParent = (p: string, r: string, f: File | null, n: string) => {
        onDataChange({ senderPhone: p, transactionRef: r, proofFile: f, notes: n });
    };

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
        >
            {/* Header & Back */}
            <div className="flex items-center justify-between px-2">
                <button 
                    onClick={onBack}
                    className="flex items-center gap-1.5 text-slate-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
                >
                    <FiArrowRight /> تراجع
                </button>
                <div className="flex items-center gap-2 bg-white/5 border border-white/5 px-4 py-1.5 rounded-full">
                    <span className="text-xl">{method.icon}</span>
                    <span className="text-sm font-bold text-white">{method.nameAr}</span>
                </div>
            </div>

            {/* Premium Price Conversion Card */}
            <div className="relative group overflow-hidden bg-gradient-to-br from-indigo-950 to-blue-950/40 p-10 rounded-[2.5rem] border border-blue-500/20 shadow-2xl">
                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-[80px] -mr-10 -mt-10"></div>
                <div className="relative">
                    <p className="text-blue-500/70 text-xs font-bold uppercase tracking-[0.2em] mb-4">المبلغ المطلوب بالعملة المحلية</p>
                    <div className="flex items-baseline gap-3">
                        <span className="text-5xl font-bold text-white tracking-tighter">
                            {new Intl.NumberFormat('ar-EG').format(localPrice.amount)}
                        </span>
                        <span className="text-2xl font-bold text-blue-500">{localPrice.currency}</span>
                    </div>
                    <div className="mt-8 flex items-center gap-3 text-xs font-bold bg-black/40 backdrop-blur-3xl w-fit px-4 py-2 rounded-2xl border border-white/5">
                        <FiInfo size={14} className="text-blue-500" />
                        <span className="text-slate-400">يعادل تقريباً {usdTotal.toFixed(2)} $ بسعر السوق اليوم</span>
                    </div>
                </div>
            </div>

            {/* Wallet Address with Copy */}
            <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 shadow-inner">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 block px-2">رقم المحفظة للدفع {method.nameAr}</label>
                <div className="flex items-center gap-3">
                    <div className="flex-1 bg-black/40 border border-white/5 rounded-2xl px-5 py-4 font-mono text-xl font-bold text-white tracking-widest text-left" dir="ltr">
                        {walletAddress}
                    </div>
                    <button
                        onClick={handleCopy}
                        className={`shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${copied ? 'bg-blue-500 text-white scale-95' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 active:scale-95 border border-white/5'}`}
                    >
                        {copied ? <FiCheck size={28} /> : <FiCopy size={24} />}
                    </button>
                </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">رقم الهاتف المرسل منه *</label>
                    <input 
                        type="tel"
                        value={senderPhone}
                        onChange={(e) => { setSenderPhone(e.target.value); updateParent(e.target.value, transactionRef, proofFile, notes); }}
                        placeholder="09xx-xxx-xxx"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-blue-500/50 outline-none transition-all font-bold text-white text-left"
                        dir="ltr"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">رقم المرجع / العملية *</label>
                    <input 
                        type="text"
                        value={transactionRef}
                        onChange={(e) => { setTransactionRef(e.target.value); updateParent(senderPhone, e.target.value, proofFile, notes); }}
                        placeholder="Transaction ID"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-blue-500/50 outline-none transition-all font-mono font-bold text-white text-left"
                        dir="ltr"
                    />
                </div>
            </div>

            {/* Proof Upload Area */}
            <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">صورة إيصال التحويل (Proof) *</label>
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative w-full aspect-[16/6] rounded-[2rem] border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden ${proofPreview ? 'border-blue-500/50 bg-blue-500/5' : 'border-white/10 hover:border-blue-500/30 hover:bg-white/5 group'}`}
                >
                    <input type="file" ref={fileInputRef} onChange={handleFile} accept="image/*" className="hidden" />
                    
                    <AnimatePresence mode="wait">
                        {proofPreview ? (
                            <motion.div 
                                key="preview"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 group/img"
                            >
                                <img src={proofPreview} alt="Receipt" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setProofFile(null); setProofPreview(null); updateParent(senderPhone, transactionRef, null, notes); }}
                                        className="bg-white/10 backdrop-blur-xl p-3 rounded-full text-white hover:bg-white/20 transition-colors"
                                    >
                                        <FiX size={28} />
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="upload"
                                className="flex flex-col items-center gap-2"
                            >
                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-blue-500 group-hover:bg-white/10 transition-all">
                                    <FiUpload size={24} />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-bold text-white">اضغط لإرسال لقطة الشاشة</p>
                                    <p className="text-[10px] text-slate-600 font-bold mt-1 uppercase tracking-widest">PNG, JPG b 5MB Max</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">ملاحظات (اختياري)</label>
                <textarea 
                    value={notes}
                    onChange={(e) => { setNotes(e.target.value); updateParent(senderPhone, transactionRef, proofFile, e.target.value); }}
                    rows={2}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-blue-500/50 outline-none transition-all font-medium text-white resize-none"
                    placeholder="..."
                />
            </div>
        </motion.div>
    );
}
