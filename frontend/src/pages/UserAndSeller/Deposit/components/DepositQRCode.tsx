import React from "react";
import type { DepositResponse } from "@services/DepositServices";

interface DepositQRCodeProps {
  depositData: DepositResponse;
  status: string;
  onVerify: () => void;
  onReset: () => void;
  verifying: boolean;
}

export const DepositQRCode: React.FC<DepositQRCodeProps> = ({
  depositData,
  status,
  onVerify,
  onReset,
  verifying,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "text-green-600";
      case "CANCELLED":
        return "text-red-600";
      default:
        return "text-yellow-600";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "Đã thanh toán";
      case "CANCELLED":
        return "Hết hạn";
      default:
        return "Đang chờ thanh toán";
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "Thanh toán thành công! Số dư của bạn đã được cập nhật.";
      case "CANCELLED":
        return "Giao dịch đã hết hạn. Vui lòng tạo giao dịch mới.";
      default:
        return "Vui lòng quét mã QR và thanh toán trong vòng 15 phút. Hệ thống sẽ tự động cập nhật trạng thái khi nhận được thanh toán.";
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "bg-green-50 border-green-200 text-green-700";
      case "CANCELLED":
        return "bg-red-50 border-red-200 text-red-700";
      default:
        return "bg-blue-50 border-blue-200 text-blue-700";
    }
  };

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
          <span className={`font-semibold ${getStatusColor(status)}`}>
            {getStatusText(status)}
          </span>
        </div>
      </div>

      <div className={`${getStatusBgColor(status)} border px-4 py-3 rounded`}>
        <p className="text-sm">{getStatusMessage(status)}</p>
      </div>

      {status === "PENDING" && (
        <button
          onClick={onVerify}
          disabled={verifying}
          className="w-full bg-yellow-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {verifying ? "Đang xác minh..." : "Xác minh thanh toán ngay"}
        </button>
      )}

      <button
        onClick={onReset}
        className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
      >
        Tạo giao dịch mới
      </button>
    </div>
  );
};

