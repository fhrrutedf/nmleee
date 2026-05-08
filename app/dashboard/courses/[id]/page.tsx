import { redirect } from 'next/navigation';

// 🔒 قسم تفاصيل الدورات مغلق مؤقتاً
export default function CourseDetailsPage() {
    redirect('/dashboard');
}
