import { httpGet, httpPost } from "@utils/http";

export interface CreateDepositRequest {
  amount: number;
}

export interface DepositResponse {
  transactionId: number;
  amount: number;
  referenceCode: string;
  qrCodeUrl: string;
  status: string;
  createdAt: string | null;
}

export interface DepositStatusResponse {
  transactionId: number;
  status: string;
  amount: number;
  referenceCode: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface VerifyDepositResponse {
  transactionId: number;
  status: string;
  message: string;
  processed: boolean;
}

class DepositServices {
  async createDeposit(amount: number): Promise<DepositResponse> {
    return await httpPost<DepositResponse, CreateDepositRequest>(
      "deposit/create",
      {
        amount,
      }
    );
  }

  async getDepositStatus(
    transactionId: number
  ): Promise<DepositStatusResponse> {
    return await httpGet<DepositStatusResponse>(
      `deposit/status/${transactionId}`
    );
  }

  async verifyDeposit(transactionId: number): Promise<VerifyDepositResponse> {
    return await httpPost<VerifyDepositResponse, undefined>(
      `deposit/verify/${transactionId}`,
      undefined
    );
  }
}

export const depositServices = new DepositServices();
