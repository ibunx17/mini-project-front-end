"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import "@/utils/chart";

const StatisticTab = () => {
  const [ticketData, setTicketData] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any>(null);
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

    const fetchData = async () => {
      try {
        const [ticketRes, revenueRes] = await Promise.all([
          axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/api/eventorder/statistic/ticket-by-category/${organizerId}`
          ),
          axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/api/eventorder/statistic/monthly-revenue/${organizerId}`
          ),
        ]);

        const ticketByCategory = ticketRes.data.data;
        const monthlyRevenue = revenueRes.data.data;

        setTicketData({
          labels: ticketByCategory.map((item: any) => item.category_name),
          datasets: [
            {
              label: "Tickets Sold",
              data: ticketByCategory.map((item: any) => item.tickets_sold),
              backgroundColor: "rgba(56, 182, 255, 0.6)",
              borderColor: "rgba(56, 182, 255, 1)",
              borderWidth: 1,
            },
          ],
        });

        setRevenueData({
          labels: monthlyRevenue.labels,
          datasets: [
            {
              label: "Revenue (in IDR)",
              data: monthlyRevenue.data.map(
                (value: number) => value / 1_000_000
              ),
              backgroundColor: "rgba(16, 185, 129, 0.6)",
              borderColor: "rgba(16, 185, 129, 1)",
              borderWidth: 1,
            },
          ],
        });
      } catch (error: any) {
        setError(error?.message || "Error fetching statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex-1 min-h-screen bg-stone-100 px-4 sm:px-8 py-8">
      <h1 className="text-3xl font-bold text-sky-800 mb-6">Statistic</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Tickets by Category */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-3xl font-bold text-slate-700">
            Tickets by Category
          </h2>
          <div className="h-80">
            {ticketData ? (
              <Bar
                data={ticketData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "top",
                    },
                  },
                }}
              />
            ) : (
              <p>Loading...</p>
            )}
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Monthly Revenue
          </h2>
          <div className="h-80">
            {revenueData ? (
              <Bar
                data={revenueData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "top",
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: (value: number | string) => `Rp${value}M`,
                      },
                    },
                  },
                }}
              />
            ) : (
              <p>Loading...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticTab;
