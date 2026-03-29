'use client';

/**
 * EarningsDashboard — Real-time seller earnings & withdrawal UI
 *
 * Features:
 *  - Live pending / available / total balance cards
 *  - Upcoming escrow release timeline
 *  - Withdrawal request modal with USDT TRC20 / wallet methods
 *  - Withdrawal history table
 *  - Auto-refreshes balance after successful withdrawal
 */

import { useState, useEffect, useCallback } from 'react';
import {
    FiDollarSign, FiClock, FiCheckCircle, FiTrendingUp,
    FiArrowDownCircle, FiRefreshCw, FiAlertTriangle,
    FiX, FiCalendar, FiList, FiShield, FiLink
} from 'react-icons/fi';
import toast from 'react-hot-toast';

// ─── Types ─────────────────────────────────────────────────

interface BalanceSummary {
    pending: number;
    available: number;
    spendable: number;
    totalEarnings: number;
    referralEarnings: number;
    pendingWithdrawals: number;
}

interface UpcomingRelease {
    releaseDate: string;
    amount: number;
}

interface WithdrawalRecord {
    id: string;
    payoutNumber: string;
    amount: number;
    method: string;
    status: 'PENDING' | 'PROCESSING' | 'PAID' | 'COMPLETED' | 'REJECTED';
    requestedAt: string;
    completedAt?: string;
    transactionId?: string;
    adminNotes?: string;
}

interface EarningsData {
    balance: BalanceSummary;
    minPayoutAmount: number;
    payoutMethodConfigured: boolean;
    withdrawals: WithdrawalRecord[];
    upcomingReleases: UpcomingRelease[];
}

// ─── Helper: Format currency ────────────────────────────────
function fmt(n: number, decimals = 2): string {
    return n.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    });
}

