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
  const isPreorderPage = window.location.pathname === '/preorder' || (!user && window.location.pathname === '/');

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
    if (user && otpPending && window.location.pathname !== '/otp') {
      window.location.replace('/otp'); // Ensures immediate OTP redirection
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
        <div className="min-h-screen bg-gray-50 flex flex-col">
          {/* ✅ Hide Navbar on Preorder Page */}
          {!isPreorderPage && user && !otpPending && window.location.pathname !== '/otp' && <Navbar />}

          <div className={`${!isPreorderPage ? 'pt-16' : ''} flex-grow`}>
            <Routes>
              {/* ✅ First visit → Redirect to Preorder if not signed in */}
              <Route path="/" element={user ? <HomePage /> : <Navigate to="/preorder" replace />} />
              <Route path="/preorder" element={<PreOrderPage />} />

              {/* ✅ Login & Registration */}
              <Route path="/login" element={user ? <Navigate to={otpPending ? "/otp" : "/dashboard"} replace /> : <LoginPage />} />
              <Route path="/register" element={user ? <Navigate to={otpPending ? "/otp" : "/dashboard"} replace /> : <RegisterPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/pricing" element={<PricingSection />} />

              {/* ✅ OTP Verification Route */}
              <Route 
                path="/otp" 
                element={user && otpPending ? <OtpPage onOtpVerified={handleOtpVerified} /> : <Navigate to="/dashboard" replace />} 
              />

              {/* ✅ Protected Routes - Ensure OTP Verification Before Access */}
              <Route path="/dashboard" element={user ? (otpPending ? <Navigate to="/otp" replace /> : <DashboardPage />) : <Navigate to="/preorder" replace />} />
              <Route path="/quizzes" element={user ? (otpPending ? <Navigate to="/otp" replace /> : <QuizzesPage />) : <Navigate to="/preorder" replace />} />
              <Route path="/mock-exams" element={user ? (otpPending ? <Navigate to="/otp" replace /> : <MockExamsPage />) : <Navigate to="/preorder" replace />} />
              <Route path="/flashcards" element={user ? (otpPending ? <Navigate to="/otp" replace /> : <FlashcardsPage />) : <Navigate to="/preorder" replace />} />
              <Route path="/resources" element={user ? (otpPending ? <Navigate to="/otp" replace /> : <ResourcesPage />) : <Navigate to="/preorder" replace />} />
              <Route path="/profile" element={user ? (otpPending ? <Navigate to="/otp" replace /> : <ProfilePage />) : <Navigate to="/preorder" replace />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>

          {/* ✅ Show Chatbot only if user is logged in and not on preorder page */}
          {user && !isPreorderPage && <Chatbot />}
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App; 
