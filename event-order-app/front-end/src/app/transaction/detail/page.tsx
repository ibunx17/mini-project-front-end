import DetailTransaction from "@/components/transaction/detail";
import { Suspense } from "react";

export default function(){
  return (
    <Suspense>
      <DetailTransaction />
    </Suspense>
  )
}