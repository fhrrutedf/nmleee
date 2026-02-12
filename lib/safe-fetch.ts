/**
 * Safe Fetch Utility
 * Handles common JSON parsing errors and provides better error messages
 */

interface FetchOptions extends RequestInit {
    timeout?: number;
}

export class FetchError extends Error {
    status?: number;
    statusText?: string;

    constructor(message: string, status?: number, statusText?: string) {
        super(message);
        this.name = 'FetchError';
        this.status = status;
        this.statusText = statusText;
    }
}

/**
 * Safe fetch wrapper that handles JSON parsing errors
 */
export async function safeFetch<T = any>(
    url: string,
    options: FetchOptions = {}
): Promise<T> {
    const { timeout = 10000, ...fetchOptions } = options;

    try {
        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
            ...fetchOptions,
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Check if response is OK
        if (!response.ok) {
            // Try to get error message from JSON
            let errorMessage = `خطأ ${response.status}: ${response.statusText}`;

            try {
                const contentType = response.headers.get('content-type');
                if (contentType?.includes('application/json')) {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorData.message || errorMessage;
                }
            } catch {
                // Ignore JSON parsing errors for error responses
            }

            throw new FetchError(errorMessage, response.status, response.statusText);
        }

        // Check content type before parsing JSON
        const contentType = response.headers.get('content-type');

        if (!contentType?.includes('application/json')) {
            // Not JSON - likely HTML error page
            const text = await response.text();
            console.error('Expected JSON but got:', text.substring(0, 200));
            throw new FetchError(
                'الخادم أرجع HTML بدلاً من JSON. قد تكون الصفحة المطلوبة غير موجودة.',
                response.status
            );
        }

        // Parse JSON safely
        const data = await response.json();
        return data as T;

    } catch (error) {
        // Handle different error types
        if (error instanceof FetchError) {
            throw error;
        }

        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                throw new FetchError('انتهت مدة الطلب. حاول مرة أخرى.');
            }

            if (error.name === 'SyntaxError') {
                throw new FetchError(
                    'خطأ في تحليل البيانات. الخادم أرجع بيانات غير صحيحة.'
                );
            }

            throw new FetchError(error.message);
        }

        throw new FetchError('حدث خطأ غير متوقع');
    }
}

/**
 * Quick API GET request
 */
export async function apiGet<T = any>(endpoint: string): Promise<T> {
    return safeFetch<T>(endpoint, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

/**
 * Quick API POST request
 */
export async function apiPost<T = any>(
    endpoint: string,
    data?: any
): Promise<T> {
    return safeFetch<T>(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
    });
}

/**
 * Quick API PUT request
 */
export async function apiPut<T = any>(
    endpoint: string,
    data?: any
): Promise<T> {
    return safeFetch<T>(endpoint, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
    });
}

/**
 * Quick API PATCH request
 */
export async function apiPatch<T = any>(
    endpoint: string,
    data?: any
): Promise<T> {
    return safeFetch<T>(endpoint, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
    });
}

/**
 * Quick API DELETE request
 */
export async function apiDelete<T = any>(endpoint: string): Promise<T> {
    return safeFetch<T>(endpoint, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

/**
 * Handle API errors in UI
 */
export function handleApiError(error: unknown): string {
    if (error instanceof FetchError) {
        return error.message;
    }

    if (error instanceof Error) {
        return error.message;
    }

    return 'حدث خطأ غير متوقع';
}
