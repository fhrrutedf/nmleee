import { headers } from 'next/headers';

export async function getBaseUrl() {
    const headerList = await headers();
    const host = headerList.get('host') || 'tmleen.com';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    return `${protocol}://${host}`;
}
