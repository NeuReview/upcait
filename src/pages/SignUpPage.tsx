import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  AcademicCapIcon, 
  CpuChipIcon, 
  ChartBarIcon, 
  UserGroupIcon,
  RocketLaunchIcon,
  SparklesIcon,
  BeakerIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  XMarkIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Security constants
const MAX_ATTEMPTS = 5;
const THROTTLE_TIME = 2000; // 2 seconds
const LOCKOUT_TIME = 60000; // 1 minute

const SignUpPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [showThankYouPopup, setShowThankYouPopup] = useState(false);
  
  // Security state
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTimer, setLockoutTimer] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [honeypotField, setHoneypotField] = useState('');
  const lastSubmitTime = useRef<number>(0);

  const dashboardImages = [
    '/images/student-dashboard.png',
    '/images/student-dashboard-2.png'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev === 0 ? 1 : 0));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Hide any navigation elements when on this page
    document.body.classList.add('preorder-page');
    
    // Clean up function
    return () => {
      document.body.classList.remove('preorder-page');
    };
  }, []);

  // Lockout timer effect
  useEffect(() => {
    if (isLocked && remainingTime > 0) {
      const timer = setTimeout(() => {
        setRemainingTime(prev => {
          if (prev <= 1000) {
            setIsLocked(false);
            setAttempts(0);
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isLocked, remainingTime]);

  // Check if the email is valid
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    return emailRegex.test(email);
  };

  // Check for suspicious patterns
  const isSuspicious = (email: string): boolean => {
    // Check for common spam patterns
    const suspiciousPatterns = [
      /@(temp|fake|disposable|mailinator|guerrilla)/i,
      /^admin@/i,
      /^test@/i,
      /^[a-z]{1,3}@/i, // Very short usernames
      /\.(ru|cn|tk)$/i // Commonly used in spam
    ];
    
    return suspiciousPatterns.some(pattern => pattern.test(email));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Honeypot check - if filled, it's likely a bot
    if (honeypotField) {
      console.log('Honeypot triggered');
      setMessage('Submission successful!'); // Fake success to confuse bots
      return;
    }
    
    // Check if form is locked
    if (isLocked) {
      setMessage(`Too many attempts. Please try again in ${Math.ceil(remainingTime / 1000)} seconds.`);
      return;
    }
    
    // Rate limiting - check time since last submission
    const now = Date.now();
    const timeSinceLastSubmit = now - lastSubmitTime.current;
    
    if (timeSinceLastSubmit < THROTTLE_TIME) {
      setMessage('Please wait a moment before submitting again.');
      return;
    }
    
    // Validate email
    if (!email) {
      setMessage('Please enter your email address.');
      incrementAttempts();
      return;
    }
    
    if (!isValidEmail(email)) {
      setMessage('Please enter a valid email address.');
      incrementAttempts();
      return;
    }
    
    // Check for suspicious patterns
    if (isSuspicious(email)) {
      setMessage('This email address appears to be invalid.');
      incrementAttempts();
      return;
    }
    
    // Update last submit time
    lastSubmitTime.current = now;
    
    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase
        .from('pre_order_email')
        .insert([{ email }]);

      if (error) {
        console.error('Supabase Error:', error);
        setMessage('There was an error submitting your email. Please try again.');
        setLoading(false);
        return;
      }

      // Reset attempts on successful submission
      setAttempts(0);
      
      setTimeout(() => {
        setLoading(false);
        setEmail('');
        setShowThankYouPopup(true);
      }, 2000);
    } catch (error) {
      console.error('Unexpected Error:', error);
      setMessage('An unexpected error occurred. Please try again later.');
      setLoading(false);
      incrementAttempts();
    }
  };
  
  // Increment attempts and check if should lock
  const incrementAttempts = () => {
    setAttempts(prev => {
      const newAttempts = prev + 1;
      if (newAttempts >= MAX_ATTEMPTS) {
        setIsLocked(true);
        setRemainingTime(LOCKOUT_TIME);
      }
      return newAttempts;
    });
  };

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-[#6B46C1] via-[#9F7AEA] to-white overflow-hidden preorder-page-container">
      {/* Geometric Patterns */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#F6E05E] opacity-5 rounded-full transform -translate-x-1/3 translate-y-1/3"></div>
        
        {/* Triangles */}
        <svg className="absolute top-1/4 right-1/4 w-32 h-32 text-white opacity-5" viewBox="0 0 100 100">
          <polygon points="50,0 100,100 0,100" fill="currentColor" />
        </svg>
        <svg className="absolute bottom-1/4 left-1/3 w-24 h-24 text-[#F6E05E] opacity-5 transform rotate-45" viewBox="0 0 100 100">
          <polygon points="50,0 100,100 0,100" fill="currentColor" />
        </svg>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 grid-pattern"></div>
        
        {/* Geometric Dots */}
        <div className="geometric-dot w-4 h-4" style={{ top: '15%', left: '10%', animationDelay: '0s' }}></div>
        <div className="geometric-dot w-6 h-6" style={{ top: '25%', right: '15%', animationDelay: '0.5s' }}></div>
        <div className="geometric-dot w-3 h-3" style={{ bottom: '30%', left: '20%', animationDelay: '1s' }}></div>
        <div className="geometric-dot w-5 h-5" style={{ bottom: '15%', right: '25%', animationDelay: '1.5s' }}></div>
        <div className="geometric-dot w-8 h-8" style={{ top: '40%', left: '30%', animationDelay: '2s', opacity: '0.1' }}></div>
      </div>

      {/* Particle Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-white rounded-full animate-pulse delay-75"></div>
        <div className="absolute top-2/3 left-1/2 w-2 h-2 bg-white rounded-full animate-pulse delay-150"></div>
        <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-white rounded-full animate-pulse delay-300"></div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen">
        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
          {/* Logo */}
          <div className="absolute top-0 left-4 sm:left-6 lg:left-8 pt-4 sm:pt-6">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center"
            >
              <img 
                src="/images/logo.png" 
                alt="UPCAiT Logo" 
                className="h-10 w-auto"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/images/logo-placeholder.png';
                }}
              />
            </motion.div>
          </div>

          <div className="text-center lg:text-left lg:grid lg:grid-cols-2 lg:gap-8 xl:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="relative z-10 max-w-xl mx-auto lg:mx-0"
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white font-display mb-6">
                Run Smarter
                <span className="block mt-2 text-[#F6E05E]">UPCAT Prep</span>
                <span className="text-white">with </span>
                <span className="text-[#F6E05E]">AI</span>.
              </h1>
              <p className="text-lg sm:text-xl text-white/90 max-w-2xl leading-relaxed font-body mb-8">
                Boost your review efficiency with AI-powered learning insights and personalized study paths. Experience the future of UPCAT preparation.
              </p>

              {/* Pre-order Form */}
              <motion.form
                onSubmit={handleSubmit}
                className="max-w-md mx-auto lg:mx-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-6 py-4 rounded-full border-2 border-white/20 focus:ring-2 focus:ring-[#F6E05E] focus:border-transparent focus:outline-none shadow-xl transition-all duration-300 bg-white/10 backdrop-blur-sm text-white placeholder-white/70"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLocked || loading}
                    required
                  />
                  
                  {/* Honeypot field - hidden from users but bots might fill it */}
                  <input
                    type="email"
                    name="email_confirm"
                    value={honeypotField}
                    onChange={(e) => setHoneypotField(e.target.value)}
                    autoComplete="off"
                    tabIndex={-1}
                    className="opacity-0 absolute top-0 left-0 h-0 w-0 z-[-1]"
                    aria-hidden="true"
                  />
                  
                  <motion.button
                    type="submit"
                    className={`absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 font-medium text-[#2D3748] rounded-full inline-flex items-center justify-center gap-2 transition-all duration-300 ${
                      loading || isLocked ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-[#F6E05E] to-[#F6AD55] hover:from-[#F6AD55] hover:to-[#F6E05E]'
                    }`}
                    disabled={loading || isLocked}
                    initial={{ y: "-50%" }}
                    whileHover={{ scale: isLocked ? 1 : 1.05 }}
                    whileTap={{ scale: isLocked ? 1 : 0.95 }}
                    style={{ transformOrigin: "center" }}
                  >
                    {isLocked ? (
                      <ShieldCheckIcon className="w-5 h-5" />
                    ) : (
                      <SparklesIcon className="w-5 h-5" />
                    )}
                    <span>
                      {isLocked 
                        ? `Locked (${Math.ceil(remainingTime / 1000)}s)` 
                        : loading 
                          ? 'Submitting...' 
                          : 'Try For Free'}
                    </span>
                  </motion.button>
                </div>
                
                {message && (
                  <motion.p 
                    className={`mt-2 ${isLocked ? 'text-red-300' : 'text-white'}`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {message}
                  </motion.p>
                )}
                
                {attempts > 0 && attempts < MAX_ATTEMPTS && (
                  <p className="mt-1 text-xs text-white/70">
                    {MAX_ATTEMPTS - attempts} attempts remaining
                  </p>
                )}
              </motion.form>
            </motion.div>

            {/* Dashboard Preview */}
            <motion.div
              className="mt-12 lg:mt-0 relative z-10 flex items-center justify-center"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <div className="relative w-full max-w-2xl mx-auto">
                {/* Main Dashboard */}
                <motion.div
                  className="mt-12 lg:mt-0 relative z-10 flex items-center justify-center"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                >
                  <div className="relative w-full max-w-5xl mx-auto">
                    {/* Enlarged Dashboard Image */}
                    <motion.div className="w-full">
                      <img
                        src="/images/website.png"
                        alt="AI-Powered Dashboard"
                        className="w-[100%] h-auto max-w-none transform scale-125 -translate-y-6 "
                      />
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Thank You Popup */}
      <AnimatePresence>
        {showThankYouPopup && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative overflow-hidden"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", bounce: 0.4 }}
            >
              <button 
                onClick={() => setShowThankYouPopup(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <CheckCircleIcon className="w-12 h-12 text-green-600" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Thank You for Joining!</h3>
                
                <p className="text-gray-600 mb-6">
                  We're thrilled to have you on board! You'll be among the first to experience the future of UPCAT preparation with AI. 
                  We'll notify you as soon as UPCAiT is ready to launch.
                </p>
                
                <div className="w-full h-1 bg-gradient-to-r from-[#6B46C1] to-[#F6E05E] rounded-full mb-6"></div>
                
                <p className="text-gray-700 font-medium mb-6">
                  Get ready for a revolutionary learning experience!
                </p>
                
                <motion.button
                  onClick={() => setShowThankYouPopup(false)}
                  className="px-8 py-3 bg-gradient-to-r from-[#6B46C1] to-[#9F7AEA] text-white font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Continue Exploring
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SignUpPage;
