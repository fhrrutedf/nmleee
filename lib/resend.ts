import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import { render } from '@react-email/components';

export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || process.env.BREVO_FROM_EMAIL || process.env.GMAIL_USER || 'noreply@tmleen.com';
export const FROM_NAME = process.env.RESEND_FROM_NAME || 'تمالين';

const resendClient = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Create SMTP transporter as fallback
function createTransporter() {
    return nodemailer.createTransport({
        host: process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
        port: Number(process.env.BREVO_SMTP_PORT) || 587,
        secure: false,
        auth: {
            user: process.env.BREVO_SMTP_USER || '',
            pass: process.env.BREVO_SMTP_KEY || '',
        },
    });
}

export async function sendEmail({
    to,
    toName,
    subject,
    html,
    react,
    from,
    fromName,
}: {
    to: string;
    toName?: string;
    subject: string;
    html?: string;
    react?: React.ReactElement;
    from?: string;
    fromName?: string;
}) {
    try {
        const fromAddress = fromName || from ? `${fromName || FROM_NAME} <${from || FROM_EMAIL}>` : `${FROM_NAME} <${FROM_EMAIL}>`;
        const toAddress = toName ? `${toName} <${to}>` : to;

        // 1. Try Resend SDK first
        if (resendClient) {
            const { data, error } = await resendClient.emails.send({
                from: fromAddress,
                to: [to],
                subject,
                html: html || undefined,
                react: react || undefined,
            });

            if (!error) {
                console.log('✅ Email sent via Resend:', data?.id);
                return { success: true, id: data?.id };
            }
            console.warn('⚠️ Resend failed, falling back to SMTP:', error);
        }

        // 2. Fallback to SMTP
        const transporter = createTransporter();
        const htmlContent = react ? await render(react) : html || '';
        
        const info = await transporter.sendMail({
            from: fromAddress,
            to: toAddress,
            subject,
            html: htmlContent,
        });

        console.log('✅ Email sent via SMTP (Fallback):', info.messageId);
        return { success: true, id: info.messageId };
    } catch (err: any) {
        console.error('❌ All email providers failed:', err.message);
        return { success: false, error: err.message };
    }
}

// Compatibility stub for existing imports
export const resend = {
    emails: {
        send: async (opts: any) => {
            const result = await sendEmail({
                to: Array.isArray(opts.to) ? opts.to[0] : opts.to,
                subject: opts.subject,
                html: opts.html || '<p></p>',
                from: opts.from || FROM_EMAIL,
                fromName: opts.fromName || FROM_NAME,
            });
            return result.success
                ? { data: { id: result.id }, error: null }
                : { data: null, error: { message: result.error } };
        },
    },
};
