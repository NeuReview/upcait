import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Disclosure } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '../store/authStore';

const Navbar: React.FC = () => {
  const [practiceOpen, setPracticeOpen] = useState(false);
  const { user, signOut, otpPending } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Always point to real routes; App.tsx guards will handle otpPending
  const practiceItems = [
    { name: 'Quizzes',    href: '/quizzes'    },
    { name: 'Mock Exams', href: '/mock-exams' },
    { name: 'Flashcards', href: '/flashcards' },
  ];

  // Top-level navbar items
  const navigation = [
    ...(user
      ? [
          // grouped under Practice
          { name: 'Practice', children: practiceItems },
          { name: 'Dashboard', href: '/dashboard' },
        ]
      : []),
    { name: 'Subscription', href: '/pricing' },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <Disclosure as="nav" className="bg-white shadow-sm fixed w-full top-0 z-50">
      {({ open }) => (
        <>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              {/* Brand + Desktop Nav */}
              <div className="flex items-center">
              <img
                src="/images/logo.png"
                alt="UPCaiT Logo"
                className="h-8 w-auto"
              />
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  {navigation.map((item) =>
                    item.children ? (
                      <div key={item.name} className="relative inline-block text-left">
                        <button
                          onClick={() => setPracticeOpen((o) => !o)}
                          className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                            practiceItems.some((ci) => location.pathname === ci.href)
                              ? 'text-neural-purple border-b-2 border-neural-purple'
                              : 'text-gray-500 hover:text-neural-purple hover:border-b-2 hover:border-neural-purple'
                          }`}
                        >
                          {item.name}
                          <svg
                            className="ml-1 h-4 w-4 transform"
                            style={{ transform: practiceOpen ? 'rotate(180deg)' : undefined }}
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {practiceOpen && (
                          <div className="absolute left-0 mt-2 w-40 bg-white border rounded shadow-lg z-20">
                            {practiceItems.map((child) => (
                              <Link
                                key={child.name}
                                to={child.href}
                                onClick={() => setPracticeOpen(false)}
                                className={`block px-4 py-2 text-sm ${
                                  location.pathname === child.href
                                    ? 'text-neural-purple'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                              >
                                {child.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                          location.pathname === item.href
                            ? 'text-neural-purple border-b-2 border-neural-purple'
                            : 'text-gray-500 hover:text-neural-purple hover:border-b-2 hover:border-neural-purple'
                        }`}
                      >
                        {item.name}
                      </Link>
                    )
                  )}
                </div>
              </div>

              {/* Auth buttons (desktop) */}
              <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
                {user ? (
                  <>
                    <span className="text-sm text-gray-500">{user.email}</span>
                    <button
                      onClick={handleSignOut}
                      className="text-sm font-medium text-gray-500 hover:text-neural-purple"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="text-sm font-medium text-gray-500 hover:text-neural-purple">
                      Log in
                    </Link>
                    <Link
                      to="/register"
                      className="inline-flex items-center px-4 py-2 border text-sm font-medium rounded-lg text-white bg-neural-purple hover:bg-tech-lavender"
                    >
                      Sign up free
                    </Link>
                  </>
                )}
              </div>

              {/* Mobile menu button */}
              <div className="flex items-center sm:hidden">
                <Disclosure.Button className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
                  {open ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          {/* Mobile panel */}
          <Disclosure.Panel className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {navigation.map((item) =>
                item.children ? (
                  <React.Fragment key={item.name}>
                    <div className="px-3 py-2 text-sm font-semibold text-gray-700">{item.name}</div>
                    {item.children.map((child) => (
                      <Link
                        key={child.name}
                        to={child.href}
                        onClick={() => setPracticeOpen(false)}
                        className={`block pl-6 pr-4 py-2 text-base font-medium ${
                          location.pathname === child.href
                            ? 'text-neural-purple bg-neural-purple/5'
                            : 'text-gray-500 hover:text-neural-purple hover:bg-gray-50'
                        }`}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </React.Fragment>
                ) : (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`block pl-3 pr-4 py-2 text-base font-medium ${
                      location.pathname === item.href
                        ? 'text-neural-purple bg-neural-purple/5'
                        : 'text-gray-500 hover:text-neural-purple hover:bg-gray-50'
                    }`}
                  >
                    {item.name}
                  </Link>
                )
              )}
            </div>

            {/* Mobile auth */}
            {user ? (
              <div className="pt-4 pb-3 border-t border-gray-200">
                <span className="block pl-3 pr-4 py-2 text-base font-medium text-gray-500">
                  {user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left pl-3 pr-4 py-2 text-base font-medium text-gray-500 hover:text-neural-purple hover:bg-gray-50"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="pt-4 pb-3 border-t border-gray-200 space-y-1">
                <Link
                  to="/login"
                  className="block pl-3 pr-4 py-2 text-base font-medium text-gray-500 hover:text-neural-purple hover:bg-gray-50"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="block pl-3 pr-4 py-2 text-base font-medium text-neural-purple hover:bg-gray-50"
                >
                  Sign up free
                </Link>
              </div>
            )}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};

export default Navbar;
