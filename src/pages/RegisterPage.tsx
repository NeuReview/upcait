import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'
import { validatePassword } from '../utils/passwordValidation'
import { supabase } from '../lib/supabase'

const RegisterPage = () => {
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

   const pwCheck         = validatePassword(password)          // live strength
   const passwordValid   = pwCheck.isValid
   const passwordsMatch  = password && confirmPassword && password === confirmPassword
   const isFormValid =
     !loading &&                     // not submitting
     email.length > 0 &&             // some email text
     !emailError &&                  // not already taken
     passwordValid &&                // meets all 5 strength rules
     passwordsMatch                  // both fields identical

  // 1️⃣ onBlur: check user_profile for existing email
  const checkEmailExists = async () => {
    if (!email) {
      setEmailError(null)
      return
    }

    const { data, error } = await supabase
      .from('user_profile')
      .select('id', { count: 'exact' })
      .eq('email', email)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = “no rows found” for single()
      console.error('error checking email', error)
      setEmailError('Could not verify email.')
    } else if (data) {
      setEmailError('That email is already registered.')
    } else {
      setEmailError(null)
    }
  }

  // 2️⃣ Live–validate password strength
  useEffect(() => {
    if (!password) return setErrors([])
    const v = validatePassword(password)
    setErrors(v.errors)
  }, [password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors([])

    // block if email is known to be taken
    if (emailError) return

    // password strength
    const v = validatePassword(password)
    if (!v.isValid) {
      setErrors(v.errors)
      return
    }

    // confirm match
    if (password !== confirmPassword) {
      setErrors(['Passwords do not match'])
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/confirm`,
      },
    })
    setLoading(false)

    if (error) {
      // fallback if race condition
      if (error.message.toLowerCase().includes('already registered')) {
        setErrors(['That email is already registered. Please log in instead.'])
      } else {
        setErrors([error.message])
      }
      return
    }

    localStorage.setItem('magic-email', email)
    navigate('/email-sent')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-neural-purple hover:text-tech-lavender"
          >
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={checkEmailExists}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm ${
                    emailError
                      ? 'border-alert-red focus:ring-alert-red focus:border-alert-red'
                      : 'border-gray-300 focus:ring-neural-purple focus:border-neural-purple'
                  }`}
                />
              </div>
              {emailError && (
                <p className="mt-1 text-sm text-alert-red">{emailError}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-neural-purple focus:border-neural-purple sm:text-sm pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-neural-purple" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-neural-purple" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Confirm password
              </label>
              <div className="mt-1 relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-neural-purple focus:border-neural-purple sm:text-sm pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword((v) => !v)}
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
                <h3 className="text-sm font-medium text-gray-700">
                  Password Requirements:
                </h3>
                <RequirementCheck passed={password.length >= 12} text="At least 12 characters long" />
                <RequirementCheck passed={/[A-Z]/.test(password)} text="Contains uppercase letter" />
                <RequirementCheck passed={/[a-z]/.test(password)} text="Contains lowercase letter" />
                <RequirementCheck passed={/\d/.test(password)} text="Contains number" />
                <RequirementCheck passed={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)} text="Contains special character" />
              </div>
            )}

            {/* Submission Errors */}
            {errors.length > 0 && (
              <div className="rounded-md bg-alert-red/10 p-4">
                <div className="flex">
                  <XCircleIcon className="h-5 w-5 text-alert-red flex-shrink-0" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-alert-red">
                      Please fix the following errors:
                    </h3>
                    <ul className="mt-2 list-disc pl-5 space-y-1 text-sm text-alert-red">
                      {errors.map((e, i) => (
                        <li key={i}>{e}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Create Account */}
            <button
              type="submit"
              disabled={!isFormValid}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-neural-purple hover:bg-tech-lavender focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neural-purple disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

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
)

export default RegisterPage
