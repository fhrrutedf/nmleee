# 🔥 حلول مشكلة MongoDB Timeout

## ✅ الحلول (بالترتيب):

### 1️⃣ تحقق من Network Access في MongoDB Atlas

**الخطوات:**
1. افتح: https://cloud.mongodb.com
2. سجّل دخول
3. اذهب لـ **Security** → **Network Access**
4. تأكد من وجود: `0.0.0.0/0` (Allow from anywhere)
5. إذا لم يكن موجود:
   - اضغط **"Add IP Address"**
   - اختر **"Allow Access from Anywhere"**
   - **انتظر 1-2 دقيقة**
6. جرب التطبيق مرة أخرى

---

### 2️⃣ إيقاف Windows Firewall مؤقتاً (للاختبار)

في PowerShell (كـ Administrator):

```powershell
# إيقاف مؤقت (للاختبار فقط!)
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled False

# ثم جرب التطبيق
npm run dev

# بعد الاختبار، أعد تشغيل Firewall
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled True
```

⚠️ **ملاحظة:** هذا للاختبار فقط! أعد تشغيل Firewall بعد الاختبار.

---

### 3️⃣ استخدام VPN

إذا كنت على شبكة محظورة (مدرسة/جامعة/شركة):
- جرب استخدام VPN
- أو استخدم Mobile Hotspot من الموبايل

---

### 4️⃣ تحديث Connection String بـ SRV Lookup

جرب هذا البديل:

```env
DATABASE_URL="mongodb+srv://aeaaboaleon_db_user:Perb4FwkDl4LvBjM@cluster0.f76n83k.mongodb.net/tmleen?retryWrites=true&w=majority&ssl=true&authSource=admin&connectTimeoutMS=60000&serverSelectionTimeoutMS=60000"
```

---

### 5️⃣ استخدام Connection String بدون SRV

إذا استمرت المشكلة، جرب الاتصال المباشر (بدون srv):

**الخطوات:**
1. في MongoDB Atlas → Database → Connect
2. اختر **"Connect your application"**
3. **Driver:** Node.js
4. اختر **"Include full driver code example"**
5. ستجد Connection String يبدأ بـ `mongodb://` (بدون srv)
6. انسخه وضعه في `.env`

---

### 6️⃣ إعادة إنشاء Database User

أحياناً المشكلة تكون في صلاحيات User:

1. في MongoDB Atlas → Security → Database Access
2. احذف المستخدم الحالي: `aeaaboaleon_db_user`
3. أنشئ مستخدم جديد:
   - Username: `tmleen_admin`
   - Password: (اختر كلمة مرور بسيطة بدون أحرف خاصة، مثل: `Admin123456`)
   - Privileges: **Atlas Admin**
4. حدّث `.env`:
   ```env
   DATABASE_URL="mongodb+srv://tmleen_admin:Admin123456@cluster0.f76n83k.mongodb.net/tmleen?retryWrites=true&w=majority"
   ```
5. نفّذ:
   ```bash
   npx prisma generate
   npm run dev
   ```

---

### 7️⃣ DNS Flush (لنظام Windows)

في PowerShell (كـ Administrator):

```powershell
ipconfig /flushdns
```

ثم جرب مرة أخرى.

---

### 8️⃣ استخدام Google DNS

أحياناً DNS provider يحجب MongoDB Atlas:

**Windows:**
1. Control Panel → Network and Sharing Center
2. Change adapter settings
3. Right-click على الاتصال النشط → Properties
4. Internet Protocol Version 4 (TCP/IPv4) → Properties
5. Use the following DNS server addresses:
   - Preferred: `8.8.8.8`
   - Alternate: `8.8.4.4`
6. OK → Restart network

---

## 🧪 اختبار سريع

بعد كل حل، جرب:

```bash
npm run dev
```

ثم افتح: http://localhost:3000/register

إذا استطعت التسجيل بنجاح → المشكلة حُلّت! ✅

---

## 📞 إذا لم ينجح أي حل:

استخدم **MongoDB Local** (محلي على جهازك):

1. حمّل MongoDB Community: https://www.mongodb.com/try/download/community
2. ثبّته
3. في `.env`:
   ```env
   DATABASE_URL="mongodb://localhost:27017/tmleen"
   ```
4. نفّذ:
   ```bash
   npx prisma generate
   npx prisma db push
   npm run dev
   ```

---

**ابدأ بالحل 1 وجرّب واحد تلو الآخر! 🚀**
