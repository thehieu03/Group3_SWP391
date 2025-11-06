import React, { useEffect, useState } from "react";
import { paymentHistoryServices } from "../../../services/PaymentHistoryServices";
import { useAuth } from "../../../hooks/useAuth";
import type { PaymentHistorySummary } from "@models/modelResponse/PaymentHistoryResponse.ts";

const PaymentHistory: React.FC = () => {
    const { user, isLoggedIn } = useAuth();
    const [paymentData, setPaymentData] = useState<PaymentHistorySummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


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
                
                const data = await paymentHistoryServices.getPaymentHistory(user.id);
                setPaymentData(data);
            } catch (err) {
                console.error('Error fetching payment history:', err);
                setError('Không thể tải lịch sử giao dịch');
            } finally {
                setLoading(false);
            }
        };

        fetchPaymentHistory();
    }, [isLoggedIn, user]);

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
                    <button 
                        onClick={() => window.location.reload()}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Lịch sử giao dịch</h2>
                    
                    <div className="text-right mb-4">
                        <span className="text-gray-600">Tổng tiền tạm giữ: </span>
                        <span className="font-bold text-blue-600 text-lg">
                            {formatAmount(paymentData?.totalBalance || 0)} VNĐ
                        </span>
                    </div>

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
                                {paymentData?.transactions?.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                                            Chưa có giao dịch nào
                                        </td>
                                    </tr>
                                ) : (
                                    paymentData?.transactions?.map((transaction) => (
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
