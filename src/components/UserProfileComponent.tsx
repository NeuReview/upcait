import React, { useState } from 'react';
import { useUserProfile } from '../hooks/useUserProfile';
import { 
  UserIcon, 
  AcademicCapIcon, 
  BuildingLibraryIcon,
  PencilSquareIcon,
  CheckBadgeIcon,
  AtSymbolIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { supabase } from '../lib/supabase';

const yearLevels = [
  'Grade 11',
  'Grade 12',
  '1st Year College',
  '2nd Year College',
  '3rd Year College',
  '4th Year College'
];

interface UserProfile {
  id: number;
  created_at: string;
  user_fullname: string | null;
  user_year_level: string | null;
  user_school: string | null;
  user_id: string | null;
  user_username: string | null;
}

const UserProfileComponent = () => {
  const { profile, loading, error, updateProfile, createProfile } = useUserProfile();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    user_fullname: '',
    user_school: '',
    user_year_level: '',
    user_username: ''
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(true);

  // Update form data when profile loads
  React.useEffect(() => {
    if (profile) {
      setFormData({
        user_fullname: profile.user_fullname || '',
        user_school: profile.user_school || '',
        user_year_level: profile.user_year_level || '',
        user_username: profile.user_username || ''
      });
    }
  }, [profile]);

  const checkUsernameUnique = async (username: string) => {
    if (!username || (profile && profile.user_username === username)) {
      setUsernameAvailable(true);
      return true;
    }
    
    setUsernameChecking(true);
    
    try {
      const { data, error } = await supabase
        .from('user_profile')
        .select('user_username')
        .eq('user_username', username);

      if (error) throw error;
      
      const isAvailable = data.length === 0;
      setUsernameAvailable(isAvailable);
      return isAvailable;
    } catch (err) {
      console.error('Error checking username uniqueness:', err);
      setUsernameAvailable(false);
      return false;
    } finally {
      setUsernameChecking(false);
    }
  };

  const handleUsernameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const username = e.target.value;
    setFormData({ ...formData, user_username: username });
    
    if (username.length > 2) {
      await checkUsernameUnique(username);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    // Validate required fields
    if (!formData.user_fullname) {
      setErrorMessage('Full Name is required');
      return;
    }
    
    if (!formData.user_username) {
      setErrorMessage('Username is required');
      return;
    }
    
    if (!usernameAvailable) {
      setErrorMessage('Username is already taken');
      return;
    }

    try {
      if (profile) {
        await updateProfile(formData);
      } else {
        await createProfile(formData);
      }
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving profile:', err);
      setErrorMessage('Failed to save profile changes');
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
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-neural-purple to-tech-lavender p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Profile Information</h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm transition-colors"
            >
              <PencilSquareIcon className="w-4 h-4 mr-1" />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-6 p-4 bg-alert-red/10 border border-alert-red/20 rounded-lg flex items-start">
            <ExclamationCircleIcon className="w-5 h-5 text-alert-red mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-alert-red">{error}</p>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 bg-alert-red/10 border border-alert-red/20 rounded-lg flex items-start">
            <ExclamationCircleIcon className="w-5 h-5 text-alert-red mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-alert-red">{errorMessage}</p>
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="user_fullname" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-alert-red">*</span>
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="user_fullname"
                    value={formData.user_fullname || ''}
                    onChange={(e) => setFormData({ ...formData, user_fullname: e.target.value })}
                    className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-neural-purple focus:ring-neural-purple sm:text-sm"
                    placeholder="John Dela Cruz"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="user_username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username <span className="text-alert-red">*</span>
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <AtSymbolIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="user_username"
                    value={formData.user_username || ''}
                    onChange={handleUsernameChange}
                    className={`block w-full pl-10 pr-10 rounded-md border-gray-300 shadow-sm focus:ring-neural-purple sm:text-sm ${
                      !usernameAvailable && formData.user_username 
                        ? 'border-alert-red focus:border-alert-red' 
                        : 'focus:border-neural-purple'
                    }`}
                    placeholder="juandelacruz"
                    required
                  />
                  {formData.user_username && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      {usernameChecking ? (
                        <div className="h-4 w-4 border-2 border-gray-300 border-t-neural-purple rounded-full animate-spin"></div>
                      ) : usernameAvailable ? (
                        <CheckBadgeIcon className="h-5 w-5 text-growth-green" />
                      ) : (
                        <ExclamationCircleIcon className="h-5 w-5 text-alert-red" />
                      )}
                    </div>
                  )}
                </div>
                {!usernameAvailable && formData.user_username && (
                  <p className="mt-1 text-sm text-alert-red">Username already taken</p>
                )}
              </div>

              <div>
                <label htmlFor="user_school" className="block text-sm font-medium text-gray-700 mb-1">
                  School
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <BuildingLibraryIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="user_school"
                    value={formData.user_school || ''}
                    onChange={(e) => setFormData({ ...formData, user_school: e.target.value })}
                    className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-neural-purple focus:ring-neural-purple sm:text-sm"
                    placeholder="University of the Philippines"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="user_year_level" className="block text-sm font-medium text-gray-700 mb-1">
                  Year Level
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <AcademicCapIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="user_year_level"
                    value={formData.user_year_level || ''}
                    onChange={(e) => setFormData({ ...formData, user_year_level: e.target.value })}
                    className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-neural-purple focus:ring-neural-purple sm:text-sm"
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
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setErrorMessage('');
                  if (profile) {
                    setFormData({
                      user_fullname: profile.user_fullname || '',
                      user_school: profile.user_school || '',
                      user_year_level: profile.user_year_level || '',
                      user_username: profile.user_username || ''
                    });
                  }
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 text-sm font-medium text-white bg-neural-purple hover:bg-tech-lavender rounded-md transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <UserIcon className="w-5 h-5 text-neural-purple mr-2" />
                  <h3 className="font-medium text-gray-900">Full Name</h3>
                </div>
                <p className="text-gray-800">{profile?.user_fullname || 'Not set'}</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <AtSymbolIcon className="w-5 h-5 text-neural-purple mr-2" />
                  <h3 className="font-medium text-gray-900">Username</h3>
                </div>
                <p className="text-gray-800">{profile?.user_username || 'Not set'}</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <BuildingLibraryIcon className="w-5 h-5 text-neural-purple mr-2" />
                  <h3 className="font-medium text-gray-900">School</h3>
                </div>
                <p className="text-gray-800">{profile?.user_school || 'Not set'}</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <AcademicCapIcon className="w-5 h-5 text-neural-purple mr-2" />
                  <h3 className="font-medium text-gray-900">Year Level</h3>
                </div>
                <p className="text-gray-800">{profile?.user_year_level || 'Not set'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfileComponent; 