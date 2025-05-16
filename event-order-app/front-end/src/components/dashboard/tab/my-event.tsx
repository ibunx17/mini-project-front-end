"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { IEvent } from "@/interface/event.interface";
import axios from "axios"; // Sesuaikan path ini
import { IUserParam } from "@/interface/user.interface";
const MyEventsTab = () => {
  const router = useRouter();
  const [events, setEvents] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dapatkan token dan organizerId dari tempat penyimpanan yang sesuai

  // const organizerId = Number(
  //   typeof window !== "undefined" ? localStorage.getItem("user") : null
  // );
  useEffect(() => {
    const user = JSON.parse(
      localStorage.getItem("user") || "null"
    ) as IUserParam;
    const fetchEvents = async () => {
      try {
        if (!user.id) {
          throw new Error("Authentication required");
        }

        const response = await axios
          .get(
            `${process.env.NEXT_PUBLIC_API_URL}/api/eventorder/events/organizer/${user.id}`,
            {
              withCredentials: true,
            }
          )
          .then((res) => {
            const eventList = res.data.data as IEvent[];
            setEvents(eventList);
          });
        // const data = await response.data.data();
        // setEvents(data.data || []);

        // if (!response.data.data) {
        //   throw new Error(`Error: ${response.status}`);
        // }

        // const data = await response.data.data();
        // setEvents(data.data || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleViewAttendees = (eventId: number) => {
    router.push(`/attandees?eventId=${eventId}`);
  };

  const handleEditEvent = (eventId: number) => {
    router.push(`/event/edit?id=${eventId}`);
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";

    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getEventStatus = (
    startDate: Date | string | null,
    endDate: Date | string | null
  ) => {
    if (!startDate || !endDate) return "upcoming";

    const now = new Date();
    const start = startDate instanceof Date ? startDate : new Date(startDate);
    const end = endDate instanceof Date ? endDate : new Date(endDate);

    if (now < start) return "upcoming";
    if (now > end) return "completed";
    return "ongoing";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-800"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4">
        Error: {error}
        <button
          onClick={() => window.location.reload()}
          className="ml-4 px-3 py-1 bg-stone-100 text-sky-800 rounded"
        >
          Retry.
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-stone-100 px-4 sm:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-700">My Events</h1>
        <button
          onClick={() => router.push("/event")}
          className="flex items-center gap-2 px-5 py-2 bg-slate-700 text-white rounded-xl shadow hover:bg-slate-800 transition"
        >
          <span className="text-xl">+</span> Create Event
        </button>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-500 text-lg mb-4">
            You haven't created any events yet
          </p>
          <button
            onClick={() => router.push("/event/create")}
            className="px-5 py-2 bg-slate-700 text-white rounded-xl shadow hover:bg-slate-800 transition"
          >
            Create Your First Event
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white border border-slate-200 rounded-2xl shadow-md hover:shadow-xl hover:border-sky-700 transition-all overflow-hidden"
            >
              <div className="h-48 overflow-hidden bg-slate-100">
                <img
                  src={event.banner_url || "/default-event-banner.jpg"}
                  alt={event.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "/default-event-banner.jpg";
                  }}
                />
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-slate-800 truncate">
                    {event.name}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs rounded-full font-semibold ${
                      getEventStatus(event.start_date, event.end_date) ===
                      "upcoming"
                        ? "bg-yellow-100 text-yellow-800"
                        : getEventStatus(event.start_date, event.end_date) ===
                          "ongoing"
                        ? "bg-green-100 text-green-800"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {getEventStatus(event.start_date, event.end_date)}
                  </span>
                </div>
                <div className="space-y-2 text-sm text-slate-600 mb-4">
                  <p>
                    <span className="font-medium">Date:</span>{" "}
                    {formatDate(event.start_date)} -{" "}
                    {formatDate(event.end_date)}
                  </p>
                  <p>
                    <span className="font-medium">Location:</span>{" "}
                    {event.location || "Online"}
                  </p>
                  <p>
                    <span className="font-medium">Category:</span>{" "}
                    {event.category?.name || "General"}
                  </p>
                  <p>
                    <span className="font-medium">Seats:</span>{" "}
                    {event.available_seats} available
                  </p>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                  <button
                    onClick={() => handleViewAttendees(event.id)}
                    className="text-sky-500 hover:text-sky-700 text-sm font-medium"
                  >
                    View Attendees (
                    {event.tickets?.reduce(
                      (acc, ticket) => acc + (ticket.quota - ticket.remaining),
                      0
                    ) || 0}
                    )
                  </button>
                  <button
                    onClick={() => handleEditEvent(event.id)}
                    className="px-3 py-1 bg-slate-100 text-slate-700 rounded-md hover:bg-sky-50 hover:text-sky-700 border border-slate-200 transition"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyEventsTab;
