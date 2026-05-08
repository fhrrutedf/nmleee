import { redirect } from 'next/navigation';

// 🔒 قسم الدورات مغلق مؤقتاً
export default function CoursesPage() {
    redirect('/dashboard');
}
