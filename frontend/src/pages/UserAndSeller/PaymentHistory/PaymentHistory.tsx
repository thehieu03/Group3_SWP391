import React, { useEffect, useState } from "react";
import { paymentHistoryServices } from "@services/PaymentHistoryServices";
import { useAuth } from "@hooks/useAuth";
import type { PaymentHistorySummary } from "@models/modelResponse/PaymentHistoryResponse";
import Pagination from "@components/Pagination/Pagination";
import Button from "@components/Button/Button";

const PaymentHistory: React.FC = () => {
    const { user, isLoggedIn } = useAuth();
    const [paymentData, setPaymentData] = useState<PaymentHistorySummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Filter states
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [transactionType, setTransactionType] = useState<string>('');
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(5);


    useEffect(() => {
        const fetchPaymentHistory = async () => {
            if (!isLoggedIn || !user) {
                setError('Bạn cần đăng nhập để xem lịch sử giao dịch');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                
                const data = await paymentHistoryServices.getPaymentHistory(
                    user.id, 
                    startDate || undefined, 
                    endDate || undefined, 
                    transactionType || undefined,
                    currentPage,
                    pageSize
                );
                setPaymentData(data);
            } catch (err: unknown) {
                console.error('Error fetching payment history:', err);
                const errorMessage = err instanceof Error ? err.message : 'Không thể tải lịch sử giao dịch';
                setError(errorMessage);
                setPaymentData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchPaymentHistory();
    }, [isLoggedIn, user, startDate, endDate, transactionType, currentPage, pageSize]);

    // Reset to first page when filters or page size change
    useEffect(() => {
        setCurrentPage(1);
    }, [startDate, endDate, transactionType, pageSize]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('vi-VN').format(amount);
    };

    const getTransactionTypeClass = (type: string) => {
        switch (type) {
            case 'Nạp tiền':
                return 'deposit';
            case 'Mua Hàng':
                return 'purchase';
            case 'Rút tiền':
                return 'withdraw';
            default:
                return 'deposit';
        }
    };

    const getTransactionTypeLabel = (type: string) => {
        switch (type) {
            case 'Nạp tiền':
                return 'Deposit';
            case 'Mua Hàng':
                return 'Purchase';
            case 'Rút tiền':
                return 'Withdrawal';
            default:
                return 'Deposit';
        }
    };

    const getAmountClass = (type: string) => {
        return type === 'Nạp tiền' ? 'positive' : 'negative';
    };

    const getAmountSign = (type: string) => {
        return type === 'Nạp tiền' ? '+' : '-';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải lịch sử giao dịch...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <Button 
                        onClick={() => window.location.reload()}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                    >
                        Thử lại
                    </Button>
                </div>
            </div>
        );
    }

    const clearFilters = () => {
        setStartDate('');
        setEndDate('');
        setTransactionType('');
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    // If no payment data and not loading/error, show empty state
    if (!loading && !error && !paymentData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">Không có dữ liệu giao dịch</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Lịch sử giao dịch</h2>
                    
                    {/* Filters */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">Bộ lọc</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Từ ngày</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Đến ngày</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Loại giao dịch</label>
                                <select
                                    value={transactionType}
                                    onChange={(e) => setTransactionType(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Tất cả</option>
                                    <option value="Nạp tiền">Nạp tiền</option>
                                    <option value="Mua Hàng">Mua Hàng</option>
                                    <option value="Rút tiền">Rút tiền</option>
                                </select>
                            </div>
                            <div className="flex items-end">
                                <Button
                                    onClick={clearFilters}
                                    className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                                >
                                    Xóa bộ lọc
                                </Button>
                            </div>
                        </div>
                    </div>
                    
                    {/* Balance Information */}
                    {paymentData && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <div className="text-sm text-blue-600 mb-1">Số dư hiện tại</div>
                                <div className="text-2xl font-bold text-blue-800">
                                    {formatAmount(paymentData.totalBalance || 0)} VNĐ
                                </div>
                            </div>
                            <div className="bg-orange-50 p-4 rounded-lg">
                                <div className="text-sm text-orange-600 mb-1">Tiền tạm giữ</div>
                                <div className="text-2xl font-bold text-orange-800">
                                    {formatAmount(paymentData.moneyOnHold || 0)} VNĐ
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b">Ngày</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b">Loại</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b">Số tiền</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b">Lý do</th>
                                </tr>
                            </thead>
                            <tbody>
                                {!paymentData || !paymentData.transactions || paymentData.transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                                            Chưa có giao dịch nào
                                        </td>
                                    </tr>
                                ) : (
                                    paymentData.transactions.map((transaction) => (
                                        <tr key={transaction.id} className="border-b hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm text-gray-700">
                                                {formatDate(transaction.createdAt)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${getTransactionTypeClass(transaction.type)}`}>
                                                    {getTransactionTypeLabel(transaction.type)}
                                                </span>
                                            </td>
                                            <td className={`px-4 py-3 font-bold ${getAmountClass(transaction.type)}`}>
                                                {getAmountSign(transaction.type)}{formatAmount(transaction.amount)}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-700">
                                                {transaction.paymentDescription}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {paymentData && (
                        <div className="mt-4 flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                Hiển thị {paymentData.transactions?.length || 0} trong tổng số {paymentData.totalItems || 0} giao dịch
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-sm text-gray-600">Hiển thị:</label>
                                <select
                                    value={pageSize}
                                    onChange={(e) => setPageSize(Number(e.target.value))}
                                    className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                </select>
                            </div>
                        </div>
                    )}
                    
                    {paymentData && paymentData.totalPages > 1 && (
                        <div className="mt-6">
                            <Pagination
                                currentPage={paymentData.currentPage}
                                totalPages={paymentData.totalPages}
                                onPageChange={handlePageChange}
                                className="mt-6"
                            />
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .deposit {
                    background: #28a745;
                    color: white;
                }
                .purchase {
                    background: #ffc107;
                    color: #333;
                }
                .withdraw {
                    background: #dc3545;
                    color: white;
                }
                .positive {
                    color: #28a745;
                }
                .negative {
                    color: #dc3545;
                }
            `}</style>
        </div>
    );
};

export default PaymentHistory;
