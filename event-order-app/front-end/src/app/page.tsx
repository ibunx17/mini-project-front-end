import HomePage from "./homepage/page";
import { Suspense } from "react";
export default function Home() {
  return (
    <Suspense>
        <HomePage />
    </Suspense>
    );
}
