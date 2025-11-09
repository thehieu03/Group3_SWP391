import React, { useState } from "react";
import { useDeposit } from "@hooks/useDeposit";
import { DepositForm } from "./components/DepositForm";
import { DepositQRCode } from "./components/DepositQRCode";

const Deposit: React.FC = () => {
  const [amount, setAmount] = useState<string>("");
  const [verifying, setVerifying] = useState(false);
  const {
    depositData,
    status,
    error,
    loading,
    createDeposit,
    verifyDeposit,
    reset,
  } = useDeposit();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createDeposit(parseFloat(amount));
    } catch (err) {
      // Error đã được xử lý trong hook
    }
  };

  const handleVerify = async () => {
    if (!depositData) return;
    
    setVerifying(true);
    try {
      await verifyDeposit(depositData.transactionId);
    } catch (err) {
      // Error đã được xử lý trong hook
    } finally {
      setVerifying(false);
    }
  };

  const handleReset = () => {
    setAmount("");
    reset();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Nạp tiền</h2>

          {!depositData ? (
            <DepositForm
              amount={amount}
              onAmountChange={setAmount}
              onSubmit={handleSubmit}
              loading={loading}
              error={error}
            />
          ) : (
            <DepositQRCode
              depositData={depositData}
              status={status}
              onVerify={handleVerify}
              onReset={handleReset}
              verifying={verifying}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Deposit;

