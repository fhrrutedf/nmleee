import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: 'غير مصرح' },
                { status: 401 }
            );
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const fileType = formData.get('type') as string; // 'image' or 'file'

        if (!file) {
            return NextResponse.json(
                { error: 'لم يتم تحديد ملف' },
                { status: 400 }
            );
        }

        // التحقق من حجم الملف (50MB max)
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'حجم الملف كبير جداً (الحد الأقصى 50MB)' },
                { status: 400 }
            );
        }

        // إعداد Supabase Client
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            console.error('Supabase credentials not configured');
            return NextResponse.json(
                { error: 'إعدادات التخزين غير مكتملة' },
                { status: 500 }
            );
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // تحديد الـ bucket
        const bucket = fileType === 'image' || file.type.startsWith('image/')
            ? 'product-images'
            : 'product-files';

        // إنشاء اسم ملف فريد
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(7);
        const fileExtension = file.name.split('.').pop();
        const fileName = `${timestamp}-${randomString}.${fileExtension}`;
        const filePath = `uploads/${fileName}`;

        // تحويل File إلى ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // رفع الملف إلى Supabase Storage
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(filePath, buffer, {
                contentType: file.type,
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error('Supabase upload error:', error);
            return NextResponse.json(
                { error: 'فشل رفع الملف' },
                { status: 500 }
            );
        }

        // الحصول على الرابط العام
        const { data: publicUrlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);

        return NextResponse.json({
            url: publicUrlData.publicUrl,
            path: filePath,
            bucket: bucket
        });

    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json(
            { error: 'حدث خطأ في رفع الملف' },
            { status: 500 }
        );
    }
}
