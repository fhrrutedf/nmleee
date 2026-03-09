import nodemailer from 'nodemailer';

export const FROM_EMAIL = process.env.EMAIL_FROM || process.env.GMAIL_USER || '';
export const FROM_NAME = process.env.RESEND_FROM_NAME || 'المنصة';

// Create transporter - supports Gmail SMTP
function createTransporter() {
    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD;

    if (gmailUser && gmailPass) {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: gmailUser,
                pass: gmailPass,
            },
        });
    }

    // Fallback: generic SMTP
    const emailServer = process.env.EMAIL_SERVER;
    if (emailServer) {
        return nodemailer.createTransport(emailServer);
    }

    throw new Error('No email configuration found. Set GMAIL_USER and GMAIL_APP_PASSWORD in environment variables.');
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

        console.log('✅ Email sent:', info.messageId);
        return { success: true, id: info.messageId };
    } catch (err: any) {
        console.error('❌ Email send error:', err.message);
        return { success: false, error: err.message };
    }
}

// Keep resend export for any files that still import it directly (stub)
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
