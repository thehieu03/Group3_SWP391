import React from "react";

interface DepositFormProps {
  amount: string;
  onAmountChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  error: string;
}

export const DepositForm: React.FC<DepositFormProps> = ({
  amount,
  onAmountChange,
  onSubmit,
  loading,
  error,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
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
          onChange={(e) => onAmountChange(e.target.value)}
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
  );
};

