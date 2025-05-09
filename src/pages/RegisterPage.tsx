import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { validatePassword } from '../utils/passwordValidation';
import { useAuthStore } from '../store/authStore';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const { signUp, loading } = useAuthStore();
  const navigate = useNavigate();

  // Validate password on change
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
    setErrors([]);

    // Validate password
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
      // send the magic‐link / signUp
      await signUp(email, password);
      // stash email so EmailLinkSentPage can pick it up
      localStorage.setItem('magic-email', email);
      // now show the “we’ve sent it” screen
      navigate('/email-sent');
    } catch (err) {
      setErrors([err instanceof Error ? err.message : 'An error occurred']);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-neural-purple hover:text-tech-lavender">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
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

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
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
                Confirm password
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
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

            {/* Password Requirements */}
            {password && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700">Password Requirements:</h3>
                <div className="space-y-1">
                  <RequirementCheck
                    passed={password.length >= 12}
                    text="At least 12 characters long"
                  />
                  <RequirementCheck
                    passed={/[A-Z]/.test(password)}
                    text="Contains uppercase letter"
                  />
                  <RequirementCheck
                    passed={/[a-z]/.test(password)}
                    text="Contains lowercase letter"
                  />
                  <RequirementCheck
                    passed={/\d/.test(password)}
                    text="Contains number"
                  />
                  <RequirementCheck
                    passed={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)}
                    text="Contains special character"
                  />
                </div>
              </div>
            )}

            {errors.length > 0 && (
              <div className="rounded-md bg-alert-red/10 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <XCircleIcon className="h-5 w-5 text-alert-red" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-alert-red">
                      Please fix the following errors:
                    </h3>
                    <div className="mt-2 text-sm text-alert-red">
                      <ul className="list-disc pl-5 space-y-1">
                        {errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading || errors.length > 0}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-neural-purple hover:bg-tech-lavender focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neural-purple disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account...' : 'Create account'}
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
    {passed ? (
      <CheckCircleIcon className="h-4 w-4 text-growth-green" />
    ) : (
      <XCircleIcon className="h-4 w-4 text-alert-red" />
    )}
    <span className={`text-sm ${passed ? 'text-growth-green' : 'text-alert-red'}`}>
      {text}
    </span>
  </div>
);

export default RegisterPage;