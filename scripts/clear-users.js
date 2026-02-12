/**
 * Clear All Users Script
 * ⚠️ للتطوير فقط - يحذف جميع المستخدمين من قاعدة البيانات
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearUsers() {
    try {
        console.log('🗑️  بدء حذف جميع المستخدمين...');

        // حذف جميع المستخدمين
        const result = await prisma.user.deleteMany({});

        console.log(`✅ تم حذف ${result.count} مستخدم بنجاح`);

    } catch (error) {
        console.error('❌ خطأ في حذف المستخدمين:', error);
    } finally {
        await prisma.$disconnect();
    }
}

clearUsers();
