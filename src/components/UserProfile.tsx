import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useProfileStore } from '../store/profileStore';
import { UserIcon, AcademicCapIcon, BuildingLibraryIcon } from '@heroicons/react/24/outline';

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
    full_name: '',
    school: '',
    year_level: ''
  });

  useEffect(() => {
    if (user) {
      fetchProfile(user.id);
    }
  }, [user, fetchProfile]);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        school: profile.school || '',
        year_level: profile.year_level || ''
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
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm text-neural-purple hover:text-tech-lavender"
          >
            Edit Profile
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-alert-red/10 border border-alert-red/20 rounded-lg">
          <p className="text-sm text-alert-red">{error}</p>
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-neural-purple focus:ring-neural-purple sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="school" className="block text-sm font-medium text-gray-700">
              School
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="school"
                value={formData.school}
                onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-neural-purple focus:ring-neural-purple sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="year_level" className="block text-sm font-medium text-gray-700">
              Year Level
            </label>
            <div className="mt-1">
              <select
                id="year_level"
                value={formData.year_level}
                onChange={(e) => setFormData({ ...formData, year_level: e.target.value })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-neural-purple focus:ring-neural-purple sm:text-sm"
              >
                <option value="">Select Year Level</option>
                {yearLevels.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm text-white bg-neural-purple rounded-md hover:bg-tech-lavender"
            >
              Save Changes
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <UserIcon className="w-5 h-5 text-neural-purple" />
            <div>
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="font-medium">{profile?.full_name || 'Not set'}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <BuildingLibraryIcon className="w-5 h-5 text-neural-purple" />
            <div>
              <p className="text-sm text-gray-500">School</p>
              <p className="font-medium">{profile?.school || 'Not set'}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <AcademicCapIcon className="w-5 h-5 text-neural-purple" />
            <div>
              <p className="text-sm text-gray-500">Year Level</p>
              <p className="font-medium">{profile?.year_level || 'Not set'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile