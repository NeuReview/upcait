import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '../store/authStore';

// ✅ Define Prop Type
interface OtpPageProps {
  onOtpVerified: () => void; // ✅ Function to update OTP verification status
}

const OtpPage: React.FC<OtpPageProps> = ({ onOtpVerified }) => {
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(''));
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false); // ✅ Ensures OTP field appears after sending
  const navigate = useNavigate();
  const { sendOtp, verifyOtp } = useAuthStore();
  const email = localStorage.getItem('otp-email');

  const inputRefs = useRef<HTMLInputElement[]>([]);

  // ✅ Redirect to login if no email is found
  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  // ✅ Handle OTP Input Change
  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/, ''); // Only allow numbers
    if (!value) return;

    const newOtp = [...otp];
    newOtp[index] = value[0]; // Allow only one character
    setOtp(newOtp);

    // Move focus to the next input box
    if (index < 5 && value) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // ✅ Handle OTP Backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // ✅ Send OTP
  const handleSendOtp = async () => {
    setError('');
    setLoading(true);

    try {
      await sendOtp(email!);
      setOtpSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error sending OTP.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    const otpValue = otp.join('');

    try {
      await verifyOtp(email!, otpValue);
      localStorage.removeItem('otp-email');
      onOtpVerified();
      setSuccess(true);

      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Verify Your Email
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          We’ve sent a One-Time Password (OTP) to your email <span className="font-medium text-gray-900">{email}</span>.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 p-2 text-sm text-alert-red bg-alert-red/10 rounded flex items-center">
              <XCircleIcon className="h-5 w-5 text-alert-red mr-2" />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-2 text-sm text-growth-green bg-growth-green/10 rounded flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-growth-green mr-2" />
              OTP Verified! Redirecting to dashboard...
            </div>
          )}

          {!otpSent ? (
            <button
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-neural-purple hover:bg-tech-lavender focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neural-purple disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          ) : (
            <form className="space-y-6" onSubmit={handleVerifyOtp}>
              {/* ✅ OTP Input Fields */}
              <div className="flex justify-center space-x-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el!)}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 border border-gray-300 text-center text-xl rounded-lg focus:ring-neural-purple focus:border-neural-purple outline-none"
                  />
                ))}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-neural-purple hover:bg-tech-lavender focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neural-purple disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </div>

              {/* ✅ Resend & Help Links */}
              <div className="flex justify-between mt-4">
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="text-sm text-neural-purple hover:text-tech-lavender"
                  disabled={loading}
                >
                  Resend Code
                </button>

                <Link to="/help" className="text-sm text-neural-purple hover:text-tech-lavender">
                  Need Help?
                </Link>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-neural-purple hover:text-tech-lavender">
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtpPage;
