# 🗄️ إعداد قاعدة البيانات - MongoDB Atlas

## المشكلة الحالية:
```
Error: No connection could be made because the target machine actively refused it.
```

**السبب:** التطبيق يحاول الاتصال بـ MongoDB محلي لكنه غير مُشغّل.

**الحل:** استخدام MongoDB Atlas (سحابي ومجاني!)

---

## ⚡ الحل السريع (5 دقائق)

### الخطوة 1: إنشاء حساب MongoDB Atlas

1. افتح: https://www.mongodb.com/cloud/atlas/register
2. سجّل حساب جديد (مجاني 100%)
3. اختر **M0 Free Tier** (512 MB مجاني للأبد)

---

### الخطوة 2: إنشاء Cluster

1. بعد التسجيل، اضغط **"Build a Database"**
2. اختر **"M0 FREE"**
3. اختر المنطقة الأقرب لك (مثلاً: AWS - Frankfurt)
4. اسم الـ Cluster: `MANASA DIGITAL-cluster` (أو أي اسم)
5. اضغط **"Create"**

⏳ انتظر 2-3 دقائق حتى ينشأ الـ Cluster

---

### الخطوة 3: إنشاء Database User

1. في صفحة Security → **Database Access**
2. اضغط **"Add New Database User"**
3. اختر **"Password"**
4. أدخل:
   - **Username:** `MANASA DIGITALuser` (أو أي اسم)
   - **Password:** كلمة مرور قوية (احفظها!)
5. **Database User Privileges:** اختر **"Read and write to any database"**
6. اضغط **"Add User"**

---

### الخطوة 4: السماح بالوصول من أي IP

1. في صفحة Security → **Network Access**
2. اضغط **"Add IP Address"**
3. اضغط **"Allow Access from Anywhere"** (0.0.0.0/0)
4. اضغط **"Confirm"**

⚠️ **ملاحظة:** في بيئة Production، حدد IPs محددة فقط!

---

### الخطوة 5: الحصول على Connection String

1. ارجع لصفحة **Database** الرئيسية
2. اضغط **"Connect"** بجانب الـ Cluster
3. اختر **"Drivers"**
4. اختر **Driver:** Node.js، **Version:** 5.5 or later
5. انسخ الـ **Connection String**، سيكون شبيه بهذا:

```
mongodb+srv://MANASA DIGITALuser:<password>@MANASA DIGITAL-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

---

### الخطوة 6: تحديث ملف .env

1. افتح ملف `d:\MANASA DIGITAL\.env`
2. استبدل السطر الثاني:

**قبل:**
```env
DATABASE_URL="mongodb://localhost:27017/digital-platform"
```

**بعد:**
```env
DATABASE_URL="mongodb+srv://MANASA DIGITALuser:<password>@MANASA DIGITAL-cluster.xxxxx.mongodb.net/MANASA DIGITAL?retryWrites=true&w=majority"
```

⚠️ **مهم جداً:**
- استبدل `<password>` بكلمة المرور الحقيقية (بدون `<>`)
- استبدل `MANASA DIGITAL-cluster.xxxxx` بالعنوان الحقيقي من Connection String
- أضف `/MANASA DIGITAL` قبل علامة `?` (اسم قاعدة البيانات)

**مثال كامل:**
```env
DATABASE_URL="mongodb+srv://MANASA DIGITALuser:MyPass123@cluster0.abcde.mongodb.net/MANASA DIGITAL?retryWrites=true&w=majority"
```

---

### الخطوة 7: تطبيق التغييرات على قاعدة البيانات

في PowerShell:
```bash
# أوقف الخادم أولاً (Ctrl+C)

# ثم:
npx prisma generate
npx prisma db push
```

---

### الخطوة 8: تشغيل المشروع مرة أخرى

```bash
npm run dev
```

✅ **يجب أن يعمل الآن!**

---

## 🎯 اختبار الاتصال

افتح: http://localhost:3000/register

جرّب إنشاء حساب:
- الاسم: Test User
- البريد: test@example.com
- اسم المستخدم: testuser
- كلمة المرور: test123

إذا نجح التسجيل → قاعدة البيانات تعمل! ✅

---

## 🐛 استكشاف الأخطاء

### خطأ: "Authentication failed"
- تأكد من استبدال `<password>` بكلمة المرور الحقيقية
- تأكد من عدم وجود مسافات زائدة

### خطأ: "Could not connect to any servers"
- تأكد من السماح بالوصول من 0.0.0.0/0 في Network Access
- جرّب الانتظار دقيقة وحاول مرة أخرى

### خطأ: "Server selection timeout"
- تحقق من اتصال الإنترنت
- تأكد من صحة Connection String

---

## 📊 التحقق من البيانات

بعد التسجيل بنجاح، يمكنك رؤية البيانات:

1. في MongoDB Atlas → **Database** → **Browse Collections**
2. ستجد قاعدة بيانات `MANASA DIGITAL`
3. فيها مجموعات (Collections) مثل:
   - `User`
   - `Product`
   - `Order`
   - إلخ...

---

## 🔒 الأمان

### في Development:
- ✅ يمكن استخدام 0.0.0.0/0 (أي IP)

### في Production:
- ❌ لا تسمح بـ 0.0.0.0/0
- ✅ حدد IPs محددة فقط
- ✅ استخدم Environment Variables
- ✅ لا ترفع `.env` على GitHub

---

## 💡 نصائح

1. **احفظ كلمة المرور** في مكان آمن
2. **لا تشارك Connection String** مع أحد
3. **MongoDB Atlas مجاني** حتى 512 MB
4. **Backup تلقائي** في الباقة المجانية

---

## ✅ الخطوات التالية

بعد نجاح الاتصال:

1. ✅ إنشاء حساب جديد
2. ✅ تسجيل الدخول
3. ✅ إضافة منتجات
4. ✅ اختبار الميزات الجديدة:
   - Analytics
   - Coupons
   - Affiliate
   - Reviews

---

**الآن لديك قاعدة بيانات سحابية مجانية وموثوقة! 🎉**
