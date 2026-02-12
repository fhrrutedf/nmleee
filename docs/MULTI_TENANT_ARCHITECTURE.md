# 🏗️ Multi-Tenant Creator Marketplace Architecture

## 📋 Overview

تم تحويل المنصة من **Single E-commerce Site** إلى **Multi-Tenant Creator Marketplace** مشابه لـ Gumroad و Linktree.

---

## 🎯 Core Architecture Changes

### **1. User = Creator (Vendor)**
كل مستخدم في المنصة هو **Creator** يمتلك متجره الخاص:
- ✅ Username فريد لكل Creator
- ✅ صفحة عامة خاصة بكل Creator
- ✅ منتجات معزولة تماماً (Data Isolation)
- ✅ علامة تجارية مخصصة (Brand Color, Bio, Social Links)

### **2. URL Structure**

#### 🔗 **Creator Profile (Storefront)**
```
https://platform.com/@username
```
**مثال:**
```
https://tmleen.com/@ahmed-coach
https://tmleen.com/@designer-pro
```

#### 🔗 **Direct Product Link (Deep Linking)**
```
https://platform.com/@username/product-slug
```
**مثال:**
```
https://tmleen.com/@ahmed-coach/web-development-course
https://tmleen.com/@designer-pro/logo-templates-pack
```

---

## 🗄️ Database Schema Changes

### **Product Model Updates**

```prisma
model Product {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  title       String
  slug        String   // NEW: URL-friendly slug
  description String
  price       Float
  // ... other fields
  
  userId      String   @db.ObjectId
  user        User     @relation(...)
  
  @@unique([userId, slug]) // Unique slug PER creator
  @@index([userId])
  @@index([slug])
}
```

**Key Points:**
- ✅ `slug`: URL-friendly identifier للمنتج
- ✅ `@@unique([userId, slug])`: الـ slug فريد **لكل Creator**
- ✅ نفس slug يمكن استخدامه من Creators مختلفين

---

## 📁 File Structure

```
app/
├── @[username]/                    # Creator Storefront
│   ├── page.tsx                    # Profile page
│   └── [slug]/
│       └── page.tsx                # Product page
│
├── api/
│   └── creators/
│       └── [username]/
│           ├── route.ts            # Get creator + products
│           └── products/
│               └── [slug]/
│                   └── route.ts    # Get specific product
│
lib/
└── multi-tenant-utils.ts           # Helper functions
```

---

## 🔌 API Endpoints

### **1. Get Creator Profile + Products**
```
GET /api/creators/[username]
```

**Response:**
```json
{
  "creator": {
    "id": "...",
    "name": "Ahmed",
    "username": "ahmed-coach",
    "bio": "...",
    "avatar": "...",
    "brandColor": "#FF6B6B"
  },
  "products": [
    {
      "id": "...",
      "title": "Web Development Course",
      "slug": "web-development-course",
      "price": 499,
      "image": "..."
    }
  ]
}
```

**Data Isolation:** يتم جلب منتجات هذا Creator فقط!

---

### **2. Get Specific Product**
```
GET /api/creators/[username]/products/[slug]
```

**Response:**
```json
{
  "product": {
    "id": "...",
    "title": "...",
    "slug": "...",
    "description": "...",
    "price": 499,
    "features": [...],
    "reviews": [...]
  },
  "creator": {
    "id": "...",
    "name": "Ahmed",
    "username": "ahmed-coach",
    ...
  }
}
```

**Security:** المنتج يجب أن ينتمي لهذا Creator (userId filter)

---

## 🎨 Creator Storefront Features

### **صفحة Creator (`@username`)**

#### ✅ **Header Section:**
- Cover Image (أو gradient بـ brandColor)
- Avatar
- Name & Bio
- Social Links (Website, Facebook, Instagram, Twitter)

#### ✅ **Products Grid:**
- عرض منتجات هذا Creator فقط
- فلترة: isActive = true
- ترتيب: displayOrder → createdAt
- كل منتج رابطه: `/@username/product-slug`

#### ✅ **Branding:**
- Brand Color مخصص
- تصميم minimal للـ platform navigation
- Footer بسيط: "Powered by تمكين"

---

## 📦 Product Page Features

### **صفحة المنتج (`@username/product-slug`)**

#### ✅ **Header:**
- زر رجوع للـ Creator Store
- معلومات Creator (Avatar + Name)

#### ✅ **Product Details:**
- صورة/فيديو
- العنوان والوصف
- Features list
- التقييمات
- Course stats (Duration, Sessions)

#### ✅ **Purchase Card:**
- السعر
- زر "اشتر الآن"
- Guarantees (وصول فوري، ضمان استرجاع)
- معلومات Creator

#### ✅ **No Distractions:**
- **لا توجد** منتجات مقترحة من creators آخرين
- **لا يوجد** global navigation
- Focus كامل على المنتج

---

## 🛡️ Data Isolation & Security

### **Critical Security Rules:**

```typescript
// ✅ CORRECT: Filter by creator
const products = await prisma.product.findMany({
    where: {
        userId: creator.id,  // MUST include
        isActive: true
    }
});

// ❌ WRONG: No creator filter
const products = await prisma.product.findMany({
    where: {
        isActive: true  // Will show ALL creators' products!
    }
});
```

