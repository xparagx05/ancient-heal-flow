import Navbar from "@/components/dhanvantara/Navbar";
import Hero from "@/components/dhanvantara/Hero";
import Features from "@/components/dhanvantara/Features";
import Experience from "@/components/dhanvantara/Experience";
import Doctors from "@/components/dhanvantara/Doctors";
import Pricing from "@/components/dhanvantara/Pricing";
import DashboardPreview from "@/components/dhanvantara/DashboardPreview";
import Founder from "@/components/dhanvantara/Founder";
import Footer from "@/components/dhanvantara/Footer";
import ChatBot from "@/components/dhanvantara/ChatBot";
import EmergencyButton from "@/components/dhanvantara/EmergencyButton";
import { useEffect } from "react";

const Index = () => {
  useEffect(() => {
    document.title = "Dhanvantara AI — Intelligent Healthcare Experience Platform";
    const meta = document.querySelector('meta[name="description"]') || (() => {
      const m = document.createElement("meta");
      m.setAttribute("name", "description");
      document.head.appendChild(m);
      return m;
    })();
    meta.setAttribute("content", "Dhanvantara AI blends ancient Indian healing wisdom with modern AI — book doctors, video consults, and instant prescriptions.");
  }, []);

  return (
    <main className="relative overflow-x-hidden">
      <Navbar />
      <Hero />
      <Features />
      <Founder />
      <Experience />
      <Doctors />
      <Pricing />
      <DashboardPreview />
      <Footer />
      <ChatBot />
      <EmergencyButton />
    </main>
  );
};

export default Index;
