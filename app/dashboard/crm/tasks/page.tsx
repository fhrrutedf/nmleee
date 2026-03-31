'use client';

import { useState, useEffect } from 'react';
import { 
    FiCheckCircle, FiCircle, FiPlus, FiCalendar, FiFlag,
    FiPhone, FiMail, FiMessageSquare, FiUser, FiTrash2
} from 'react-icons/fi';

interface Task {
    id: string;
    title: string;
    description?: string;
    dueDate?: string;
    completedAt?: string;
    priority: string;
    status: string;
    type: string;
    contact?: {
        id: string;
        name: string;
        email: string;
    };
    deal?: {
        id: string;
        title: string;
    };
}

const priorityConfig = {
    high: { color: 'text-red-400', bg: 'bg-red-500/20', label: 'عالي' },
    medium: { color: 'text-yellow-400', bg: 'bg-yellow-500/20', label: 'متوسط' },
    low: { color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'منخفض' }
};

const typeIcons = {
    call: FiPhone,
    email: FiMail,
    meeting: FiUser,
    follow_up: FiMessageSquare,
    general: FiCheckCircle
};

export default function CRMTasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        fetchTasks();
    }, [filter]);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filter === 'pending') params.append('status', 'pending');
            if (filter === 'completed') params.append('status', 'completed');
            
            const response = await fetch(`/api/crm/tasks?${params}`);
            if (response.ok) {
                const data = await response.json();
                setTasks(data);
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleTaskStatus = async (taskId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
        
        try {
            const response = await fetch('/api/crm/tasks', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: taskId, status: newStatus })
            });

            if (response.ok) {
                fetchTasks();
            }
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    const deleteTask = async (taskId: string) => {
        if (!confirm('هل أنت متأكد من حذف هذه المهمة؟')) return;
        
        try {
            const response = await fetch(`/api/crm/tasks?id=${taskId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                fetchTasks();
            }
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    const stats = {
        total: tasks.length,
        pending: tasks.filter(t => t.status !== 'completed').length,
        completed: tasks.filter(t => t.status === 'completed').length,
        overdue: tasks.filter(t => {
            if (t.status === 'completed' || !t.dueDate) return false;
            return new Date(t.dueDate) < new Date();
        }).length
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A]">
            {/* Header */}
            <div className="border-b border-white/10 bg-[#0A0A0A]/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                <FiCheckCircle className="w-6 h-6 text-emerald-400" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">المهام</h1>
                                <p className="text-sm text-gray-400">إدارة المهام والمتابعات</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-colors font-medium"
                        >
                            <FiPlus className="w-5 h-5" />
                            إضافة مهمة
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="max-w-7xl mx-auto px-6 py-6">
                <div className="grid grid-cols-4 gap-4">
                    <div className="bg-[#111111] border border-white/5 rounded-xl p-5">
                        <p className="text-sm text-gray-400">الإجمالي</p>
                        <p className="text-3xl font-bold text-white mt-1">{stats.total}</p>
                    </div>
                    <div className="bg-[#111111] border border-white/5 rounded-xl p-5">
                        <p className="text-sm text-yellow-400">معلقة</p>
                        <p className="text-3xl font-bold text-white mt-1">{stats.pending}</p>
                    </div>
                    <div className="bg-[#111111] border border-white/5 rounded-xl p-5">
                        <p className="text-sm text-emerald-400">مكتملة</p>
                        <p className="text-3xl font-bold text-emerald-400 mt-1">{stats.completed}</p>
                    </div>
                    <div className="bg-[#111111] border border-white/5 rounded-xl p-5">
                        <p className="text-sm text-red-400">متأخرة</p>
                        <p className="text-3xl font-bold text-red-400 mt-1">{stats.overdue}</p>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="max-w-7xl mx-auto px-6 pb-6">
                <div className="flex items-center gap-2">
                    {[
                        { id: 'all', label: 'الكل' },
                        { id: 'pending', label: 'معلقة' },
                        { id: 'completed', label: 'مكتملة' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setFilter(tab.id as any)}
                            className={`px-5 py-2 rounded-xl text-sm font-medium transition-colors ${
                                filter === tab.id
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-[#111111] text-gray-400 hover:text-white border border-white/5'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tasks List */}
            <div className="max-w-7xl mx-auto px-6 pb-8">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-xl h-10 w-10 border-2 border-emerald-500/20 border-t-emerald-500"></div>
                    </div>
                ) : tasks.length === 0 ? (
                    <div className="text-center py-20">
                        <FiCheckCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">لا توجد مهام</h3>
                        <p className="text-gray-400 mb-6">ابدأ بإضافة مهام جديدة</p>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-colors"
                        >
                            إضافة مهمة
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {tasks.map((task) => {
                            const TypeIcon = typeIcons[task.type as keyof typeof typeIcons] || FiCheckCircle;
                            const isCompleted = task.status === 'completed';
                            const isOverdue = !isCompleted && task.dueDate && new Date(task.dueDate) < new Date();
                            
                            return (
                                <div
                                    key={task.id}
                                    className={`flex items-center gap-4 p-4 bg-[#111111] border rounded-xl transition-all ${
                                        isCompleted ? 'border-white/5 opacity-60' : 'border-white/10'
                                    }`}
                                >
                                    <button
                                        onClick={() => toggleTaskStatus(task.id, task.status)}
                                        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                            isCompleted
                                                ? 'bg-emerald-500 border-emerald-500'
                                                : 'border-gray-500 hover:border-emerald-500'
                                        }`}
                                    >
                                        {isCompleted && <FiCheckCircle className="w-4 h-4 text-white" />}
                                    </button>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className={`text-sm font-medium ${isCompleted ? 'text-gray-500 line-through' : 'text-white'}`}>
                                                {task.title}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded text-xs ${priorityConfig[task.priority as keyof typeof priorityConfig]?.bg}`}>
                                                <span className={priorityConfig[task.priority as keyof typeof priorityConfig]?.color}>
                                                    {priorityConfig[task.priority as keyof typeof priorityConfig]?.label}
                                                </span>
                                            </span>
                                        </div>
                                        
                                        {task.description && (
                                            <p className="text-sm text-gray-500 mb-1 line-clamp-1">{task.description}</p>
                                        )}

                                        <div className="flex items-center gap-4 text-xs text-gray-400">
                                            {task.dueDate && (
                                                <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-400' : ''}`}>
                                                    <FiCalendar className="w-3 h-3" />
                                                    {new Date(task.dueDate).toLocaleDateString('ar-EG')}
                                                    {isOverdue && ' (متأخرة)'}
                                                </span>
                                            )}
                                            {task.contact && (
                                                <span className="flex items-center gap-1">
                                                    <FiUser className="w-3 h-3" />
                                                    {task.contact.name}
                                                </span>
                                            )}
                                            {task.deal && (
                                                <span className="flex items-center gap-1">
                                                    <FiFlag className="w-3 h-3" />
                                                    {task.deal.title}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="p-2 bg-white/5 rounded-lg">
                                            <TypeIcon className="w-4 h-4 text-gray-400" />
                                        </span>
                                        <button
                                            onClick={() => deleteTask(task.id)}
                                            className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                                        >
                                            <FiTrash2 className="w-4 h-4 text-red-400" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
