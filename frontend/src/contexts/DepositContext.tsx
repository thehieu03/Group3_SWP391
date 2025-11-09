import React, { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import { useDeposit } from "@hooks/useDeposit";
import type { DepositResponse } from "@services/DepositServices";

interface DepositContextValue {
  depositData: DepositResponse | null;
  status: string;
  error: string;
  loading: boolean;
  verifying: boolean;
  createDeposit: (amount: number) => Promise<void>;
  verifyDeposit: (transactionId: number) => Promise<boolean>;
  reset: () => void;
  setVerifying: (value: boolean) => void;
}

const DepositContext = createContext<DepositContextValue | undefined>(undefined);

interface DepositProviderProps {
  children: ReactNode;
  pollInterval?: number;
}

export const DepositProvider: React.FC<DepositProviderProps> = ({
  children,
  pollInterval = 5000,
}) => {
  const [verifying, setVerifying] = React.useState(false);
  const depositHook = useDeposit(pollInterval);

  const contextValue = useMemo<DepositContextValue>(
    () => ({
      depositData: depositHook.depositData,
      status: depositHook.status,
      error: depositHook.error,
      loading: depositHook.loading,
      verifying,
      createDeposit: depositHook.createDeposit,
      verifyDeposit: depositHook.verifyDeposit,
      reset: depositHook.reset,
      setVerifying,
    }),
    [
      depositHook.depositData,
      depositHook.status,
      depositHook.error,
      depositHook.loading,
      depositHook.createDeposit,
      depositHook.verifyDeposit,
      depositHook.reset,
      verifying,
    ]
  );

  return (
    <DepositContext.Provider value={contextValue}>
      {children}
    </DepositContext.Provider>
  );
};

export const useDepositContext = (): DepositContextValue => {
  const context = useContext(DepositContext);
  if (context === undefined) {
    throw new Error("useDepositContext must be used within a DepositProvider");
  }
  return context;
};

