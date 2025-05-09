// src/pages/EmailLinkSentPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircleIcon, ArrowPathIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { supabase } from '../lib/supabase';

const EmailLinkSentPage: React.FC = () => {
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [resent, setResent]     = useState(false);
  const navigate                = useNavigate();

  // ✨ new: unified key
  const email = localStorage.getItem('verify-email') ?? '';

  /* Clear the key when the user leaves the screen — otherwise a
     stale address might show up the next time they open the app. */
  useEffect(() => {
    return () => localStorage.removeItem('verify-email');
  }, []);

  const handleResend = async () => {
    setError(null);
    setLoading(true);

    try {
      if (!email) throw new Error('Missing e‑mail address.');

      // “signup” → Supabase sends the same confirmation link again
      const { error: supaErr } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: { emailRedirectTo: `${window.location.origin}/confirm` },
      });

      if (supaErr) throw supaErr;
      setResent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error resending link.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => navigate('/login');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="text-3xl font-extrabold text-gray-900">Verify Your Email</h2>
        <p className="mt-2 text-sm text-gray-600">
          We’ve sent a verification link to{' '}
          <span className="font-medium text-gray-900">{email}</span>.
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

          {resent && (
            <div className="mb-4 p-2 text-sm text-growth-green bg-growth-green/10 rounded flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-growth-green mr-2" />
              Link resent! Check your inbox.
            </div>
          )}

          <button
            onClick={handleResend}
            disabled={loading}
            className="w-full flex justify-center items-center py-2 px-4 mb-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-neural-purple hover:bg-tech-lavender focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neural-purple disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? (<><ArrowPathIcon className="animate-spin h-5 w-5 mr-2" />Resending…</>)
              : 'Resend Link'}
          </button>

          <button
            onClick={handleBackToLogin}
            className="w-full flex justify-center py-2 px-4 text-sm font-medium text-neural-purple hover:text-tech-lavender"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailLinkSentPage;
