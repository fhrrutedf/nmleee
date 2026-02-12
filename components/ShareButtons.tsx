'use client';

import { FiShare2 } from 'react-icons/fi';
import { SiWhatsapp } from 'react-icons/si';

interface ShareButtonsProps {
    productUrl: string;
    productTitle: string;
    creatorName: string;
    price?: number;
    currency?: string;
}

export function ShareButtons({
    productUrl,
    productTitle,
    creatorName,
    price,
    currency = 'ج.م'
}: ShareButtonsProps) {
    const whatsappMessage = encodeURIComponent(
        `🎯 ${productTitle}\n\nمن: ${creatorName}\n${price ? `السعر: ${price} ${currency}` : 'مجاني!'}\n\nشاهد المنتج:\n${productUrl}`
    );

    const whatsappUrl = `https://wa.me/?text=${whatsappMessage}`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(productUrl);
        alert('تم نسخ الرابط! ✅');
    };

    return (
        <div className="flex flex-wrap gap-3">
            {/* WhatsApp Share */}
            <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-400 hover:bg-green-500 hover:text-white dark:hover:bg-green-600"
            >
                <SiWhatsapp className="text-lg" />
                <span className="hidden sm:inline">مشاركة عبر واتساب</span>
                <span className="sm:hidden">واتساب</span>
            </a>

            {/* Copy Link */}
            <button
                onClick={handleCopyLink}
                className="btn btn-outline flex items-center gap-2"
            >
                <FiShare2 />
                <span className="hidden sm:inline">نسخ الرابط</span>
                <span className="sm:hidden">نسخ</span>
            </button>
        </div>
    );
}

interface AffiliateReferralLinkProps {
    productUrl: string;
    affiliateId: string;
}

export function AffiliateReferralLink({
    productUrl,
    affiliateId
}: AffiliateReferralLinkProps) {
    const referralUrl = `${productUrl}?ref=${affiliateId}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(referralUrl);
        alert('تم نسخ رابط الإحالة! 🎉');
    };

    return (
        <div className="card p-4">
            <h4 className="font-semibold text-primary-charcoal dark:text-white mb-2">
                رابط الإحالة الخاص بك
            </h4>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={referralUrl}
                    readOnly
                    className="input flex-1 bg-gray-50 dark:bg-gray-900 text-sm"
                    dir="ltr"
                />
                <button
                    onClick={handleCopy}
                    className="btn btn-primary"
                >
                    نسخ
                </button>
            </div>
            <p className="text-xs text-text-muted mt-2">
                💰 احصل على عمولة عند كل عملية شراء عبر هذا الرابط
            </p>
        </div>
    );
}
