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
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("البريد الإلكتروني وكلمة المرور مطلوبان")
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email }
                })

                if (!user) {
                    throw new Error("البريد الإلكتروني أو كلمة المرور غير صحيحة")
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                )

                if (!isPasswordValid) {
                    throw new Error("البريد الإلكتروني أو كلمة المرور غير صحيحة")
                }

                if (!user.isActive) {
                    throw new Error("حسابك غير نشط")
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    username: user.username,
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
        }
    },
    secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
