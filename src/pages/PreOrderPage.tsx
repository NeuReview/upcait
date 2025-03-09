import React, { useState, useEffect } from 'react';
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
  XMarkIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const PreOrderPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [showThankYouPopup, setShowThankYouPopup] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!email || !emailRegex.test(email)) {
      setMessage('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setMessage('');

    const { error } = await supabase
      .from('pre_order_email')
      .insert([{ email }]);

    if (error) {
      setMessage('There was an error submitting your email. Please try again.');
      setLoading(false);
      return;
    }

    setTimeout(() => {
      setLoading(false);
      setEmail('');
      setShowThankYouPopup(true);
    }, 2000);
  };

  return (
    <div className="h-screen relative bg-gradient-to-br from-[#6B46C1] via-[#9F7AEA] to-white overflow-hidden preorder-page-container">
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
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="text-center lg:text-left lg:grid lg:grid-cols-2 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10"
          >
            <h1 className="text-5xl font-bold text-white sm:text-6xl md:text-7xl font-display mb-6">
              Run Smarter
              <span className="block mt-2 text-[#F6E05E]">UPCAT Prep</span>
              <span className="mt-2 text-white">with </span>
              <span className="text-[#F6E05E]">AI</span>.
            </h1>
            <p className="text-xl text-white/90 max-w-2xl leading-relaxed font-body mb-8">
              Boost your review efficiency with AI-powered learning insights and personalized study paths. Experience the future of UPCAT preparation.
            </p>

            {/* Pre-order Form */}
            <motion.form
              onSubmit={handleSubmit}
              className="max-w-md"
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
                  required
                />
                <motion.button
                  type="submit"
                  className={`absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 font-medium text-[#2D3748] rounded-full inline-flex items-center justify-center gap-2 transition-all duration-300 ${
                    loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-[#F6E05E] to-[#F6AD55] hover:from-[#F6AD55] hover:to-[#F6E05E]'
                  }`}
                  disabled={loading}
                  initial={{ y: "-50%" }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ transformOrigin: "center" }}
                >
                  <SparklesIcon className="w-5 h-5" />
                  <span>{loading ? 'Submitting...' : 'Try For Free'}</span>
                </motion.button>
              </div>
            </motion.form>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div
            className="mt-12 lg:mt-0 relative z-10 flex items-center justify-center"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <div className="relative w-full">
              {/* Main Dashboard */}
              <motion.div className="w-full">
                <img
                  src="/images/student-dashboard.png"
                  alt="AI-Powered Dashboard"
                  className="w-full md:w-[110%] lg:w-[130%] h-auto max-w-none object-contain transform scale-100 md:scale-110 lg:scale-125 translate-y-0 md:-translate-y-13 lg:-translate-y-6 translate-x-0 md:-translate-x-6 lg:-translate-x-12 rounded-lg"
                />
              </motion.div>
            </div>
          </motion.div>
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

export default PreOrderPage;
