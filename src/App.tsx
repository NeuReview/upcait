import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import ChatbotTest from './components/ChatbotTest';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import QuizzesPage from './pages/QuizzesPage';
import MockExamsPage from './pages/MockExamsPage';
import FlashcardsPage from './pages/FlashcardsPage';
import PricingSection from './components/PricingSection';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import PreOrderPage from './pages/PreOrderPage';

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Auth Route component - redirects to dashboard if already logged in
const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthStore();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function App() {
  const { user } = useAuthStore();
  const isPreorderPage = window.location.pathname === '/preorder';

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Show Navbar on all pages except preorder */}
        {!isPreorderPage && <Navbar />}
        
        <div className={`${!isPreorderPage ? 'pt-16' : ''} flex-grow`}>
          <Routes>
            {/* Homepage is accessible to all */}
            <Route path="/" element={<HomePage />} />
            
            {/* Public PreOrder page - completely standalone */}
            <Route path="/preorder" element={<PreOrderPage />} />
            
            {/* Auth Routes */}
            <Route path="/login" element={
              <AuthRoute>
                <LoginPage />
              </AuthRoute>
            } />
            <Route path="/register" element={
              <AuthRoute>
                <RegisterPage />
              </AuthRoute>
            } />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/pricing" element={<PricingSection />} />
            <Route path="/chatbot-test" element={<ChatbotTest />} />
            
            {/* Protected Routes */}
            <Route path="/quizzes" element={
              <ProtectedRoute>
                <QuizzesPage />
              </ProtectedRoute>
            } />
            <Route path="/mock-exams" element={
              <ProtectedRoute>
                <MockExamsPage />
              </ProtectedRoute>
            } />
            <Route path="/flashcards" element={
              <ProtectedRoute>
                <FlashcardsPage />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
        
        {/* Only show Chatbot if user is logged in and not on preorder page */}
        {user && !isPreorderPage && <Chatbot />}
        {/* Always show Footer */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;