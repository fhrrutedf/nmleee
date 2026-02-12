# 🚀 Quick Start - Marketplace Features

## ⚡ 5-Minute Integration

### Step 1: Update Your Product Data
Add these fields to your products:

\`\`\`typescript
{
    minPrice: 0,           // 0 = free choice, or set minimum
    suggestedPrice: 50,    // Recommended price
    stockLimit: 100,       // Limited inventory
    soldCount: 0,          // Auto-updated
    offerExpiresAt: new Date('2026-02-20T23:59:59')
}
\`\`\`

### Step 2: Add Components to Product Page

\`\`\`tsx
import { ScarcityEngine } from '@/components/ScarcityEngine';
import { PayWhatYouWant } from '@/components/PayWhatYouWant';
import { ShareButtons } from '@/components/ShareButtons';
import { CreatorNameWithBadge } from '@/components/VerifiedBadge';

export default function ProductPage({ product, creator }) {
    return (
        <div>
            {/* 1. Scarcity at top (sticky on mobile) */}
            <ScarcityEngine
                stockLimit={product.stockLimit}
                soldCount={product.soldCount}
                offerExpiresAt={product.offerExpiresAt}
                position="sticky"
            />

            {/* 2. Creator name with badge */}
            <CreatorNameWithBadge
                name={creator.name}
                isVerified={creator.isVerified}
            />

            {/* 3. PWYW Pricing */}
            {product.minPrice !== null ? (
                <PayWhatYouWant
                    productId={product.id}
                    productTitle={product.title}
                    minPrice={product.minPrice}
                    suggestedPrice={product.suggestedPrice}
                    onPurchase={(amount, email) => {
                        if (amount === 0) {
                            // Send free download to email
                        } else {
                            // Process payment
                        }
                    }}
                />
            ) : (
                <div>
                    <p>{product.price} ج.م</p>
                    <button>Buy Now</button>
                </div>
            )}

            {/* 4. Share Buttons */}
            <ShareButtons
                productUrl={window.location.href}
                productTitle={product.title}
                creatorName={creator.name}
                price={product.price}
            />
        </div>
    );
}
\`\`\`

### Step 3: Add Language Switcher to Navigation

\`\`\`tsx
import { LanguageSwitcher } from '@/context/I18nContext';

export default function Navbar() {
    return (
        <nav>
            {/* Your existing nav items */}
            <LanguageSwitcher />
        </nav>
    );
}
\`\`\`

### Step 4: Mark Verified Creators
In your database (MongoDB):

\`\`\`javascript
db.users.updateOne(
    { email: "creator@example.com" },
    { $set: { isVerified: true } }
)
\`\`\`

---

## 🎯 Testing Checklist

- [ ] Scarcity countdown updates every second
- [ ] Stock limit shows "Only X left" when low
- [ ] PWYW shows email field when amount = 0
- [ ] WhatsApp button opens with pre-filled message
- [ ] Language switcher changes text direction
- [ ] Verified badge appears next to creator name

---

## 📊 Update Database

\`\`\`bash
npx prisma db push
npx prisma generate
\`\`\`

---

## 🔥 Pro Tips

1. **Scarcity Psychology**: Set `offerExpiresAt` 24-48 hours for maximum urgency
2. **PWYW Sweet Spot**: Set `suggestedPrice` at 70% of your target price
3. **Stock Limits**: Start with `stockLimit: 50` for exclusive feeling
4. **Verified Badges**: Only verify established creators with good reviews

---

✅ **You're ready to launch!**

See [MARKETPLACE_IMPLEMENTATION.md](./MARKETPLACE_IMPLEMENTATION.md) for full documentation.
