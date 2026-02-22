import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);

export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
export const FROM_NAME = process.env.RESEND_FROM_NAME || 'المنصة';

export async function sendEmail({
    to,
    toName,
    subject,
    html,
    from,
    fromName,
}: {
    to: string;
    toName?: string;
    subject: string;
    html: string;
    from?: string;
    fromName?: string;
}) {
    try {
        const fromAddress = `${fromName || FROM_NAME} <${from || FROM_EMAIL}>`;
        const { data, error } = await resend.emails.send({
            from: fromAddress,
            to: toName ? `${toName} <${to}>` : to,
            subject,
            html,
        });

        if (error) {
            console.error('Resend error:', error);
            return { success: false, error: error.message };
        }

        return { success: true, id: data?.id };
    } catch (err: any) {
        console.error('Email send error:', err);
        return { success: false, error: err.message };
    }
}
