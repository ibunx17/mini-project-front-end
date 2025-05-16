"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../navbar";
import Sidebar from "./layout/sidebar";
import MyEventsTab from "./tab/my-event";
import TransactionTab from "./tab/transaction";
import StatisticTab from "./tab/statistics";
import OverviewTab from "./tab/overview";

// TypeScript: Definisikan tipe untuk activeTab (opsional)
type ActiveTabType = "events" | "transactions" | "statistics" | "overview";

const DashboardPage = () => {
  const router = useRouter();

  // 1. State untuk kontrol tab aktif
  const [activeTab, setActiveTab] = useState("events");
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);

  // 2. State data dashboard (contoh)
  const [dashboardData] = useState({
    pendingTransactions: 3, // Data dummy
    totalEvents: 5,
    // ...data lainnya
  });

  return (
    <div className="min-h-screen bg-sky-50">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingTransactions={dashboardData.pendingTransactions}
      />

      {/* Konten Utama */}
      <main className="ml-64">
        {/* Events Tab */}
        {activeTab === "events" && <MyEventsTab />}

        {/* Transactions Tab */}
        {activeTab === "transactions" && <TransactionTab />}

        {/* Statistics Tab */}
        {activeTab === "statistics" && <StatisticTab />}

        {/* Overview Tab */}
        {activeTab === "overview" && <OverviewTab />}
      </main>
    </div>
  );
};

export default DashboardPage;