// ─── Status Badge ───────────────────────────────────────────
function StatusBadge({ status }: { status: WithdrawalRecord['status'] }) {
    const map: Record<string, { label: string; cls: string }> = {
        PENDING:    { label: 'قيد المراجعة', cls: 'bg-emerald-600-50 text-blue-700 border border-blue-100' },
        PROCESSING: { label: 'قيد التحويل',  cls: 'bg-emerald-600-50 text-blue-700 border border-blue-100' },
        PAID:       { label: 'تم الدفع',      cls: 'bg-emerald-600-light text-emerald-600 border border-emerald-600/10' },
        COMPLETED:  { label: 'مكتمل',         cls: 'bg-emerald-600-light text-emerald-600 border border-emerald-600/10' },
        REJECTED:   { label: 'مرفوض',         cls: 'bg-red-50 text-red-700 border border-red-100' },
    };
    const { label, cls } = map[status] || { label: status, cls: 'bg-gray-50 text-gray-600 border border-gray-100' };
    return (
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${cls}`}>
            {label}
        </span>
    );
}

// ─── Main Component ─────────────────────────────────────────
export default function EarningsDashboard() {
    const [data, setData] = useState<EarningsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'schedule'>('overview');

    // ── Fetch earnings data ─────────────────────────────────
    const fetchData = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        else setRefreshing(true);

        try {
            const res = await fetch('/api/withdraw', { cache: 'no-store' });
            if (!res.ok) throw new Error(await res.text());
            const json = await res.json();
            setData(json);
        } catch (err) {
            console.error('[EARNINGS_DASHBOARD]', err);
            toast.error('فشل تحميل بيانات الأرباح');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // ── Auto-refresh every 60 seconds ──────────────────────
    useEffect(() => {
        const interval = setInterval(() => fetchData(true), 60_000);
        return () => clearInterval(interval);
    }, [fetchData]);

    // ── Submit withdrawal ───────────────────────────────────
    const handleWithdraw = async () => {
        const amount = parseFloat(withdrawAmount);

        if (!amount || isNaN(amount) || amount <= 0) {
            return toast.error('يرجى إدخال مبلغ صحيح');
        }

        if (!data?.balance.spendable || amount > data.balance.spendable) {
            return toast.error('المبلغ أكبر من رصيدك المتاح');
        }

        if (data.minPayoutAmount && amount < data.minPayoutAmount) {
            return toast.error(`الحد الأدنى للسحب $${data.minPayoutAmount}`);
        }

        if (!data.payoutMethodConfigured) {
            return toast.error('يرجى إعداد طريقة الاستلام أولاً في الإعدادات');
        }

        setSubmitting(true);
        try {
            const res = await fetch('/api/withdraw', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount }),
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.error || 'خطأ غير معروف');
            }

            toast.success(result.message || 'تم تقديم طلب السحب بنجاح ✓');
            setShowWithdrawModal(false);
            setWithdrawAmount('');
            await fetchData(true);
        } catch (err: any) {
            toast.error(err.message || 'فشل تقديم طلب السحب');
        } finally {
            setSubmitting(false);
        }
    };

    // ── Loading skeleton ────────────────────────────────────
    if (loading) {
        return (
            <div className=" space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-28 bg-gray-50 rounded-xl" />
                    ))}
                </div>
                <div className="h-64 bg-gray-50 rounded-xl" />
            </div>
        );
    }

    if (!data) return null;

    const { balance, minPayoutAmount, payoutMethodConfigured, withdrawals, upcomingReleases } = data;
    const hasPendingWithdraw = withdrawals.some(w => w.status === 'PENDING');

    // ── Render ──────────────────────────────────────────────
    return (
        <div className="space-y-8" dir="rtl">

            {/* ── Header ─────────────────────────────────── */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-ink">لوحة الأرباح</h2>
                    <p className="text-sm text-gray-400 mt-1">جميع المبالغ بالدولار الأمريكي (USD)</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        id="refresh-earnings-btn"
                        onClick={() => fetchData(true)}
                        disabled={refreshing}
                        className="p-2.5 rounded-xl border border-gray-100 text-gray-500 hover:bg-gray-50 transition-colors"
                        title="تحديث"
                    >
                        <FiRefreshCw className={refreshing ? 'animate-spin' : ''} />
                    </button>
                    <button
                        id="open-withdraw-modal-btn"
                        onClick={() => setShowWithdrawModal(true)}
                        disabled={balance.spendable <= 0 || hasPendingWithdraw || !payoutMethodConfigured}
                        className="flex items-center gap-2 px-6 py-3 bg-ink text-white rounded-xl font-bold hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
                    >
                        <FiArrowDownCircle className="text-lg" />
                        طلب سحب
                    </button>
                </div>
            </div>

            {/* ── Alerts ─────────────────────────────────── */}
            {!payoutMethodConfigured && (
                <div className="flex items-start gap-4 p-5 bg-emerald-600-50 border border-blue-200 rounded-xl text-sm text-blue-900 shadow-sm shadow-blue-900/5">
                    <FiAlertTriangle className="mt-0.5 shrink-0 text-emerald-600-500" size={20} />
                    <p className="leading-relaxed">لم تقم بإعداد طريقة الاستلام بعد. يرجى الذهاب إلى <strong>الإعدادات → طريقة الاستلام</strong> لتفعيل السحب.</p>
                </div>
            )}
            {hasPendingWithdraw && (
                <div className="flex items-start gap-4 p-5 bg-emerald-600-50 border border-blue-100 rounded-xl text-sm text-blue-900 shadow-sm shadow-blue-900/5">
                    <FiShield className="mt-0.5 shrink-0 text-emerald-600-500" size={20} />
                    <p className="leading-relaxed">لديك طلب سحب قيد المراجعة حالياً. يمكنك تقديم طلب جديد بعد معالجة الطلب الحالي.</p>
                </div>
            )}

            {/* ── Balance Cards ───────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <BalanceCard
                    label="الرصيد المتاح"
                    value={balance.spendable}
                    icon={<FiCheckCircle />}
                    color="accent"
                    sub="قابل للسحب الآن"
                    highlight
                />
                <BalanceCard
                    label="قيد الحجز"
                    value={balance.pending}
                    icon={<FiClock />}
                    color="amber"
                    sub="سيُفرج عنه قريباً"
                />
                <BalanceCard
                    label="إجمالي الأرباح"
                    value={balance.totalEarnings}
                    icon={<FiTrendingUp />}
                    color="blue"
                    sub="منذ الانضمام"
                />
                <BalanceCard
                    label="أرباح الإحالات"
                    value={balance.referralEarnings}
                    icon={<FiLink />}
                    color="purple"
                    sub="شجرة الإحالات"
                />
            </div>

            {/* ── Tabs ───────────────────────────────────── */}
            <div className="border-b border-gray-100">
                <nav className="flex gap-2">
                    {([
                        { id: 'overview', label: 'نظرة عامة', icon: FiDollarSign },
                        { id: 'schedule', label: 'مواعيد الإفراج', icon: FiCalendar },
                        { id: 'history', label: 'سجل السحوبات', icon: FiList },
                    ] as const).map(tab => (
                        <button
                            key={tab.id}
                            id={`earnings-tab-${tab.id}`}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 transition-all ${
                                activeTab === tab.id
                                    ? 'border-emerald-600 text-emerald-600'
                                    : 'border-transparent text-gray-400 hover:text-ink'
                            }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* ── Tab Content ─────────────────────────────── */}

            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {activeTab === 'overview' && (
                    <OverviewTab balance={balance} minPayoutAmount={minPayoutAmount} />
                )}

                {activeTab === 'schedule' && (
                    <ScheduleTab releases={upcomingReleases} />
                )}

                {activeTab === 'history' && (
                    <HistoryTab withdrawals={withdrawals} />
                )}
            </div>

            {/* ── Withdraw Modal ──────────────────────────── */}
            {showWithdrawModal && (
                <WithdrawModal
                    spendable={balance.spendable}
                    minPayoutAmount={minPayoutAmount}
                    amount={withdrawAmount}
                    onAmountChange={setWithdrawAmount}
                    onSubmit={handleWithdraw}
                    onClose={() => { setShowWithdrawModal(false); setWithdrawAmount(''); }}
                    submitting={submitting}
                />
            )}
        </div>
    );
}

// ─── Sub-components ─────────────────────────────────────────

function BalanceCard({
    label, value, icon, color, sub, highlight
}: {
    label: string; value: number; icon: React.ReactNode;
    color: 'accent' | 'amber' | 'blue' | 'purple';
    sub?: string; highlight?: boolean;
}) {
    const colors = {
        accent: { bg: 'bg-emerald-600-light', icon: 'bg-emerald-600', text: 'text-emerald-600', amt: 'text-ink' },
        amber:  { bg: 'bg-emerald-600-50',     icon: 'bg-emerald-600-500',  text: 'text-blue-700', amt: 'text-ink' },
        blue:   { bg: 'bg-emerald-600-50',      icon: 'bg-emerald-600-500',   text: 'text-blue-700',  amt: 'text-ink' },
        purple: { bg: 'bg-purple-50',    icon: 'bg-purple-500', text: 'text-purple-700', amt: 'text-ink' },
    };
    const c = colors[color];
    
    return (
        <div className={`p-6 rounded-xl transition-all hover:shadow-sm ${highlight ? 'bg-ink text-white ring-1 ring-white/5' : `${c.bg} border border-transparent hover:border-gray-200`}`}>
            <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${highlight ? 'bg-surface/10' : c.icon}`}>
                    {icon}
                </div>
            </div>
            <p className={`text-3xl font-bold tracking-tight font-inter ${highlight ? 'text-white' : c.amt}`}>
                ${fmt(value)}
            </p>
            <p className={`text-xs mt-1.5 font-bold uppercase tracking-wider ${highlight ? 'text-white/60' : 'text-gray-400'}`}>{label}</p>
            {sub && <p className={`text-[10px] mt-1 ${highlight ? 'text-white/40' : 'text-gray-400'}`}>{sub}</p>}
        </div>
    );
}

