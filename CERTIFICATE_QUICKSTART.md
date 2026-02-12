# 🎓 Quick Start - Course Certificates

## ⚡ 3-Minute Integration

### Step 1: Enable in Course Settings
```tsx
import { CertificateToggle } from '@/components/CertificateToggle';

// In your course settings/edit page
<CertificateToggle
    courseId={course.id}
    initialEnabled={course.isCertificateEnabled}
/>
```

### Step 2: Add to Course Player
```tsx
import { CertificateDownload } from '@/components/CertificateDownload';

// In your course player/view page
{course.isCertificateEnabled && (
    <CertificateDownload
        courseId={course.id}
        courseName={course.title}
        studentEmail={session.user.email}
        studentName={session.user.name}
        progress={enrollment.progress} // Must track this
    />
)}
```

### Step 3: Track Student Progress
```typescript
// When student completes a lesson
await prisma.courseEnrollment.upsert({
    where: {
        courseId_studentEmail: {
            courseId: course.id,
            studentEmail: student.email
        }
    },
    create: {
        courseId: course.id,
        studentName: student.name,
        studentEmail: student.email,
        progress: 0
    },
    update: {
        progress: calculateProgress(), // Your logic (0-100)
        isCompleted: progress === 100
    }
});
```

---

## 🎯 How It Works

1. **Creator** enables certificates via toggle
2. **Student** completes course (100%)
3. **Student** sees "Generate Certificate" button
4. **System** validates and generates certificate
5. **Student** downloads PDF

---

## 🔒 Security Built-In

✅ Only shows if `isCertificateEnabled = true`  
✅ Only generates if `progress = 100%`  
✅ Prevents duplicate generation  
✅ API validates all conditions

---

## 📊 Database Already Updated

```bash
✅ Course.isCertificateEnabled
✅ CourseEnrollment model created
✅ Prisma client generated
```

---

## 🎨 Beautiful UI States

- 🔒 **Locked** (< 100%) - Shows progress bar
- 🎊 **Ready** (100%) - Purple generate button
- 🎉 **Available** - Green download button

---

## 📝 Test It

1. Go to any course settings
2. Enable certificate toggle
3. Set a student's progress to 100%
4. Student sees the certificate button
5. Click "Generate" → Certificate created!

---

See [CERTIFICATE_SYSTEM_GUIDE.md](./CERTIFICATE_SYSTEM_GUIDE.md) for full documentation.

✨ **That's it! Your certificate system is ready.**
