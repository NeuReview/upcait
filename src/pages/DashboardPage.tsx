import React from 'react';
import { 
  AcademicCapIcon, 
  ChartBarIcon, 
  FireIcon,
  CalendarIcon,
  NewspaperIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import UserProfile from '../components/UserProfile';

// Sample data for demonstration
const studentData = {
  name: "Juan Dela Cruz",
  gradeLevel: "Grade 12",
  goalScore: 98,
  currentScore: 85,
  streak: 15,
  studyGoals: [
    { id: 1, text: "Complete Math Module 5", deadline: "2024-02-20", completed: true },
    { id: 2, text: "Review Science Concepts", deadline: "2024-02-22", completed: false },
  ],
  events: [
    { id: 1, title: "UPCAT Registration", date: "2024-03-15" },
    { id: 2, title: "Mock Exam #3", date: "2024-02-25" },
  ],
  newsletter: {
    title: "UPCAT 2024 Updates",
    content: "New study materials available for Science and Math sections.",
  },
  performance: {
    questionsCompleted: 350,
    totalQuestions: 1000,
    accuracyRate: 68,
    subjectMastery: {
      math: 60,
      science: 75,
      english: 80,
      reading: 70,
    },
    weeklyProgress: {
      lastWeek: 58,
      thisWeek: 65,
    },
    weaknesses: [
      { topic: "Algebra", accuracy: 45, suggestion: "Practice more equations & word problems" },
      { topic: "Chemistry", accuracy: 50, suggestion: "Review periodic table & reactions" },
    ],
  },
};

const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Overview */}
        <div className="mb-6">
          <UserProfile />
        </div>

        {/* Score and Progress Overview */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* UPCAT Score Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">UPCAT Score Progress</h2>
            <div className="flex items-end space-x-4">
              <div>
                <p className="text-sm text-gray-500">Current Score</p>
                <p className="text-3xl font-bold text-neural-purple">{studentData.currentScore}%</p>
              </div>
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-neural-purple h-2.5 rounded-full"
                    style={{ width: `${(studentData.currentScore / studentData.goalScore) * 100}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-1">Goal: {studentData.goalScore}%</p>
              </div>
            </div>
          </div>

          {/* Question Progress */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Question Progress</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Completed Questions</span>
                  <span>{studentData.performance.questionsCompleted}/{studentData.performance.totalQuestions}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-growth-green h-2.5 rounded-full"
                    style={{ width: `${(studentData.performance.questionsCompleted / studentData.performance.totalQuestions) * 100}%` }}
                  ></div>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Goal: 500 questions by next week
              </p>
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Study Goals */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Study Goals</h2>
              <CalendarIcon className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {studentData.studyGoals.map(goal => (
                <div key={goal.id} className="flex items-start space-x-3">
                  <div className={`mt-1 w-5 h-5 rounded-full flex items-center justify-center ${
                    goal.completed ? 'bg-growth-green' : 'bg-gray-200'
                  }`}>
                    <CheckCircleIcon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className={`text-sm ${goal.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                      {goal.text}
                    </p>
                    <p className="text-xs text-gray-500">Due: {goal.deadline}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subject Mastery */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Subject Mastery</h2>
              <AcademicCapIcon className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {Object.entries(studentData.performance.subjectMastery).map(([subject, mastery]) => (
                <div key={subject}>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span className="capitalize">{subject}</span>
                    <span>{mastery}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        mastery >= 75 ? 'bg-growth-green' : 
                        mastery >= 60 ? 'bg-energy-orange' : 
                        'bg-alert-red'
                      }`}
                      style={{ width: `${mastery}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Progress */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Weekly Progress</h2>
              <ArrowTrendingUpIcon className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Last Week</p>
                  <p className="text-lg font-semibold">{studentData.performance.weeklyProgress.lastWeek}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">This Week</p>
                  <p className="text-lg font-semibold text-growth-green">
                    {studentData.performance.weeklyProgress.thisWeek}%
                    <span className="text-sm ml-1 text-growth-green">
                      (+{studentData.performance.weeklyProgress.thisWeek - studentData.performance.weeklyProgress.lastWeek}%)
                    </span>
                  </p>
                </div>
              </div>
              <div className="h-32 bg-gray-50 rounded-lg flex items-end justify-around p-4">
                {/* Placeholder for trend graph */}
                <div className="w-8 bg-gray-300 rounded-t" style={{ height: '60%' }}></div>
                <div className="w-8 bg-gray-300 rounded-t" style={{ height: '45%' }}></div>
                <div className="w-8 bg-gray-300 rounded-t" style={{ height: '75%' }}></div>
                <div className="w-8 bg-gray-300 rounded-t" style={{ height: '55%' }}></div>
                <div className="w-8 bg-neural-purple rounded-t" style={{ height: '85%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Areas for Improvement */}
        <div className="mt-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Areas for Improvement</h2>
              <ExclamationTriangleIcon className="w-5 h-5 text-gray-400" />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {studentData.performance.weaknesses.map(weakness => (
                <div key={weakness.topic} className="p-4 bg-alert-red/5 rounded-lg border border-alert-red/20">
                  <div className="flex items-start space-x-3">
                    <ExclamationTriangleIcon className="w-5 h-5 text-alert-red shrink-0 mt-1" />
                    <div>
                      <h3 className="font-medium text-gray-900">{weakness.topic}</h3>
                      <p className="text-sm text-gray-600 mt-1">Accuracy: {weakness.accuracy}%</p>
                      <p className="text-sm text-gray-500 mt-2">{weakness.suggestion}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Events and Newsletter */}
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {/* Upcoming Events */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
              <CalendarIcon className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {studentData.events.map(event => (
                <div key={event.id} className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-neural-purple/10 rounded-lg flex items-center justify-center">
                    <CalendarIcon className="w-6 h-6 text-neural-purple" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{event.title}</p>
                    <p className="text-sm text-gray-500">{event.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">UPCAT Newsletter</h2>
              <NewspaperIcon className="w-5 h-5 text-gray-400" />
            </div>
            <div className="p-4 bg-neural-purple/5 rounded-lg">
              <h3 className="font-medium text-neural-purple">{studentData.newsletter.title}</h3>
              <p className="text-sm text-gray-600 mt-2">{studentData.newsletter.content}</p>
              <button className="mt-4 text-sm text-neural-purple font-medium hover:text-tech-lavender">
                Read more →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;