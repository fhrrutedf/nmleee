# 📖 دليل Git الشامل

## 🎯 الخطوات الكاملة لرفع المشروع على GitHub

### 1️⃣ تحضير المشروع

```bash
# 1. افتح terminal في مجلد المشروع
cd d:\tmleen

# 2. تأكد من وجود .gitignore
# (تم إنشاؤه تلقائياً)
```

### 2️⃣ تهيئة Git

```bash
# إنشاء repository محلي
git init

# إضافة جميع الملفات
git add .

# Commit أول
git commit -m "🎉 Initial commit: Complete creator marketplace platform"
```

### 3️⃣ إنشاء Repository على GitHub

**طريقة 1: عبر الموقع**
1. اذهب إلى https://github.com
2. اضغط على **New Repository** (أخضر)
3. اسم المشروع: `tmleen`
4. الوصف: `Creator Marketplace Platform with Escrow and Manual Payment`
5. اختر **Public** أو **Private**
6. **لا تختر** "Add README" (لأن عندك واحد)
7. اضغط **Create Repository**

**طريقة 2: عبر GitHub CLI**
```bash
# نزّل GitHub CLI
# https://cli.github.com/

# Login
gh auth login

# إنشاء repo
gh repo create tmleen --public --source=. --remote=origin
```

### 4️⃣ ربط المشروع بـ GitHub

```bash
# أضف رابط GitHub repo
git remote add origin https://github.com/YOUR_USERNAME/tmleen.git

# أو إذا استخدمت gh CLI، سيُضاف تلقائياً
```

### 5️⃣ رفع الكود (Push)

```bash
# رفع الكود لأول مرة
git push -u origin main

# أو إذا الـ branch اسمه master
git push -u origin master
```

---

## 📚 أوامر Git الأساسية

### الحالة والمعلومات
```bash
# معرفة حالة المشروع
git status

# معرفة الـ commits السابقة
git log

# معرفة الـ commits بشكل مختصر
git log --oneline
```

### إضافة ملفات
```bash
# إضافة ملف واحد
git add filename.ts

# إضافة مجلد
git add foldername/

# إضافة كل الملفات
git add .

# إضافة كل الملفات المعدلة فقط
git add -u
```

### Commit
```bash
# commit مع رسالة
git commit -m "✨ Add new feature"

# commit مع رسالة طويلة
git commit -m "✨ Add feature" -m "Detailed description here"

# تعديل آخر commit
git commit --amend -m "New message"
```

### Push & Pull
```bash
# رفع التغييرات
git push

# رفع لأول مرة
git push -u origin main

# جلب التحديثات
git pull

# جلب بدون دمج
git fetch
```

### Branches
```bash
# إنشاء branch جديد
git branch feature-name

# الانتقال لـ branch
git checkout feature-name

# إنشاء والانتقال مباشرة
git checkout -b feature-name

# عرض كل الـ branches
git branch -a

# دمج branch
git merge feature-name

# حذف branch
git branch -d feature-name
```

---

## 🔄 سير العمل اليومي

### سيناريو: تعديل ملف

```bash
# 1. تأكد أنك على آخر نسخة
git pull

# 2. عدّل الملفات

# 3. شاهد التغييرات
git status

# 4. أضف التغييرات
git add .

# 5. Commit
git commit -m "🐛 Fix payment bug"

# 6. ارفع
git push
```

### سيناريو: ميزة جديدة

```bash
# 1. أنشئ branch جديد
git checkout -b feature/manual-payment

# 2. عمل على الميزة

# 3. Commit
git add .
git commit -m "✨ Add manual payment system"

# 4. ارفع الـ branch
git push -u origin feature/manual-payment

# 5. افتح Pull Request على GitHub

# 6. بعد الموافقة، ادمج
git checkout main
git merge feature/manual-payment
git push
```

---

## 🚨 حل المشاكل الشائعة

### مشكلة: رفضت GitHub الـ Push

```bash
# السبب: GitHub محدّث وأنت لا

# الحل:
git pull --rebase
git push
```

### مشكلة: نسيت .gitignore ورفعت ملفات حساسة

```bash
# احذف الملف من Git (بدون حذفه محلياً)
git rm --cached .env

# أضف .env لـ .gitignore
echo ".env" >> .gitignore

# Commit
git add .gitignore
git commit -m "🔒 Remove sensitive files"
git push
```

### مشكلة: أريد التراجع عن آخر commit

```bash
# التراجع مع الاحتفاظ بالتغييرات
git reset --soft HEAD~1

# التراجع وحذف التغييرات (خطر!)
git reset --hard HEAD~1
```

### مشكلة: صراع (Conflict) عند الدمج

```bash
# 1. Git سيخبرك بالملفات المتعارضة
git status

# 2. افتح الملفات وعدّلها يدوياً
# ستجد:
# <<<<<<< HEAD
# your code
# =======
# their code
# >>>>>>> branch-name

# 3. احذف العلامات واختر الكود الصحيح

# 4. أضف وcommit
git add .
git commit -m "🔀 Resolve merge conflict"
```

---

## 🎨 Commit Messages الاحترافية

استخدم Emoji + وصف واضح:

```bash
✨ feat: Add new feature
🐛 fix: Fix bug
📝 docs: Update documentation
💄 style: Improve UI/UX
♻️ refactor: Refactor code
⚡️ perf: Improve performance
✅ test: Add tests
🔧 chore: Update config
🚀 deploy: Deploy to production
🔒 security: Fix security issue
```

**أمثلة:**
```bash
git commit -m "✨ feat: Add manual payment for Syria"
git commit -m "🐛 fix: Fix Stripe webhook validation"
git commit -m "📝 docs: Update README with deployment guide"
git commit -m "💄 style: Improve admin dashboard layout"
```

---

## 🌿 استراتيجيات Branching

### Git Flow (للمشاريع الكبيرة)

```
main (production)
  ├── develop (development)
      ├── feature/payment
      ├── feature/admin
      └── feature/escrow
```

### GitHub Flow (أبسط)

```
main
  ├── feature/payment
  ├── feature/admin
  └── fix/bug
```

**الموصى به لمشروعك:** GitHub Flow

---

## 📌 Tips مهمة

1. **Commit بشكل متكرر** - كل ميزة صغيرة commit منفصل
2. **اكتب رسائل واضحة** - اشرح "ليش" مش "شو"
3. **استخدم .gitignore** - لا ترفع `.env` أو `node_modules`
4. **راجع قبل Push** - `git status` و `git diff`
5. **Pull قبل Push** - تجنب الصراعات

---

## 🔗 روابط مفيدة

- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)
- [GitHub Docs](https://docs.github.com)
- [Learn Git Branching](https://learngitbranching.js.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

**الآن جاهز لرفع مشروعك! 🚀**
