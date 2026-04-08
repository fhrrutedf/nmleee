# 🗄️ استخدام MongoDB محلي (بديل)

## إذا لا يمكنك الاتصال بـ MongoDB Atlas:

### 1. ثبّت MongoDB Community (مجاناً):

**رابط التحميل:**
https://www.mongodb.com/try/download/community

**اختر:**
- Version: 7.0 (أو أحدث)
- Platform: Windows
- Package: MSI

### 2. ثبّت MongoDB:
- شغّل ملف التثبيت
- اضغط Next → Next → Install
- اترك الإعدادات الافتراضية

### 3. حدّث .env:

```env
# بدلاً من Atlas، استخدم محلي:
DATABASE_URL="mongodb://localhost:27017/MANASA DIGITAL"
```

### 4. أعد تشغيل:

```bash
# احذف .next
Remove-Item -Recurse -Force .next

# أعد generate
npx prisma generate

# شغّل
npm run dev
```

### 5. أضف بيانات:

```bash
npm run db:seed
```

---

## ✅ المميزات:

- ✅ لا يحتاج إنترنت
- ✅ أسرع بكثير
- ✅ لا توجد مشاكل اتصال
- ✅ مجاني تماماً

## ⚠️ العيوب:

- ❌ محلي فقط (لا يمكن مشاركته)
- ❌ تحتاج تثبيت MongoDB

---

## 💡 التوصية النهائية:

### للتطوير المحلي:
→ **استخدم MongoDB المحلي** (أسهل وأسرع)

### للإنتاج/النشر:
→ **استخدم MongoDB Atlas** (عبر Mobile Hotspot)

---

**قرر: هل تريد تثبيت MongoDB محلي أم تستخدم Mobile Hotspot؟**
