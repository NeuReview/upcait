import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { supabase } from '../lib/supabase';
import { validatePassword } from '../utils/passwordValidation';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<string[]>([]); // ✅ Password validation errors
  const navigate = useNavigate();

  useEffect(() => {
    const handlePasswordReset = async () => {
      const query = new URLSearchParams(window.location.search);
      const accessToken = query.get('access_token');
      const refreshToken = query.get('refresh_token');

      if (accessToken && refreshToken) {
        try {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          if (error) throw error;
        } catch (err) {
          console.error('Error setting session:', err);
        }
      }
    };

    handlePasswordReset();
  }, []);

  // ✅ Validate password on input change
  useEffect(() => {
    if (password) {
      const validation = validatePassword(password);
      setErrors(validation.errors);
    } else {
      setErrors([]);
    }
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // ✅ Validate password before submitting
    const validation = validatePassword(password);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    if (password !== confirmPassword) {
      setErrors(['Passwords do not match']);
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      setSuccess(true);
      await supabase.auth.signOut();

      setTimeout(() => {
        navigate('/login', { 
          state: { message: 'Password has been reset successfully. Please sign in with your new password.' }
        });
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while resetting your password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link to="/login" className="font-medium text-neural-purple hover:text-tech-lavender">
            go back to sign in
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
              Password updated successfully! Redirecting to login...
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
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

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-neural-purple focus:border-neural-purple sm:text-sm pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-neural-purple" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-neural-purple" />
                  )}
                </button>
              </div>
            </div>

            {/* ✅ Password Requirements */}
            {password && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700">Password Requirements:</h3>
                <div className="space-y-1">
                  <RequirementCheck passed={password.length >= 12} text="At least 12 characters long" />
                  <RequirementCheck passed={/[A-Z]/.test(password)} text="Contains uppercase letter" />
                  <RequirementCheck passed={/[a-z]/.test(password)} text="Contains lowercase letter" />
                  <RequirementCheck passed={/\d/.test(password)} text="Contains number" />
                  <RequirementCheck passed={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)} text="Contains special character" />
                </div>
              </div>
            )}

            {errors.length > 0 && (
              <div className="rounded-md bg-alert-red/10 p-4">
                <div className="flex">
                  <XCircleIcon className="h-5 w-5 text-alert-red" aria-hidden="true" />
                  <div className="ml-3 text-sm text-alert-red">
                    <ul className="list-disc pl-5 space-y-1">
                      {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading || success || errors.length > 0}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-neural-purple hover:bg-tech-lavender focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neural-purple disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Updating password...' : 'Update password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const RequirementCheck = ({ passed, text }: { passed: boolean; text: string }) => (
  <div className="flex items-center space-x-2">
    {passed ? <CheckCircleIcon className="h-4 w-4 text-growth-green" /> : <XCircleIcon className="h-4 w-4 text-alert-red" />}
    <span className={`text-sm ${passed ? 'text-growth-green' : 'text-alert-red'}`}>{text}</span>
  </div>
);

export default ResetPasswordPage;
