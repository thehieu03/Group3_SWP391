import React, { useMemo, memo, useCallback } from "react";
import { useDepositContext } from "@contexts/DepositContext";

const STATUS_CONFIG = {
  SUCCESS: {
    color: "text-green-600",
    text: "Đã thanh toán",
    message: "Thanh toán thành công! Số dư của bạn đã được cập nhật.",
    bgColor: "bg-green-50 border-green-200 text-green-700",
  },
  CANCELLED: {
    color: "text-red-600",
    text: "Hết hạn",
    message: "Giao dịch đã hết hạn. Vui lòng tạo giao dịch mới.",
    bgColor: "bg-red-50 border-red-200 text-red-700",
  },
  PENDING: {
    color: "text-yellow-600",
    text: "Đang chờ thanh toán",
    message:
      "Vui lòng quét mã QR và thanh toán trong vòng 15 phút. Hệ thống sẽ tự động cập nhật trạng thái khi nhận được thanh toán.",
    bgColor: "bg-blue-50 border-blue-200 text-blue-700",
  },
} as const;

export const DepositQRCode: React.FC = memo(() => {
  const { depositData, status, verifying, verifyDeposit, reset } =
    useDepositContext();

  if (!depositData) {
    return null;
  }

  // Memoize status config để tránh tính toán lại mỗi lần render
  const statusConfig = useMemo(() => {
    return (
      STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ||
      STATUS_CONFIG.PENDING
    );
  }, [status]);

  // Memoize formatted amount
  const formattedAmount = useMemo(
    () => depositData.amount.toLocaleString("vi-VN"),
    [depositData.amount]
  );

  // Memoize handlers
  const handleVerify = useCallback(async () => {
    await verifyDeposit(depositData.transactionId);
  }, [depositData.transactionId, verifyDeposit]);

  const handleReset = useCallback(() => {
    reset();
  }, [reset]);

  return (
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
            loading="lazy"
          />
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Số tiền:</span>
          <span className="font-semibold text-gray-800">
            {formattedAmount} VNĐ
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
          <span className={`font-semibold ${statusConfig.color}`}>
            {statusConfig.text}
          </span>
        </div>
      </div>

      <div className={`${statusConfig.bgColor} border px-4 py-3 rounded`}>
        <p className="text-sm">{statusConfig.message}</p>
      </div>

      {status === "PENDING" && (
        <button
          onClick={handleVerify}
          disabled={verifying}
          className="w-full bg-yellow-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {verifying ? "Đang xác minh..." : "Xác minh thanh toán ngay"}
        </button>
      )}

      <button
        onClick={handleReset}
        className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
      >
        Tạo giao dịch mới
      </button>
    </div>
  );
});

DepositQRCode.displayName = "DepositQRCode";

