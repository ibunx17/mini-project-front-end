export interface IUserParam {
  id : number;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: "customer" | "event_organizer";
  referral_code?: string;
  profile_picture : string;
}
