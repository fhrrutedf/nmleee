/**
 * Migration Script: Add Slugs to Existing Products
 * Run this ONCE after updating the schema
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Generate URL-friendly slug from text
 */
function generateSlug(text) {
    return text
        .toLowerCase()
        .trim()
        .replace(/[\u0600-\u06FF]/g, (char) => {
            const arabicToLatin = {
                'ا': 'a', 'أ': 'a', 'إ': 'e', 'آ': 'aa',
                'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j',
                'ح': 'h', 'خ': 'kh', 'د': 'd', 'ذ': 'dh',
                'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh',
                'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z',
                'ع': 'a', 'غ': 'gh', 'ف': 'f', 'ق': 'q',
                'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n',
                'ه': 'h', 'و': 'w', 'ي': 'y', 'ى': 'a',
                'ة': 'h', 'ء': 'a'
            };
            return arabicToLatin[char] || char;
        })
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/**
 * Generate unique slug for a creator
 */
async function generateUniqueSlug(baseSlug, userId) {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
        const existing = await prisma.product.findFirst({
            where: {
                slug,
                userId
            }
        });

        if (!existing) {
            return slug;
        }

        slug = `${baseSlug}-${counter}`;
        counter++;
    }
}

/**
 * Main migration function
 */
async function migrateProductSlugs() {
    try {
        console.log('🚀 Starting product slug migration...\n');

        // Get all products without slugs
        const products = await prisma.product.findMany({
            select: {
                id: true,
                title: true,
                userId: true,
                slug: true
            }
        });

        console.log(`📦 Found ${products.length} products\n`);

        let updated = 0;
        let skipped = 0;

        for (const product of products) {
            // Skip if already has slug
            if (product.slug) {
                console.log(`⏭️  Skipped: "${product.title}" (already has slug: ${product.slug})`);
                skipped++;
                continue;
            }

            // Generate slug from title
            const baseSlug = generateSlug(product.title);

            // Make it unique for this creator
            const uniqueSlug = await generateUniqueSlug(baseSlug, product.userId);

            // Update product
            await prisma.product.update({
                where: { id: product.id },
                data: { slug: uniqueSlug }
            });

            console.log(`✅ Updated: "${product.title}" → slug: "${uniqueSlug}"`);
            updated++;
        }

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📊 Migration Summary:');
        console.log(`   ✅ Updated: ${updated} products`);
        console.log(`   ⏭️  Skipped: ${skipped} products`);
        console.log(`   📦 Total: ${products.length} products`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('🎉 Migration completed successfully!\n');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run migration
migrateProductSlugs()
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
