# إعداد Novu 🔔

## الخطوة 1: إنشاء حساب Novu

### الخيار الأول: Novu Cloud (الأسهل - موصى به للبداية)

1. اذهب إلى: https://web.novu.co/auth/signup
2. سجل حساب جديد (مجاني)
3. أنشئ تطبيق جديد (Application)
4. احصل على API Keys من: **Settings → API Keys**

### الخيار الثاني: Self-hosted (للتحكم الكامل)

```bash
# استخدام Docker
git clone https://github.com/novuhq/novu
cd novu
docker-compose up -d

# الوصول للوحة التحكم
# http://localhost:4200
```

---

## الخطوة 2: إضافة API Keys

في ملف `.env`:

```env
NOVU_API_KEY="your-api-key-here"
NOVU_APP_ID="your-app-id-here"
```

**كيف تحصل على API Key:**
1. افتح لوحة تحكم Novu
2. اذهب إلى **Settings** → **API Keys**
3. انسخ الـ **API Key**
4. انسخ الـ **Application Identifier**

---

## الخطوة 3: إنشاء Workflows

في لوحة تحكم Novu، أنشئ الـ Workflows التالية:

### 1️⃣ Welcome Email (`user-welcome`)

**Trigger Identifier:** `user-welcome`

**Template:**
```html
<div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #0ea5e9;">مرحباً بك {{name}}! 🎉</h1>
  
  <p>نحن سعداء بانضمامك إلى منصتنا لبيع المنتجات الرقمية.</p>
  
  <div style="background: #f0f9ff; padding: 20px; border-radius: 10px; margin: 20px 0;">
    <h3>منصتك الشخصية جاهزة!</h3>
    <p><strong>الرابط:</strong> <a href="{{platformUrl}}">{{platformUrl}}</a></p>
    <p><strong>اسم المستخدم:</strong> @{{username}}</p>
  </div>
  
  <p>ابدأ الآن:</p>
  <ul>
    <li>أضف منتجك الأول</li>
    <li>خصص منصتك الشخصية</li>
    <li>شارك رابطك مع متابعيك</li>
  </ul>
  
  <a href="{{dashboardUrl}}" style="display: inline-block; background: #0ea5e9; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
    اذهب إلى لوحة التحكم
  </a>
  
  <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
  
  <p style="color: #6b7280; font-size: 14px;">
    إذا كان لديك أي أسئلة، لا تتردد في التواصل معنا.
  </p>
</div>
```

**Subject:** `مرحباً بك في منصتنا يا {{name}}! 🎉`

---

### 2️⃣ Order Confirmation (`order-created`)

**Trigger Identifier:** `order-created`

**Template:**
```html
<div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #10b981;">✅ تم تأكيد طلبك!</h1>
  
  <p>مرحباً {{customerName}},</p>
  
  <p>شكراً لشرائك من منصتنا. تم استلام طلبك بنجاح.</p>
  
  <div style="background: #f0fdf4; padding: 20px; border-radius: 10px; margin: 20px 0;">
    <h3>تفاصيل الطلب:</h3>
    <p><strong>رقم الطلب:</strong> #{{orderNumber}}</p>
    <p><strong>المنتج:</strong> {{productTitle}}</p>
    <p><strong>المبلغ المدفوع:</strong> {{amount}} ج.م</p>
  </div>
  
  {{#if downloadLink}}
  <a href="{{downloadLink}}" style="display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
    تحميل المنتج الآن
  </a>
  {{/if}}
  
  <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
    إذا كنت بحاجة لأي مساعدة، تواصل معنا في أي وقت.
  </p>
</div>
```

**Subject:** `✅ تأكيد طلبك #{{orderNumber}}`

---

### 3️⃣ New Order - Seller (`new-order-seller`)

**Trigger Identifier:** `new-order-seller`

**Template:**
```html
<div dir="rtl" style="font-family: Arial, sans-serif;">
  <h2>🎉 لديك طلب جديد!</h2>
  
  <p><strong>رقم الطلب:</strong> #{{orderNumber}}</p>
  <p><strong>العميل:</strong> {{customerName}}</p>
  <p><strong>المنتج:</strong> {{productTitle}}</p>
  <p><strong>المبلغ:</strong> {{amount}} ج.م</p>
  
  <a href="{{dashboardUrl}}/orders/{{orderNumber}}">عرض تفاصيل الطلب</a>
</div>
```

