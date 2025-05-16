"use client";

import Image from "next/image";
import { Transaction } from "@/type/type";

export default function TransactionDetailModal({
  transaction,
  onClose,
  onApprove,
  onReject,
}: {
  transaction: Transaction;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  // Fungsi untuk memberi warna pada status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "canceled":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-xl w-full p-6">
        <h2 className="text-xl font-bold mb-4">Transaction Details</h2>

        {/* Info Status */}
        <div className="mb-4">
          <span
            className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
              transaction.status
            )}`}
          >
            Status: {transaction.status === "pending" && "Waiting for payment"}
            {transaction.status === "approved" && "Approved"}
            {transaction.status === "rejected" && "Rejected"}
            {transaction.status === "canceled" && "Canceled"}
          </span>
          {transaction.status === "canceled" && transaction.canceledReason && (
            <p className="mt-2 text-sm text-gray-600">
              Reason: {transaction.canceledReason}
            </p>
          )}
        </div>

        {/* Info Pengguna */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="font-semibold">Name</p>
            <p>{transaction.user.name}</p>
          </div>
          <div>
            <p className="font-semibold">Email</p>
            <p>{transaction.user.email}</p>
          </div>
          <div>
            <p className="font-semibold">Contact</p>
            <p>{transaction.user.phone}</p>
          </div>
          <div>
            <p className="font-semibold">Event</p>
            <p>{transaction.event}</p>
          </div>
          <div>
            <p className="font-semibold">Ticket</p>
            <p>{transaction.ticketType}</p>
          </div>
          <div>
            <p className="font-semibold">Amount</p>
            <p>{transaction.quantity}</p>
          </div>
        </div>

        {/* Bukti Pembayaran */}
        <div className="mb-6">
          <p className="font-semibold mb-2">Payment proof</p>
          <div className="border rounded-lg p-2">
            <Image
              src={transaction.paymentProof}
              width={600}
              height={400}
              alt="Payment proof"
              className="w-full h-auto"
            />
          </div>
        </div>

        {/* Tombol Aksi */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Close
          </button>

          {/* Hanya tampilkan tombol Approve/Reject jika status pending */}
          {transaction.status === "pending" && (
            <>
              <button
                onClick={onApprove}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Approve
              </button>
              <button
                onClick={onReject}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Reject
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