function OverviewTab({ balance, minPayoutAmount }: { balance: BalanceSummary; minPayoutAmount: number }) {
    const progressPct = Math.min(100, Math.round((balance.spendable / Math.max(1, minPayoutAmount)) * 100));
    const reachedMin = balance.spendable >= minPayoutAmount;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Minimum payout progress */}
            <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-ink">الحد الأدنى للسحب</h3>
                    <span className={`text-sm font-bold font-inter ${reachedMin ? 'text-emerald-600' : 'text-gray-400'}`}>
                        ${fmt(balance.spendable)} / ${fmt(minPayoutAmount)}
                    </span>
                </div>
                <div className="h-3 bg-gray-50 rounded-xl overflow-hidden mb-6">
                    <div
                        className={`h-full rounded-xl transition-all duration-1000 ${reachedMin ? 'bg-emerald-600' : 'bg-blue-400'}`}
                        style={{ width: `${progressPct}%` }}
                    />
                </div>
                {reachedMin ? (
                    <div className="flex items-center gap-2 p-4 bg-emerald-600-light rounded-xl text-emerald-600 text-sm font-bold">
                        <FiCheckCircle size={18} />
                        وصبت للحد الأدنى — يمكنك السحب الآن!
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 bg-gray-50 p-4 rounded-xl">
                        تحتاج <span className="font-bold text-ink">${fmt(minPayoutAmount - balance.spendable)}</span> إضافية للوصول إلى الحد الأدنى
                    </p>
                )}
            </div>

            {/* Financial summary */}
            <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm">
                <h3 className="font-bold text-ink mb-6">ملخص مالي</h3>
                <div className="space-y-4">
                    {[
                        { label: 'إجمالي الأرباح', val: balance.totalEarnings, cls: 'text-ink font-bold' },
                        { label: 'قيد الحجز (Escrow)', val: balance.pending, cls: 'text-emerald-600-600' },
                        { label: 'متاح للسحب', val: balance.available, cls: 'text-emerald-600' },
                        { label: 'طلبات سحب قيد المراجعة', val: balance.pendingWithdrawals, cls: 'text-emerald-600-500' },
                        { label: 'صافي قابل للسحب', val: balance.spendable, cls: 'text-ink font-bold text-lg' },
                        { label: 'أرباح الإحالات', val: balance.referralEarnings, cls: 'text-ink' },
                    ].map(row => (
                        <div key={row.label} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0 last:pt-4 last:mt-2">
                            <span className="text-sm text-gray-500 font-medium">{row.label}</span>
                            <span className={`text-sm font-inter ${row.cls}`}>${fmt(row.val)}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function ScheduleTab({ releases }: { releases: UpcomingRelease[] }) {
    if (releases.length === 0) {
        return (
            <div className="bg-white border border-gray-100 rounded-xl p-16 shadow-sm text-center">
                <FiCalendar className="mx-auto text-4xl mb-4 text-gray-100" />
                <p className="text-gray-400 font-bold">لا توجد مبالغ معلقة قادمة</p>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-gray-50">
                <h3 className="font-bold text-ink">مواعيد الإفراج عن الأرباح المحجوزة</h3>
                <p className="text-xs text-gray-400 mt-1">يتم الإفراج تلقائياً بعد فترة الحجز</p>
            </div>
            <div className="divide-y divide-gray-50">
                {releases.map((r, i) => {
                    const date = new Date(r.releaseDate);
                    const daysLeft = Math.ceil((date.getTime() - Date.now()) / 86_400_000);
                    return (
                        <div key={i} className="flex items-center justify-between p-6 hover:bg-gray-50 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-600-50 flex items-center justify-center text-emerald-600-500">
                                    <FiClock size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-ink">
                                        {date.toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-0.5 font-bold">
                                        {daysLeft <= 0 ? 'اليوم' : `بعد ${daysLeft} يوم`}
                                    </p>
                                </div>
                            </div>
                            <span className="text-xl font-bold font-inter text-ink tracking-tight">${fmt(r.amount)}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function HistoryTab({ withdrawals }: { withdrawals: WithdrawalRecord[] }) {
    if (withdrawals.length === 0) {
        return (
            <div className="bg-white border border-gray-100 rounded-xl p-16 shadow-sm text-center">
                <FiList className="mx-auto text-4xl mb-4 text-gray-100" />
                <p className="text-gray-400 font-bold">لا توجد عمليات سحب بعد</p>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="text-right p-5 font-bold text-gray-500 uppercase tracking-widest text-[10px]">رقم الطلب</th>
                            <th className="text-right p-5 font-bold text-gray-500 uppercase tracking-widest text-[10px]">المبلغ</th>
                            <th className="text-right p-5 font-bold text-gray-500 uppercase tracking-widest text-[10px]">الطريقة</th>
                            <th className="text-right p-5 font-bold text-gray-500 uppercase tracking-widest text-[10px]">الحالة</th>
                            <th className="text-right p-5 font-bold text-gray-500 uppercase tracking-widest text-[10px]">التاريخ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {withdrawals.map(w => (
                            <tr key={w.id} className="hover:bg-gray-50 transition-all font-inter">
                                <td className="p-5 font-bold text-xs text-gray-400">#{w.payoutNumber}</td>
                                <td className="p-5 font-bold text-ink">${fmt(w.amount)}</td>
                                <td className="p-5 text-gray-500 font-bold uppercase text-[11px]">{w.method}</td>
                                <td className="p-5"><StatusBadge status={w.status} /></td>
                                <td className="p-5 text-gray-400 text-xs font-bold">
                                    {new Date(w.requestedAt).toLocaleDateString('ar-EG')}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function WithdrawModal({
    spendable, minPayoutAmount, amount, onAmountChange, onSubmit, onClose, submitting
}: {
    spendable: number;
    minPayoutAmount: number;
    amount: string;
    onAmountChange: (v: string) => void;
    onSubmit: () => void;
    onClose: () => void;
    submitting: boolean;
}) {
    const numericAmount = parseFloat(amount) || 0;
    const isValid = numericAmount >= minPayoutAmount && numericAmount <= spendable;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60  animate-in fade-in duration-300">
            <div className="bg-white rounded-xl shadow-sm w-full max-w-md p-8 animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-xl font-bold text-ink">طلب سحب الأرباح</h3>
                        <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-bold">Review-only Withdrawal</p>
                    </div>
                    <button
                        id="close-withdraw-modal-btn"
                        onClick={onClose}
                        className="p-2.5 rounded-xl hover:bg-gray-50 text-gray-400 transition-all"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                {/* Available balance */}
                <div className="bg-ink rounded-xl p-6 mb-6 text-white text-center shadow-sm shadow-ink/20">
                    <p className="text-xs text-white/40 font-bold uppercase tracking-[0.2em] mb-1">Available for Withdrawal</p>
                    <p className="text-4xl font-bold font-inter tracking-tighter">${fmt(spendable)}</p>
                    <div className="mt-4 inline-flex px-3 py-1 bg-surface/10 rounded-xl text-[10px] font-bold text-white/60">
                        Minimum Withdrawal: ${fmt(minPayoutAmount)}
                    </div>
                </div>

                {/* Amount input */}
                <div className="mb-6">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 pr-1">
                        المبلغ المراد سحبه (USD)
                    </label>
                    <div className="relative group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 font-bold font-inter">$</span>
                        <input
                            id="withdraw-amount-input"
                            type="number"
                            min={minPayoutAmount}
                            max={spendable}
                            step="0.01"
                            value={amount}
                            onChange={e => onAmountChange(e.target.value)}
                            className="w-full pl-9 pr-4 py-4 border-2 border-gray-100 rounded-xl text-xl font-bold font-inter focus:outline-none focus:border-ink transition-all text-left"
                            dir="ltr"
                            placeholder={`${minPayoutAmount}.00`}
                        />
                    </div>
                    {/* Quick fill buttons */}
                    <div className="flex gap-2 mt-4">
                        {[25, 50, 100].map(pct => {
                            const val = round2((spendable * pct) / 100);
                            if (val < minPayoutAmount) return null;
                            return (
                                <button
                                    key={pct}
                                    onClick={() => onAmountChange(val.toString())}
                                    className="text-[10px] px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-500 font-bold transition-all"
                                >
                                    {pct}% 
                                </button>
                            );
                        })}
                        <button
                            onClick={() => onAmountChange(spendable.toString())}
                            className="text-[10px] px-4 py-2 bg-emerald-600-light hover:bg-emerald-600/20 rounded-xl text-emerald-600 font-bold transition-all mr-auto"
                        >
                            سحب الكل
                        </button>
                    </div>
                    {numericAmount > 0 && !isValid && (
                        <p className="text-xs text-red-500 mt-3 flex items-center gap-1 font-bold">
                            <FiAlertTriangle size={14} />
                            {numericAmount < minPayoutAmount
                                ? `الحد الأدنى $${minPayoutAmount}`
                                : `لا يمكن سحب أكثر من $${fmt(spendable)}`}
                        </p>
                    )}
                </div>

                {/* Info */}
                <div className="bg-gray-50 rounded-xl p-4 mb-8 text-[10px] text-gray-400 font-bold space-y-2 leading-relaxed">
                    <p className="flex items-start gap-2">• <span className="flex-1">سيتم إرسال المبلغ عبر طريقة الاستلام المحددة في حسابك.</span></p>
                    <p className="flex items-start gap-2">• <span className="flex-1">رسوم السحب: لا توجد رسوم إضافية من المنصة.</span></p>
                    <p className="flex items-start gap-2">• <span className="flex-1">وقت المعالجة: من 2 إلى 3 أيام عمل للمراجعة والأمان.</span></p>
                </div>

                {/* Submit */}
                <button
                    id="confirm-withdraw-btn"
                    onClick={onSubmit}
                    disabled={!isValid || submitting}
                    className="w-full py-4 bg-ink text-white rounded-xl font-bold text-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm shadow-ink/20 active:scale-[0.98]"
                >
                    {submitting ? (
                        <span className="flex items-center justify-center gap-3">
                            <FiRefreshCw className="animate-spin" />
                            جاري إرسال الطلب...
                        </span>
                    ) : (
                        `تأكيد السحب $${numericAmount > 0 ? fmt(numericAmount) : '—'}`
                    )}
                </button>
            </div>
        </div>
    );
}

// ─── Missing helper (since we import from lib) ──────────────
function round2(n: number): number {
    return Math.round(n * 100) / 100;
}
