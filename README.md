# 🎓 Tmleen - منصة المبدعين العربية

منصة متكاملة للبيع الرقمي مع دعم Escrow والدفع اليدوي للدول العربية

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Prisma](https://img.shields.io/badge/Prisma-5.0-2D3748)
![MongoDB](https://img.shields.io/badge/MongoDB-6.0-green)

## ✨ المميزات

### 🛒 للبائعين
- ✅ بيع منتجات رقمية ودورات
- ✅ إنشاء Coupons وافلييت
- ✅ نظام Escrow (عمولة 10%)
- ✅ سحب الأرباح (Bank/PayPal/Crypto)
- ✅ إدارة المنتجات والدورات
- ✅ تتبع الأرباح والمبيعات

### 💳 أنظمة الدفع
- **Stripe** - للدول المدعومة
- **الدفع اليدوي** - سوريا، العراق، مصر، السعودية
  - شام كاش 🇸🇾
  - OMT 🇸🇾
  - Zain Cash 🇮🇶
  - Vodafone Cash 🇪🇬
  - تحويل تلقائي للعملات

### 🎛️ للأدمن
- لوحة تحكم شاملة
- إدارة السحوبات
- مراجعة الدفعات اليدوية
- إحصائيات مفصلة

### 🎓 للمشترين
- تصفح المنتجات والدورات
- مشاهدة الدروس مباشرة
- تتبع التقدم
- نظام سلة التسوق

## 🚀 التقنيات المستخدمة

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB + Prisma ORM
- **Authentication**: NextAuth.js
- **Payment**: Stripe, Manual Payment System
- **File Upload**: (قابل للتخصيص)
- **Deployment**: Vercel-ready

## 📋 المتطلبات

- Node.js 18+
- MongoDB
- Stripe Account (اختياري)

## ⚙️ التثبيت

### 1. Clone المشروع

```bash
git clone https://github.com/YOUR_USERNAME/tmleen.git
cd tmleen
```

### 2. تثبيت Dependencies

```bash
npm install
```

### 3. إعداد Environment Variables

أنشئ ملف `.env` في المجلد الرئيسي:

```env
# Database
DATABASE_URL="mongodb://localhost:27017/tmleen"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Stripe (اختياري)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. إعداد Database

```bash
# Push schema to database
npx prisma db push

# (اختياري) فتح Prisma Studio
npx prisma studio
```

### 5. تشغيل المشروع

```bash
npm run dev
```

افتح [http://localhost:3000](http://localhost:3000)

## 📁 هيكل المشروع

```
tmleen/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── dashboard/         # Seller Dashboard
│   ├── admin/             # Admin Panel
│   └── checkout/          # Checkout Pages
├── components/            # React Components
├── config/               # Configuration Files
│   ├── escrow.ts         # Escrow Settings
│   └── paymentMethods.ts # Payment Methods Config
├── prisma/               # Database Schema
│   └── schema.prisma
├── lib/                  # Utilities
└── public/              # Static Assets
```

## 💰 نظام Escrow

- **عمولة المنصة**: 10%
- **فترة الانتظار**: 7 أيام
- **الحد الأدنى للسحب**: $50

### التدفق:
```
مشتري يدفع $100
  ↓
Stripe/Manual Payment
  ↓
المنصة: $10 (عمولة)
البائع: $90 (pending)
  ↓
بعد 7 أيام → available
  ↓
البائع يطلب سحب
  ↓
Admin يوافق
```

## 🌍 الدفع اليدوي

### الدول المدعومة:

**سوريا 🇸🇾**
- شام كاش
- OMT
- هوالا
- MTN Cash

**العراق 🇮🇶**
- Zain Cash
- Qi Card
- Asia Hawala

**مصر 🇪🇬**
- Vodafone Cash
- Fawry
- InstaPay

**السعودية 🇸🇦**
- STC Pay
- تحويل بنكي

### الخطوات:
1. المشتري يختار دولته
2. يختار طريقة الدفع
3. يشاهد التعليمات ورقم البائع
4. يحول المال
5. يرفع رابط صورة الإيصال
6. Admin يراجع ويوافق

## 🎯 الصفحات الرئيسية

### للبائع
- `/dashboard` - الرئيسية
- `/dashboard/products` - المنتجات
- `/dashboard/courses` - الدورات
- `/dashboard/earnings` - الأرباح
- `/dashboard/payout-settings` - إعدادات السحب
- `/dashboard/manual-payment-settings` - طرق الدفع اليدوي

### للأدمن
- `/admin/dashboard` - لوحة التحكم
- `/admin/payouts` - السحوبات
- `/admin/manual-orders` - الدفعات اليدوية

### للمشتري
- `/` - الرئيسية
- `/checkout/manual` - الدفع اليدوي
- `/learn/[slug]` - مشاهدة الدروس

## 🔐 الأدوار (Roles)

- **SELLER**: بائع (الافتراضي)
- **ADMIN**: مدير المنصة
- **BUYER**: مشتري

## 📊 Database Schema

### نماذج أساسية:
- `User` - المستخدمين
- `Product` - المنتجات
- `Course` - الدورات
- `Order` - الطلبات
- `Payout` - السحوبات
- `Coupon` - الكوبونات
- `AffiliateLink` - روابط الأفلييت

## 🚀 النشر (Deployment)

### Vercel (موصى به)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel

# 4. أضف Environment Variables في لوحة Vercel
```

### متطلبات الاستضافة:
- MongoDB Atlas (مجاني)
- Vercel/Netlify (مجاني)
- Stripe Webhook URL

## 🔧 التخصيص

### تغيير عمولة المنصة

في `config/escrow.ts`:
```typescript
platformFeePercentage: 10, // غير إلى النسبة المطلوبة
```

### إضافة طريقة دفع جديدة

في `config/paymentMethods.ts`:
```typescript
{
  id: 'newmethod',
  name: 'New Method',
  nameAr: 'طريقة جديدة',
  icon: '💳',
  fields: ['phone', 'transactionId'],
  currency: 'USD',
  enabled: true,
}
```

## 🐛 استكشاف الأخطاء

### Database Connection Error
```bash
# تأكد من تشغيل MongoDB
# تأكد من DATABASE_URL في .env
npx prisma db push
```

### Stripe Webhook Failed
```bash
# للتطوير المحلي
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## 📝 License

MIT License - استخدم المشروع كما تشاء!

## 🤝 المساهمة

المساهمات مرحب بها! افتح Issue أو Pull Request.

## 📧 التواصل

لأي استفسارات: [بريدك الإلكتروني]

---

صنع بـ ❤️ للمبدعين العرب
