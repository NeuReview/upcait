import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <h1 className="text-9xl font-bold text-neural-purple">404</h1>
        <h2 className="mt-4 text-3xl font-semibold text-gray-900">Page Not Found</h2>
        <p className="mt-2 text-gray-600">We couldn’t find the page you were looking for.</p>
        <div className="mt-8">
          <Link 
            to="/" 
            className="inline-flex items-center px-6 py-3 bg-neural-purple text-white font-medium rounded-lg hover:bg-neural-purple/90 transition-colors duration-200"
          >
            Go back to the Home Page
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage; 