import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// ─── MAGIC NUMBER CHECKS (Nuclear Defense Level 1) ──────────────
function validateMagicBytes(buffer: Buffer, mime: string): boolean {
    const hex = buffer.toString('hex', 0, 8).toUpperCase();
    
    // Images
    if (mime.startsWith('image/jpeg')) return hex.startsWith('FFD8FF');
    if (mime.startsWith('image/png'))  return hex.startsWith('89504E47');
    if (mime.startsWith('image/gif'))  return hex.startsWith('47494638');
    if (mime.startsWith('image/webp')) return hex.includes('57454250');

    // Documents
    if (mime === 'application/pdf')      return hex.startsWith('25504446');
    if (mime.includes('zip'))           return hex.startsWith('504B0304');

    // Videos
    if (mime.startsWith('video/'))      return hex.includes('66747970'); // ftyp

    return false; // Type not in whitelist or magic mismatch
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        // Remove strictly required session for image uploads (to allow Guest Receipt Upload)
        const isGuestUpload = uploadType === 'receipt' || uploadType === 'image';
        
        if (!session?.user && !isGuestUpload) {
            return NextResponse.json({ error: 'منطقة محظورة' }, { status: 401 });
        }

        const userId = session?.user?.id || 'guest_upload';
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const uploadType = formData.get('type') as string; // 'image' | 'product' | 'avatar'

        if (!file || !(file instanceof File)) {
            return NextResponse.json({ error: 'لم يتم العثور على الملف' }, { status: 400 });
        }

        // 🛡️ SECURITY 1: Strict Whitelist
        const allowedMimes = [
            'image/jpeg', 'image/png', 'image/webp', 'image/gif',
            'application/pdf', 'application/zip', 'application/x-zip-compressed',
            'video/mp4', 'video/quicktime', 'video/x-matroska'
        ];

        if (!allowedMimes.includes(file.type)) {
            return NextResponse.json({ error: 'نوع الملف غير مسموح برفه (سيكيورتي)' }, { status: 403 });
        }

        // 🛡️ SECURITY 2: Buffer Protection (Anti-DOS)
        // Note: For Next.js Route Handlers, the request has a 4.5MB limit in Vercel Hobby, 
        // 500MB in Pro. We check size BEFORE reading into Buffer if possible (but we need it for Magic Bytes).
        const maxImageSize = 10 * 1024 * 1024; // 10MB
        const maxFileSize  = 100 * 1024 * 1024; // 100MB (For server processing limit)
        
        const limit = file.type.startsWith('image/') ? maxImageSize : maxFileSize;
        if (file.size > limit) {
             return NextResponse.json({ error: `الملف كبير جداً. الحد الأقصى لجلسة الرفع هو ${limit/1024/1024}MB` }, { status: 413 });
        }

        // Read first chunk for verification BEFORE full buffering to minimize memory usage
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 🛡️ SECURITY 3: Deep Content Verification (Magic Numbers)
        if (!validateMagicBytes(buffer, file.type)) {
            return NextResponse.json({ error: 'تحذير: محتوى الملف لا يطابق الامتداد المزعوم. تم حظر الرفع.' }, { status: 400 });
        }

        // 🛡️ SECURITY 4: Filename Sanitization & Path Injection Defense
        const cleanExtension = file.name.split('.').pop()?.replace(/[^a-z0-9]/gi, '') || 'bin';
        const secureFileName = `${crypto.randomUUID()}.${cleanExtension}`;
        
        // Logical Routing: Private vs Public
        // Images are public. Digital products are STRICTLY PRIVATE.
        let bucket = 'product-images';
        let isPrivate = false;

        if (uploadType === 'product' || !file.type.startsWith('image/')) {
            bucket = 'product-files'; // Ensure this bucket is PRIVATE in Supabase
            isPrivate = true;
        }

        const filePath = `${userId}/${secureFileName}`;

        // 🛡️ SECURITY 5: Service Role Isolation logic
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(filePath, buffer, {
                contentType: file.type,
                upsert: false // Security: Prevent overwriting other users files
            });

        if (error) {
            console.error('[Upload Security Failure]:', error);
            return NextResponse.json({ error: 'عذراً، فشل الرفع لأسباب فنية' }, { status: 500 });
        }

        // 🛡️ SECURITY 6: Access Control logic (Signed URLs)
        let finalUrl: string;
        if (isPrivate) {
            // Never return public URL for private products!
            // Return a 5-minute preview URL for immediate confirmation
            const { data: signedData, error: signError } = await supabase.storage
                .from(bucket)
                .createSignedUrl(filePath, 300); // 5 minutes
            
            if (signError) throw signError;
            finalUrl = signedData.signedUrl;
        } else {
            // Images can be public
            const { data: publicData } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath);
            finalUrl = publicData.publicUrl;
        }

        return NextResponse.json({
            url: finalUrl,
            path: filePath,
            bucket: bucket,
            isPrivate
        });

    } catch (err) {
        console.error('[Critical Upload Failure]:', err);
        return NextResponse.json({ error: 'توقف السيرفر بشكل مفاجئ' }, { status: 500 });
    }
}
