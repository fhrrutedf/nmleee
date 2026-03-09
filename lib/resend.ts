import nodemailer from 'nodemailer';

export const FROM_EMAIL = process.env.BREVO_FROM_EMAIL || process.env.GMAIL_USER || 'noreply@tmleen.com';
export const FROM_NAME = process.env.RESEND_FROM_NAME || 'المنصة';

// Create Brevo SMTP transporter
function createTransporter() {
    return nodemailer.createTransport({
        host: 'smtp-relay.brevo.com',
        port: 587,
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
        const transporter = createTransporter();
        const fromAddress = `${fromName || FROM_NAME} <${from || FROM_EMAIL}>`;
        const toAddress = toName ? `${toName} <${to}>` : to;

        const info = await transporter.sendMail({
            from: fromAddress,
            to: toAddress,
            subject,
            html,
        });

        console.log('✅ Email sent via Brevo:', info.messageId);
        return { success: true, id: info.messageId };
    } catch (err: any) {
        console.error('❌ Brevo email error:', err.message);
        return { success: false, error: err.message };
    }
}

// Compatibility stub for files that import `resend` directly
export const resend = {
    emails: {
        send: async (opts: any) => {
            const result = await sendEmail({
                to: Array.isArray(opts.to) ? opts.to[0] : opts.to,
                subject: opts.subject,
                html: opts.html || '<p></p>',
                from: FROM_EMAIL,
            });
            return result.success
                ? { data: { id: result.id }, error: null }
                : { data: null, error: { message: result.error } };
        },
    },
};
