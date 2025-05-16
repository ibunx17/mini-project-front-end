import HomeView from "@/components/homepage";
import Navbar from "@/components/navbar";
import { Suspense } from "react";
import Footer from "@/components/footer";
export default function HomePage() {
  return (<>
    <Suspense>
        <Navbar />
        <HomeView />
        <Footer />        
    </Suspense>
      </>        
  );
}