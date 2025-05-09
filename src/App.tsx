import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import QuizzesPage from './pages/QuizzesPage';
import MockExamsPage from './pages/MockExamsPage';
import FlashcardsPage from './pages/FlashcardsPage';
import ResourcesPage from './pages/ResourcesPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import PricingSection from './components/PricingSection';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import PreOrderPage from './pages/PreOrderPage';
import OtpPage from './pages/OtpPage';
import { AuthProvider } from './context/AuthContext';
import AuthRoute from './components/AuthRoute';

function App() {
  const { user, fetchUser, otpPending, setOtpPending } = useAuthStore();
  const [loading, setLoading] = useState(true);

  // ✅ Define isPreorderPage to hide Navbar and adjust layout
  //const isPreorderPage = window.location.pathname === '/upcait/preorder';

  // ✅ Fetch user session on app load
  useEffect(() => {
    const initializeAuth = async () => {
      await fetchUser();
      setLoading(false);
    };
    initializeAuth();
  }, []);

  // ✅ Redirect logged-in users to OTP if verification is pending
  useEffect(() => {
    if (user && otpPending && window.location.pathname !== '/upcait/otp') {
      window.location.replace('/upcait/otp'); // Ensures immediate OTP redirection
    }
  }, [user, otpPending]);

  const handleOtpVerified = () => {
    setOtpPending(false); // ✅ Marks OTP as verified
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <AuthProvider>
      <Router>
          {/* ✅ Hide Navbar on Preorder Page */}
          {user && !otpPending && window.location.pathname !== '/upcait/otp' && <Navbar />}
          <div className="flex-grow pt-16">
            <Routes>
              {/* Redirect unprefixed login and register to /upcait/... */}
              <Route path="/dashboard" element={<Navigate to="/upcait/dashboard" replace />} />
              <Route path="/quizzes" element={<Navigate to="/upcait/quizzes" replace />} />
              <Route path="/mock-exams" element={<Navigate to="/upcait/mock-exams" replace />} />
              <Route path="/flashcards" element={<Navigate to="/upcait/flashcards" replace />} />
              <Route path="/resources" element={<Navigate to="/upcait/resources" replace />} />
              <Route path="/profile" element={<Navigate to="/upcait/profile" replace />} />
              <Route path="/otp" element={<Navigate to="/upcait/otp" replace />} />
              <Route path="/reset-password" element={<Navigate to="/upcait/reset-password" replace />} />
              <Route path="/pricing" element={<Navigate to="/upcait/pricing" replace />} />

              <Route path="/login" element={<Navigate to="/upcait/login" replace />} />
              <Route path="/register" element={<Navigate to="/upcait/register" replace />} />

              {/* ✅ Redirect root path to /upcait for homepage */}
              <Route path="/" element={<Navigate to="/upcait" replace />} />
              {/* ✅ Actual homepage at /upcait */}
              <Route path="/upcait" element={<HomePage />} />

              {/* ✅ Login & Registration */}
              <Route path="/upcait/login" element={user ? <Navigate to={otpPending ? "/upcait/otp" : "/upcait/dashboard"} replace /> : <LoginPage />} />
              <Route path="/upcait/register" element={user ? <Navigate to={otpPending ? "/upcait/otp" : "/upcait/dashboard"} replace /> : <RegisterPage />} />
              <Route path="/upcait/reset-password" element={<ResetPasswordPage />} />
              <Route path="/upcait/pricing" element={<PricingSection />} />

              {/* ✅ OTP Verification Route */}
              <Route 
                path="/upcait/otp" 
                element={user && otpPending ? <OtpPage onOtpVerified={handleOtpVerified} /> : <Navigate to="/upcait/dashboard" replace />} 
              />

              {/* ✅ Protected Routes - Ensure OTP Verification Before Access */}
              <Route path="/upcait/dashboard" element={user ? (otpPending ? <Navigate to="/upcait/otp" replace /> : <DashboardPage />) : <Navigate to="/upcait/preorder" replace />} />
              <Route path="/upcait/quizzes" element={user ? (otpPending ? <Navigate to="/upcait/otp" replace /> : <QuizzesPage />) : <Navigate to="/upcait/preorder" replace />} />
              <Route path="/upcait/mock-exams" element={user ? (otpPending ? <Navigate to="/upcait/otp" replace /> : <MockExamsPage />) : <Navigate to="/upcait/preorder" replace />} />
              <Route path="/upcait/flashcards" element={user ? (otpPending ? <Navigate to="/upcait/otp" replace /> : <FlashcardsPage />) : <Navigate to="/upcait/preorder" replace />} />
              <Route path="/upcait/resources" element={user ? (otpPending ? <Navigate to="/upcait/otp" replace /> : <ResourcesPage />) : <Navigate to="/upcait/preorder" replace />} />
              <Route path="/upcait/profile" element={user ? (otpPending ? <Navigate to="/upcait/otp" replace /> : <ProfilePage />) : <Navigate to="/upcait/preorder" replace />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>

          {/* ✅ Show Chatbot only if user is logged in and not on preorder page */}
          {user && <Chatbot />}
          <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;