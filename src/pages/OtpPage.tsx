import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '../store/authStore';

interface OtpPageProps {
  onOtpVerified: () => void;
}

const OtpPage: React.FC<OtpPageProps> = ({ onOtpVerified }) => {
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(''));
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();
  const { sendOtp, verifyOtp } = useAuthStore();
  const email = localStorage.getItem('otp-email');

  const inputRefs = useRef<HTMLInputElement[]>([]);

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');

    if (!value) {
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
      return;
    }

    const newOtp = [...otp];

    if (value.length > 1) {
      const pastedArray = value.split('').slice(0, otp.length);
      pastedArray.forEach((char, i) => {
        newOtp[index + i] = char;
      });

      setOtp(newOtp);

      const lastFilledIndex = Math.min(index + pastedArray.length, otp.length - 1);
      inputRefs.current[lastFilledIndex]?.focus();
    } else {
      newOtp[index] = value[0];
      setOtp(newOtp);

      if (index < otp.length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

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

  // OtpPage.tsx (partial update)
const handleVerifyOtp = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setSuccess(false);
  setLoading(true);

  const otpValue = otp.join('');

  try {
    await verifyOtp(email!, otpValue);
    localStorage.removeItem('otp-email');
    
    // ✅ 1. Show success message
    setSuccess(true); 

    // ✅ 2. Wait 2 seconds for the message to display
    setTimeout(() => {
      // ✅ 3. Update OTP verification status and navigate
      onOtpVerified(); // This sets otpPending to false in App.tsx
      navigate('/');
    }, 2000);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Invalid OTP. Try again.');
  } finally {
    setLoading(false);
  }
};

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text').replace(/\D/g, '');
    if (!pastedText) return;
    const newOtp = pastedText.split('').slice(0, otp.length);
    setOtp(newOtp);
    const lastFilledIndex = Math.min(newOtp.length - 1, otp.length - 1);
    inputRefs.current[lastFilledIndex]?.focus();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Verify Your Email
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          We've sent a One-Time Password (OTP) to your email <span className="font-medium text-gray-900">{email}</span>.
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
              Your device is successfully verified. Redirecting to dashboard...
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
                    onPaste={handlePaste}
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