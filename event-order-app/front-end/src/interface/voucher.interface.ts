export interface IVoucherParam {
  id              : number;
  event_id        : number;
  code            : string;
  description     : string;
  discount_amount : number;
  sales_start     : Date | null;
  sales_end       : Date | null;
  created_at      : Date;
  updated_at      : Date;
  created_by_id   : number;
}