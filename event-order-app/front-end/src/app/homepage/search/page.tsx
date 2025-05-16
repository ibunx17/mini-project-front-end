import SearchEvent from "@/components/homepage/search"
import { Suspense } from "react";

export default function EmptyHomPage() {
  return (
    <Suspense>
      <SearchEvent />
    </Suspense>
  )
}
