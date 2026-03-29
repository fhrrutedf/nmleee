export default function DashboardLoading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <div className="relative">
                {/* Electric Blue Pulsing Spinner */}
                <div className="w-16 h-16 border-4 border-emerald-600/30 border-t-accent rounded-xl animate-spin"></div>
                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-accent rounded-xl  opacity-50"></div>
            </div>
            <p className="mt-4 text-[#10B981] font-medium ">جاري تحميل البيانات...</p>
        </div>
    );
}
