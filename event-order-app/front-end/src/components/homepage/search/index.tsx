"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { IEvent } from '@/interface/event.interface';
import api from "@/lib/axiosInstance";

export default function SearchEvent() {
  const searchParams = useSearchParams();
  const keyword = searchParams.get('keyword');

  const [events, setEvents] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!keyword) return;

    const fetchEvents = async () => {
      try {
        const res = await api.get(`${process.env.NEXT_PUBLIC_API_URL}/api/eventorder/events/search?keyword=${encodeURIComponent(keyword)}`);
        setEvents(res.data.data);
      } catch (error) {
        console.error("Failed to fetch events:", error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [keyword]);

  if (loading) return <p className="text-center mt-8">Loading...</p>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">
        Hasil pencarian untuk: <span className="text-blue-500">{keyword}</span>
      </h1>

      {events.length === 0 ? (
        <p className="text-gray-500">Event tidak ditemukan.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <div key={event.id} className="border rounded-lg shadow p-4">
              <img src={event.banner_url} alt={event.name} className="w-full h-40 object-cover rounded mb-2" />
              <h2 className="text-lg font-semibold">{event.name}</h2>
              <p className="text-sm text-gray-600">{event.description}</p>
              {/* <p className="text-sm mt-1 text-gray-500">Date: {new Date(event.start_date).toLocaleDateString()}</p> */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
