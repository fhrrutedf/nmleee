/**
 * Telegram Notification Helper (DISABLED)
 * All telegram integrations have been removed by user request.
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

export async function sendTelegramMessage(message: string) {
    console.log('[Telegram Disabled]:', message);
    return { success: true, message: 'Telegram integration is disabled' };
}

export const sendTelegramAlert = sendTelegramMessage;

// Dummy generators that accept any arguments to prevent build errors
export function newOrderMessage(...args: any[]) { return ''; }
export function dailyReportMessage(...args: any[]) { return ''; }
export function newPayoutMessage(...args: any[]) { return ''; }

export const TelegramTemplates = {
    newSeller: (...args: any[]) => '',
    bigSale: (...args: any[]) => '',
    bigPayout: (...args: any[]) => '',
};
