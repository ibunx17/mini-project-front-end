"use client";

import { useEffect, useState } from "react";
import axios from "axios";

interface OverviewData {
  total_events: number;
  total_transactions: number;
  total_revenue: number;
}

const OverviewTab = () => {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      setError("User not found. Please login again.");
      setLoading(false);
      return;
    }
    const user = JSON.parse(userStr);
    if (!user?.id) {
      setError("User ID not found. Please login again.");
      setLoading(false);
      return;
    }
    const organizerId = user.id;

    const fetchOverview = async () => {
      try {
        const res = await axios.get<{ data: OverviewData }>(
          `${process.env.NEXT_PUBLIC_API_URL}/api/eventorder/overview/${organizerId}`
        );
        setOverview(res.data.data);
      } catch (err: any) {
        setError(err?.message || "Error fetching overview data");
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

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
          className="ml-4 px-3 py-1 bg-sky-100 text-sky-800 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-stone-100 px-4 sm:px-8 py-8">
      <h1 className="text-3xl font-bold text-slate-700">Overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {/* Card 1 */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-blue-100">
          <h3 className="text-sm text-slate-700 mb-1 border-b-2">
            Total Events
          </h3>
          <p className="text-2xl font-bold text-slate-700">
            {overview?.total_events ?? 0}
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-blue-100">
          <h3 className="text-sm text-slate-700 mb-1 border-b-2">
            Total Transactions
          </h3>
          <p className="text-2xl font-bold text-slate-700">
            {overview?.total_transactions ?? 0}
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-blue-100">
          <h3 className="text-sm text-slate-700 mb-1 border-b-2">
            Total Revenue
          </h3>
          <p className="text-2xl font-bold text-slate-700">
            Rp {overview?.total_revenue?.toLocaleString("id-ID") ?? 0}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
