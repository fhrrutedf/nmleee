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
    return sanitizeHtml(html, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "h1", "h2", "iframe", "span"]),
        allowedAttributes: {
            ...sanitizeHtml.defaults.allowedAttributes,
            '*': ['style', 'class'],
            img: ['src', 'alt', 'width', 'height'],
            iframe: ['src', 'title', 'allow', 'allowfullscreen']
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
    content: string;
    excerpt: string;
    status: "DRAFT" | "PUBLISHED" | "SCHEDULED";
    coverImage?: string;
    publishedAt?: Date | null;
}) {
    try {
        const user = await checkAdminAccess();
        const slug = generateSlug(data.title);
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
                authorId: user.id,
            }
        });

        revalidatePath("/admin/articles");
        return { success: true, articleId: article.id, slug: article.slug };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateArticle(articleId: string, data: {
    title: string;
    content: string;
    excerpt: string;
    status: "DRAFT" | "PUBLISHED" | "SCHEDULED";
    coverImage?: string;
    publishedAt?: Date | null;
}) {
    try {
        await checkAdminAccess();
        const cleanContent = sanitize(data.content);

        await prisma.article.update({
            where: { id: articleId },
            data: {
                title: data.title,
                content: cleanContent,
                excerpt: data.excerpt || "",
                status: data.status,
                coverImage: data.coverImage,
                publishedAt: data.status === "SCHEDULED" ? data.publishedAt : (data.status === "PUBLISHED" ? new Date() : null),
            }
        });

        revalidatePath("/admin/articles");
        revalidatePath(`/admin/articles/${articleId}/edit`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteArticle(articleId: string) {
    try {
        await checkAdminAccess();
        await prisma.article.delete({ where: { id: articleId } });
        revalidatePath("/admin/articles");
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
