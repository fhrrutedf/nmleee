'use client';

import { useState, useEffect } from 'react';
import { FiDownload, FiSearch } from 'react-icons/fi';

interface Customer {
    email: string;
    name: string;
    ordersCount: number;
    totalSpent: number;
    firstPurchase: string;
    lastPurchase: string;
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const response = await fetch('/api/seller/customers');
            if (response.ok) {
                const data = await response.json();
                setCustomers(data);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const exportToCSV = () => {
        const headers = ['البريد الإلكتروني', 'الاسم', 'عدد الطلبات', 'إجمالي الإنفاق', 'أول شراء', 'آخر شراء'];
        const rows = customers.map((c) => [
            c.email,
            c.name,
            c.ordersCount,
            c.totalSpent.toFixed(2),
            new Date(c.firstPurchase).toLocaleDateString('ar-EG'),
            new Date(c.lastPurchase).toLocaleDateString('ar-EG'),
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map((row) => row.join(',')),
        ].join('\n');

        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `customers_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const filteredCustomers = customers.filter((customer) =>
        customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">إدارة العملاء</h1>
                    <button
                        onClick={exportToCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <FiDownload />
                        تصدير CSV
                    </button>
                </div>

                {/* Search */}
                <div className="mb-6">
                    <div className="relative">
                        <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="البحث بالاسم أو البريد الإلكتروني..."
                            className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <p className="text-sm text-gray-600 mb-1">إجمالي العملاء</p>
                        <p className="text-3xl font-bold text-gray-900">{customers.length}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <p className="text-sm text-gray-600 mb-1">متوسط الطلبات لكل عميل</p>
                        <p className="text-3xl font-bold text-gray-900">
                            {customers.length > 0
                                ? (customers.reduce((sum, c) => sum + c.ordersCount, 0) / customers.length).toFixed(1)
                                : 0}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <p className="text-sm text-gray-600 mb-1">متوسط الإنفاق لكل عميل</p>
                        <p className="text-3xl font-bold text-gray-900">
                            {customers.length > 0
                                ? (customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length).toFixed(0)
                                : 0} ج.م
                        </p>
                    </div>
                </div>

                {/* Customers Table */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                        العميل
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                        الطلبات
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                        إجمالي الإنفاق
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                        أول شراء
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                        آخر شراء
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredCustomers.map((customer) => (
                                    <tr key={customer.email} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-gray-900">{customer.name}</p>
                                                <p className="text-sm text-gray-500">{customer.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {customer.ordersCount} طلب
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                            {customer.totalSpent.toFixed(2)} ج.م
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {new Date(customer.firstPurchase).toLocaleDateString('ar-EG')}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {new Date(customer.lastPurchase).toLocaleDateString('ar-EG')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredCustomers.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            {searchTerm ? 'لا توجد نتائج' : 'لا يوجد عملاء بعد'}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