**Subject:** `🎉 طلب جديد #{{orderNumber}}`

---

### 4️⃣ Payment Success (`payment-success`)

**Trigger Identifier:** `payment-success`

**Template:**
```html
<div dir="rtl">
  <h2>✅ تم استلام الدفع بنجاح</h2>
  <p>المبلغ: {{amount}} ج.م</p>
  {{#if downloadLink}}
  <a href="{{downloadLink}}">تحميل المنتج</a>
  {{/if}}
</div>
```

---

### 5️⃣ Appointment Reminder (`appointment-reminder`)

**Trigger Identifier:** `appointment-reminder`

**Template:**
```html
<div dir="rtl">
  <h2>📅 تذكير: لديك موعد قريب</h2>
  <p><strong>العنوان:</strong> {{title}}</p>
  <p><strong>التاريخ:</strong> {{date}}</p>
  <p><strong>الوقت:</strong> {{time}}</p>
  <a href="{{meetingLink}}">الانضمام للاجتماع</a>
</div>
```

---

## الخطوة 4: اختبار النظام

### الطريقة 1: عبر API

```bash
# تسجيل مستخدم جديد
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "محمد أحمد",
    "email": "test@example.com",
    "username": "mohamed",
    "password": "123456"
  }'

# يجب أن تصل رسالة ترحيب لـ test@example.com
```

### الطريقة 2: عبر Novu Dashboard

1. اذهب إلى **Activity Feed** في Novu
2. شاهد جميع الإشعارات المرسلة
3. تحقق من الحالة (Sent, Delivered, Read, etc.)

---

## الخطوة 5: مراقبة الإشعارات

### في لوحة تحكم Novu:

```
Activity Feed → شاهد جميع الإشعارات
├── ✅ Sent: تم الإرسال
├── 📧 Delivered: تم التوصيل
├── 👁️ Read: تم القراءة
└── ❌ Failed: فشل الإرسال
```

---

## استخدام في الكود

### إرسال رسالة ترحيب:

```typescript
import { sendWelcomeEmail } from '@/lib/novu';

await sendWelcomeEmail(
  user.id,
  user.email,
  user.name,
  user.username
);
```

### إرسال تأكيد طلب:

```typescript
import { sendOrderConfirmation } from '@/lib/novu';

await sendOrderConfirmation(
  customerEmail,
  {
    orderNumber: 'ORD-123',
    customerName: 'أحمد',
    productTitle: 'دورة برمجة',
    amount: 299,
    downloadLink: 'https://...'
  }
);
```

### إشعار البائع:

```typescript
import { notifySellerNewOrder } from '@/lib/novu';

await notifySellerNewOrder(
  sellerId,
  {
    orderNumber: 'ORD-123',
    customerName: 'أحمد',
    productTitle: 'دورة برمجة',
    amount: 299
  }
);
```

---

## التكلفة 💰

### Novu Cloud (Free Tier)
- ✅ 30,000 إشعار/شهر مجاناً
- ✅ جميع القنوات (Email, SMS, Push, In-App)
- ✅ Unlimited workflows
- ✅ دعم فني

### بعد 30k
- $0.0005 لكل إشعار
- مثال: 100k إشعار = $35/شهر

---

## نصائح 💡

1. **استخدم الـ Activity Feed** لمراقبة جميع الإشعارات
2. **فعّل الـ Webhooks** لتتبع حالة الرسائل
3. **اختبر القوالب** قبل النشر
4. **راقب الـ Quota** إذا كنت على Free tier

---

## المشاكل الشائعة 🔧

### لا تصل الرسائل؟
1. تحقق من API Key
2. تحقق من أن الـ Workflow مفعّل
3. شاهد الـ Activity Feed لمعرفة الخطأ

### رسائل في Spam؟
1. أضف SPF/DKIM records
2. استخدم domain مخصص
3. تجنب كلمات الـ spam

---

## الموارد 📚

- [Novu Documentation](https://docs.novu.co)
- [Novu GitHub](https://github.com/novuhq/novu)
- [Dashboard](https://web.novu.co)
- [API Reference](https://docs.novu.co/api-reference/overview)

---

**جاهز! الآن لديك نظام إشعارات احترافي! 🚀**
