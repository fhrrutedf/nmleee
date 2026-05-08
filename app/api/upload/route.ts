import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { withRateLimit } from '@/lib/rate-limit';

// ─── MAGIC NUMBER CHECKS ──────────────────────────────────────────
function validateMagicBytes(buffer: Buffer, mime: string): boolean {
    const hex = buffer.toString('hex', 0, 8).toUpperCase();

    // Images
    if (mime === 'image/jpeg') return hex.startsWith('FFD8FF');
    if (mime === 'image/png')  return hex.startsWith('89504E47');
    if (mime === 'image/gif')  return hex.startsWith('47494638');
    if (mime === 'image/webp') return buffer.toString('ascii', 0, 4) === 'RIFF';
    if (mime === 'image/avif' || mime === 'image/heic') return true;
    if (mime === 'image/svg+xml') return true; // SVG is XML text
    if (mime.startsWith('image/')) return true;

    // PDF
    if (mime === 'application/pdf') return hex.startsWith('25504446');

    // ZIP / RAR / 7z / compressed
    if (mime.includes('zip') || mime.includes('x-zip')) return hex.startsWith('504B0304') || hex.startsWith('504B0506');
    if (mime.includes('x-rar') || mime.includes('vnd.rar')) return hex.startsWith('52617221');
    if (mime.includes('x-7z')) return hex.startsWith('377ABCAF');
    if (mime.includes('x-tar') || mime.includes('gzip') || mime.includes('x-bzip')) return true;
    if (mime.includes('compressed') || mime.includes('octet-stream')) return true;

    // Videos
    if (mime.startsWith('video/')) return true; // trust file extension

    // Audio / Podcasts
    if (mime.startsWith('audio/')) return true;

    // Office / Documents
    if (mime.includes('msword') || mime.includes('officedocument') || mime.includes('opendocument')) return true;
    if (mime.includes('ms-excel') || mime.includes('spreadsheet') || mime.includes('csv')) return true;
    if (mime.includes('ms-powerpoint') || mime.includes('presentation')) return true;
    if (mime === 'text/plain' || mime === 'text/csv' || mime === 'text/markdown') return true;
    if (mime === 'application/rtf') return true;

    // Code / Data / Programming
    if (mime === 'application/json' || mime === 'text/json') return true;
    if (mime === 'application/xml' || mime === 'text/xml') return true;
    if (mime === 'text/javascript' || mime === 'application/javascript') return true;
    if (mime === 'text/html') return true;
    if (mime === 'text/css') return true;
    if (mime.startsWith('text/')) return true; // all text files: py, php, sh, etc.
    if (mime === 'application/x-sh' || mime === 'application/x-python') return true;
    if (mime === 'application/sql') return true;

    // Software / Executables
    if (mime === 'application/x-msdownload' || mime === 'application/x-msdos-program') return true; // .exe
    if (mime === 'application/vnd.android.package-archive') return true; // .apk
    if (mime === 'application/x-apple-diskimage') return true; // .dmg

    // Design files (large blobs)
    if (mime === 'application/octet-stream') return true; // .psd, .ai, .sketch, .fig, .xd

    return true; // Default: allow — frontend already validates type
}

