import React, { useState } from 'react';
import { TrophyIcon, AcademicCapIcon, FireIcon } from '@heroicons/react/24/outline';

// Dummy data for demonstration
const dummyData = {
  questions: [
    {
      user_id: '1',
      profile: {
        full_name: 'Pedro Penduko',
        school: 'Manila Science High School'
      },
      questions_answered: 1000,
      accuracy_percentage: 85
    },
    {
      user_id: '2',
      profile: {
        full_name: 'Miguel Garcia',
        school: 'UP Rural High School'
      },
      questions_answered: 750,
      accuracy_percentage: 80
    },
    {
      user_id: '3',
      profile: {
        full_name: 'Juan Dela Cruz',
        school: 'UP Diliman'
      },
      questions_answered: 500,
      accuracy_percentage: 90
    },
    {
      user_id: '4',
      profile: {
        full_name: 'Maria Santos',
        school: 'Philippine Science High School'
      },
      questions_answered: 300,
      accuracy_percentage: 95
    },
    {
      user_id: '5',
      profile: {
        full_name: 'Ana Reyes',
        school: 'Quezon City Science High School'
      },
      questions_answered: 250,
      accuracy_percentage: 90
    }
  ],
  accuracy: [
    {
      user_id: '4',
      profile: {
        full_name: 'Maria Santos',
        school: 'Philippine Science High School'
      },
      questions_answered: 300,
      accuracy_percentage: 95
    },
    {
      user_id: '3',
      profile: {
        full_name: 'Juan Dela Cruz',
        school: 'UP Diliman'
      },
      questions_answered: 500,
      accuracy_percentage: 90
    },
    {
      user_id: '5',
      profile: {
        full_name: 'Ana Reyes',
        school: 'Quezon City Science High School'
      },
      questions_answered: 250,
      accuracy_percentage: 90
    },
    {
      user_id: '1',
      profile: {
        full_name: 'Pedro Penduko',
        school: 'Manila Science High School'
      },
      questions_answered: 1000,
      accuracy_percentage: 85
    },
    {
      user_id: '2',
      profile: {
        full_name: 'Miguel Garcia',
        school: 'UP Rural High School'
      },
      questions_answered: 750,
      accuracy_percentage: 80
    }
  ]
};

const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState<'questions' | 'accuracy'>('questions');

  const getOrdinal = (n: number) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  const getMedalColor = (index: number) => {
    switch (index) {
      case 0: return 'text-yellow-400';
      case 1: return 'text-gray-400';
      case 2: return 'text-amber-600';
      default: return 'text-gray-600';
    }
  };

  const displayData = activeTab === 'questions' ? dummyData.questions : dummyData.accuracy;

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Leaderboard</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('questions')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                activeTab === 'questions'
                  ? 'bg-neural-purple text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Most Questions
            </button>
            <button
              onClick={() => setActiveTab('accuracy')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                activeTab === 'accuracy'
                  ? 'bg-neural-purple text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Highest Accuracy
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {displayData.map((user, index) => (
            <div
              key={user.user_id}
              className="flex items-center space-x-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
            >
              <div className={`flex-shrink-0 ${getMedalColor(index)}`}>
                <TrophyIcon className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-900">
                    {user.profile.full_name}
                  </span>
                  <span className="text-sm text-gray-500">
                    • {user.profile.school}
                  </span>
                </div>
                <div className="mt-1 text-sm text-gray-600">
                  {activeTab === 'questions' ? (
                    <span className="flex items-center">
                      <FireIcon className="w-4 h-4 mr-1 text-energy-orange" />
                      {user.questions_answered} questions answered
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <AcademicCapIcon className="w-4 h-4 mr-1 text-growth-green" />
                      {user.accuracy_percentage.toFixed(1)}% accuracy
                    </span>
                  )}
                </div>
              </div>
              <div className="text-2xl font-bold text-neural-purple">
                {getOrdinal(index + 1)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;