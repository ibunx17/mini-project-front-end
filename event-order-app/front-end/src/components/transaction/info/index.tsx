'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axiosInstance';
import { toast } from 'react-toastify';
import { ITransactionParam }  from '@/interface/transaction.interface';

interface PaymentInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PaymentInfoModal({ isOpen, onClose }: PaymentInfoModalProps) {
  const [transaction, setTransaction] = useState<ITransactionParam | null>(null);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('latest_transaction');
    if (!stored) return;
  
    try {
      const data = JSON.parse(stored);
      if (data && data.id) {
        setTransaction(data);
      }
    } catch (err) {
      console.error("Gagal parse localStorage", err);
      setTransaction(null);
    }
  }, []);

  const handleSubmit = async () => {
    try {
      if (!paymentProof) {
        toast.error("Mohon unggah bukti pembayaran terlebih dahulu.");
        return;
      }

      const formData = new FormData();
      formData.append("payment_proof", paymentProof);

      await api.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/eventorder/transactions/payment-proof/${transaction!.id}`,
        formData
      );

      toast.success("Terimakasih atas pembayaran anda");
      localStorage.removeItem("latest_transaction");
      onClose();
      router.push("/");
    } catch (err) {
      toast.error("Gagal mengunggah bukti bayar. harap coba lagi!.");
      console.error(err);
    }
  };

  if (!transaction) return null;

  const deadline = new Date(transaction.created_at);
  deadline.setHours(deadline.getHours() + 2);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-transparent bg-opacity-40" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center px-4 py-8">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-100"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-gray-900">
                  Informasi Pembayaran
                </Dialog.Title>

                <div className="mt-2">
                  <p className="mb-2">Transaksi Number: {transaction.code}</p>
                  <p className="mb-2">Total Pembayaran: <strong>Rp {transaction.final_price?.toLocaleString() || 0}</strong></p>
                  <p className="mb-4">Batas Waktu Pembayaran: <strong>{deadline.toLocaleString()}</strong></p>

                  <div className="my-4">
                    <h4 className="text-md font-semibold">Silakan transfer ke:</h4>
                    <p>Bank: <strong>XYZ</strong></p>
                    <p>No Rek: <strong>1234567890</strong></p>
                    <p>Nama: <strong>PT Event CobaCoba</strong></p>
                  </div>

                  <div>
                    <label className="block font-medium mb-1">Upload Bukti Pembayaran</label>
                    <input
                      type="file"
                      className="border p-2 rounded w-full"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          setPaymentProof(e.target.files[0]);
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded"
                    onClick={() => {
                      localStorage.removeItem("latest_transaction");
                      onClose();
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                    onClick={handleSubmit}
                  >
                    Kirim Bukti Pembayaran
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
