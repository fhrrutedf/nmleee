import { redirect } from 'next/navigation';

// 🔒 قسم أسئلة الدورات مغلق مؤقتاً
export default function CourseQAPage() {
    redirect('/dashboard');
}
