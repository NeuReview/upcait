import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand and Description */}
          <div className="col-span-1 md:col-span-2">
          <img
            src="/images/logo.png"
            alt="UPCaiT Logo"
            className="h-8 w-auto"
          />
            <p className="mt-4 text-gray-500">
              Your AI-powered companion for UPCAT success. We help aspiring UP students prepare effectively with personalized learning paths and comprehensive study materials.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/quizzes" className="text-gray-500 hover:text-neural-purple">
                  Practice Quizzes
                </Link>
              </li>
              <li>
                <Link to="/mock-exams" className="text-gray-500 hover:text-neural-purple">
                  Mock Exams
                </Link>
              </li>
              <li>
                <Link to="/flashcards" className="text-gray-500 hover:text-neural-purple">
                  Flashcards
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-500 hover:text-neural-purple">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
              Contact Us
            </h3>
            <ul className="mt-4 space-y-4">
              <li className="text-gray-500">
                Email: support@upcait.com
              </li>
              <li className="text-gray-500">
                Phone: +63 (2) 8981-8500
              </li>
              <li className="text-gray-500">
                Address: Quezon City, Philippines
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} UPCAiT. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-neural-purple">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-neural-purple">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-neural-purple">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;