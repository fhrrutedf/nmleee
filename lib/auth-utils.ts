import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { sendGuestWelcomeEmail } from '@/lib/email';

export async function ensureUserAccount(email: string, name: string): Promise<string> {
    const cleanEmail = email.toLowerCase().trim();
    const existingUser = await prisma.user.findFirst({
        where: { email: { equals: cleanEmail, mode: 'insensitive' } }
    });

    if (existingUser) {
        return existingUser.id;
    }

    // Generate random 8-character string for password
    const plainPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4);
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    
    // Generate unique username
    const baseUsername = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    let username = baseUsername;
    let count = 1;
    while (await prisma.user.findUnique({ where: { username } })) {
        username = `${baseUsername}${count++}`;
    }

    // Create the user
    const newUser = await prisma.user.create({
        data: {
            email: cleanEmail,
            name: name || 'مستخدم جديد',
            username,
            password: hashedPassword,
            role: 'CUSTOMER',
        }
    });

    // Send Welcome Email with Password to the user
    await sendGuestWelcomeEmail(email, name || 'طالبنا العزيز', plainPassword);
    
    return newUser.id;
}
