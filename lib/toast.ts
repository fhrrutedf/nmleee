import toast, { Toaster, ToastOptions } from 'react-hot-toast';

// Updated at: 2026-02-16 12:20 (Fixing Vercel Build)
// Toast configuration
const defaultConfig: ToastOptions = {
    duration: 4000,
    position: 'top-center',
    style: {
        background: '#fff',
        color: '#1a1a1a',
        padding: '16px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        fontFamily: 'inherit',
    },
};

// Toast utilities
export const showToast = {
    success: (message: string, options?: ToastOptions) => {
        toast.success(message, {
            ...defaultConfig,
            duration: 3000,
            iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
            },
            ...options,
        });
    },
    error: (message: string, options?: ToastOptions) => {
        toast.error(message, {
            ...defaultConfig,
            duration: 5000,
            iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
            },
            ...options,
        });
    },
    loading: (message: string, options?: ToastOptions) => {
        return toast.loading(message, {
            ...defaultConfig,
            iconTheme: {
                primary: '#3b82f6',
                secondary: '#fff',
            },
            ...options,
        });
    },
    promise: <T,>(
        promise: Promise<T>,
        messages: {
            loading: string;
            success: string | ((data: T) => string);
            error: string | ((error: any) => string);
        },
        options?: ToastOptions
    ) => {
        return toast.promise(promise, messages, { ...defaultConfig, ...options });
    },
    dismiss: (toastId?: string) => {
        toast.dismiss(toastId);
    },
    custom: (message: string, options?: ToastOptions) => {
        toast(message, { ...defaultConfig, ...options });
    },
};

// Toaster component to be added to layout
export { Toaster };

export default showToast;
