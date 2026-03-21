import { AuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

export const authOptions: AuthOptions = {
    providers: [
        // Google OAuth Provider
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),

        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                console.log('🔐 [NextAuth] Authorize called with email:', credentials?.email);

                if (!credentials?.email || !credentials?.password) {
                    console.log('❌ [NextAuth] Missing credentials');
                    throw new Error("البريد الإلكتروني وكلمة المرور مطلوبان")
                }

                try {
                    const cleanEmail = credentials.email.toLowerCase().trim();
                    const user = await prisma.user.findFirst({
                        where: { email: { equals: cleanEmail, mode: 'insensitive' } }
                    })

                    console.log('👤 [NextAuth] User found:', !!user);

                    if (!user) {
                        console.log('❌ [NextAuth] User not found');
                        throw new Error("البريد الإلكتروني أو كلمة المرور غير صحيحة")
                    }

                    if (!user.password) {
                        throw new Error("هذا الحساب مرتبط بتسجيل دخول جوجل. يرجى استخدام 'تسجيل الدخول بجوجل'")
                    }

                    const isPasswordValid = await bcrypt.compare(
                        credentials.password,
                        user.password
                    )

                    console.log('🔑 [NextAuth] Password valid:', isPasswordValid);

                    if (!isPasswordValid) {
                        console.log('❌ [NextAuth] Invalid password');
                        throw new Error("البريد الإلكتروني أو كلمة المرور غير صحيحة")
                    }

                    if (!user.isActive) {
                        console.log('❌ [NextAuth] User inactive');
                        throw new Error("حسابك غير نشط")
                    }

                    console.log('✅ [NextAuth] Auth successful for:', user.email);

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        username: user.username,
                        role: user.role,
                    }
                } catch (error) {
                    console.error('💥 [NextAuth] Auth error:', error);
                    throw error;
                }
            }
        })
    ],
    session: {
        strategy: "jwt",
        maxAge: 48 * 60 * 60, // 48 hours
        updateAge: 24 * 60 * 60, // 24 hours
    },
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async signIn({ user, account }) {
            // Handle Google OAuth sign-in
            if (account?.provider === 'google') {
                try {
                    const existingUser = await prisma.user.findUnique({
                        where: { email: user.email! },
                        select: { id: true, username: true, role: true },
                    });

                    if (!existingUser) {
                        // Create new user from Google account
                        const baseUsername = user.email!.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
                        
                        // ⚡ Fast unique username: one query instead of while loop
                        const similarUsers = await prisma.user.count({
                            where: { username: { startsWith: baseUsername } },
                        });
                        const username = similarUsers === 0 ? baseUsername : `${baseUsername}${similarUsers + 1}`;

                        const newUser = await prisma.user.create({
                            data: {
                                name: user.name || 'مستخدم جوجل',
                                email: user.email!,
                                username,
                                password: '', // Google users have no password
                                avatar: user.image || null,
                                emailVerified: true,
                            },
                            select: { id: true, username: true, role: true },
                        });

                        user.id = newUser.id;
                        user.username = newUser.username;
                        user.role = newUser.role;
                    } else {
                        user.id = existingUser.id;
                        user.username = existingUser.username;
                        user.role = existingUser.role;
                    }
                    return true;
                } catch (error) {
                    console.error('Google sign-in error:', error);
                    return false;
                }
            }
            return true;
        },
        async jwt({ token, user, account }) {
            if (user) {
                token.sub = user.id;
                token.id = (user as any).id;
                token.name = user.name;
                token.email = user.email;
                token.username = (user as any).username;
                token.role = (user as any).role;
                token.isImpersonating = (user as any).isImpersonating;
                token.originalAdminName = (user as any).originalAdminName;
            }
            
            // For Google sign-in, fetch username from DB if not in token
            if (account?.provider === 'google' && token.email && !token.username) {
                const dbUser = await prisma.user.findUnique({ where: { email: token.email as string } });
                if (dbUser) {
                    token.sub = dbUser.id;
                    token.id = dbUser.id;
                    token.username = dbUser.username;
                    token.role = dbUser.role;
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (session?.user) {
                session.user.name = token.name as string;
                session.user.email = token.email as string;
                session.user.id = token.id as string;
                session.user.username = token.username as string;
                session.user.role = token.role as string;
                (session.user as any).isImpersonating = token.isImpersonating;
                (session.user as any).originalAdminName = token.originalAdminName;
            }
            return session;
        }
    },
    secret: process.env.NEXTAUTH_SECRET,
}
