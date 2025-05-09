// src/pages/ConfirmPage.tsx
import React, { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { CheckCircleIcon } from '@heroicons/react/24/outline'
import { supabase } from '../lib/supabase'

const ConfirmPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  // If Supabase sent tokens in the URL, set the session automatically
  useEffect(() => {
    const accessToken = searchParams.get('access_token')
    const refreshToken = searchParams.get('refresh_token')
    if (accessToken && refreshToken) {
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })
    }
  }, [searchParams])

  const handleGoToSignIn = () => {
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <CheckCircleIcon className="mx-auto h-12 w-12 text-growth-green" />
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          Email Verified!
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Your email has been successfully confirmed.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
          <p className="mb-6 text-gray-700">
            You can now sign in and continue to your dashboard.
          </p>
          <button
            onClick={handleGoToSignIn}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-neural-purple hover:bg-tech-lavender focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neural-purple"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmPage
