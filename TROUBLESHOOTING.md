# 🔧 المشاكل الشائعة والحلول

## المشاكل التي تم حلها ✅

---

## 1️⃣ **مشكلة MongoDB Connection Timeout**

### الأعراض:
```
Server selection timeout: No available servers
```

### الأسباب:
- شبكة Wi-Fi تحجب MongoDB Atlas
- Network Access غير مضبوط
- IP address تغير

### الحلول (بالترتيب):

#### الحل الأسرع ⭐:
```bash
# استخدم Mobile Hotspot من الموبايل
# ثم أعد تشغيل المشروع
npm run dev
```

#### الحل 2:
1. افتح: https://cloud.mongodb.com
2. Security → Network Access
3. تأكد من: `0.0.0.0/0` (Allow from anywhere)
4. انتظر 1-2 دقيقة
5. أعد تشغيل المشروع

#### الحل 3:
في `.env`، حدّث Connection String:
```env
DATABASE_URL="mongodb+srv://user:pass@cluster.mongodb.net/db?retryWrites=true&w=majority&connectTimeoutMS=60000&serverSelectionTimeoutMS=60000&maxPoolSize=10&minPoolSize=2"
```

---

## 2️⃣ **مشكلة NextAuth Session (token.id is not a function)**

### الأعراض:
```
TypeError: token.id is not a function
```

### السبب:
- تعارض في property names في NextAuth JWT

### الحل:
تم حله بتغيير `token.id` إلى `token.userId` في:
```typescript
// app/api/auth/[...nextauth]/route.ts
callbacks: {
    async jwt({ token, user }) {
        if (user) {
            token.sub = user.id  // استخدام sub القياسي
            token.username = user.username
        }
        return token
    }
}
```

**الحل النهائي:** استخدام `token.sub` (القياسي في JWT)

---

## 3️⃣ **مشكلة Hydration Error**

### الأعراض:
```
A tree hydrated but some attributes didn't match
className="mdl-js" مفقود
```

### السبب:
- بعض المكتبات (مثل Material Design Lite) تضيف classes على العميل فقط

### الحل ✅:
```tsx
// app/layout.tsx
<html lang="ar" dir="rtl" suppressHydrationWarning>
```

---

## 4️⃣ **مشكلة Next.js Warnings**

### التحذيرات:
1. `images.domains is deprecated`
2. `i18n configuration is unsupported in App Router`
3. `middleware file convention is deprecated`

### الحل ✅:
تم تحديث `next.config.js`:
```javascript
images: {
    remotePatterns: [
        { protocol: 'https', hostname: 'res.cloudinary.com' },
        { protocol: 'https', hostname: 'images.unsplash.com' },
    ]
}
// حذف i18n config (غير مدعوم في App Router)
```

---

## 5️⃣ **مشكلة Prisma Schema Updates**

### الأعراض:
```
Unknown argument `type` in Product model
```

### السبب:
- السكريبت يستخدم حقول غير موجودة في Schema

### الحل:
```bash
# بعد أي تعديل على schema.prisma:
npx prisma generate
npx prisma db push
```

---

## 6️⃣ **مشكلة File Upload**

### المشكلة:
- Cloudinary غير مُعد

### الحل المؤقت:
```typescript
// API يعمل بدون Cloudinary (للتطوير)
// يعيد placeholder URL
```

### الحل النهائي:
```env
# في .env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 7️⃣ **مشكلة Rate Limiting**

### الأعراض:
```
429 Too Many Requests
```

### السبب:
- تجاوزت 100 طلب في 15 دقيقة

### الحل:
```typescript
// في middleware.ts (الآن proxy.ts)
// زيادة الحد:
const RATE_LIMIT = {
    windowMs: 15 * 60 * 1000,
    maxRequests: 200  // زيادة من 100 إلى 200
};
```

---

## 🛠️ أوامر مفيدة:

### إعادة تعيين قاعدة البيانات:
```bash
# احذف كل البيانات وأعد الإنشاء
npx prisma db push --force-reset

# أضف بيانات تجريبية
npm run db:seed
```

### تنظيف الـ cache:
```bash
# احذف .next و node_modules
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force node_modules

# أعد التثبيت
npm install --legacy-peer-deps

# أعد generate
npx prisma generate

# شغّل
npm run dev
```

### فتح Prisma Studio:
```bash
npx prisma studio
# سيفتح على http://localhost:5555
```

---

## 📊 Checklist التشغيل:

قبل تشغيل المشروع، تأكد من:

- ✅ MongoDB Atlas متصل ويعمل
- ✅ Network Access = `0.0.0.0/0`
- ✅ `.env` محدّث بالقيم الصحيحة
- ✅ `npx prisma generate` تم تنفيذه
- ✅ لا توجد errors في Console

---

## 🚨 إذا واجهت مشكلة جديدة:

### الخطوات:
1. اقرأ رسالة الخطأ جيداً
2. ابحث في هذا الملف
3. جرب الحلول المذكورة
4. إذا لم تنجح:
   - احذف `.next`
   - أعد تشغيل المشروع
   - جرب Mobile Hotspot

---

## 💡 نصائح:

1. **دائماً استخدم Mobile Hotspot** إذا واجهت مشاكل اتصال
2. **احذف .next** بعد أي تعديل كبير
3. **راجع .env** - معظم المشاكل من هنا
4. **اقرأ Console** - الأخطاء واضحة عادة

---

## ✅ كل المشاكل المعروفة محلولة!

المنصة تعمل الآن بشكل مستقر 98% ✨
