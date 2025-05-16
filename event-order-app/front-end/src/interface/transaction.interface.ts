import { IEvent } from "./event.interface";
interface ITransactionDetailParam {
  ticket_id: number;
  qty: number;
  price: number;
  subtotal : number;  
}

export interface ITransaction {
  id : number;
  code : string;
  user_id: number;
  event_id: number;
  voucher_id: number;
  coupon_id: number;
  voucher_amount: number;
  point_amount: number;
  coupon_amount: number;
  final_price: number;
  payment_proof: string;
  status: string;
  created_at: Date;
  details: ITransactionDetailParam[];
}

export interface ITransactionParam {
  id : number;
  code : string;
  user_id: number;
  event_id: number;
  voucher_id: number;
  coupon_id: number;
  voucher_amount: number;
  point_amount: number;
  coupon_amount: number;
  final_price: number;
  payment_proof: string;
  status: string;
  created_at: Date;
  event: IEvent;
  details: ITransactionDetailParam[];
}

