import { ScarcityEngine } from '@/components/ScarcityEngine';
import { PayWhatYouWant } from '@/components/PayWhatYouWant';
import { ShareButtons } from '@/components/ShareButtons';
import { CreatorNameWithBadge } from '@/components/VerifiedBadge';

# Product Page Components Implementation Guide

## 🎯 Overview
This guide shows how to integrate the new marketplace features into your product pages.

## 🔧 Components Available

### 1. ScarcityEngine
Creates urgency with countdown timers and stock limits.

\`\`\`tsx
import { ScarcityEngine } from '@/components/ScarcityEngine';

<ScarcityEngine
    stockLimit={10}
    soldCount={7}
    offerExpiresAt={new Date('2026-02-15T23:59:59')}
    position="sticky" // or "inline"
/>
\`\`\`

**Props:**
- \`stockLimit\`: Total available stock
- \`soldCount\`: Number already sold
- \`offerExpiresAt\`: Expiry date/time
- \`position\`: 'inline' | 'sticky' (sticky on mobile)

---

### 2. PayWhatYouWant
Flexible pricing with PWYW model.

\`\`\`tsx
import { PayWhatYouWant } from '@/components/PayWhatYouWant';

<PayWhatYouWant
    productId={product.id}
    productTitle={product.title}
    minPrice={product.minPrice || 0}
    suggestedPrice={product.suggestedPrice || 50}
    onPurchase={(amount, email) => {
        // Handle purchase
        if (amount === 0 && email) {
            // Free download - send file to email
        } else {
            // Paid purchase - redirect to payment
        }
    }}
    currency="ج.م"
/>
\`\`\`

**Features:**
- If \`minPrice = 0\`, shows "Free" option with email capture
- Quick amount buttons for easy selection
- Custom amount input
- Shows appreciation message for generous amounts

---

### 3. ShareButtons & WhatsApp
Viral growth tools with pre-filled messages.

\`\`\`tsx
import { ShareButtons, AffiliateReferralLink } from '@/components/ShareButtons';

<ShareButtons
    productUrl={`https://yoursite.com/@${creator.username}/${product.slug}`}
    productTitle={product.title}
    creatorName={creator.name}
    price={product.price}
    currency="ج.م"
/>

{/* For affiliates */}
<AffiliateReferralLink
    productUrl={productUrl}
    affiliateId={user.affiliateCode}
/>
\`\`\`

**WhatsApp Message Format:**
\`\`\`
🎯 [Product Title]

من: [Creator Name]
السعر: [Price] ج.م

شاهد المنتج:
[Product URL]
\`\`\`

--

### 4. VerifiedBadge
Trust indicator with blue checkmark.

\`\`\`tsx
import { CreatorNameWithBadge, VerifiedBadge } from '@/components/VerifiedBadge';

<CreatorNameWithBadge
    name={creator.name}
    isVerified={creator.isVerified}
    badgeSize="md"
/>

{/* Or standalone */}
{creator.isVerified && <VerifiedBadge size="lg" />}
\`\`\`

---

## 📊 Database Schema Updates

Run this to apply the schema changes:

\`\`\`bash
npx prisma db push
\`\`\`

**New Product Fields:**
- \`minPrice\`: Minimum price for PWYW (0 = free choice)
- \`suggestedPrice\`: Suggested price to guide users
- \`stockLimit\`: Inventory limit (null = unlimited)
- \`soldCount\`: Track sales count
- \`offerExpiresAt\`: Time-limited offers

**New User Fields:**
- \`isVerified\`: Blue checkmark for trusted creators
- \`preferredLanguage\`: User's language preference (ar, en, es)

---

## 🌍 Multi-Language Support (i18n)

\`\`\`tsx
import { useI18n, LanguageSwitcher } from '@/context/I18nContext';

function MyComponent() {
    const { t, language, direction } = useI18n();
    
    return (
        <div>
            <h1>{t('common.home')}</h1>
            <p>Current: {language}, Direction: {direction}</p>
            <LanguageSwitcher />
        </div>
    );
}
\`\`\`

**Features:**
- Auto-detect RTL/LTR based on language
- Updates HTML \`lang\` and \`dir\` attributes
- Persists preference in localStorage
- Supports: Arabic (RTL), English (LTR), Spanish (LTR)

---

## 🎨 Example: Complete Product Page

\`\`\`tsx
'use client';

import { ScarcityEngine } from '@/components/ScarcityEngine';
import { PayWhatYouWant } from '@/components/PayWhatYouWant';
import { ShareButtons } from '@/components/ShareButtons';
import { CreatorNameWithBadge } from '@/components/VerifiedBadge';
import { useI18n } from '@/context/I18nContext';

export default function ProductPage({ product, creator }) {
    const { t } = useI18n();
    
    const handlePurchase = async (amount: number, email?: string) => {
        if (amount === 0 && email) {
            // Free download
            await fetch('/api/products/claim-free', {
                method: 'POST',
                body: JSON.stringify({ productId: product.id, email })
            });
        } else {
            // Paid purchase
            window.location.href = '/checkout?productId=' + product.id;
        }
    };

    return (
        <div className="min-h-screen bg-bg-light dark:bg-bg-dark">
            {/* Scarcity Engine - Sticky on Mobile */}
            <ScarcityEngine
                stockLimit={product.stockLimit}
                soldCount={product.soldCount}
                offerExpiresAt={product.offerExpiresAt}
                position="sticky"
            />

            <div className="container-custom py-12">
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Product Info */}
                    <div>
                        <img
                            src={product.image}
                            alt={product.title}
                            className="w-full rounded-lg shadow-lg"
                        />
                    </div>

                    {/* Purchase Section */}
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-4xl font-bold mb-4">
                                {product.title}
                            </h1>
                            <CreatorNameWithBadge
                                name={creator.name}
                                isVerified={creator.isVerified}
                                className="text-lg"
                            />
                        </div>

                        {/* PWYW or Regular Price */}
                        {product.minPrice !== null ? (
                            <PayWhatYouWant
                                productId={product.id}
                                productTitle={product.title}
                                minPrice={product.minPrice}
                                suggestedPrice={product.suggestedPrice}
                                onPurchase={handlePurchase}
                            />
                        ) : (
                            <div className="card p-6">
                                <div className="text-3xl font-bold text-action-blue mb-4">
                                    {product.price} ج.م
                                </div>
                                <button className="btn btn-primary w-full">
                                    {t('buttons.buy')}
                                </button>
                            </div>
                        )}

                        {/* Share Buttons */}
                        <ShareButtons
                            productUrl={window.location.href}
                            productTitle={product.title}
                            creatorName={creator.name}
                            price={product.price}
                        />

                        {/* Description */}
                        <div className="prose dark:prose-invert">
                            <p>{product.description}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
\`\`\`

---

## 🚀 Next Steps

1. **Update Product Forms**: Add fields for \`minPrice\`, \`stockLimit\`, \`offerExpiresAt\`
2. **Tracking**: Increment \`soldCount\` on each purchase
3. **Affiliate System**: Track \`?ref=\` parameter in URL and record referral
4. **Analytics**: Show scarcity stats in creator dashboard
5. **Email System**: Send free downloads when PWYW = 0

---

## 📝 Notes

- **PWYW**: If \`minPrice\` is null, use standard pricing
- **Scarcity**: Both time and quantity limits can work together
- **Verified Badges**: Set \`isVerified\` to true in database for trusted creators
- **RTL/LTR**: Automatically flips layouts based on selected language

---

✨ **Your marketplace now has enterprise-level growth features!**
