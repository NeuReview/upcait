// src/App.tsx
import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Chatbot from './components/Chatbot'
import HomePage from './pages/HomePage'
import DashboardPage from './pages/DashboardPage'
import QuizzesPage from './pages/QuizzesPage'
import MockExamsPage from './pages/MockExamsPage'
import FlashcardsPage from './pages/FlashcardsPage'
import ResourcesPage from './pages/ResourcesPage'
import ProfilePage from './pages/ProfilePage'
import NotFoundPage from './pages/NotFoundPage'
import PricingSection from './components/PricingSection'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import PreOrderPage from './pages/PreOrderPage'
import OtpPage from './pages/OtpPage'
import TermsAndConditionsModal from './components/TermsAndConditionsModal'
import { AuthProvider } from './context/AuthContext'
import ConfirmPage from './pages/ConfirmPage'
import EmailLinkSentPage from './pages/EmailLinkSentPage'

function App() {
  const {
    user,
    otpPending,
    acceptedTOS,
    fetchUser,
    fetchTOS,
    markTOSAccepted,
    setOtpPending,
  } = useAuthStore()

  const [loading, setLoading] = useState(true)

  // Determine if we’re on the public PreOrder/Landing
  const isPreorderPage =
    window.location.pathname === '/preorder' ||
    (!user && window.location.pathname === '/')

  // 1. On mount: load the session (user + otpPending flag)
  useEffect(() => {
    ;(async () => {
      await fetchUser()
      setLoading(false)
    })()
  }, [fetchUser])

  // 2. After OTP/email confirmation (i.e. otpPending flips false), fetch the TOS flag
  useEffect(() => {
    if (user && !otpPending) {
      fetchTOS()
    }
  }, [user, otpPending, fetchTOS])

  // 3. Show spinner while:
  //    – we’re initially loading the session, OR
  //    – we have a fully-logged-in user (otpPending=false) but haven’t loaded the TOS flag yet
  if (
    loading ||
    (user && !otpPending && acceptedTOS === null)
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading…
      </div>
    )
  }

  // 4. Once fully logged in, if they haven't accepted TOS, show the modal
  if (user && !otpPending && acceptedTOS === false) {
    return <TermsAndConditionsModal onAgree={markTOSAccepted} />
  }

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-gray-50">
          {!isPreorderPage && user && !otpPending && <Navbar />}

          <main className={`${!isPreorderPage ? 'pt-16' : ''} flex-grow`}>
            <Routes>
              <Route
                path="/"
                element={
                  user ? <HomePage /> : <Navigate to="/preorder" replace />
                }
              />
              <Route path="/preorder" element={<PreOrderPage />} />

              <Route
                path="/login"
                element={
                  user && !otpPending ? (
                    <Navigate to="/dashboard" replace />
                  ) : (
                    <LoginPage />
                  )
                }
              />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/pricing" element={<PricingSection />} />

              {/* OTP Verification */}
              <Route
                path="/otp"
                element={
                  user && otpPending ? (
                    <OtpPage onOtpVerified={() => setOtpPending(false)} />
                  ) : (
                    <Navigate to="/dashboard" replace />
                  )
                }
              />

              {/* Protected */}
              <Route
                path="/dashboard"
                element={
                  user ? (
                    otpPending ? (
                      <Navigate to="/otp" replace />
                    ) : (
                      <DashboardPage />
                    )
                  ) : (
                    <Navigate to="/preorder" replace />
                  )
                }
              />
              <Route
                path="/quizzes"
                element={
                  user ? (
                    otpPending ? (
                      <Navigate to="/otp" replace />
                    ) : (
                      <QuizzesPage />
                    )
                  ) : (
                    <Navigate to="/preorder" replace />
                  )
                }
              />
              <Route
                path="/mock-exams"
                element={
                  user ? (
                    otpPending ? (
                      <Navigate to="/otp" replace />
                    ) : (
                      <MockExamsPage />
                    )
                  ) : (
                    <Navigate to="/preorder" replace />
                  )
                }
              />
              <Route
                path="/flashcards"
                element={
                  user ? (
                    otpPending ? (
                      <Navigate to="/otp" replace />
                    ) : (
                      <FlashcardsPage />
                    )
                  ) : (
                    <Navigate to="/preorder" replace />
                  )
                }
              />
              <Route
                path="/resources"
                element={
                  user ? (
                    otpPending ? (
                      <Navigate to="/otp" replace />
                    ) : (
                      <ResourcesPage />
                    )
                  ) : (
                    <Navigate to="/preorder" replace />
                  )
                }
              />
              <Route
                path="/profile"
                element={
                  user ? (
                    otpPending ? (
                      <Navigate to="/otp" replace />
                    ) : (
                      <ProfilePage />
                    )
                  ) : (
                    <Navigate to="/preorder" replace />
                  )
                }
              />
              {/* Auth flow pages */}
              <Route path="/confirm" element={<ConfirmPage />} />
              <Route path="/email-sent" element={<EmailLinkSentPage />} />

              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>

          {user && !isPreorderPage && <Chatbot />}
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
