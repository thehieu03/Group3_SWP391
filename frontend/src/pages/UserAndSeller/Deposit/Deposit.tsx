import React, { useState, useEffect } from "react";
import { depositServices, type DepositResponse } from "@services/DepositServices";

const Deposit: React.FC = () => {
  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [depositData, setDepositData] = useState<DepositResponse | null>(null);
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (depositData && depositData.status === "PENDING") {
      const interval = setInterval(async () => {
        try {
          const statusResponse = await depositServices.getDepositStatus(
            depositData.transactionId
          );
          setStatus(statusResponse.status);
          
            if (statusResponse.status === "SUCCESS" || statusResponse.status === "CANCELLED") {
            clearInterval(interval);
            if (statusResponse.status === "SUCCESS") {
              setTimeout(() => {
                window.location.reload();
              }, 3000);
            }
          }
        } catch (err) {
          console.error("Error checking deposit status:", err);
        }
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [depositData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        setError("Vui lòng nhập số tiền hợp lệ");
        setLoading(false);
        return;
      }

      const response = await depositServices.createDeposit(amountNum);
      setDepositData(response);
      setStatus(response.status);
    } catch (err: any) {
      setError(err.response?.data?.message || "Có lỗi xảy ra khi tạo giao dịch");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setAmount("");
    setDepositData(null);
    setStatus("");
    setError("");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Nạp tiền</h2>

          {!depositData ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Số tiền nạp (VNĐ)
                </label>
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Nhập số tiền"
                  min="1000"
                  step="1000"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Số tiền tối thiểu: 1,000 VNĐ
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Đang xử lý..." : "Thanh toán"}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Quét mã QR để thanh toán
                </h3>
                <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
                  <img
                    src={depositData.qrCodeUrl}
                    alt="VietQR Code"
                    className="w-64 h-64 mx-auto"
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Số tiền:</span>
                  <span className="font-semibold text-gray-800">
                    {depositData.amount.toLocaleString("vi-VN")} VNĐ
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mã tham chiếu:</span>
                  <span className="font-mono text-sm text-gray-800">
                    {depositData.referenceCode}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Trạng thái:</span>
                  <span
                    className={`font-semibold ${
                      status === "SUCCESS"
                        ? "text-green-600"
                        : status === "CANCELLED"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {status === "SUCCESS"
                      ? "Đã thanh toán"
                      : status === "CANCELLED"
                      ? "Hết hạn"
                      : "Đang chờ thanh toán"}
                  </span>
                </div>
              </div>

              {status === "PENDING" && (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
                  <p className="text-sm">
                    Vui lòng quét mã QR và thanh toán trong vòng 15 phút. Hệ thống sẽ tự động
                    cập nhật trạng thái khi nhận được thanh toán.
                  </p>
                </div>
              )}

              {status === "SUCCESS" && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                  <p className="text-sm font-semibold">
                    Thanh toán thành công! Số dư của bạn đã được cập nhật.
                  </p>
                </div>
              )}

              {status === "CANCELLED" && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  <p className="text-sm">
                    Giao dịch đã hết hạn. Vui lòng tạo giao dịch mới.
                  </p>
                </div>
              )}

              <button
                onClick={handleReset}
                className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
              >
                Tạo giao dịch mới
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Deposit;

