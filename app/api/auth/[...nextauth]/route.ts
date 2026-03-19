import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

// تمرير خيارات إضافية لتخطي مشكلة (Host Trust Validation) و CSRF
const handler = NextAuth({
  ...authOptions,
  trustHost: true,
} as any)

export { handler as GET, handler as POST }
