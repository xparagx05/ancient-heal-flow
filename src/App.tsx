import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/context/ThemeContext";
import { BookingProvider, useBooking } from "@/context/BookingContext";
import { I18nProvider } from "@/context/I18nContext";
import { SubscriptionProvider } from "@/context/SubscriptionContext";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import BookingModal from "@/components/dhanvantara/BookingModal";
import VideoComingSoon from "@/components/dhanvantara/VideoComingSoon";
import PreLoader from "@/components/dhanvantara/PreLoader";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import PricingPage from "./pages/Pricing.tsx";
import PaymentPage from "./pages/Payment.tsx";
import SubscriptionPayment from "./pages/SubscriptionPayment.tsx";
import AuthPage from "./pages/Auth.tsx";
import Unauthorized from "./pages/Unauthorized.tsx";

// Lazy-loaded portal + admin bundles keep the homepage light.
const DoctorApply = lazy(() => import("./pages/doctor/DoctorApply.tsx"));
const DoctorPending = lazy(() => import("./pages/doctor/DoctorPending.tsx"));
const DoctorGate = lazy(() => import("./pages/doctor/DoctorGate.tsx"));
const DoctorDashboard = lazy(() => import("./pages/doctor/DoctorDashboard.tsx"));
const DoctorAppointments = lazy(() => import("./pages/doctor/DoctorAppointments.tsx"));
const DoctorAvailability = lazy(() => import("./pages/doctor/DoctorAvailability.tsx"));
const DoctorConsultation = lazy(() => import("./pages/doctor/DoctorConsultation.tsx"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard.tsx"));
const AdminDoctors = lazy(() => import("./pages/admin/AdminDoctors.tsx"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics.tsx"));
const AdminAppointments = lazy(() => import("./pages/admin/AdminAppointments.tsx"));
const AdminPayments = lazy(() => import("./pages/admin/AdminPayments.tsx"));
const AdminFeedback = lazy(() => import("./pages/admin/AdminFeedback.tsx"));
const AdminNotifications = lazy(() => import("./pages/admin/AdminNotifications.tsx"));
const AdminCMS = lazy(() => import("./pages/admin/AdminCMS.tsx"));
const DoctorPortalLogin = lazy(() => import("./pages/portal/DoctorPortalLogin.tsx"));
const AdminPortalLogin = lazy(() => import("./pages/portal/AdminPortalLogin.tsx"));
const ConsultationRoom = lazy(() => import("./pages/consultation/ConsultationRoom.tsx"));

// Placeholders re-exported from DoctorDashboard/AdminDashboard
import { DoctorPlaceholder } from "./pages/doctor/DoctorDashboard.tsx";
import { AdminPlaceholder } from "./pages/admin/AdminDashboard.tsx";

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

const RouteFallback = () => (
  <div className="min-h-screen grid place-items-center">
    <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <I18nProvider>
        <SubscriptionProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <PreLoader />
            <BrowserRouter>
              <AuthProvider>
                <BookingProvider>
                  <Suspense fallback={<RouteFallback />}>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/pricing" element={<PricingPage />} />
                      <Route path="/payment/:id" element={<PaymentPage />} />
                      <Route path="/subscription-payment/:plan" element={<SubscriptionPayment />} />
                      <Route path="/auth" element={<AuthPage />} />
                      <Route path="/unauthorized" element={<Unauthorized />} />

                      {/* Video consultation (patient or doctor) */}
                      <Route path="/consult/:appointmentId" element={<ProtectedRoute><ConsultationRoom /></ProtectedRoute>} />


                      {/* Portal entry points */}
                      <Route path="/portal/doctor" element={<DoctorPortalLogin />} />
                      <Route path="/portal/admin" element={<AdminPortalLogin />} />

                      {/* Doctor Portal */}
                      <Route path="/doctor/apply" element={<ProtectedRoute><DoctorApply /></ProtectedRoute>} />
                      <Route path="/doctor/pending" element={<ProtectedRoute><DoctorPending /></ProtectedRoute>} />
                      <Route path="/doctor" element={<ProtectedRoute><DoctorGate><DoctorDashboard /></DoctorGate></ProtectedRoute>} />
                      <Route path="/doctor/appointments" element={<ProtectedRoute><DoctorGate><DoctorAppointments /></DoctorGate></ProtectedRoute>} />
                      <Route path="/doctor/consultations/:appointmentId" element={<ProtectedRoute><DoctorGate><DoctorConsultation /></DoctorGate></ProtectedRoute>} />
                      <Route path="/doctor/availability" element={<ProtectedRoute><DoctorGate><DoctorAvailability /></DoctorGate></ProtectedRoute>} />
                      <Route path="/doctor/calendar" element={<ProtectedRoute><DoctorGate><DoctorPlaceholder label="Calendar" /></DoctorGate></ProtectedRoute>} />
                      <Route path="/doctor/patients" element={<ProtectedRoute><DoctorGate><DoctorPlaceholder label="Patients" /></DoctorGate></ProtectedRoute>} />
                      <Route path="/doctor/consultations" element={<ProtectedRoute><DoctorGate><DoctorPlaceholder label="Consultations" /></DoctorGate></ProtectedRoute>} />
                      <Route path="/doctor/analytics" element={<ProtectedRoute><DoctorGate><DoctorPlaceholder label="Analytics" /></DoctorGate></ProtectedRoute>} />
                      <Route path="/doctor/feedback" element={<ProtectedRoute><DoctorGate><DoctorPlaceholder label="Feedback" /></DoctorGate></ProtectedRoute>} />

                      {/* Admin Portal */}
                      <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
                      <Route path="/admin/doctors" element={<ProtectedRoute requiredRole="admin"><AdminDoctors /></ProtectedRoute>} />
                      <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><AdminPlaceholder label="User Management" /></ProtectedRoute>} />
                      <Route path="/admin/appointments" element={<ProtectedRoute requiredRole="admin"><AdminAppointments /></ProtectedRoute>} />
                      <Route path="/admin/payments" element={<ProtectedRoute requiredRole="admin"><AdminPayments /></ProtectedRoute>} />
                      <Route path="/admin/feedback" element={<ProtectedRoute requiredRole="admin"><AdminFeedback /></ProtectedRoute>} />
                      <Route path="/admin/reports" element={<ProtectedRoute requiredRole="admin"><AdminPlaceholder label="Reports" /></ProtectedRoute>} />
                      <Route path="/admin/notifications" element={<ProtectedRoute requiredRole="admin"><AdminNotifications /></ProtectedRoute>} />
                      <Route path="/admin/cms" element={<ProtectedRoute requiredRole="admin"><AdminCMS /></ProtectedRoute>} />
                      <Route path="/admin/analytics" element={<ProtectedRoute requiredRole="admin"><AdminAnalytics /></ProtectedRoute>} />
                      <Route path="/admin/settings" element={<ProtectedRoute requiredRole="admin"><AdminPlaceholder label="Settings" /></ProtectedRoute>} />

                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                  <GlobalModals />
                </BookingProvider>
              </AuthProvider>
            </BrowserRouter>
          </TooltipProvider>
        </SubscriptionProvider>
      </I18nProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
