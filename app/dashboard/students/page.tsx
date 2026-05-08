import { redirect } from 'next/navigation';

// 🔒 قسم الطلاب مغلق مؤقتاً
export default function StudentsPage() {
    redirect('/dashboard');
}
