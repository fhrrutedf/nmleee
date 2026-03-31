import { prisma } from '../lib/db';
import bcrypt from 'bcryptjs';

async function seed() {
    console.log('🌱 Starting seed...');

    // Create Admin User
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@tmleen.com' },
        update: {},
        create: {
            email: 'admin@tmleen.com',
            username: 'admin',
            name: 'المشرف العام',
            password: adminPassword,
            role: 'ADMIN',
            isActive: true,
            emailVerified: true,
            country: 'Syria',
            planType: 'AGENCY',
        },
    });
    console.log('✅ Admin created:', admin.email);

    // Create Platform Settings
    await prisma.platformSettings.upsert({
        where: { id: 'singleton' },
        update: {},
        create: {
            id: 'singleton',
            platformName: 'منصة تمالين',
            commissionRate: 10,
            minPayoutAmount: 50,
            growthCommissionRate: 5,
            proCommissionRate: 2,
            agencyCommissionRate: 0,
            freeEscrowDays: 14,
            growthEscrowDays: 7,
            proEscrowDays: 1,
            agencyEscrowDays: 1,
            usdToSyp: 13000,
            usdToIqd: 1300,
            usdToEgp: 50,
            usdToAed: 3.67,
            spaceremitEnabled: true,
            shamcashEnabled: true,
            stripeEnabled: false,
            gatewayFee: 2.5,
            withdrawalsEnabled: true,
            highValueAlertThreshold: 500,
        },
    });
    console.log('✅ Platform settings created');

    // Create Sample Seller
    const sellerPassword = await bcrypt.hash('seller123', 10);
    const seller = await prisma.user.upsert({
        where: { email: 'seller@example.com' },
        update: {},
        create: {
            email: 'seller@example.com',
            username: 'demo_seller',
            name: 'بائع تجريبي',
            password: sellerPassword,
            role: 'SELLER',
            isActive: true,
            emailVerified: true,
            country: 'Syria',
            planType: 'GROWTH',
            bio: 'بائع تجريبي للاختبار',
        },
    });
    console.log('✅ Seller created:', seller.email);

    // Create Sample Product
    const product = await prisma.product.upsert({
        where: { id: 'sample-product-1' },
        update: {},
        create: {
            id: 'sample-product-1',
            title: 'منتج تجريبي',
            description: 'هذا منتج للاختبار بعد استعادة البيانات',
            price: 50,
            currency: 'USD',
            category: 'digital',
            isActive: true,
            userId: seller.id,
            slug: 'sample-product',
        },
    });
    console.log('✅ Product created:', product.title);

    // Create Subscription Plans
    const plans = [
        { name: 'GROWTH', price: 29, interval: 'month', planType: 'GROWTH', userId: admin.id },
        { name: 'PRO', price: 79, interval: 'month', planType: 'PRO', userId: admin.id },
        { name: 'AGENCY', price: 199, interval: 'month', planType: 'AGENCY', userId: admin.id },
    ];

    for (const plan of plans) {
        await prisma.subscriptionPlan.upsert({
            where: { id: `plan-${plan.planType}` },
            update: {},
            create: {
                id: `plan-${plan.planType}`,
                name: plan.name,
                description: `باقة ${plan.name}`,
                price: plan.price,
                interval: plan.interval,
                planType: plan.planType,
                isActive: true,
                features: ['ميزة 1', 'ميزة 2', 'ميزة 3'],
                userId: plan.userId,
            },
        });
    }
    console.log('✅ Subscription plans created');

    console.log('\n🎉 Seed completed successfully!');
    console.log('\n📧 Login credentials:');
    console.log('   Admin: admin@tmleen.com / admin123');
    console.log('   Seller: seller@example.com / seller123');
}

seed()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
