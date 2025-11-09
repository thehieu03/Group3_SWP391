import { useState, useEffect, useCallback } from "react";
import {
  depositServices,
  type DepositResponse,
  type DepositStatusResponse,
} from "@services/DepositServices";

interface UseDepositReturn {
  depositData: DepositResponse | null;
  status: string;
  error: string;
  loading: boolean;
  createDeposit: (amount: number) => Promise<void>;
  verifyDeposit: (transactionId: number) => Promise<boolean>;
  reset: () => void;
}

export const useDeposit = (pollInterval: number = 5000): UseDepositReturn => {
  const [depositData, setDepositData] = useState<DepositResponse | null>(null);
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Polling status khi có transaction PENDING
  useEffect(() => {
    if (!depositData || depositData.status !== "PENDING") {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const statusResponse = await depositServices.getDepositStatus(
          depositData.transactionId
        );
        setStatus(statusResponse.status);

        if (
          statusResponse.status === "SUCCESS" ||
          statusResponse.status === "CANCELLED"
        ) {
          clearInterval(interval);
          if (statusResponse.status === "SUCCESS") {
            // Reload sau 3 giây để cập nhật balance
            setTimeout(() => {
              window.location.reload();
            }, 3000);
          }
        }
      } catch (err) {
        console.error("Error checking deposit status:", err);
      }
    }, pollInterval);

    return () => clearInterval(interval);
  }, [depositData, pollInterval]);

  const createDeposit = useCallback(async (amount: number) => {
    setError("");
    setLoading(true);

    try {
      const amountNum = parseFloat(amount.toString());
      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error("Vui lòng nhập số tiền hợp lệ");
      }

      if (amountNum < 1000) {
        throw new Error("Số tiền tối thiểu là 1,000 VNĐ");
      }

      const response = await depositServices.createDeposit(amountNum);
      setDepositData(response);
      setStatus(response.status);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Có lỗi xảy ra khi tạo giao dịch";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyDeposit = useCallback(async (transactionId: number) => {
    setError("");
    setLoading(true);

    try {
      const response = await depositServices.verifyDeposit(transactionId);
      setStatus(response.status);

      if (response.status === "SUCCESS" && response.processed) {
        // Reload sau 2 giây để cập nhật balance
        setTimeout(() => {
          window.location.reload();
        }, 2000);
        return true;
      }

      return false;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Có lỗi xảy ra khi xác minh giao dịch";
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setDepositData(null);
    setStatus("");
    setError("");
  }, []);

  return {
    depositData,
    status,
    error,
    loading,
    createDeposit,
    verifyDeposit,
    reset,
  };
};

