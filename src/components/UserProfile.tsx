import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useProfileStore } from '../store/profileStore';
import { 
  UserIcon, 
  AcademicCapIcon, 
  BuildingLibraryIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const yearLevels = [
  'Grade 11',
  'Grade 12',
  '1st Year College',
  '2nd Year College',
  '3rd Year College',
  '4th Year College'
];

const UserProfile = () => {
  const { user } = useAuthStore();
  const { profile, loading, error, fetchProfile, updateProfile } = useProfileStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    user_fullname: '',
    user_school: '',
    user_year_level: ''
  });

  useEffect(() => {
    if (user) {
      fetchProfile(user.id);
    }
  }, [user, fetchProfile]);

  useEffect(() => {
    if (profile) {
      setFormData({
        user_fullname: profile.user_fullname || '',
        user_school: profile.user_school || '',
        user_year_level: profile.user_year_level || ''
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await updateProfile(user.id, formData);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };

  if (loading) {
    return (
      <div className="relative bg-white rounded-lg shadow-neural p-4 overflow-hidden">
        
        <div className="animate-pulse space-y-4 relative">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3 mt-2"></div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-white rounded-lg shadow-neural p-4 overflow-hidden">
      
      <div className="relative">
        {/* Profile Header */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-neural-purple/10 rounded-full flex items-center justify-center">
            <UserIcon className="w-6 h-6 text-neural-purple" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">{profile?.user_fullname || 'Complete Your Profile'}</h2>
            <p className="text-sm text-gray-500">{profile?.user_school || 'Add your school information'}</p>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-3 py-1.5 text-sm text-neural-purple bg-neural-purple/10 rounded-md hover:bg-neural-purple/20"
            >
              <PencilIcon className="w-4 h-4 mr-1" />
              Edit
            </button>
          )}
        </div>

        {error && (
          <div className="mb-3 p-2 bg-alert-red/10 border border-alert-red/20 rounded">
            <p className="text-xs text-alert-red text-center">{error}</p>
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="relative">
                  <UserIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    id="user_fullname"
                    value={formData.user_fullname}
                    onChange={(e) => setFormData({ ...formData, user_fullname: e.target.value })}
                    className="pl-8 block w-full rounded border-gray-300 bg-gray-50 shadow-sm focus:border-neural-purple focus:ring-neural-purple text-sm py-2.5"
                    placeholder="Full Name"
                  />
                </div>
              </div>

              <div>
                <div className="relative">
                  <BuildingLibraryIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    id="user_school"
                    value={formData.user_school}
                    onChange={(e) => setFormData({ ...formData, user_school: e.target.value })}
                    className="pl-8 block w-full rounded border-gray-300 bg-gray-50 shadow-sm focus:border-neural-purple focus:ring-neural-purple text-sm py-2.5"
                    placeholder="School"
                  />
                </div>
              </div>

              <div className="col-span-2">
                <div className="relative">
                  <AcademicCapIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    id="user_year_level"
                    value={formData.user_year_level}
                    onChange={(e) => setFormData({ ...formData, user_year_level: e.target.value })}
                    className="pl-8 block w-full rounded border-gray-300 bg-gray-50 shadow-sm focus:border-neural-purple focus:ring-neural-purple text-sm py-2.5"
                  >
                    <option value="">Select Year Level</option>
                    {yearLevels.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="inline-flex items-center px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
              >
                <XMarkIcon className="w-4 h-4 mr-1" />
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-3 py-1.5 text-sm text-white bg-neural-purple rounded hover:bg-tech-lavender"
              >
                <CheckIcon className="w-4 h-4 mr-1" />
                Save
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded p-3 transform hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-neural-purple/10 rounded flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-neural-purple" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Full Name</p>
                  <p className="text-sm font-medium text-gray-900">{profile?.user_fullname || 'Not set'}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded p-3 transform hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-neural-purple/10 rounded flex items-center justify-center">
                  <BuildingLibraryIcon className="w-4 h-4 text-neural-purple" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">School</p>
                  <p className="text-sm font-medium text-gray-900">{profile?.user_school || 'Not set'}</p>
                </div>
              </div>
            </div>

            <div className="col-span-2 bg-gray-50 rounded p-3 transform hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-neural-purple/10 rounded flex items-center justify-center">
                  <AcademicCapIcon className="w-4 h-4 text-neural-purple" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Year Level</p>
                  <p className="text-sm font-medium text-gray-900">{profile?.user_year_level || 'Not set'}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;