export async function POST(request: NextRequest) {
    try {
        // ── Rate Limiting: 30 طلب/دقيقة لكل IP ────────────────
        const rateLimitRes = await withRateLimit(request, {
            identifier: 'api:upload',
            limit: 30,
            windowSeconds: 60,
        });
        if (rateLimitRes) return rateLimitRes;

        const session = await getServerSession(authOptions);
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const uploadType = (formData.get('type') as string) || 'image';

        const isGuestUpload = uploadType === 'receipt' || uploadType === 'image';

        if (!session?.user && !isGuestUpload) {
            return NextResponse.json({ error: 'منطقة محظورة' }, { status: 401 });
        }

        const userId = (session?.user as any)?.id || 'guest_upload';

        if (!file || !(file instanceof File)) {
            return NextResponse.json({ error: 'لم يتم العثور على الملف' }, { status: 400 });
        }

        // ─── SECURITY: Allowed MIME whitelist ─────────────────────────
        const allowedMimes = [
            // Images
            'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
            'image/avif', 'image/heic', 'image/bmp', 'image/tiff', 'image/ico', 'image/x-icon',

            // PDFs
            'application/pdf',

            // Compressed / Archives
            'application/zip', 'application/x-zip-compressed', 'application/x-zip',
            'application/x-rar-compressed', 'application/vnd.rar', 'application/x-rar',
            'application/x-7z-compressed',
            'application/gzip', 'application/x-gzip',
            'application/x-tar', 'application/x-bzip2',
            'application/x-compressed',

            // Videos
            'video/mp4', 'video/quicktime', 'video/x-matroska', 'video/x-msvideo',
            'video/webm', 'video/x-flv', 'video/x-ms-wmv', 'video/mpeg',

            // Audio / Podcasts
            'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac',
            'audio/flac', 'audio/x-flac', 'audio/mp4', 'audio/x-m4a',
            'audio/opus', 'audio/webm',

            // Office / Documents
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/vnd.oasis.opendocument.text',
            'application/vnd.oasis.opendocument.spreadsheet',
            'application/vnd.oasis.opendocument.presentation',
            'application/rtf',

            // Text / Code / Data
            'text/plain', 'text/csv', 'text/markdown', 'text/html', 'text/css',
            'text/javascript', 'text/xml', 'text/x-python', 'text/x-php',
            'text/x-shellscript', 'text/x-sql',
            'application/json', 'application/xml',
            'application/javascript', 'application/x-javascript',
            'application/x-sh', 'application/x-python', 'application/sql',

            // Software / Executables
            'application/x-msdownload', 'application/x-msdos-program', // .exe
            'application/vnd.android.package-archive', // .apk
            'application/x-apple-diskimage', // .dmg

            // Design / Generic binary (Photoshop, Illustrator, Figma, Sketch, etc.)
            'application/octet-stream',
        ];

        if (!allowedMimes.includes(file.type) && !file.type.startsWith('text/')) {
            return NextResponse.json({ 
                error: `نوع الملف "${file.type}" غير مسموح به. يرجى التواصل مع الدعم لإضافته.` 
            }, { status: 403 });
        }

        // ─── Size limits ──────────────────────────────────────────────
        const maxImageSize = 10  * 1024 * 1024;  // 10 MB  للصور
        const maxFileSize  = 500 * 1024 * 1024;  // 500 MB للمنتجات الرقمية

        const limit = file.type.startsWith('image/') ? maxImageSize : maxFileSize;
        if (file.size > limit) {
            return NextResponse.json({ 
                error: `الملف كبير جداً. الحد الأقصى ${limit / 1024 / 1024}MB` 
            }, { status: 413 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Magic bytes check (lenient for non-binary files)
        if (!validateMagicBytes(buffer, file.type)) {
            return NextResponse.json({ 
                error: 'تحذير: محتوى الملف لا يطابق الامتداد. تم حظر الرفع.' 
            }, { status: 400 });
        }

        // Filename sanitization
        const cleanExtension = file.name.split('.').pop()?.replace(/[^a-zA-Z0-9]/g, '') || 'bin';
        const secureFileName = `${crypto.randomUUID()}.${cleanExtension}`;

        // Routing: images go to public bucket, everything else to private
        let bucket = 'product-images';
        let isPrivate = false;

        if (uploadType === 'file' || uploadType === 'product' || !file.type.startsWith('image/')) {
            bucket = 'product-files';
            isPrivate = true;
        }

        const filePath = `${userId}/${secureFileName}`;

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(filePath, buffer, {
                contentType: file.type,
                upsert: false,
            });

        if (error) {
            console.error('[Upload Error]:', error);
            return NextResponse.json({ error: 'فشل رفع الملف: ' + error.message }, { status: 500 });
        }

        // Generate URL
        let finalUrl: string;
        if (isPrivate) {
            // Signed URL for private files (long-lived: 10 years for stored products)
            const { data: signedData, error: signError } = await supabase.storage
                .from(bucket)
                .createSignedUrl(filePath, 315_360_000); // 10 years

            if (signError) throw signError;
            finalUrl = signedData.signedUrl;
        } else {
            const { data: publicData } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath);
            finalUrl = publicData.publicUrl;
        }

        return NextResponse.json({
            url: finalUrl,
            path: filePath,
            bucket,
            isPrivate,
        });

    } catch (err) {
        console.error('[Critical Upload Failure]:', err);
        return NextResponse.json({ error: 'توقف السيرفر بشكل مفاجئ' }, { status: 500 });
    }
}
