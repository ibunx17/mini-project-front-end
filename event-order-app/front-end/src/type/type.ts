// types.ts
export type TransactionStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "canceled";

export type Transaction = {
  id: string;
  event: string;
  ticketType: string;
  quantity: number;
  quota?: number;
  status: TransactionStatus;
  user: {
    name: string;
    email: string;
    phone: string;
  };
  paymentProof: string;
  date: string;
  paymentDue?: Date; // Add payment deadline
  canceledReason?: string; // Predefined reasons
};
