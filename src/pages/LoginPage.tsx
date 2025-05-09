import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '../store/authStore';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const navigate = useNavigate();
  
  // ✅ Import `setOtpPending` from Auth Store
  const { signIn, sendOtp, resetPassword, googleSignIn, setOtpPending } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
  
    try {
      if (isForgotPassword) {
        await resetPassword(email);
        setSuccess('Password reset instructions have been sent to your email.');
        setIsForgotPassword(false);
      } else {
        await signIn(email, password); // ✅ Authenticate user with email/password
        setOtpPending(true); // ✅ Ensure OTP is required

        if (rememberMe) {
          localStorage.setItem('rememberMe', email);
        } else {
          localStorage.removeItem('rememberMe');
        }

        localStorage.setItem('otp-email', email); // ✅ Store email for OTP verification
        navigate('/otp'); // ✅ Redirect to OTP page after login
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await googleSignIn();
      // ✅ Redirect Google Sign-In users directly to the dashboard
    } catch (error) {
      console.error('Google Sign-in failed:', error);
    }
  };

   const submitLabel = isForgotPassword
    ? loading
      ? 'Sending link…'
      : 'Send link'
    : loading
    ? 'Signing in…'
    : 'Sign in';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {isForgotPassword ? 'Reset your password' : 'Sign in to your account'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link to="/register" className="font-medium text-neural-purple hover:text-tech-lavender">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 p-2 text-sm text-alert-red bg-alert-red/10 rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-2 text-sm text-growth-green bg-growth-green/10 rounded">
              {success}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-neural-purple focus:border-neural-purple sm:text-sm"
                />
              </div>
            </div>

            {!isForgotPassword && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-neural-purple focus:border-neural-purple sm:text-sm pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-neural-purple" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400 hover:text-neural-purple" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* ✅ "Remember Me" checkbox */}
            {!isForgotPassword && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                    className="h-4 w-4 text-neural-purple focus:ring-neural-purple border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Remember me
                  </label>
                </div>
              </div>
            )}

            {/* ✅ "Forgot Password?" button */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(!isForgotPassword);
                  setError('');
                  setSuccess('');
                }}
                className="text-sm text-neural-purple hover:text-tech-lavender"
              >
                {isForgotPassword ? 'Back to sign in' : 'Forgot your password?'}
              </button>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-neural-purple hover:bg-tech-lavender focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neural-purple disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitLabel}
              </button>
            </div>
          </form>

          {/* ✅ Hide Google Sign-In when "Forgot Password?" is active */}
          {!isForgotPassword && (
            <div className="mt-6 flex items-center justify-center">
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
              >
                <img
                  src="https://cdn4.iconfinder.com/data/icons/logos-brands-7/512/google_logo-google_icongoogle-1024.png"
                  alt="Google logo"
                  className="w-5 h-5 mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Sign in with Google</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
