'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiBell, FiDollarSign, FiShoppingBag, FiUserPlus } from 'react-icons/fi';

export const NotificationListener = () => {
    const [lastRefreshed, setLastRefreshed] = useState(Date.now());

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await fetch('/api/notifications');
                if (!res.ok) return;
                
                const notifications: any[] = await res.json();
                
                // Only show toasts for unread notifications from the last minute or so
                // to avoid double-toasting on initial load
                notifications.forEach(notif => {
                    const isNew = new Date(notif.createdAt).getTime() > lastRefreshed;
                    if (!notif.isRead && isNew) {
                        showToast(notif);
                    }
                });
                
                setLastRefreshed(Date.now());
            } catch (err) {
                console.error('Failed to poll notifications', err);
            }
        };

        const showToast = (notif: any) => {
            const icon = 
                notif.type === 'SALE' ? <FiDollarSign className="text-green-500" /> :
                notif.type === 'CUSTOMER' ? <FiUserPlus className="text-[#10B981]-500" /> :
                notif.type === 'ORDER' ? <FiShoppingBag className="text-purple-500" /> :
                <FiBell className="text-[#10B981]" />;

            toast.custom((t) => (
                <div
                    className={`${
                        t.visible ? 'animate-enter' : 'animate-leave'
                    } max-w-md w-full bg-[#0A0A0A] dark:bg-card-white shadow-lg shadow-[#10B981]/20 rounded-[2rem] pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-white/10 dark:border-gray-800`}
                >
                    <div className="flex-1 w-0 p-5">
                        <div className="flex items-start">
                            <div className="flex-shrink-0 pt-0.5">
                                <div className="w-12 h-12 rounded-xl bg-[#111111] dark:bg-gray-800 flex items-center justify-center text-2xl shadow-inner">
                                    {icon}
                                </div>
                            </div>
                            <div className="mr-4 flex-1">
                                <p className="text-sm font-bold text-[#10B981] dark:text-white">
                                    {notif.title}
                                </p>
                                <p className="mt-1 text-sm text-text-muted">
                                    {notif.message}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex border-r border-white/10 dark:border-gray-800">
                        <button
                            onClick={() => {
                                toast.dismiss(t.id);
                                markAsRead(notif.id);
                            }}
                            className="w-full border border-transparent rounded-none rounded-l-2xl p-4 flex items-center justify-center text-sm font-bold text-[#10B981] hover:text-[#10B981] focus:outline-none"
                        >
                            تجاهل
                        </button>
                    </div>
                </div>
            ), { duration: 6000 });
        };

        const markAsRead = async (id: string) => {
            await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
        };

        // Poll every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [lastRefreshed]);

    return null;
};
