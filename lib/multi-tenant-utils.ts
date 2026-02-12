/**
 * Utility functions for Multi-Tenant Creator Marketplace
 */

/**
 * Generate a URL-friendly slug from text
 * @param text - The text to convert to slug
 * @returns URL-friendly slug
 */
export function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .trim()
        // Replace Arabic characters with transliteration (optional)
        .replace(/[\u0600-\u06FF]/g, (char) => {
            const arabicToLatin: { [key: string]: string } = {
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
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Generate a unique slug by appending number if slug exists
 * @param baseSlug - The base slug
 * @param userId - The creator's user ID
 * @param prisma - Prisma client instance
 * @returns Unique slug for this creator
 */
export async function generateUniqueSlug(
    baseSlug: string,
    userId: string,
    prisma: any
): Promise<string> {
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
 * Build creator profile URL
 * @param username - Creator's username
 * @returns Full profile URL
 */
export function buildCreatorUrl(username: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return `${baseUrl}/@${username}`;
}

/**
 * Build product direct URL
 * @param username - Creator's username
 * @param productSlug - Product slug
 * @returns Full product URL
 */
export function buildProductUrl(username: string, productSlug: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return `${baseUrl}/@${username}/${productSlug}`;
}

/**
 * Validate username format
 * @param username - Username to validate
 * @returns true if valid
 */
export function isValidUsername(username: string): boolean {
    // 3-30 characters, alphanumeric + underscore/hyphen
    const regex = /^[a-zA-Z0-9_-]{3,30}$/;
    return regex.test(username);
}

/**
 * Extract username from URL path
 * @param path - URL path (e.g., "/@username/product-slug")
 * @returns Username without @ symbol
 */
export function extractUsername(path: string): string | null {
    const match = path.match(/\/@([^\/]+)/);
    return match ? match[1] : null;
}

/**
 * Check if user is accessing their own store
 * @param sessionUserId - Logged in user ID
 * @param creatorId - Creator/Store owner ID
 * @returns true if same user
 */
export function isOwnStore(sessionUserId: string | null, creatorId: string): boolean {
    return sessionUserId === creatorId;
}
