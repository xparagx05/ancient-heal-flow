import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/context/ThemeContext";
import { BookingProvider, useBooking } from "@/context/BookingContext";
import BookingModal from "@/components/dhanvantara/BookingModal";
import VideoComingSoon from "@/components/dhanvantara/VideoComingSoon";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import PricingPage from "./pages/Pricing.tsx";
import PaymentPage from "./pages/Payment.tsx";

const queryClient = new QueryClient();

function GlobalModals() {
  const { bookingDoctor } = useBooking();
  return (
    <>
      {bookingDoctor && <BookingModal />}
      <VideoComingSoon />
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <BookingProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/payment/:id" element={<PaymentPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <GlobalModals />
          </BookingProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
