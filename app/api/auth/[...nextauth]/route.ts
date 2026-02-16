import NextAuth, { AuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

export const authOptions: AuthOptions = {
    providers: [
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
                    const user = await prisma.user.findUnique({
                        where: { email: credentials.email }
                    })

                    console.log('👤 [NextAuth] User found:', !!user);

                    if (!user) {
                        console.log('❌ [NextAuth] User not found');
                        throw new Error("البريد الإلكتروني أو كلمة المرور غير صحيحة")
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
                    }
                } catch (error) {
                    console.error('💥 [NextAuth] Auth error:', error);
                    throw error;
                }
            }
        })
    ],
    session: {
        strategy: "jwt"
    },
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.sub = user.id
                token.name = user.name
                token.email = user.email
                token.username = (user as any).username
            }
            return token
        },
        async session({ session, token }) {
            if (session?.user) {
                session.user.name = token.name as string
                session.user.email = token.email as string;
                (session.user as any).id = token.sub;
                (session.user as any).username = token.username
            }
            return session
        },
        async redirect({ url, baseUrl }) {
            // If url contains /dashboard, go to dashboard
            if (url.includes('/dashboard')) {
                return `${baseUrl}/dashboard`
            }
            // Allows callback URLs on the same origin
            if (url.startsWith(baseUrl)) return url
            // Default to dashboard for sign in
            return `${baseUrl}/dashboard`
        }
    },
    secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
