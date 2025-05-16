"use client";

import { Dialog } from "@headlessui/react";
import { useState, useEffect } from "react";
import { ITicketParam } from "@/interface/ticket.interface";
import { IVoucherParam } from "@/interface/voucher.interface";
import { ICoupon } from "@/interface/coupon.interface";
import IPoint from "@/interface/point.interface";
import api from "@/lib/axiosInstance";
import { toast } from "react-toastify";
import { IUserParam } from "@/interface/user.interface";
import { useRouter } from "next/navigation";
import PaymentInfoModal from "../info";
import { date } from "yup";
import { ITransactionParam } from "@/interface/transaction.interface";

interface BuyTicketDialogProps {
  open: boolean;
  onClose: () => void;
  eventId: number;
}

export default function BuyTicketDialog({
  open,
  onClose,
  eventId,
}: BuyTicketDialogProps) {
  const [tickets, setAvailableTickets] = useState<ITicketParam[]>([]);
  const [selectedQuantities, setSelectedQuantities] = useState<{
    [ticketId: number]: number;
  }>({});
  const [vouchers, setAvailableVouchers] = useState<IVoucherParam[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState<IVoucherParam | null>(
    null
  );
  const [selectedVoucherId, setSelectedVoucherId] = useState<number | null>(
    null
  );
  const [coupon, setCoupon] = useState<ICoupon[]>([]);
  const [useCoupon, setUseCoupon] = useState(false);
  const [userPoint, setUserPoint] = useState<IPoint[]>([]); // misalnya dari API
  const [pointUsed, setPointUsed] = useState(0);
  const [ticketPrice, setTicketPrice] = useState(0);
  const [user, setUser] = useState<IUserParam | null>(null); // misalnya dari API
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [trans, setTrans] = useState<ITransactionParam | null>(null); // misalnya dari API

  useEffect(() => {
    if (open) {
      const storedUser = JSON.parse(localStorage.getItem("user") || "null");
      setUser(storedUser);
      setShowModal(false);
      const fetchTickets = async () => {
        try {
          const res = await api.get(
            `${process.env.NEXT_PUBLIC_API_URL}/api/eventorder/tickets/by-event/${eventId}`
          );
          setAvailableTickets(res.data.data); // bentuk array tiket
        } catch (err) {
          console.error("Failed to fetch tickets", err);
        }
      };
      const fetchVouchers = async () => {
        try {
          const res = await api.get(
            `${process.env.NEXT_PUBLIC_API_URL}/api/eventorder/vouchers/by-event/${eventId}`
          );
          setAvailableVouchers(res.data.data); // bentuk array tiket
        } catch (err) {
          console.error("Failed to fetch vouchers", err);
        }
      };
      const fetchCoupon = async () => {
        try {
          const res = await api.get(
            `${process.env.NEXT_PUBLIC_API_URL}/api/eventorder/coupons/by-user/${storedUser.id}`
          );
          setCoupon(res.data.data); // bentuk array tiket
        } catch (err) {
          console.error("Failed to fetch vouchers", err);
        }
      };
      const fetchPoint = async () => {
        try {
          const res = await api.get(
            `${process.env.NEXT_PUBLIC_API_URL}/api/eventorder/points/by-user/${storedUser.id}`
          );
          setUserPoint(res.data.data); // bentuk array tiket
        } catch (err) {
          console.error("Failed to fetch vouchers", err);
        }
      };
      fetchPoint();
      fetchCoupon();
      fetchVouchers();
      fetchTickets();
    }
  }, [open, eventId]);

  useEffect(() => {
    if (open) {
      // reset quantity when dialog opens
      const initial = tickets.reduce((acc, ticket) => {
        acc[ticket.id] = 0;
        return acc;
      }, {} as { [ticketId: number]: number });
      setSelectedQuantities(initial);
    }
  }, [open, tickets]);

  const handleQuantityChange = (ticketId: number, quantity: number) => {
    setSelectedQuantities((prev) => ({ ...prev, [ticketId]: quantity }));
  };

  const handleVoucherClick = (voucher: IVoucherParam) => {
    if(ticketPrice){
      setSelectedVoucher(voucher);
      setSelectedVoucherId(voucher.id);
    }
  };

  const subtotal = Object.entries(selectedQuantities).reduce(
    (acc, [ticketId, qty]) => {
      const ticket = tickets.find((t) => t.id === parseInt(ticketId));
      return acc + (ticket ? ticket.price * qty : 0);
    },
    0
  );

  useEffect(() => {
    setTicketPrice(subtotal);

  },[subtotal])
  
  const discount = selectedVoucher?.discount_amount || 0;
  const discountCoupon =
    coupon && useCoupon ? subtotal * (coupon[0].discount_amount / 100) : 0;

  const totalPrice = Math.max(
    0,
    subtotal - discount - discountCoupon - pointUsed
  ); // jaga-jaga biar gak negatif

  const handleSubmit = async () => {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const hour = String(now.getHours()).padStart(2, "0");
      const minute = String(now.getMinutes()).padStart(2, "0");
      const second = String(now.getSeconds()).padStart(2, "0");

      const timestamp = `${year}${month}${day}${hour}${minute}${second}`;
      // Misalnya: 20250512140325

      const code = `TRX-${eventId}-${user!.id}-${timestamp}`;

      const payload = {
        user_id: user!.id,
        event_id: eventId,
        code: code,
        voucher_id: selectedVoucherId,
        coupon_id: useCoupon ? coupon[0]?.id : null,
        voucher_amount: selectedVoucher?.discount_amount || 0,
        coupon_amount: useCoupon ? coupon[0]?.discount_amount : 0,
        point_amount: pointUsed,
        final_price: totalPrice,
        payment_proof: "dummy.jpg",
        status: totalPrice > 0 ? "Waiting for payment" : "approve",
        details: Object.entries(selectedQuantities)
          .filter(([_, qty]) => qty > 0)
          .map(([ticketId, qty]) => {
            const ticket = tickets.find((t) => t.id === parseInt(ticketId));
            return {
              ticket_id: parseInt(ticketId),
              qty,
              price: ticket?.price || 0,
            };
          }),
      };
      const res = await api.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/eventorder/transactions`,
        payload
      );
      localStorage.setItem("latest_transaction", JSON.stringify(res.data.data));
      const stored = JSON.parse(
        localStorage.getItem("latest_transaction") || "null"
      ) as ITransactionParam;
  
      setTrans(stored);
      if (trans?.status === "Waiting for payment") setShowModal(true);

      toast.success("Tiket berhasil dibeli!");
      onClose();
//      router.push("/transaction/info");
    } catch (err) {
      toast.error("Gagal membeli tiket.");
      console.error(err);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        className="fixed z-10 inset-0 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen px-4">
          <Dialog.Panel className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
            <Dialog.Title className="text-xl font-bold mb-6">
              Pilih Tiket
            </Dialog.Title>
            <div className="flex flex-cols-2 gap-4">
              <div>
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="w-[300px] border p-4 rounded-md mb-4"
                  >
                    <div className="flex justify-between">
                      <div>
                        <h2 className="font-semibold text-lg">{ticket.name}</h2>
                        <p className="text-gray-600">{ticket.description}</p>
                        <p className="text-sm text-gray-500">
                          Remaining Seats: {ticket.remaining}
                        </p>
                        <p className="text-sm text-gray-700">
                          Price: {Number(ticket.price).toLocaleString("id-ID", {
                            style: "currency",
                            currency: "IDR",
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                        })}                        
                      </p>
                      </div>
                      <div>
                        <select
                          className="border rounded p-1"
                          value={selectedQuantities[ticket.id] || 0}
                          onChange={(e) =>
                            handleQuantityChange(
                              ticket.id,
                              parseInt(e.target.value)
                            )
                          }
                        >
                          {[0, 1, 2, 3, 4, 5].map((qty) => (
                            <option
                              key={qty}
                              value={qty}
                              disabled={qty > ticket.remaining}
                            >
                              {qty}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
                <p className="text-lg font-semibold">
                  Discount Voucher: {selectedVoucher && selectedVoucher.discount_amount 
                    ? Number(selectedVoucher.discount_amount).toLocaleString("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })
                    : 0}
                </p>
                <p className="text-lg font-semibold">
                  Discount Point : {Number(pointUsed).toLocaleString(
                    "id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                  })}
                </p>
                <p className="text-lg font-semibold">
                  Discount Coupon :{" "}
                  {coupon[0]?.discount_amount.toLocaleString()}%
                </p>
                <p className="text-lg font-semibold">
                  Total: {Number(totalPrice).toLocaleString(
                    "id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                  })}
                </p>
              </div>
              <div>
                {vouchers.map((voucher) => (
                  <div
                    key={voucher.id}
                    onClick={() => {
                      handleVoucherClick(voucher);
                    }}
                    className={`w-[300px] border p-4 rounded-md mb-4 cursor-pointer ${
                      selectedVoucherId === voucher.id
                        ? "bg-blue-100 border-blue-500"
                        : ""
                    }`}
                  >
                    <div className="flex justify-between">
                      <div>
                        <h2 className="font-semibold text-lg">
                          {voucher.code}
                        </h2>
                        <p className="text-gray-600">{voucher.description}</p>
                        <p className="text-sm text-gray-700">
                          Discount Amount: 
                          {Number(voucher.discount_amount).toLocaleString(
                            "id-ID", {
                            style: "currency",
                            currency: "IDR",
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,}                            
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {coupon[0] && (
                  <div className="mb-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={useCoupon}
                        onChange={() => setUseCoupon(!useCoupon)}
                        className="mr-2"
                      />
                      <span>
                        {coupon[0]?.code} ({coupon[0]?.discount_amount}% diskon)
                      </span>
                    </label>
                  </div>
                )}
                <div className="mb-4">
                  <label className="block font-medium mb-1">
                    Poin (Max: {userPoint[0]?.point ? userPoint[0]?.point : 0})
                  </label>
                  <input
                    type="number"
                    className="border p-2 rounded w-full max-w-xs"
                    value={pointUsed}
                    onChange={(e) => {
                      const val = e.target.value;
                      const parsed = parseInt(val);

                      if (!isNaN(parsed)) {
                        const maxPoint = userPoint[0]?.point || 0;
                        setPointUsed(Math.min(Math.max(parsed, 0), maxPoint));
                      } else {
                        setPointUsed(0);
                      }
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end ">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md"
                >
                  Beli Tiket
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
      {showModal && (
      <PaymentInfoModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
      )
        }
    </>
  );
}
