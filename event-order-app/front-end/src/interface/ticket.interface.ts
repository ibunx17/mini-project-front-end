import { ITransactionParam } from "./transaction.interface";

export interface ITicketParam {
  id: number;
  name: string;
  description: string;
  event_id: number;
  type: string;
  price: number;
  quota: number;
  remaining: number;
  sales_start: Date | null;
  sales_end: Date | null;
  created_at: Date;
  updated_at: Date;
  created_by_id: number;
  transactions?: ITransactionParam[];
}
