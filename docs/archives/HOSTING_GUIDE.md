# 🚀 دليل الاستضافة - أفضل الخيارات

## 🏆 الخيارات الموصى بها

### 1. Vercel (⭐ الأفضل - موصى به)

**المميزات:**
- ✅ **مجاني للأبد** - Unlimited projects
- ✅ **سريع جداً** - Edge Network عالمي
- ✅ **سهل** - Deploy بأمر واحد
- ✅ **مصمم لـ Next.js** - من نفس الفريق
- ✅ **SSL مجاني** - تلقائي
- ✅ **Custom Domain** - مجاني
- ✅ **Environment Variables** - سهلة
- ✅ **Serverless Functions** - مدمجة

**الأسعار:**
- **Free**: Unlimited projects, 100GB bandwidth/month
- **Pro** ($20/month): إذا احتجت أكثر

**الخطوات:**
```bash
# 1. نزّل Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel

# تابع التعليمات → اكتمل!
```

**أو عبر الموقع:**
1. اذهب إلى https://vercel.com
2. Sign up بـ GitHub
3. Import Repository
4. Vercel بيكتشف Next.js تلقائياً
5. أضف Environment Variables
6. Deploy!

**Database:** يحتاج MongoDB Atlas (مجاني أيضاً)

---

### 2. Netlify (بديل ممتاز)

**المميزات:**
- ✅ مجاني - 100GB bandwidth
- ✅ سهل الاستخدام
- ✅ CI/CD تلقائي
- ✅ Forms مدمجة
- ✅ Serverless Functions

**الأسعار:**
- **Free**: 100GB/month, 300 build minutes
- **Pro** ($19/month): 1TB, unlimited builds

**الخطوات:**
```bash
npm i -g netlify-cli
netlify login
netlify deploy
```

---

### 3. Railway (جيد للتطبيقات الكبيرة)

**المميزات:**
- ✅ Database مدمجة (PostgreSQL/MongoDB)
- ✅ مجاني - $5 credit/month
- ✅ سهل جداً
- ✅ Docker support

**الأسعار:**
- **Free**: $5 credit/month (~550 ساعة)
- **Pay as you go**: $0.000231/GB-hour

**الخطوات:**
1. https://railway.app
2. Login with GitHub
3. New Project → Deploy from GitHub
4. Choose repo → Deploy!

---

### 4. Render (خيار قوي)

**المميزات:**
- ✅ مجاني - Static sites unlimited
- ✅ Web services مجاني (بقيود)
- ✅ Database مدمجة
- ✅ SSL تلقائي

**الأسعار:**
- **Free**: Web services (sleep after 15 min inactivity)
- **Starter** ($7/month): Always-on

---

## 📊 مقارنة سريعة

| الخدمة | السعر (Free) | السرعة | السهولة | Next.js | Database |
|--------|-------------|--------|---------|---------|----------|
| **Vercel** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | منفصلة |
| **Netlify** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | منفصلة |
| **Railway** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Render** | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |

---

## 🎯 التوصية النهائية لمشروعك

### ✅ استخدم: **Vercel + MongoDB Atlas**

**Why?**
1. **مجاني 100%** - لا تدفع شيء
2. **مصمم لـ Next.js** - أفضل أداء
3. **سهل** - Deploy بدقيقة
4. **سريع** - Edge Network عالمي
5. **موثوق** - uptime 99.99%

---

## 📖 خطوات Deploy على Vercel بالتفصيل

### 1. إعداد MongoDB Atlas (مجاني)

```bash
# 1. اذهب إلى https://www.mongodb.com/cloud/atlas
# 2. Sign Up (مجاني)
# 3. Create Cluster → Free (M0)
# 4. Choose region (قريب منك)
# 5. Create Cluster (يستغرق 5 دقائق)
# 6. Database Access → Add User
#    - Username: admin
#    - Password: [قوي]
# 7. Network Access → Add IP
#    - اختر: "Allow access from anywhere" (0.0.0.0/0)
# 8. Clusters → Connect → Connect your application
#    - انسخ الـ connection string:
#      mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/MANASA DIGITAL
```

### 2. Deploy على Vercel

```bash
# Terminal في مجلد المشروع
cd d:\MANASA DIGITAL

# Deploy
vercel

# أول مرة سيسألك:
# - Set up and deploy? Yes
# - Which scope? (اختر حسابك)
# - Link to existing project? No
# - Project name? MANASA DIGITAL
# - Directory? ./
# - Override settings? No

# Deploy! 🚀
```

### 3. إضافة Environment Variables

```bash
# طريقة 1: عبر CLI
vercel env add DATABASE_URL
# الصق connection string من MongoDB Atlas

vercel env add NEXTAUTH_SECRET
# أي نص عشوائي طويل

vercel env add NEXTAUTH_URL
# https://your-project.vercel.app

# كرر لكل متغير

# طريقة 2: عبر Dashboard
# 1. https://vercel.com/dashboard
# 2. اختر المشروع
# 3. Settings → Environment Variables
# 4. أضف كل متغير
```

### 4. إعادة Deploy

```bash
# بعد إضافة Environment Variables
vercel --prod
```

### 5. Stripe Webhook (إذا استخدمت Stripe)

```bash
# 1. اذهب إلى https://dashboard.stripe.com/webhooks
# 2. Add endpoint
# 3. URL: https://your-project.vercel.app/api/stripe/webhook
# 4. Events: checkout.session.completed
# 5. انسخ Signing Secret
# 6. أضفه في Vercel:
vercel env add STRIPE_WEBHOOK_SECRET
```

---

## 🔧 Environment Variables المطلوبة

```env
# في Vercel Dashboard → Settings → Environment Variables

DATABASE_URL=mongodb+srv://...
NEXTAUTH_URL=https://your-project.vercel.app
NEXTAUTH_SECRET=your-random-secret-here
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
```

---

## 🌐 Custom Domain

### في Vercel:
```
1. Settings → Domains
2. Add Domain
3. اكتب domain.com
4. اتبع التعليمات لتحديث DNS
```

**مجاني!** SSL تلقائي ✅

---

## 📊 المراقبة والتحليلات

### Vercel Analytics (مجاني)

```bash
# في dashboard
Settings → Analytics → Enable
```

يعطيك:
- Page views
- Top pages
- Unique visitors
- Performance metrics

---

## 🚨 نصائح مهمة

1. **لا ترفع `.env` على GitHub** - استخدم Environment Variables
2. **استخدم Production Mode** - `vercel --prod`
3. **راقب الأخطاء** - Vercel Dashboard → Logs
4. **استخدم Edge Functions** - لتحسين الأداء
5. **فعّل Analytics** - لمعرفة الزوار

---

## ✅ Checklist قبل Deploy

- [ ] `.env` في `.gitignore`
- [ ] `DATABASE_URL` صحيح
- [ ] Stripe Webhook URL محدّث
- [ ] Environment Variables مضافة في Vercel
- [ ] `npm run build` يعمل محلياً
- [ ] Prisma schema محدّث

---

## 🎉 بعد Deploy

**الرابط:**
```
https://your-project.vercel.app
```

**كل Push على GitHub → Deploy تلقائي!** ✨

---

**جاهز للإطلاق! 🚀**
