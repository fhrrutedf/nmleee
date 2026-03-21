import { DefaultSession, DefaultUser } from "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            username: string;
            role: string;
            isImpersonating?: boolean;
            originalAdminName?: string;
        } & DefaultSession["user"]
    }

    interface User extends DefaultUser {
        id: string;
        username: string;
        role: string;
        isImpersonating?: boolean;
        originalAdminName?: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        username: string;
        role: string;
        isImpersonating?: boolean;
        originalAdminName?: string;
    }
}
