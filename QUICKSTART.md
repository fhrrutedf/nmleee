# Quick Start Guide 🚀

## التثبيت والتشغيل السريع

### الخطوة 1: تثبيت المكتبات
```bash
npm install --legacy-peer-deps
```

### الخطوة 2: إعداد ملف .env
```env
# Database
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/tmleen"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-here"

# Stripe
STRIPE_SECRET_KEY="sk_test_your_key_here"
STRIPE_PUBLISHABLE_KEY="pk_test_your_key_here"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

# Novu
NOVU_API_KEY="your_novu_api_key"
NOVU_APP_ID="your_novu_app_id"
```

### الخطوة 3: إعداد قاعدة البيانات
```bash
npm run db:push
```

### الخطوة 4: تشغيل المشروع
```bash
npm run dev
```

### الخطوة 5: افتح المتصفح
```
http://localhost:3000
```

---

## 🎯 الإعداد الكامل

### 1. MongoDB Atlas
1. سجل على https://mongodb.com/cloud/atlas
2. أنشئ Cluster مجاني
3. احصل على Connection String
4. ضعها في `DATABASE_URL`

### 2. Stripe
1. سجل على https://stripe.com
2. انتقل لـ Developers → API Keys
3. انسخ Secret Key و Publishable Key
4. لـ Webhook Secret:
   - انتقل لـ Developers → Webhooks
   - أضف endpoint: `http://localhost:3000/api/stripe/webhook`
   - Events: `checkout.session.completed`
   - انسخ Signing Secret

### 3. Novu
1. سجل على https://novu.co
2. انتقل لـ Settings → API Keys
3. انسخ API Key و Application ID
4. أنشئ Workflows (راجع `docs/NOVU_SETUP.md`)

---

## 📱 صفحات المنصة

### للبائعين:
- `/dashboard` - الرئيسية
- `/dashboard/products` - المنتجات
- `/dashboard/products/new` - إضافة منتج
- `/dashboard/products/edit/[id]` - تعديل منتج
- `/dashboard/courses` - الدورات
- `/dashboard/orders` - الطلبات
- `/dashboard/payouts` - الأرباح
- `/dashboard/analytics` - التحليلات ⭐
- `/dashboard/coupons` - الكوبونات ⭐
- `/dashboard/affiliate` - الأفلييت ⭐
- `/dashboard/settings` - الإعدادات

### للعملاء:
- `/product/[id]` - صفحة المنتج
- `/success` - نجاح الدفع
- `/cancel` - إلغاء الدفع

---

## 🧪 اختبار الميزات

### 1. إنشاء حساب
```
POST /api/auth/register
{
  "name": "اسم المستخدم",
  "email": "user@example.com",
  "username": "username",
  "password": "password123"
}
```

### 2. إضافة منتج
- افتح `/dashboard/products/new`
- املأ النموذج
- احفظ

### 3. إنشاء كوبون
- افتح `/dashboard/coupons`
- اضغط "إضافة كوبون جديد"
- أدخل البيانات
- احفظ

### 4. مشاهدة Analytics
- افتح `/dashboard/analytics`
- استكشف الرسوم البيانية

### 5. رابط الأفلييت
- افتح `/dashboard/affiliate`
- انسخ رابطك الخاص

---

## 🐛 استكشاف الأخطاء

### خطأ: لا يمكن الاتصال بقاعدة البيانات
- ✅ تأكد من صحة `DATABASE_URL`
- ✅ تحقق من الاتصال بالإنترنت
- ✅ تأكد من IP Whitelist في MongoDB

### خطأ: Stripe Webhook لا يعمل
- ✅ استخدم Stripe CLI للاختبار المحلي
- ✅ تأكد من `STRIPE_WEBHOOK_SECRET`

### خطأ: Novu لا يرسل إشعارات
- ✅ تحقق من API Keys
- ✅ تأكد من إنشاء Workflows
- ✅ راجع `docs/NOVU_SETUP.md`

---

## 📚 روابط مفيدة

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Stripe Docs](https://stripe.com/docs)
- [Novu Docs](https://docs.novu.co)
- [Chart.js Docs](https://www.chartjs.org/docs)

---

## 💪 جاهز للإطلاق!

المنصة الآن **جاهزة 95%** للاستخدام!

**ما تم إنجازه:**
- ✅ نظام المصادقة الكامل
- ✅ إدارة المنتجات المتقدمة
- ✅ نظام الدفع (Stripe)
- ✅ نظام الأرباح والسحوبات
- ✅ نظام الإشعارات (Novu)
- ✅ Analytics متقدم ⭐
- ✅ نظام الكوبونات ⭐
- ✅ برنامج الأفلييت ⭐
- ✅ التقييمات والمراجعات ⭐

**ابدأ الآن!** 🚀
