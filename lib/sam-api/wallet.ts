export async function getActiveWalletIdentifier(provider: 'syriatel' | 'shamcash', apiKey: string): Promise<string | null> {
  try {
    const res = await fetch('https://www.sam-api.pro/api/v1/wallets', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      next: { revalidate: 3600 } // Cache for 1 hour to prevent rate limits
    });

    if (!res.ok) {
      console.error('[SAM API] Failed to fetch wallets:', await res.text());
      return null;
    }

    const wallets = await res.json();
    const activeWallet = wallets.find((w: any) => w.provider === provider && w.status === 'active');

    if (!activeWallet) {
      console.error(`[SAM API] No active wallet found for provider: ${provider}`);
      return null;
    }

    // For shamcash: use walletAddress or accountNumber
    // For syriatel: use phone or cashCode
    if (provider === 'shamcash') {
      return activeWallet.walletAddress || activeWallet.accountNumber;
    } else if (provider === 'syriatel') {
      return activeWallet.phone || activeWallet.cashCode;
    }

    return null;
  } catch (error) {
    console.error('[SAM API] Error fetching wallet identifier:', error);
    return null;
  }
}
