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
        PENDING:    { label: 'قيد المراجعة', cls: 'bg-amber-100 text-amber-700' },
        PROCESSING: { label: 'قيد التحويل',  cls: 'bg-blue-100 text-blue-700' },
        PAID:       { label: 'تم الدفع',      cls: 'bg-emerald-100 text-emerald-700' },
        COMPLETED:  { label: 'مكتمل',         cls: 'bg-emerald-100 text-emerald-700' },
        REJECTED:   { label: 'مرفوض',         cls: 'bg-red-100 text-red-700' },
    };
    const { label, cls } = map[status] || { label: status, cls: 'bg-gray-100 text-gray-600' };
    return (
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cls}`}>
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
            <div className="animate-pulse space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-28 bg-gray-100 rounded-2xl" />
                    ))}
                </div>
                <div className="h-64 bg-gray-50 rounded-2xl" />
            </div>
        );
    }

    if (!data) return null;

    const { balance, minPayoutAmount, payoutMethodConfigured, withdrawals, upcomingReleases } = data;
    const hasPendingWithdraw = withdrawals.some(w => w.status === 'PENDING');

    // ── Render ──────────────────────────────────────────────
    return (
        <div className="space-y-6" dir="rtl">

            {/* ── Header ─────────────────────────────────── */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">لوحة الأرباح</h2>
                    <p className="text-sm text-gray-500 mt-0.5">جميع المبالغ بالدولار الأمريكي (USD)</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        id="refresh-earnings-btn"
                        onClick={() => fetchData(true)}
                        disabled={refreshing}
                        className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                        title="تحديث"
                    >
                        <FiRefreshCw className={refreshing ? 'animate-spin' : ''} />
                    </button>
                    <button
                        id="open-withdraw-modal-btn"
                        onClick={() => setShowWithdrawModal(true)}
                        disabled={balance.spendable <= 0 || hasPendingWithdraw || !payoutMethodConfigured}
                        className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                    >
                        <FiArrowDownCircle className="text-lg" />
                        طلب سحب
                    </button>
                </div>
            </div>

            {/* ── Alerts ─────────────────────────────────── */}
            {!payoutMethodConfigured && (
                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-sm text-amber-800">
                    <FiAlertTriangle className="mt-0.5 shrink-0 text-amber-500" size={18} />
                    <p>لم تقم بإعداد طريقة الاستلام بعد. يرجى الذهاب إلى <strong>الإعدادات → طريقة الاستلام</strong> لتفعيل السحب.</p>
                </div>
            )}
            {hasPendingWithdraw && (
                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-2xl text-sm text-blue-800">
                    <FiShield className="mt-0.5 shrink-0 text-blue-500" size={18} />
                    <p>لديك طلب سحب قيد المراجعة حالياً. يمكنك تقديم طلب جديد بعد معالجة الطلب الحالي.</p>
                </div>
            )}

            {/* ── Balance Cards ───────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <BalanceCard
                    label="الرصيد المتاح"
                    value={balance.spendable}
                    icon={<FiCheckCircle />}
                    color="emerald"
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
            <div className="border-b border-gray-200">
                <nav className="flex gap-1">
                    {([
                        { id: 'overview', label: 'نظرة عامة', icon: FiDollarSign },
                        { id: 'schedule', label: 'مواعيد الإفراج', icon: FiCalendar },
                        { id: 'history', label: 'سجل السحوبات', icon: FiList },
                    ] as const).map(tab => (
                        <button
                            key={tab.id}
                            id={`earnings-tab-${tab.id}`}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === tab.id
                                    ? 'border-emerald-500 text-emerald-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <tab.icon size={15} />
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* ── Tab Content ─────────────────────────────── */}

            {activeTab === 'overview' && (
                <OverviewTab balance={balance} minPayoutAmount={minPayoutAmount} />
            )}

            {activeTab === 'schedule' && (
                <ScheduleTab releases={upcomingReleases} />
            )}

            {activeTab === 'history' && (
                <HistoryTab withdrawals={withdrawals} />
            )}

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
    color: 'emerald' | 'amber' | 'blue' | 'purple';
    sub?: string; highlight?: boolean;
}) {
    const colors = {
        emerald: { bg: 'bg-emerald-50', icon: 'bg-emerald-500', text: 'text-emerald-700', amt: 'text-emerald-600' },
        amber:   { bg: 'bg-amber-50',   icon: 'bg-amber-500',   text: 'text-amber-700',   amt: 'text-amber-600' },
        blue:    { bg: 'bg-blue-50',     icon: 'bg-blue-500',    text: 'text-blue-700',    amt: 'text-blue-600' },
        purple:  { bg: 'bg-purple-50',   icon: 'bg-purple-500',  text: 'text-purple-700',  amt: 'text-purple-600' },
    };
    const c = colors[color];
    return (
        <div className={`p-4 rounded-2xl ${highlight ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-200' : `${c.bg} border border-${color}-100`}`}>
            <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white ${highlight ? 'bg-white/20' : c.icon}`}>
                    {icon}
                </div>
            </div>
            <p className={`text-2xl font-bold font-mono ${highlight ? 'text-white' : c.amt}`}>
                ${fmt(value)}
            </p>
            <p className={`text-xs mt-1 font-medium ${highlight ? 'text-emerald-100' : c.text}`}>{label}</p>
            {sub && <p className={`text-xs mt-0.5 ${highlight ? 'text-white/70' : 'text-gray-500'}`}>{sub}</p>}
        </div>
    );
}

function OverviewTab({ balance, minPayoutAmount }: { balance: BalanceSummary; minPayoutAmount: number }) {
    const progressPct = Math.min(100, Math.round((balance.spendable / Math.max(1, minPayoutAmount)) * 100));
    const reachedMin = balance.spendable >= minPayoutAmount;

    return (
        <div className="space-y-6">
            {/* Minimum payout progress */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-800">الحد الأدنى للسحب</h3>
                    <span className={`text-sm font-bold ${reachedMin ? 'text-emerald-600' : 'text-gray-500'}`}>
                        ${fmt(balance.spendable)} / ${fmt(minPayoutAmount)}
                    </span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-700 ${reachedMin ? 'bg-emerald-500' : 'bg-amber-400'}`}
                        style={{ width: `${progressPct}%` }}
                    />
                </div>
                {reachedMin ? (
                    <p className="text-xs text-emerald-600 mt-2 font-medium">
                        ✓ وصلت للحد الأدنى — يمكنك السحب الآن!
                    </p>
                ) : (
                    <p className="text-xs text-gray-500 mt-2">
                        تحتاج ${fmt(minPayoutAmount - balance.spendable)} إضافية للوصول إلى الحد الأدنى
                    </p>
                )}
            </div>

            {/* Financial summary */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-4">ملخص مالي</h3>
                <div className="space-y-3">
                    {[
                        { label: 'إجمالي الأرباح', val: balance.totalEarnings, cls: 'text-gray-900' },
                        { label: 'قيد الحجز (Escrow)', val: balance.pending, cls: 'text-amber-600' },
                        { label: 'متاح للسحب', val: balance.available, cls: 'text-emerald-600' },
                        { label: 'طلبات سحب قيد المراجعة', val: balance.pendingWithdrawals, cls: 'text-blue-600' },
                        { label: 'صافي قابل للسحب', val: balance.spendable, cls: 'text-emerald-700 font-bold' },
                        { label: 'أرباح الإحالات', val: balance.referralEarnings, cls: 'text-purple-600' },
                    ].map(row => (
                        <div key={row.label} className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
                            <span className="text-sm text-gray-600">{row.label}</span>
                            <span className={`text-sm font-mono font-semibold ${row.cls}`}>${fmt(row.val)}</span>
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
            <div className="bg-white border border-gray-100 rounded-2xl p-10 shadow-sm text-center text-gray-400">
                <FiCalendar className="mx-auto text-4xl mb-3 opacity-30" />
                <p>لا توجد مبالغ معلقة قادمة</p>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-50">
                <h3 className="font-semibold text-gray-800">مواعيد الإفراج عن الأرباح المحجوزة</h3>
                <p className="text-xs text-gray-500 mt-0.5">يتم الإفراج تلقائياً بعد فترة الحجز</p>
            </div>
            <div className="divide-y divide-gray-50">
                {releases.map((r, i) => {
                    const date = new Date(r.releaseDate);
                    const daysLeft = Math.ceil((date.getTime() - Date.now()) / 86_400_000);
                    return (
                        <div key={i} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                                    <FiClock size={18} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-800">
                                        {date.toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {daysLeft <= 0 ? 'اليوم' : `بعد ${daysLeft} يوم`}
                                    </p>
                                </div>
                            </div>
                            <span className="text-lg font-bold font-mono text-emerald-600">${fmt(r.amount)}</span>
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
            <div className="bg-white border border-gray-100 rounded-2xl p-10 shadow-sm text-center text-gray-400">
                <FiList className="mx-auto text-4xl mb-3 opacity-30" />
                <p>لا توجد عمليات سحب بعد</p>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="text-right p-4 font-semibold text-gray-600">رقم الطلب</th>
                            <th className="text-right p-4 font-semibold text-gray-600">المبلغ</th>
                            <th className="text-right p-4 font-semibold text-gray-600">الطريقة</th>
                            <th className="text-right p-4 font-semibold text-gray-600">الحالة</th>
                            <th className="text-right p-4 font-semibold text-gray-600">التاريخ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {withdrawals.map(w => (
                            <tr key={w.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 font-mono text-xs text-gray-500">{w.payoutNumber}</td>
                                <td className="p-4 font-bold font-mono text-gray-900">${fmt(w.amount)}</td>
                                <td className="p-4 text-gray-600 capitalize">{w.method}</td>
                                <td className="p-4"><StatusBadge status={w.status} /></td>
                                <td className="p-4 text-gray-500 text-xs">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">طلب سحب الأرباح</h3>
                        <p className="text-sm text-gray-500 mt-0.5">سيتم المراجعة خلال 2-3 أيام عمل</p>
                    </div>
                    <button
                        id="close-withdraw-modal-btn"
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors"
                    >
                        <FiX size={20} />
                    </button>
                </div>

                {/* Available balance */}
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 mb-5">
                    <p className="text-sm text-emerald-700 font-medium">الرصيد المتاح</p>
                    <p className="text-3xl font-bold text-emerald-600 font-mono mt-1">${fmt(spendable)}</p>
                    <p className="text-xs text-emerald-600/70 mt-1">
                        الحد الأدنى: ${fmt(minPayoutAmount)}
                    </p>
                </div>

                {/* Amount input */}
                <div className="mb-5">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        المبلغ المراد سحبه (USD)
                    </label>
                    <div className="relative">
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                        <input
                            id="withdraw-amount-input"
                            type="number"
                            min={minPayoutAmount}
                            max={spendable}
                            step="0.01"
                            value={amount}
                            onChange={e => onAmountChange(e.target.value)}
                            className="w-full pr-9 pl-4 py-3 border border-gray-200 rounded-xl text-lg font-mono focus:outline-none focus:ring-2 focus:ring-emerald-400 text-left"
                            dir="ltr"
                            placeholder={`${minPayoutAmount}.00`}
                        />
                    </div>
                    {/* Quick fill buttons */}
                    <div className="flex gap-2 mt-2">
                        {[25, 50, 100].map(pct => {
                            const val = round2((spendable * pct) / 100);
                            if (val < minPayoutAmount) return null;
                            return (
                                <button
                                    key={pct}
                                    onClick={() => onAmountChange(val.toString())}
                                    className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 font-medium transition-colors"
                                >
                                    {pct}% (${fmt(val, 0)})
                                </button>
                            );
                        })}
                        <button
                            onClick={() => onAmountChange(spendable.toString())}
                            className="text-xs px-3 py-1 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-emerald-600 font-medium transition-colors"
                        >
                            الكل
                        </button>
                    </div>
                    {numericAmount > 0 && !isValid && (
                        <p className="text-xs text-red-500 mt-2">
                            {numericAmount < minPayoutAmount
                                ? `الحد الأدنى $${minPayoutAmount}`
                                : `لا يمكن سحب أكثر من $${fmt(spendable)}`}
                        </p>
                    )}
                </div>

                {/* Info */}
                <div className="bg-gray-50 rounded-xl p-3 mb-5 text-xs text-gray-600 space-y-1">
                    <p>• سيتم إرسال المبلغ عبر طريقة الاستلام المحددة في حسابك</p>
                    <p>• رسوم السحب: لا توجد رسوم إضافية من المنصة</p>
                    <p>• وقت المعالجة: 2-3 أيام عمل</p>
                </div>

                {/* Submit */}
                <button
                    id="confirm-withdraw-btn"
                    onClick={onSubmit}
                    disabled={!isValid || submitting}
                    className="w-full py-3.5 bg-emerald-600 text-white rounded-xl font-bold text-lg hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm shadow-emerald-200"
                >
                    {submitting ? (
                        <span className="flex items-center justify-center gap-2">
                            <FiRefreshCw className="animate-spin" />
                            جاري إرسال الطلب...
                        </span>
                    ) : (
                        `تأكيد سحب $${numericAmount > 0 ? fmt(numericAmount) : '—'}`
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
