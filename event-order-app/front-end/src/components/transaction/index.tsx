"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axiosInstance";
import { IEvent } from "@/interface/event.interface";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import BuyTicketDialog from "./dialog";
import Link from "next/link";

export default function EventTransaction() {
  const params = useParams();
  const id = params?.id?.toString();
  const [event, setEvent] = useState<IEvent | null>(null);
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: "list-disc ml-3",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal ml-3",
          },
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Highlight,
    ],
    content: "",
    editable: false,    
    immediatelyRender: false,     
  });

  useEffect(() => {
    if (!id) return;
    api
      .get(`${process.env.NEXT_PUBLIC_API_URL}/api/eventorder/events/${id}`, {
        withCredentials: true,
      })
      .then((res) => {
        const eventData = res.data.data;
        setEvent(eventData);
        if (editor) {
          editor.commands.setContent(eventData.description);
        }
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          router.push("/login");
        }
      });
  }, [id, editor]);

  if (!event)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-400"></div>
        <span className="ml-4 text-slate-600 text-lg font-medium">
          Loading...
        </span>
      </div>
    );

  return (
    <>
      <div className="mb-4 mt-6 max-w-6xl mx-auto px-4">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-sky-500 hover:text-sky-700 transition-colors font-semibold"
        >
          <span className="mr-1">←</span>
          Kembali ke Beranda
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row justify-center mx-auto mt-8 p-4 md:p-8 gap-8 max-w-6xl">
        {/* Kolom kiri: gambar & deskripsi */}
        <div className="lg:w-2/3 w-full flex flex-col gap-6">
          <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-slate-50 relative group">
            <img
              src={event.banner_url}
              alt={event.name}
              className="w-full h-72 md:h-96 object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <span className="absolute top-4 left-4 bg-sky-400 text-slate-800 text-xs font-bold px-3 py-1 rounded-full shadow border border-sky-200 uppercase tracking-wider">
              {event.category?.name || "Umum"}
            </span>
            {event.available_seats === 0 && (
              <span className="absolute top-4 right-4 bg-rose-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow border border-rose-200 uppercase tracking-wider">
                Sold Out
              </span>
            )}
          </div>
        </div>
        {/* Kolom kanan: detail */}
        <div className="lg:w-1/3 w-full flex flex-col justify-between p-6 md:p-8 shadow-2xl rounded-2xl h-fit bg-slate-700 border border-slate-200">
          {/* Konten atas */}
          <div className="space-y-4">
            <h1 className="text-3xl font-extrabold text-sky-400 mb-2">
              {event.name}
            </h1>
            <div className="flex items-center gap-2 text-slate-200">
              <span role="img" aria-label="location">
                📍
              </span>
              <span className="text-base">{event.location}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-200">
              <span role="img" aria-label="calendar">
                📅
              </span>
              <span>
                {event.start_date
                  ? new Date(event.start_date).toLocaleString("id-ID", {
                      dateStyle: "long",
                      timeStyle: "short",
                    })
                  : null}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-200">
              <span role="img" aria-label="clock">
                🕒
              </span>
              <span>
                Sampai:{" "}
                {event.end_date
                  ? new Date(event.end_date).toLocaleString("id-ID", {
                      dateStyle: "long",
                      timeStyle: "short",
                    })
                  : null}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sky-200">
              <span role="img" aria-label="ticket">
                🎟️
              </span>
              <span className="text-lg font-bold">
                Harga Mulai: Rp
                {Math.min(
                  ...event.tickets.map((t) => t.price)
                ).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 mr-1"></span>
              Sisa Kursi: {event.available_seats}
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <span role="img" aria-label="user">
                👤
              </span>
              <span>
                Diselenggarakan oleh:{" "}
                <span className="font-semibold text-sky-300">
                  {event.organizer?.first_name || event.organizer_id}
                </span>
              </span>
            </div>
          </div>

          <div className="border-t border-slate-500 my-6"></div>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              className={`bg-gradient-to-r from-sky-400 to-sky-500 text-slate-800 font-bold px-6 py-3 rounded-xl hover:from-sky-500 hover:to-sky-400 hover:text-white transition-colors w-full shadow-lg flex items-center justify-center gap-2 disabled:opacity-60`}
              onClick={handleOpenDialog}
              disabled={event.available_seats === 0}
            >
              <span role="img" aria-label="ticket">
                🎟️
              </span>
              Beli Tiket
            </button>
            <button
              type="button"
              className="border-2 border-sky-400 text-sky-400 font-semibold px-6 py-3 rounded-xl hover:bg-sky-50 hover:text-slate-700 transition-colors w-full flex items-center justify-center gap-2"
            >
              <span role="img" aria-label="share">
                🔗
              </span>
              Bagikan Event
            </button>
          </div>
        </div>
        <BuyTicketDialog
          open={isDialogOpen}
          onClose={handleCloseDialog}
          eventId={event.id}
        />
      </div>
    </>
  );
}