**Every query MUST:**
1. ✅ Filter by `userId` (creator.id)
2. ✅ Verify product belongs to requested creator
3. ✅ Never leak other creators' data

---

## 🔧 Utility Functions

### **في `lib/multi-tenant-utils.ts`:**

```typescript
// Generate URL-friendly slug
generateSlug(text: string): string

// Generate unique slug for creator
generateUniqueSlug(baseSlug: string, userId: string, prisma): Promise<string>

// Build URLs
buildCreatorUrl(username: string): string
buildProductUrl(username: string, slug: string): string

// Validation
isValidUsername(username: string): boolean
extractUsername(path: string): string | null
isOwnStore(sessionUserId: string, creatorId: string): boolean
```

---

## 🚀 Usage Examples

### **1. إنشاء منتج جديد:**

```typescript
// POST /api/products
const product = await prisma.product.create({
    data: {
        title: "دورة تطوير المواقع",
        slug: "web-development-course", // Auto-generated if not provided
        description: "...",
        price: 499,
        userId: session.user.id
    }
});
```

**Automatic Slug Generation:**
- إذا لم يتم توفير slug، يتم توليده من title
- يتم التحقق من uniqueness مع userId
- إذا كان موجود، يتم إضافة رقم: `slug-1`, `slug-2`

---

### **2. مشاركة رابط المنتج:**

```typescript
import { buildProductUrl } from '@/lib/multi-tenant-utils';

const shareUrl = buildProductUrl('ahmed-coach', 'web-development-course');
// Result: https://platform.com/@ahmed-coach/web-development-course

// Share على Social Media
shareToFacebook(shareUrl);
shareToTwitter(shareUrl);
```

---

### **3. التحقق من ملكية المتجر:**

```typescript
import { isOwnStore } from '@/lib/multi-tenant-utils';

const canEdit = isOwnStore(session.user.id, creator.id);

if (canEdit) {
    // Show edit buttons
}
```

---

## 📊 Migration Guide

### **خطوات الترحيل:**

1. **تحديث Database:**
```bash
npx prisma db push
```

2. **إضافة slugs للمنتجات الموجودة:**
```javascript
// Run migration script
const products = await prisma.product.findMany();

for (const product of products) {
    if (!product.slug) {
        const slug = generateSlug(product.title);
        const uniqueSlug = await generateUniqueSlug(slug, product.userId, prisma);
        
        await prisma.product.update({
            where: { id: product.id },
            data: { slug: uniqueSlug }
        });
    }
}
```

3. **تحديث الروابط:**
- تحديث Dashboard links من `/product/[id]` إلى `/@username/[slug]`
- تحديث Share buttons
- تحديث Email notifications

---

## 🎯 Benefits of This Architecture

### **للـ Creators:**
- ✅ متجر خاص بهوية مستقلة
- ✅ روابط قصيرة وسهلة المشاركة
- ✅ Brand customization (Colors, Bio, Social)
- ✅ Professional appearance

### **للـ Customers:**
- ✅ تجربة "standalone" focused
- ✅ ثقة أكبر (الشراء من creator مباشرة)
- ✅ لا تشتيت من منتجات أخرى
- ✅ روابط مباشرة shareable

### **للـ Platform:**
- ✅ Scalability - كل creator معزول
- ✅ Better SEO - صفحة لكل creator
- ✅ Analytics per creator
- ✅ Easy to manage (Data isolation)

---

## 🔗 URL Examples in Real World

### **Creator: Ahmed (Coach)**
- Profile: `https://tmleen.com/@ahmed-coach`
- Course 1: `https://tmleen.com/@ahmed-coach/web-dev-bootcamp`
- Course 2: `https://tmleen.com/@ahmed-coach/react-mastery`

### **Creator: Sara (Designer)**
- Profile: `https://tmleen.com/@sara-designs`
- Product 1: `https://tmleen.com/@sara-designs/logo-templates`
- Product 2: `https://tmleen.com/@sara-designs/brand-kit`

**لاحظ:** كل creator له namespace خاص، لا تعارض بين الـ slugs!

---

## ⚙️ Configuration

### **Environment Variables:**

```env
NEXT_PUBLIC_APP_URL=https://tmleen.com
```

**يستخدم في:**
- توليد Share URLs
- Open Graph meta tags
- Email notifications

---

## 📈 Next Steps

### **تحسينات مستقبلية:**

1. **Custom Domains:**
   - السماح للـ Creator بربط domain خاص
   - مثال: `https://ahmed.coach` → `https://tmleen.com/@ahmed-coach`

2. **Advanced Analytics:**
   - Page views per product
   - Conversion rates
   - Traffic sources

3. **Marketing Tools:**
   - Email marketing للعملاء
   - Discount codes خاصة بالـ Creator
   - Affiliate program

4. **Customization:**
   - Custom CSS/Themes
   - Layout options
   - Custom navigation

---

## 🎉 Success!

المنصة الآن **Multi-Tenant Creator Marketplace** كاملة مع:

- ✅ Creator Profiles (`@username`)
- ✅ Direct Product Links (`@username/slug`)
- ✅ Complete Data Isolation
- ✅ Brand Customization
- ✅ Standalone Feel
- ✅ SEO Optimized URLs

**Ready for Production! 🚀**
