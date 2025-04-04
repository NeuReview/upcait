import React from 'react';
import { useAuthStore } from '../store/authStore';

const ProfilePage = () => {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Iyong Profile</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 bg-neural-purple/10 rounded-full flex items-center justify-center">
              <span className="text-2xl font-semibold text-neural-purple">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="ml-4">
              <p className="text-lg font-semibold text-gray-900">
                {user?.email || 'Mag-log in para makita ang iyong profile'}
              </p>
              <p className="text-sm text-gray-500">Member since {new Date().toLocaleDateString()}</p>
            </div>
          </div>
          
          <div className="mt-6">
            <p className="text-gray-700">
              Ang feature na ito ay malapit nang matapos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 