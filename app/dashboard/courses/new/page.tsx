import { redirect } from 'next/navigation';

// 🔒 قسم إضافة الدورات مغلق مؤقتاً
export default function NewCoursePage() {
    redirect('/dashboard');
}
