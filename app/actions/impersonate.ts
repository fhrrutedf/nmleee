"use server"

import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { encode } from 'next-auth/jwt';

export async function impersonateUser(targetUserId: string) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'ADMIN') throw new Error('Unauthorized');
    if ((session?.user as any).isImpersonating) throw new Error('Already impersonating someone');

    const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!targetUser) throw new Error('User not found');

    const adminId = session.user.id;
    const adminName = session.user.name;

    const cookieStore = await cookies();
    const isSecure = process.env.NODE_ENV === 'production';
    const cookieName = isSecure ? '__Secure-next-auth.session-token' : 'next-auth.session-token';

    const secret = process.env.NEXTAUTH_SECRET!;
    const maxAge = 30 * 24 * 60 * 60;

    const token = await encode({
        token: {
            name: targetUser.name,
            email: targetUser.email,
            picture: targetUser.avatar,
            sub: targetUser.id,
            id: targetUser.id,
            username: targetUser.username,
            role: targetUser.role,
            isImpersonating: true,
            originalAdminId: adminId,
            originalAdminName: adminName,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + maxAge,
        },
        secret,
        maxAge,
    });

    cookieStore.set(cookieName, token, {
        httpOnly: true,
        secure: isSecure,
        sameSite: 'lax',
        path: '/'
    });

    return { success: true };
}

export async function revertImpersonation() {
    const session = await getServerSession(authOptions);
    if (!(session?.user as any).isImpersonating) throw new Error('Not impersonating anyone');

    const originalAdminId = (session?.user as any).originalAdminId;
    if (!originalAdminId) throw new Error('Mismatched impersonation state');

    const admin = await prisma.user.findUnique({ where: { id: originalAdminId } });
    if (!admin || admin.role !== 'ADMIN') throw new Error('Cannot revert to a non-admin');

    const cookieStore = await cookies();
    const isSecure = process.env.NODE_ENV === 'production';
    const cookieName = isSecure ? '__Secure-next-auth.session-token' : 'next-auth.session-token';

    const secret = process.env.NEXTAUTH_SECRET!;
    const maxAge = 30 * 24 * 60 * 60;

    const token = await encode({
        token: {
            name: admin.name,
            email: admin.email,
            picture: admin.avatar,
            sub: admin.id,
            id: admin.id,
            username: admin.username,
            role: admin.role,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + maxAge,
        },
        secret,
        maxAge,
    });

    cookieStore.set(cookieName, token, {
        httpOnly: true,
        secure: isSecure,
        sameSite: 'lax',
        path: '/'
    });

    return { success: true };
}
