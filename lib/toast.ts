import toast, { Toaster, ToastOptions } from 'react-hot-toast';

// Toast configuration
const toastConfig: ToastOptions = {
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
    success: {
        duration: 3000,
        iconTheme: {
            primary: '#10b981',
            secondary: '#fff',
        },
    },
    error: {
        duration: 5000,
        iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
        },
    },
    loading: {
        iconTheme: {
            primary: '#3b82f6',
            secondary: '#fff',
        },
    },
};

// Toast utilities
export const showToast = {
    success: (message: string, options?: ToastOptions) => {
        toast.success(message, { ...toastConfig, ...options });
    },
    error: (message: string, options?: ToastOptions) => {
        toast.error(message, { ...toastConfig, ...options });
    },
    loading: (message: string, options?: ToastOptions) => {
        return toast.loading(message, { ...toastConfig, ...options });
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
        return toast.promise(promise, messages, { ...toastConfig, ...options });
    },
    dismiss: (toastId?: string) => {
        toast.dismiss(toastId);
    },
    custom: (message: string, options?: ToastOptions) => {
        toast(message, { ...toastConfig, ...options });
    },
};

// Toaster component to be added to layout
export { Toaster };

export default showToast;
