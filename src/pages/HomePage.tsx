import React from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { 
  AcademicCapIcon, 
  BeakerIcon, 
  ChartBarIcon, 
  UserGroupIcon,
  ArrowRightIcon,
  LightBulbIcon,
  CpuChipIcon,
  RocketLaunchIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import Leaderboard from '../components/Leaderboard';

const features = [
  {
    name: 'AI-Powered Learning',
    description: 'Personalized study paths adapted to your unique learning style using advanced AI technology.',
    icon: CpuChipIcon,
  },
  {
    name: 'Comprehensive UPCAT Coverage',
    description: 'Complete preparation covering all UPCAT subjects with expert-crafted content.',
    icon: AcademicCapIcon,
  },
  {
    name: 'Real-time Analytics',
    description: 'Track your progress with detailed insights and performance metrics.',
    icon: ChartBarIcon,
  },
  {
    name: 'Community Support',
    description: 'Join a thriving community of aspiring UP students and expert mentors.',
    icon: UserGroupIcon,
  },
];

const testimonials = [
  {
    content: "UPCAiT's AI-powered system helped me achieve my target UPCAT score. The personalized approach made all the difference.",
    author: "Maria Santos",
    role: "UP Diliman, Computer Science",
  },
  {
    content: "The mock exams and detailed explanations helped me understand complex topics better. I'm now more confident about the UPCAT.",
    author: "John Cruz",
    role: "UP Manila, Biology",
  },
];

const plans = [
  {
    name: 'Basic',
    price: '₱499',
    duration: 'per month',
    features: [
      'Access to all subject materials',
      'Basic progress tracking',
      'Limited mock exams',
      'Community forum access',
    ],
    cta: 'Start Free Trial',
    featured: false,
    icon: LightBulbIcon,
  },
  {
    name: 'Premium',
    price: '₱899',
    duration: 'per month',
    features: [
      'Everything in Basic',
      'Unlimited mock exams',
      'AI-powered recommendations',
      'Personal study coach',
      'Advanced analytics',
      'Priority support',
    ],
    cta: 'Get Premium',
    featured: true,
    icon: RocketLaunchIcon,
  },
];



const HomePage = () => {

  const [loadingProgress, setLoadingProgress] = useState(60); // Initial 60% for animation
  const [isRedirecting, setIsRedirecting] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Hero Section with Neural Network Background */}
<div className="relative overflow-hidden min-h-[100vh] bg-gradient-to-br from-neural-purple via-tech-lavender to-white">

        <div className="absolute inset-0 neural-bg opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/0 to-white"></div>
<div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center min-h-[100vh]">
          <div className="text-center lg:text-left lg:grid lg:grid-cols-2 lg:gap-12 items-center">
            <div>
              <h1 className="text-4xl tracking-tight font-bold text-white sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl">
                <span className="block">Your AI-Powered</span>
                <span className="block text-success-gold">UPCAT Journey</span>
              </h1>
              <p className="mt-6 text-lg text-white/90 max-w-xl">
                Transform your UPCAT preparation with personalized AI learning paths, comprehensive study materials, and real-time progress tracking.
              </p>
              <div className="mt-8 sm:flex sm:justify-center lg:justify-start space-x-4">
                <button
                  className="btn-primary bg-white text-neural-purple hover:bg-success-gold hover:text-white"
                  onClick={() => {
                    setIsRedirecting(true);

                    setLoadingProgress(70);
                    setTimeout(() => {
                      setLoadingProgress(85);
                    }, 600);
                    setTimeout(() => {
                      setLoadingProgress(100);
                    }, 1700);
                    setTimeout(() => {
                      navigate('/register');
                    }, 2500); // navigate only after loading completes
                  }}
                >
                  Start Free Trial
                </button>

                <Link
                  to="/login"
                  className="btn-secondary border-white text-white hover:bg-white/10"
                >
                  Learn More
                </Link>
              </div>
            </div>
            <div className="mt-12 lg:mt-0">

<div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-neural p-8">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-neural-purple bg-opacity-10 rounded-xl flex items-center justify-center">
                      <CpuChipIcon className="w-6 h-6 text-neural-purple animate-pulse" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900">AI-Powered Learning</h3>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-gray-50/80 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Personalizing your study path...</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-gradient-to-r from-neural-purple to-tech-lavender h-2 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${loadingProgress}%` }}
                      ></div>

                      </div>
                    </div>
                    {/* Neural Network Animation */}
                    <div className="relative h-32 bg-gradient-to-br from-neural-purple/5 to-tech-lavender/5 rounded-lg overflow-hidden">
                      <div className="absolute inset-0 neural-bg opacity-20"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <BoltIcon className="w-12 h-12 text-neural-purple animate-float" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Leaderboard Section after Hero */}
      <div className="py-16 bg-gradient-to-br from-neural-purple/5 to-tech-lavender/5 relative">
        <div className="absolute inset-0 neural-bg opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-base text-neural-purple font-semibold tracking-wide uppercase">Top Performers</h2>
            <p className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
              UPCAT Champions
            </p>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              See how you stack up against other students preparing for UPCAT success
            </p>
          </div>
          <Leaderboard />
        </div>
      </div>

      {/* Features Section with Enhanced Visual Elements */}
      <div className="py-16 bg-white relative overflow-hidden">
        <div className="absolute inset-0 neural-bg opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-base text-neural-purple font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">Everything you need to succeed</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature) => (
                <div key={feature.name} className="relative bg-white rounded-xl p-6 shadow-md border border-gray-200">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-neural-purple to-tech-lavender rounded-xl flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{feature.name}</h3>
                </div>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section with Enhanced Design */}
      <div className="py-16 bg-gradient-to-br from-neural-purple/5 to-tech-lavender/5 relative">
        <div className="absolute inset-0 neural-bg opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">What Our Students Say</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
            <div className="relative bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <div className="absolute -top-4 -left-4 w-8 h-8 bg-neural-purple rounded-full flex items-center justify-center">
                  <UserGroupIcon className="w-4 h-4 text-white" />
                </div>
                <p className="text-gray-600 mb-4">{testimonial.content}</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.author}</p>
                  <p className="text-neural-purple">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Section with Enhanced Visual Elements
      <div className="py-16 bg-white relative overflow-hidden">
        <div className="absolute inset-0 neural-bg opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Choose Your Plan</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`card hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 ${
                  plan.featured 
                    ? 'border-2 border-neural-purple bg-gradient-to-br from-neural-purple/5 to-tech-lavender/5' 
                    : 'border border-gray-200'
                }`}
              >
                <div className="text-center">
                  <plan.icon className={`w-12 h-12 mx-auto ${
                    plan.featured ? 'text-neural-purple' : 'text-tech-lavender'
                  }`} />
                  <h3 className="text-2xl font-semibold text-gray-900 mt-4">{plan.name}</h3>
                  <p className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-gray-500">/{plan.duration}</span>
                  </p>
                  <ul className="mt-6 space-y-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center space-x-3">
                        <ArrowRightIcon className="w-5 h-5 text-neural-purple" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    className={`mt-8 w-full ${
                      plan.featured ? 'btn-primary' : 'btn-secondary'
                    }`}
                  >
                    {plan.cta}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div> */}

      {/* CTA Section with Enhanced Design */}
      <div className="bg-gradient-to-br from-neural-purple to-tech-lavender py-16 relative overflow-hidden">
        <div className="absolute inset-0 neural-bg opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-8">
            Start Your UPCAT Journey Today
          </h2>
          <Link
            to="/register"
            className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-neural-purple transition-colors duration-200"
          >
            Get Started for Free
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;