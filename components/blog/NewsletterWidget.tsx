"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function NewsletterWidget() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubscribe = async () => {
        if (!email) {
            toast.error("يرجى إدخال بريدك الإلكتروني");
            return;
        }
        
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error("يرجى إدخال بريد إلكتروني صحيح");
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch("/api/newsletter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, source: "blog_sidebar" })
            });

            const data = await res.json();
            
            if (res.ok) {
                toast.success("تم الاشتراك بنجاح! شكراً لك.");
                setEmail("");
            } else {
                toast.error(data.error || "حدث خطأ ما");
            }
        } catch (error) {
            toast.error("فشل الاتصال بالخادم");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-primary-900 text-white rounded-xl p-8 shadow-lg shadow-[#10B981]/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-700 text-white rounded-xl mix-blend-overlay filter blur-2xl opacity-20"></div>
            <h3 className="text-xl font-bold mb-4 relative z-10">تحديثات أسبوعية</h3>
            <p className="text-gray-300 mb-6 text-sm relative z-10">
                اشترك في القائمة البريدية ليصلك كل جديد في عالم التجارة الرقمية.
            </p>
            <input 
                type="email" 
                placeholder="بريدك الإلكتروني" 
                className="w-full py-3 px-4 rounded-lg bg-gray-800 border border-gray-700 text-white mb-3 focus:outline-none focus:border-emerald-600 relative z-10" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
            />
            <button 
                onClick={handleSubscribe}
                disabled={isLoading}
                className="w-full py-3 bg-emerald-700 text-white rounded-lg font-bold hover:bg-emerald-600 transition-colors relative z-10 disabled:opacity-50"
            >
                {isLoading ? "جاري الاشتراك..." : "اشتراك"}
            </button>
        </div>
    );
}
