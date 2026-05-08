"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import sanitizeHtml from "sanitize-html";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const checkAdminAccess = async () => {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized: Access denied. ADMIN role required.");
    }
    return session.user;
};

const sanitize = (html: string) => {
    // Enterprise class sanitizer: strip copied layout bounds (Tailwind Grids, Flex, absolute logic)
    // Ensures only Quill formatting and safe text attributes pass through.
    const aggressiveSanitized = html.replace(/class="([^"]*)"/g, (match, classNames) => {
        const safeClasses = classNames.split(/\s+/).filter((cls: string) => {
            if (cls.startsWith('ql-')) return true; // Keep Quill editor classes
            if (cls.startsWith('text-')) return true;
            if (cls.startsWith('font-')) return true;
            if (cls.startsWith('list-')) return true;
            if (cls.match(/^p[xyrtlb]?-\d+/)) return true; // allow basic padding
            return false; // Destroy all other classes (w-screen, flex, absolute, block, w-full, etc.)
        });
        return safeClasses.length > 0 ? `class="${safeClasses.join(' ')}"` : '';
    });

    return sanitizeHtml(aggressiveSanitized, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "h1", "h2", "iframe", "span"]),
        allowedAttributes: {
            ...sanitizeHtml.defaults.allowedAttributes,
            '*': ['style', 'class'], // Only the safe classes remain
            img: ['src', 'alt', 'width', 'height'],
            iframe: ['src', 'title', 'allow', 'allowfullscreen']
        },
        allowedStyles: {
            '*': {
                'color': [/.*/],
                'text-align': [/.*/],
                'font-size': [/.*/],
                'background-color': [/.*/],
                'direction': [/.*/]
            }
        },
        allowedIframeHostnames: ['www.youtube.com', 'player.vimeo.com']
    });
};

const generateSlug = (title: string) => {
    return title
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\u0621-\u064A0-9a-z-]/g, '') + '-' + Math.random().toString(36).substring(2, 8);
};

export async function createArticle(data: {
    title: string;
    slug?: string;
    content: string;
    excerpt: string;
    status: "DRAFT" | "PUBLISHED" | "SCHEDULED";
    coverImage?: string;
    publishedAt?: Date | null;
    seoTitle?: string;
    seoDesc?: string;
    categoryId?: string;
}) {
    try {
        const user = await checkAdminAccess();
        const slug = data.slug || generateSlug(data.title);
        const cleanContent = sanitize(data.content);

        const article = await prisma.article.create({
            data: {
                title: data.title,
                slug,
                content: cleanContent,
                excerpt: data.excerpt || "",
                status: data.status,
                coverImage: data.coverImage,
                publishedAt: data.status === "SCHEDULED" ? data.publishedAt : (data.status === "PUBLISHED" ? new Date() : null),
                seoTitle: data.seoTitle,
                seoDesc: data.seoDesc,
                categoryId: data.categoryId,
                authorId: user.id,
            }
        });

        revalidatePath("/dashboard/admin/blog");
        return { success: true, articleId: article.id, slug: article.slug };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateArticle(articleId: string, data: {
    title: string;
    slug?: string;
    content: string;
    excerpt: string;
    status: "DRAFT" | "PUBLISHED" | "SCHEDULED";
    coverImage?: string;
    publishedAt?: Date | null;
    seoTitle?: string;
    seoDesc?: string;
    categoryId?: string;
}) {
    try {
        await checkAdminAccess();
        const cleanContent = sanitize(data.content);

        const article = await prisma.article.update({
            where: { id: articleId },
            data: {
                title: data.title,
                ...(data.slug && { slug: data.slug }),
                content: cleanContent,
                excerpt: data.excerpt || "",
                status: data.status,
                coverImage: data.coverImage,
                publishedAt: data.status === "SCHEDULED" ? data.publishedAt : (data.status === "PUBLISHED" ? new Date() : null),
                seoTitle: data.seoTitle,
                seoDesc: data.seoDesc,
                categoryId: data.categoryId,
            }
        });

        revalidatePath("/dashboard/admin/blog");
        revalidatePath(`/dashboard/admin/blog/${articleId}/edit`);
        revalidatePath(`/blog/${article.slug}`);
        revalidatePath("/blog");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteArticle(articleId: string) {
    try {
        await checkAdminAccess();
        await prisma.article.delete({ where: { id: articleId } });
        revalidatePath("/dashboard/admin/blog");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function autoSaveArticle(articleId: string, content: string) {
    try {
        await checkAdminAccess();
        const cleanContent = sanitize(content);
        await prisma.article.update({
            where: { id: articleId },
            data: { content: cleanContent }
        });
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// CATEGORIES ACTIONS
export async function getCategories() {
    try {
        await checkAdminAccess();
        return await prisma.blogCategory.findMany({
            include: { _count: { select: { articles: true } } },
            orderBy: { nameAr: 'asc' }
        });
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function createCategory(data: { nameAr: string; nameEn?: string; slug: string; description?: string }) {
    try {
        await checkAdminAccess();
        const category = await prisma.blogCategory.create({ data });
        revalidatePath("/dashboard/admin/blog/categories");
        return { success: true, category };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateCategory(id: string, data: { nameAr: string; nameEn?: string; slug: string; description?: string }) {
    try {
        await checkAdminAccess();
        await prisma.blogCategory.update({ where: { id }, data });
        revalidatePath("/dashboard/admin/blog/categories");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteCategory(id: string) {
    try {
        await checkAdminAccess();
        await prisma.blogCategory.delete({ where: { id } });
        revalidatePath("/dashboard/admin/blog/categories");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
