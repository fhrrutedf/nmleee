const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 بدء إضافة البيانات التجريبية...');

    // 1. إنشاء مستخدم تجريبي
    console.log('📝 إنشاء مستخدم تجريبي...');

    const hashedPassword = await bcrypt.hash('demo123', 10);

    const demoUser = await prisma.user.upsert({
        where: { email: 'demo@tmleen.com' },
        update: {},
        create: {
            email: 'demo@tmleen.com',
            password: hashedPassword,
            name: 'مستخدم تجريبي',
            username: 'demo',
            bio: 'مرحباً! أنا بائع على منصة tmleen',
            isActive: true,
            affiliateCode: 'DEMO123'
        }
    });

    console.log('✅ تم إنشاء المستخدم:', demoUser.email);

    // 2. إضافة منتجات رقمية
    console.log('📦 إضافة منتجات رقمية...');

    const products = await Promise.all([
        prisma.product.create({
            data: {
                title: 'كتاب البرمجة باستخدام JavaScript',
                description: 'كتاب شامل لتعلم JavaScript من الصفر حتى الاحتراف. يحتوي على أمثلة عملية ومشاريع تطبيقية.',
                price: 99.99,
                category: 'كتب إلكترونية',
                fileUrl: 'https://example.com/javascript-book.pdf',
                fileType: 'pdf',
                image: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=500',
                tags: ['برمجة', 'JavaScript', 'كتب'],
                features: ['300+ صفحة', 'أمثلة عملية', 'مشاريع تطبيقية', 'تحديثات مجانية'],
                isActive: true,
                userId: demoUser.id
            }
        }),
        prisma.product.create({
            data: {
                title: 'قالب WordPress احترافي',
                description: 'قالب WordPress متجاوب ومتعدد الاستخدامات. مناسب للمدونات والمتاجر الإلكترونية.',
                price: 49.99,
                category: 'قوالب',
                fileUrl: 'https://example.com/theme.zip',
                fileType: 'zip',
                image: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=500',
                tags: ['WordPress', 'قوالب', 'تصميم'],
                features: ['متجاوب', 'سريع', 'سهل التخصيص', 'دعم RTL'],
                isActive: true,
                userId: demoUser.id
            }
        }),
        prisma.product.create({
            data: {
                title: 'مجموعة أيقونات احترافية',
                description: 'أكثر من 500 أيقونة بصيغة SVG و PNG. جاهزة للاستخدام في المشاريع التجارية.',
                price: 29.99,
                category: 'رسوميات',
                fileUrl: 'https://example.com/icons.zip',
                fileType: 'zip',
                image: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=500',
                tags: ['أيقونات', 'SVG', 'تصميم'],
                features: ['500+ أيقونة', 'SVG & PNG', 'استخدام تجاري', '3 أحجام'],
                isActive: true,
                userId: demoUser.id
            }
        }),
        prisma.product.create({
            data: {
                title: 'دليل التسويق بالعمولة',
                description: 'دليل شامل لتحقيق الربح من التسويق بالعمولة. استراتيجيات مجربة ونتائج مضمونة.',
                price: 79.99,
                category: 'كتب إلكترونية',
                fileUrl: 'https://example.com/affiliate-guide.pdf',
                fileType: 'pdf',
                image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500',
                tags: ['تسويق', 'أفلييت', 'ربح'],
                features: ['50+ استراتيجية', 'دراسات حالة', 'أدوات مجانية', 'دعم فني'],
                isActive: true,
                userId: demoUser.id
            }
        }),
        prisma.product.create({
            data: {
                title: 'صور مخزون عالية الجودة',
                description: 'مجموعة من 100 صورة عالية الدقة للاستخدام التجاري. جميع الأنواع متوفرة.',
                price: 39.99,
                category: 'صور',
                fileUrl: 'https://example.com/stock-photos.zip',
                fileType: 'zip',
                image: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=500',
                tags: ['صور', 'مخزون', 'تصوير'],
                features: ['100 صورة', '4K جودة', 'استخدام تجاري', 'تنوع كبير'],
                isActive: true,
                userId: demoUser.id
            }
        })
    ]);

    console.log(`✅ تم إضافة ${products.length} منتجات`);

    // 3. إضافة دورات تدريبية
    console.log('🎓 إضافة دورات تدريبية...');

    const courses = await Promise.all([
        prisma.course.create({
            data: {
                title: 'دورة تطوير الويب الشاملة',
                description: 'تعلم HTML, CSS, JavaScript, React, Node.js من الصفر. دورة شاملة للمبتدئين.',
                price: 299.99,
                category: 'برمجة',
                image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500',
                duration: '40 ساعة',
                sessions: 50,
                tags: ['برمجة', 'تطوير ويب', 'React'],
                features: ['50 درس', '40 ساعة', 'شهادة', 'مشاريع عملية'],
                isActive: true,
                userId: demoUser.id
            }
        }),
        prisma.course.create({
            data: {
                title: 'دورة التصميم الجرافيكي',
                description: 'احترف Adobe Photoshop و Illustrator. من المبتدئ إلى المحترف.',
                price: 199.99,
                category: 'تصميم',
                image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=500',
                duration: '30 ساعة',
                sessions: 35,
                tags: ['تصميم', 'Photoshop', 'Illustrator'],
                features: ['35 درس', '30 ساعة', 'ملفات PSD', 'دعم فني'],
                isActive: true,
                userId: demoUser.id
            }
        }),
        prisma.course.create({
            data: {
                title: 'دورة التسويق الرقمي',
                description: 'تعلم SEO, Social Media Marketing, Email Marketing. كل ما تحتاجه للنجاح.',
                price: 249.99,
                category: 'تسويق',
                image: 'https://images.unsplash.com/photo-1432888622747-4eb9a8f2c293?w=500',
                duration: '25 ساعة',
                sessions: 30,
                tags: ['تسويق', 'SEO', 'سوشيال ميديا'],
                features: ['30 درس', '25 ساعة', 'استراتيجيات', 'أدوات'],
                isActive: true,
                userId: demoUser.id
            }
        })
    ]);

    console.log(`✅ تم إضافة ${courses.length} دورات تدريبية`);

    // 4. إضافة كوبونات خصم
    console.log('🎫 إضافة كوبونات خصم...');

    const coupons = await Promise.all([
        prisma.coupon.create({
            data: {
                code: 'WELCOME50',
                type: 'percentage',
                value: 50,
                maxUses: 100,
                usedCount: 0,
                minPurchase: 50,
                isActive: true,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                userId: demoUser.id
            }
        }),
        prisma.coupon.create({
            data: {
                code: 'SAVE20',
                type: 'fixed',
                value: 20,
                maxUses: 50,
                usedCount: 0,
                minPurchase: 100,
                isActive: true,
                expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
                userId: demoUser.id
            }
        }),
        prisma.coupon.create({
            data: {
                code: 'FIRST10',
                type: 'percentage',
                value: 10,
                maxUses: 200,
                usedCount: 5,
                isActive: true,
                userId: demoUser.id
            }
        })
    ]);

    console.log(`✅ تم إضافة ${coupons.length} كوبونات خصم`);

    // 5. إضافة تقييمات للمنتجات
    console.log('⭐ إضافة تقييمات...');

    const reviews = await Promise.all([
        prisma.review.create({
            data: {
                rating: 5,
                comment: 'منتج رائع! استفدت منه كثيراً',
                name: 'أحمد محمد',
                isApproved: true,
                productId: products[0].id
            }
        }),
        prisma.review.create({
            data: {
                rating: 4,
                comment: 'جيد جداً، لكن كان يمكن أن يكون أفضل',
                name: 'فاطمة علي',
                isApproved: true,
                productId: products[0].id
            }
        }),
        prisma.review.create({
            data: {
                rating: 5,
                comment: 'ممتاز! أنصح الجميع بشرائه',
                name: 'محمود حسن',
                isApproved: true,
                productId: products[1].id
            }
        }),
        prisma.review.create({
            data: {
                rating: 5,
                comment: 'أفضل استثمار قمت به!',
                name: 'سارة أحمد',
                isApproved: true,
                productId: products[2].id
            }
        })
    ]);

    console.log(`✅ تم إضافة ${reviews.length} تقييمات`);

    // 6. تحديث متوسط التقييمات
    console.log('📊 تحديث متوسط التقييمات...');

    await prisma.product.update({
        where: { id: products[0].id },
        data: {
            averageRating: 4.5,
            reviewCount: 2
        }
    });

    await prisma.product.update({
        where: { id: products[1].id },
        data: {
            averageRating: 5,
            reviewCount: 1
        }
    });

    await prisma.product.update({
        where: { id: products[2].id },
        data: {
            averageRating: 5,
            reviewCount: 1
        }
    });

    console.log('✅ تم تحديث متوسط التقييمات');

    console.log('\n🎉 تم إضافة جميع البيانات التجريبية بنجاح!');
    console.log('\n📊 الملخص:');
    console.log(`- المستخدمون: 1`);
    console.log(`- المنتجات: ${products.length}`);
    console.log(`- الدورات: ${courses.length}`);
    console.log(`- الكوبونات: ${coupons.length}`);
    console.log(`- التقييمات: ${reviews.length}`);
    console.log('\n🔑 بيانات تسجيل الدخول:');
    console.log('   البريد: demo@tmleen.com');
    console.log('   كلمة المرور: demo123');
    console.log('\n✨ يمكنك الآن تسجيل الدخول والبدء!');
}

main()
    .catch((e) => {
        console.error('❌ خطأ:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
