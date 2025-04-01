import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import GeometricShapes from '../components/GeometricShapes';
import { 
  AcademicCapIcon, 
  BeakerIcon, 
  ChartBarIcon, 
  UserGroupIcon,
  ArrowRightIcon,
  LightBulbIcon,
  CpuChipIcon,
  RocketLaunchIcon,
  BoltIcon,
  PlayCircleIcon,
  BookOpenIcon,
  CheckCircleIcon
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
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen">
      {/* Enhanced Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-neural-purple via-tech-lavender to-white">
        <GeometricShapes />
        <div className="absolute inset-0 neural-bg opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/0 to-white"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-32 lg:pb-36">
          <div className="text-center lg:text-left lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            <div className="col-span-7">
              <h1 className="text-4xl tracking-tight font-bold text-white sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl">
                <span className="block">Prepare for UPCAT</span>
                <span className="block text-success-gold">with AI-Powered Learning</span>
              </h1>
              <p className="mt-6 text-xl text-white/90 max-w-2xl">
                Join thousands of students who have transformed their UPCAT preparation with UPCAiT's personalized learning experience.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                {!user ? (
                  <>
                    <Link
                      to="/register"
                      className="btn-primary bg-white text-neural-purple hover:bg-success-gold hover:text-white flex items-center justify-center gap-2"
                    >
                      <RocketLaunchIcon className="w-5 h-5" />
                      Start Free Trial
                    </Link>
                    <Link
                      to="/login"
                      className="btn-secondary border-white text-white hover:bg-white/10 flex items-center justify-center gap-2"
                    >
                      <PlayCircleIcon className="w-5 h-5" />
                      Watch Demo
                    </Link>
                  </>
                ) : (
                  <Link
                    to="/dashboard"
                    className="btn-primary bg-white text-neural-purple hover:bg-success-gold hover:text-white flex items-center justify-center gap-2"
                  >
                    <ArrowRightIcon className="w-5 h-5" />
                    Go to Dashboard
                  </Link>
                )}
              </div>
              <div className="mt-12 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">10k+</div>
                  <div className="text-sm text-white/80">Active Students</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">95%</div>
                  <div className="text-sm text-white/80">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">24/7</div>
                  <div className="text-sm text-white/80">AI Support</div>
                </div>
              </div>
            </div>
            <div className="col-span-5 mt-12 lg:mt-0">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-neural p-8 transform hover:-translate-y-1 transition-all duration-300">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-neural-purple bg-opacity-10 rounded-xl flex items-center justify-center">
                      <CpuChipIcon className="w-6 h-6 text-neural-purple animate-pulse" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900">AI-Powered Learning</h3>
                      <p className="text-sm text-gray-600">Personalized for your success</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-gray-50/80 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpenIcon className="w-5 h-5 text-neural-purple" />
                        <span className="text-sm font-medium text-gray-900">Learning Progress</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-gradient-to-r from-neural-purple to-tech-lavender h-2 rounded-full animate-progress" style={{ width: '60%' }}></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50/80 p-4 rounded-lg">
                        <div className="flex items-center gap-2">
                          <CheckCircleIcon className="w-5 h-5 text-growth-green" />
                          <span className="text-sm text-gray-900">Smart Quizzes</span>
                        </div>
                      </div>
                      <div className="bg-gray-50/80 p-4 rounded-lg">
                        <div className="flex items-center gap-2">
                          <ChartBarIcon className="w-5 h-5 text-energy-orange" />
                          <span className="text-sm text-gray-900">Analytics</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Benefits Section */}
      <div className="bg-white py-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <GeometricShapes />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center gap-4 p-6 rounded-xl bg-neural-purple/5 border border-neural-purple/10">
              <div className="w-12 h-12 rounded-full bg-neural-purple/10 flex items-center justify-center">
                <CpuChipIcon className="w-6 h-6 text-neural-purple" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">AI-Powered</h3>
                <p className="text-sm text-gray-600">Personalized learning path</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-6 rounded-xl bg-tech-lavender/5 border border-tech-lavender/10">
              <div className="w-12 h-12 rounded-full bg-tech-lavender/10 flex items-center justify-center">
                <BookOpenIcon className="w-6 h-6 text-tech-lavender" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Comprehensive</h3>
                <p className="text-sm text-gray-600">Complete UPCAT coverage</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-6 rounded-xl bg-success-gold/5 border border-success-gold/10">
              <div className="w-12 h-12 rounded-full bg-success-gold/10 flex items-center justify-center">
                <ChartBarIcon className="w-6 h-6 text-success-gold" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Track Progress</h3>
                <p className="text-sm text-gray-600">Real-time analytics</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Leaderboard Section after Hero */}
      <div className="py-16 bg-gradient-to-br from-neural-purple/5 to-tech-lavender/5 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <GeometricShapes />
        </div>
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
        <div className="absolute inset-0 opacity-30">
          <GeometricShapes />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-base text-neural-purple font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">Everything you need to succeed</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature) => (
              <div key={feature.name} className="card hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-white to-gray-50">
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
      <div className="py-16 bg-gradient-to-br from-neural-purple/5 to-tech-lavender/5 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <GeometricShapes />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">What Our Students Say</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card bg-white/80 backdrop-blur-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
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

      {/* Pricing Section with Enhanced Visual Elements */}
      <div className="py-16 bg-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <GeometricShapes />
        </div>
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
      </div>

      {/* CTA Section with Enhanced Design */}
      <div className="bg-gradient-to-br from-neural-purple to-tech-lavender py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <GeometricShapes />
        </div>
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