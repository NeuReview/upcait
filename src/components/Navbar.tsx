import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Disclosure } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '../store/authStore';

const Navbar = () => {
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const navigation = [
    ...(user ? [
      { name: 'Quizzes', href: '/quizzes' },
      { name: 'Mock Exams', href: '/mock-exams' },
      { name: 'Flashcards', href: '/flashcards' },
      { name: 'Dashboard', href: '/dashboard' },
    ] : []),
    { name: 'Subscription', href: '/pricing' },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <Disclosure as="nav" className="bg-white shadow-sm fixed w-full top-0 z-50">
      {({ open }) => (
        <>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <Link to="/" className="text-2xl font-bold text-neural-purple">
                    UPCaiT
                  </Link>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  {navigation.map((item) => (
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
                  ))}
                </div>
              </div>

              {/* Desktop auth buttons */}
              <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
                {user ? (
                  <>
                    <span className="text-sm text-gray-500">
                      {user.email}
                    </span>
                    <button
                      onClick={handleSignOut}
                      className="text-sm font-medium text-gray-500 hover:text-neural-purple"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="text-sm font-medium text-gray-500 hover:text-neural-purple"
                    >
                      Log in
                    </Link>
                    <Link
                      to="/register"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-neural-purple hover:bg-tech-lavender transition-colors duration-200"
                    >
                      Sign up free
                    </Link>
                  </>
                )}
              </div>

              {/* Mobile menu button */}
              <div className="flex items-center sm:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
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
              ))}
              {/* Mobile auth buttons */}
              {user ? (
                <div className="pt-4 pb-3 border-t border-gray-200">
                  <div className="space-y-1">
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
                </div>
              ) : (
                <div className="pt-4 pb-3 border-t border-gray-200">
                  <div className="space-y-1">
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
                </div>
              )}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};

export default Navbar;