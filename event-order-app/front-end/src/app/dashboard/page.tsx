import DashboardPage from "@/components/dashboard";
import { Suspense } from "react";

export default function Dashboard() {
  return (
    <Suspense>
      <DashboardPage />
    </Suspense>
  );
}
