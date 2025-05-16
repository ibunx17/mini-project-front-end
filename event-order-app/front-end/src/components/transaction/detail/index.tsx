"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IEvent } from "@/interface/event.interface";
import Link from "next/link";
import { useAppSelector, useAppDispatch } from "@/lib/redux/hooks";
import { useSearchParams } from 'next/navigation';
import { setCategories, setLocations } from "@/lib/redux/slices/eventSlice";
import api from "@/lib/axiosInstance";
import { IEventCategoryParam } from "@/interface/event-category.interface";
import { ITransactionParam}  from "@/interface/transaction.interface";
import { IUserParam } from "@/interface/user.interface";
import PaymentInfoModal from "../info";

export default function DetailTransaction() {
  const [transactions, setTransactions] = useState<ITransactionParam[]>([]);
  const [eventsSearch, setEventsSearch] = useState<IEvent[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const keyword = searchParams.get('keyword');
  const [loading, setLoading] = useState(true);
  const dispatch = useAppDispatch();
  const [user, setUser] = useState<IUserParam|null>(null); // misalnya dari API
  const [showModal, setShowModal] = useState(false);
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    setUser(storedUser);
    setShowModal(false);
    api.get(`${process.env.NEXT_PUBLIC_API_URL}/api/eventorder/transactions/by-user/${storedUser.id}`)
      .then((res) => {
        const transactionList = res.data.data as ITransactionParam[];
        console.log(transactionList);
        setTransactions(transactionList);
      })
      .catch((err) => console.error("Error fetching transactions:", err));
    }, []);

  return (
    <>
      <div className="pt-[80px] px-4 sm:pt-[96px]">
      <div className="mb-4">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-blue-600 hover:underline"
        >
          ← Back to Home
        </Link>
      </div>
      <div className="flex flex-col space-y-6">
          {/* Transaction Cards */}
          <div className="flex justify-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="cursor-pointer bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow w-[190px] flex flex-col justify-between"
                >
                  {/* Banner Image */}
                  <img
                    src={transaction.event.banner_url}
                    alt={transaction.event.name}
                    className="w-full aspect-[3/2] object-cover"
                  />

                  {/* Transaction Info */}
                  <div className="p-4 flex-grow flex flex-col justify-between min-h-[120px]">
                    <div className="text-xs font-semibold mb-1 line-clamp-2">
                      {transaction.code}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      Status {transaction.status}
                    </div>
                    <div className="mt-2 text-green-700 font-semibold">
                      💵 {Number(transaction.final_price).toLocaleString("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}
                    </div>
                  </div>

                  {/* Upload Payment Proof Button */}
                  {transaction.status === "Waiting for payment" ? (
                  <div className="p-3 pt-0 mt-auto">
                    <button
                      type="button"
                      className="w-full h-[48px] bg-green-500 hover:bg-green-600 text-white rounded-md"
                      onClick={() => {
                        localStorage.setItem("latest_transaction",JSON.stringify(transaction));
                        // const data = localStorage.getItem("latest_transaction");
                        // if (data) 
                        setShowModal(true);
                      }}
                    >
                      Upload Payment Proof
                    </button>
                  </div>
                ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      <PaymentInfoModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}/>
    </div>
  </>
  );
}
