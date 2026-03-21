const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export async function sendTelegramMessage(message: string) {
    if (!BOT_TOKEN || !CHAT_ID) {
        console.warn('[Telegram] Missing credentials');
        return { success: false, error: 'Missing credentials' };
    }

    try {
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                parse_mode: 'HTML',
            }),
        });

        const data = await response.json();
        return { success: data.ok, data };
    } catch (error) {
        console.error('[Telegram] Error:', error);
        return { success: false, error };
    }
}

export const sendTelegramAlert = async (message: string) => {
    return sendTelegramMessage(`🚨 <b>تنبيه أمني (نظام الرقابة):</b>\n\n${message}`);
};

// Templates for high-priority alerts
export const AuditTemplates = {
    sensitiveAction: (actor: string, action: string, details: string) => 
        `🔑 <b>إجراء حساس:</b>\n👤 المنفذ: ${actor}\n⚡ الحركة: ${action}\n📝 التفاصيل: ${details}`,
    failure: (type: string, error: string) => 
        `❌ <b>فشل عملية:</b>\n📦 النوع: ${type}\n⚠️ الخطأ: ${error}`,
};

// Legacy placeholders for compatibility
export function newOrderMessage(...args: any[]) { return ''; }
export function dailyReportMessage(...args: any[]) { return ''; }
export function newPayoutMessage(...args: any[]) { return ''; }

export const TelegramTemplates = {
    newSeller: (...args: any[]) => '',
    bigSale: (...args: any[]) => '',
    bigPayout: (...args: any[]) => '',
};
