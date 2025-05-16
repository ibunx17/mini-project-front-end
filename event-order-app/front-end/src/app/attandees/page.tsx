import AttendeesPage from "@/components/dashboard/event-attandees.tsx/event-attandees.";
import { Suspense } from "react";

export default function Attandee() {
  return (
    <Suspense>
      <AttendeesPage />
    </Suspense>
  );
}
