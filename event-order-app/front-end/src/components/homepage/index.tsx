"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IEvent } from "@/interface/event.interface";
import Link from "next/link";
import { useAppSelector, useAppDispatch } from "@/lib/redux/hooks";
import { useSearchParams } from "next/navigation";
import { setCategories, setLocations } from "@/lib/redux/slices/eventSlice";
import api from "@/lib/axiosInstance";
import { IEventCategoryParam } from "@/interface/event-category.interface";

export default function HomePage() {
  const [events, setEvents] = useState<IEvent[]>([]);
  const [eventsSearch, setEventsSearch] = useState<IEvent[]>([]);
  const router = useRouter();
  const searchResults = useAppSelector((state) => state.search.results);
  const searchKeyword = useAppSelector((state) => state.search.keyword);
  const searchParams = useSearchParams();
  const keyword = searchParams.get("keyword");
  const [loading, setLoading] = useState(true);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!keyword) return;

    const fetchEvents = async () => {
      try {
        const res = await api.get(
          `${
            process.env.NEXT_PUBLIC_API_URL
          }/api/eventorder/events/search?keyword=${encodeURIComponent(keyword)}`
        );
        setEventsSearch(res.data.data);
      } catch (error) {
        console.error("Failed to fetch events:", error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [keyword]);

  useEffect(() => {
    api
      .get(`${process.env.NEXT_PUBLIC_API_URL}/api/eventorder/events`)
      .then((res) => {
        const eventList = res.data.data as IEvent[];
        setEvents(eventList);

        // Extract locations
        const uniqueLocations = Array.from(
          new Set(eventList.map((e: IEvent) => e.location))
        ).filter(Boolean);
        dispatch(setLocations(uniqueLocations));
      })
      .catch((err) => console.error("Error fetching events:", err));
  }, []);

  useEffect(() => {
    api
      .get(`${process.env.NEXT_PUBLIC_API_URL}/api/eventorder/event-categories`)
      .then((res) => {
        const categoryList = res.data.data as IEventCategoryParam[];
        dispatch(setCategories(categoryList));
      })
      .catch((err) => console.error("Error fetching categiry:", err));
  }, []);
  const eventsToShow = keyword ? eventsSearch : events;

  return (
    <div className="pt-24 md:pt-28 lg:pt-30 px-24 mb-24 bg-gradient-to-b from-stone-100 to-white">
      <div className="flex flex-col space-y-6">
        {/* Banner */}
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="w-full h-60 sm:h-70 md:h-80  bg-gradient-to-r from-sky-500 via-sky-600 to-sky-700 flex items-center justify-center rounded-2xl shadow-lg relative overflow-hidden">
            {/* Decorative Blur Circles */}
            <div className="absolute left-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute right-0 bottom-0 w-40 h-40 bg-white/10 rounded-full blur-2xl translate-x-1/3 translate-y-1/3"></div>
            <div className="text-center px-2 z-10">
              <h1 className="text-2xl md:text-4xl font-bold text-white drop-shadow-lg">
                Selamat Datang di{" "}
                <span className="text-sky-200 md:text-sky-300 font-extrabold tracking-wide">
                  Tiketin.com!
                </span>
              </h1>
              <h2 className="text-xl md:text-3xl font-semibold mt-2 text-white drop-shadow">
                Bukan Sekadar Event.{" "}
                <span className="text-yellow-200 font-bold">Ini Movement!</span>
              </h2>
            </div>
          </div>
        </div>

        {/* Event Cards */}

        <section>
          <h1 className="px-8 pt-8 text-3xl font-bold text-slate-700 mb-6">
            Event Terbaru
          </h1>

          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center">
              {eventsToShow.length === 0 ? (
                <div className="text-center text-gray-500 py-10 text-lg font-medium">
                  Tidak ada event ditemukan.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
                  {eventsToShow.map((event) => (
                    <Link
                      key={event.id}
                      href={`/transaction/${event.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group"
                    >
                      <div className="cursor-pointer bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all w-full h-[320px] flex flex-col border border-sky-100 group-hover:-translate-y-1 group-hover:scale-[1.03] duration-200">
                        <div className="w-full h-56 bg-gradient-to-b from-sky-100 to-white flex items-center justify-center overflow-hidden rounded-t-2xl">
                          <img
                            src={event.banner_url || "/default-event.jpg"}
                            alt={event.name}
                            className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                        <div className="p-5 flex-grow flex flex-col justify-between bg-white rounded-b-2xl shadow-md">
                          <h2 className="text-lg font-bold mb-1 line-clamp-2 text-sky-800">
                            {event.name}
                          </h2>
                          <div className="flex flex-col gap-1">
                            <p className="text-sm text-gray-500 truncate flex items-center gap-1">
                              <span>📍</span> <span>{event.location}</span>
                            </p>
                            <p className="text-xs text-gray-400">
                              From:{" "}
                              <span className="font-medium text-gray-600">
                                {event.start_date
                                  ? new Date(
                                      event.start_date
                                    ).toLocaleDateString()
                                  : "-"}
                              </span>
                            </p>
                            <p className="text-xs text-gray-400">
                              To:{" "}
                              <span className="font-medium text-gray-600">
                                {event.end_date
                                  ? new Date(
                                      event.end_date
                                    ).toLocaleDateString()
                                  : "-"}
                              </span>
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="inline-flex items-center gap-1 text-sky-700 font-semibold bg-sky-50 px-2 py-1 rounded">
                                🎟️ {event.available_seats}
                              </span>
                              <span className="inline-flex items-center gap-1 text-green-700 font-bold bg-green-50 px-2 py-1 rounded">
                                💵 Rp
                                {event.tickets && event.tickets.length > 0
                                  ? Math.min(
                                      ...event.tickets.map((t) => t.price)
                                    ).toLocaleString("id-ID")
                                  : "-"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
