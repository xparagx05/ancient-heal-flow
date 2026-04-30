import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/dhanvantara/Navbar";
import Footer from "@/components/dhanvantara/Footer";
import EmergencyButton from "@/components/dhanvantara/EmergencyButton";
import PricingSection from "@/components/dhanvantara/Pricing";

export default function PricingPage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-gradient-hero">
      <Navbar />
      <EmergencyButton />
      <div className="container mx-auto max-w-6xl px-6 pt-28">
        <Link to="/" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
          <ArrowLeft className="w-3 h-3" /> Back to home
        </Link>
      </div>
      <PricingSection />
      <Footer />
    </main>
  );
}
