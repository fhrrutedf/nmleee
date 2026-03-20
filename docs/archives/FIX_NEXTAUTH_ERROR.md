# 🔧 حل مشكلة NextAuth - token.id is not a function

## ✅ الحل السريع:

### 1. إيقاف الخادم
اضغط `Ctrl+C` في PowerShell

### 2. حذف cache
```powershell
# في PowerShell:
Remove-Item -Recurse -Force .next
```

### 3. إعادة التشغيل
```powershell
npm run dev
```

### 4. اختبار تسجيل الدخول
1. افتح: http://localhost:3000/login
2. سجّل دخول بالبيانات التي سجلت بها
3. يجب أن يعمل الآن! ✅

---

## 🎯 إذا استمرت المشكلة:

### الحل البديل: إعادة تثبيت المكتبات

```powershell
# أوقف الخادم (Ctrl+C)

# احذف node_modules
Remove-Item -Recurse -Force node_modules

# احذف package-lock.json
Remove-Item package-lock.json

# أعد التثبيت
npm install --legacy-peer-deps

# احذف .next
Remove-Item -Recurse -Force .next

# شغّل
npm run dev
```

---

## ✅ الحل الأكيد:

إذا لم ينجح الحل السريع، نفّذ هذه الأوامر بالترتيب:

```powershell
# 1. أوقف الخادم
Ctrl+C

# 2. نظّف كل شيء
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json

# 3. أعد التثبيت
npm install --legacy-peer-deps

# 4. أعد generate
npx prisma generate

# 5. شغّل
npm run dev
```

---

**جرّب الحل السريع أولاً! 🚀**
