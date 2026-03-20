# ⚠️ خطأ قاعدة البيانات - الحل السريع

## 🔴 الخطأ الحالي:
```
No connection could be made because the target machine actively refused it.
Code: localhost:27017
```

**السبب:** لا يوجد MongoDB مُشغّل على جهازك.

---

## ✅ الحل (اختر أحد الخيارين):

### الخيار 1: MongoDB Atlas (موصى به - مجاني 100%)

#### الخطوات السريعة:

1. **سجّل على MongoDB Atlas:**
   - https://www.mongodb.com/cloud/atlas/register
   - اختر M0 Free (512 MB مجاني)

2. **أنشئ Cluster:**
   - Build a Database → M0 FREE → Create

3. **أنشئ User:**
   - Security → Database Access → Add User
   - Username: `tmleenuser`
   - Password: (اختر كلمة مرور قوية)
   - Privileges: Read and write to any database

4. **اسمح بالوصول:**
   - Security → Network Access → Add IP
   - Allow Access from Anywhere (0.0.0.0/0)

5. **احصل على Connection String:**
   - Database → Connect → Drivers
   - انسخ الرابط، سيكون مثل:
   ```
   mongodb+srv://tmleenuser:<password>@cluster0.xxxxx.mongodb.net/
   ```

6. **حدّث ملف `.env`:**
   ```env
   DATABASE_URL="mongodb+srv://tmleenuser:YourPassword@cluster0.xxxxx.mongodb.net/tmleen?retryWrites=true&w=majority"
   ```
   
   ⚠️ استبدل:
   - `<password>` بكلمة المرور الحقيقية
   - `cluster0.xxxxx` بالعنوان من الرابط الخاص بك
   - أضف `/tmleen` قبل `?`

7. **طبّق التغييرات:**
   ```bash
   # أوقف الخادم (Ctrl+C)
   npx prisma generate
   npx prisma db push
   npm run dev
   ```

✅ **جاهز!**

---

### الخيار 2: MongoDB محلي (للمتقدمين)

1. **تحميل MongoDB:**
   - https://www.mongodb.com/try/download/community
   - اختر Windows → Download

2. **تثبيته:**
   - تشغيل الملف المحمّل
   - اتبع خطوات التثبيت
   - ✅ فعّل "Install MongoDB as a Service"

3. **تشغيل MongoDB:**
   ```bash
   net start MongoDB
   ```

4. **الملف `.env` يبقى كما هو:**
   ```env
   DATABASE_URL="mongodb://localhost:27017/digital-platform"
   ```

5. **طبّق التغييرات:**
   ```bash
   npx prisma generate
   npx prisma db push
   npm run dev
   ```

---

## 📚 للمزيد من التفاصيل:

راجع: `docs/MONGODB_SETUP.md`

---

## 🎯 بعد الحل:

1. افتح: http://localhost:3000/register
2. أنشئ حساب جديد
3. سجّل دخول
4. ابدأ باستخدام المنصة!

---

**الخيار 1 (Atlas) أسرع وأسهل! ⚡**
