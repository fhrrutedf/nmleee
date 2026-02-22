// ============================================================
// نظام إشعارات Telegram لصاحب المنصة
// ============================================================

const TELEGRAM_API = 'https://api.telegram.org/bot';

export async function sendTelegramMessage(message: string, chatId?: string) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chat = chatId || process.env.TELEGRAM_CHAT_ID;

    if (!token || !chat) {
        console.warn('Telegram not configured: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID missing');
        return { success: false, error: 'Not configured' };
    }

    try {
        const res = await fetch(`${TELEGRAM_API}${token}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chat,
                text: message,
                parse_mode: 'HTML',
            }),
        });

        const data = await res.json();
        if (!data.ok) {
            console.error('Telegram error:', data);
            return { success: false, error: data.description };
        }
        return { success: true };
    } catch (err: any) {
        console.error('Telegram send error:', err);
        return { success: false, error: err.message };
    }
}

// ─── قوالب الإشعارات ─────────────────────────────────────────────

export function newOrderMessage({ orderNumber, customerName, customerEmail, sellerName, amount, products }: {
    orderNumber: string; customerName: string; customerEmail: string;
    sellerName: string; amount: number; products: string[];
}) {
    return `
💰 <b>بيع جديد!</b>
━━━━━━━━━━━━━━
🛍️ <b>الطلب:</b> #${orderNumber}
👤 <b>العميل:</b> ${customerName}
📧 <b>الإيميل:</b> ${customerEmail}
🏪 <b>البائع:</b> ${sellerName}
📦 <b>المنتجات:</b> ${products.join(', ')}
💵 <b>المبلغ:</b> $${amount.toFixed(2)}
🕐 <b>الوقت:</b> ${new Date().toLocaleString('ar')}
  `.trim();
}

export function newUserMessage({ name, email, username }: {
    name: string; email: string; username: string;
}) {
    return `
👤 <b>مستخدم جديد!</b>
━━━━━━━━━━━━━━
📛 <b>الاسم:</b> ${name}
📧 <b>الإيميل:</b> ${email}
🔗 <b>اسم المستخدم:</b> @${username}
🕐 <b>الوقت:</b> ${new Date().toLocaleString('ar')}
  `.trim();
}

export function newPayoutMessage({ sellerName, sellerEmail, amount, method }: {
    sellerName: string; sellerEmail: string; amount: number; method: string;
}) {
    return `
🏦 <b>طلب سحب جديد!</b>
━━━━━━━━━━━━━━
👤 <b>البائع:</b> ${sellerName}
📧 <b>الإيميل:</b> ${sellerEmail}
💵 <b>المبلغ:</b> $${amount.toFixed(2)}
💳 <b>الطريقة:</b> ${method}
⏳ <b>الحالة:</b> بانتظار الموافقة
🕐 <b>الوقت:</b> ${new Date().toLocaleString('ar')}
  `.trim();
}

export function newRefundMessage({ orderNumber, customerName, amount, reason }: {
    orderNumber: string; customerName: string; amount: number; reason?: string;
}) {
    return `
⚠️ <b>طلب استرجاع مبالغ!</b>
━━━━━━━━━━━━━━
📋 <b>الطلب:</b> #${orderNumber}
👤 <b>العميل:</b> ${customerName}
💵 <b>المبلغ:</b> $${amount.toFixed(2)}
📝 <b>السبب:</b> ${reason || 'لم يُحدد'}
🕐 <b>الوقت:</b> ${new Date().toLocaleString('ar')}
  `.trim();
}

export function cryptoPaymentMessage({ orderNumber, coin, amount, customerEmail }: {
    orderNumber: string; coin: string; amount: number; customerEmail: string;
}) {
    return `
🪙 <b>دفع كريبتو مؤكد!</b>
━━━━━━━━━━━━━━
📋 <b>الطلب:</b> #${orderNumber}
💎 <b>العملة:</b> ${coin.toUpperCase()}
💵 <b>المبلغ:</b> ${amount}
📧 <b>العميل:</b> ${customerEmail}
✅ <b>الحالة:</b> مؤكد ومدفوع
🕐 <b>الوقت:</b> ${new Date().toLocaleString('ar')}
  `.trim();
}

export function dailyReportMessage({ totalOrders, totalRevenue, newUsers, pendingPayouts }: {
    totalOrders: number; totalRevenue: number; newUsers: number; pendingPayouts: number;
}) {
    return `
📊 <b>التقرير اليومي للمنصة</b>
━━━━━━━━━━━━━━
🛍️ <b>الطلبات اليوم:</b> ${totalOrders}
💰 <b>الإيرادات اليوم:</b> $${totalRevenue.toFixed(2)}
👥 <b>مستخدمون جدد:</b> ${newUsers}
⏳ <b>سحوبات معلقة:</b> ${pendingPayouts}
📅 <b>التاريخ:</b> ${new Date().toLocaleDateString('ar')}
  `.trim();
}

export function manualPaymentMessage({ orderNumber, customerName, provider, amount }: {
    orderNumber: string; customerName: string; provider: string; amount: number;
}) {
    return `
📱 <b>دفع يدوي جديد يحتاج مراجعة!</b>
━━━━━━━━━━━━━━
📋 <b>الطلب:</b> #${orderNumber}
👤 <b>العميل:</b> ${customerName}
💳 <b>الطريقة:</b> ${provider}
💵 <b>المبلغ:</b> $${amount.toFixed(2)}
🔍 <b>الإجراء:</b> راجع الإيصال وأكّد الطلب
🕐 <b>الوقت:</b> ${new Date().toLocaleString('ar')}
  `.trim();
}
