import React, { useState, useMemo, useCallback } from "react";
import { DepositProvider, useDepositContext } from "@contexts/DepositContext";
import { DepositForm } from "./components/DepositForm";
import { DepositQRCode } from "./components/DepositQRCode";

const DepositContent: React.FC = () => {
  const [amount, setAmount] = useState<string>("");
  const { depositData, reset } = useDepositContext();

  // Memoize handlers để tránh re-render
  const handleAmountChange = useCallback((value: string) => {
    setAmount(value);
  }, []);

  const handleReset = useCallback(() => {
    setAmount("");
    reset();
  }, [reset]);

  // Memoize để tránh re-render khi depositData thay đổi nhưng vẫn null
  const showForm = useMemo(() => !depositData, [depositData]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Nạp tiền</h2>

          {showForm ? (
            <DepositForm amount={amount} onAmountChange={handleAmountChange} />
          ) : (
            <DepositQRCode />
          )}
        </div>
      </div>
    </div>
  );
};

const Deposit: React.FC = () => {
  return (
    <DepositProvider pollInterval={5000}>
      <DepositContent />
    </DepositProvider>
  );
};

export default Deposit;

