export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-bg-light">
            <div className="relative">
                {/* Electric Blue Pulsing Spinner */}
                <div className="w-16 h-16 border-4 border-action-blue/30 border-t-action-blue rounded-full animate-spin"></div>
                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-action-blue rounded-full animate-pulse opacity-50"></div>
            </div>
            <p className="mt-4 text-primary-charcoal font-medium animate-pulse">جاري التحميل...</p>
        </div>
    );
}
