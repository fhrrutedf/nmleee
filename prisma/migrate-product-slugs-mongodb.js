/**
 * Direct MongoDB Migration: Add Slugs to Existing Products
 * This bypasses Prisma client to update documents directly
 */

const { MongoClient } = require('mongodb');
require('dotenv').config();

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
 * Generate unique slug for a user
 */
async function generateUniqueSlug(baseSlug, userId, collection) {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
        const existing = await collection.findOne({ slug, userId });
        if (!existing) {
            return slug;
        }
        slug = `${baseSlug}-${counter}`;
        counter++;
    }
}

/**
 * Main migration
 */
async function migrateProductSlugs() {
    const client = new MongoClient(process.env.DATABASE_URL);

    try {
        console.log('🚀 Starting MongoDB migration...\n');

        await client.connect();
        console.log('✅ Connected to MongoDB\n');

        const db = client.db('tmleen');
        const collection = db.collection('Product');

        // Find all products
        const allProducts = await collection.find({}).toArray();
        console.log(`📦 Found ${allProducts.length} products\n`);

        let updated = 0;
        let skipped = 0;

        for (const product of allProducts) {
            // Skip if already has slug
            if (product.slug) {
                console.log(`⏭️  Skipped: "${product.title}" (already has slug: ${product.slug})`);
                skipped++;
                continue;
            }

            // Generate slug from title
            const baseSlug = generateSlug(product.title);

            // Make it unique for this user
            const uniqueSlug = await generateUniqueSlug(baseSlug, product.userId, collection);

            // Update product in MongoDB
            await collection.updateOne(
                { _id: product._id },
                { $set: { slug: uniqueSlug } }
            );

            console.log(`✅ Updated: "${product.title}" → slug: "${uniqueSlug}"`);
            updated++;
        }

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📊 Migration Summary:');
        console.log(`   ✅ Updated: ${updated} products`);
        console.log(`   ⏭️  Skipped: ${skipped} products`);
        console.log(`   📦 Total: ${allProducts.length} products`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('🎉 Migration completed successfully!\n');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        await client.close();
        console.log('👋 MongoDB connection closed\n');
    }
}

// Run migration
migrateProductSlugs()
    .then(() => {
        console.log('✨ All done! You can now run: npx prisma generate');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
