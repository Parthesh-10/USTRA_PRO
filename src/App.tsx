import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import SalonDetails from "./pages/SalonDetails";
import BookingPage from "./pages/BookingPage";
import PaymentPage from "./pages/PaymentPage";
import AIAssistant from "./pages/AIAssistant";
import UserDashboard from "./pages/UserDashboard";
import OwnerDashboard from "./pages/OwnerDashboard";
import NotFound from "./pages/NotFound";
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './context/ProtectedRoute'
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminDashboard from "./pages/AdminDashboard";


const queryClient = new QueryClient();


const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>    
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
  {/* Public routes */}
  <Route path="/" element={<Index />} />
  <Route path="/salon/:id" element={<SalonDetails />} />
  <Route path="/login" element={<Login />} />
  <Route path="/signup" element={<Signup />} />

  {/* Customer only */}
  <Route path="/booking" element={
    <ProtectedRoute allowedRoles={['customer']}>
      <BookingPage />
    </ProtectedRoute>
  } />
  <Route path="/payment" element={
    <ProtectedRoute allowedRoles={['customer']}>
      <PaymentPage />
    </ProtectedRoute>
  } />
  <Route path="/dashboard" element={
    <ProtectedRoute allowedRoles={['customer']}>
      <UserDashboard />
    </ProtectedRoute>
  } />
  <Route path="/ai-assistant" element={
    <ProtectedRoute allowedRoles={['customer', 'owner', 'admin']}>
      <AIAssistant />
    </ProtectedRoute>
  } />

  {/* Owner only */}
  <Route path="/owner-dashboard" element={
    <ProtectedRoute allowedRoles={['owner']}>
      <OwnerDashboard />
    </ProtectedRoute>
  } />


  <Route path="*" element={<NotFound />} />


  <Route path="/admin" element={
  <ProtectedRoute allowedRoles={['admin']}>
    <AdminDashboard />
  </ProtectedRoute>
} />

</Routes>
      </BrowserRouter>
    </TooltipProvider>
      </AuthProvider>          
  </QueryClientProvider>

  
);

export default App;
