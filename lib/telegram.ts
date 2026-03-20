/**
 * Telegram Notification Helper (DISABLED)
 * All telegram integrations have been removed by user request.
 */

export async function sendTelegramMessage(message: string) {
    console.log('[Telegram Disabled]:', message);
    return { success: true, message: 'Telegram integration is disabled' };
}

export const sendTelegramAlert = sendTelegramMessage;

export function newOrderMessage() { return ''; }
export function dailyReportMessage() { return ''; }
export function newPayoutMessage() { return ''; }

export const TelegramTemplates = {
    newSeller: () => '',
    bigSale: () => '',
    bigPayout: () => '',
};
