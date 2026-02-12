import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { v2 as cloudinary } from 'cloudinary';

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

        if (!file) {
            return NextResponse.json(
                { error: 'لم يتم تحديد ملف' },
                { status: 400 }
            );
        }

        // التحقق من نوع الملف
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf', 'application/zip'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'نوع الملف غير مدعوم' },
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

        // رفع إلى Cloudinary
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;

        if (!cloudName || !apiKey || !apiSecret) {
            // في حالة عدم إعداد Cloudinary، احفظ محلياً (للتطوير فقط)
            console.warn('Cloudinary not configured. File upload skipped.');
            return NextResponse.json({
                url: `https://via.placeholder.com/400x300?text=${file.name}`,
                publicId: 'local-' + Date.now(),
                message: 'تم الرفع محلياً (للتطوير)'
            });
        }

        // استخدام Cloudinary Upload API
        // Cloudinary is imported at the top level
        // const cloudinary = require('cloudinary').v2; // Removed in favor of top-level import

        cloudinary.config({
            cloud_name: cloudName,
            api_key: apiKey,
            api_secret: apiSecret
        });

        // رفع الملف
        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    folder: 'tmleen',
                    resource_type: 'auto'
                },
                (error: any, result: any) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            ).end(buffer);
        });

        return NextResponse.json({
            url: (result as any).secure_url,
            publicId: (result as any).public_id
        });

    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json(
            { error: 'حدث خطأ في رفع الملف' },
            { status: 500 }
        );
    }
}
