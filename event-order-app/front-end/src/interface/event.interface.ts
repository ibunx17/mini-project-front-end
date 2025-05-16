import { IEventCategoryParam } from "./event-category.interface";
import { ITicketParam } from "./ticket.interface";
import { IVoucherParam } from "./voucher.interface";
import { IUserParam } from "./user.interface";

export interface IEvent {
  id           : number; 
  organizer_id : number | null;
  name         : string;
  description  : string;
  category_id  : number;
  location     : string;
  start_date   : Date | null;
  end_date     : Date | null;
  available_seats : number;
  banner_url   : string;
  status       : string;
  created_at   : Date;
  updated_at   : Date;
  category     : IEventCategoryParam | null;
  tickets      : ITicketParam[];
  vouchers     : IVoucherParam[];
  organizer    : IUserParam | null;
}