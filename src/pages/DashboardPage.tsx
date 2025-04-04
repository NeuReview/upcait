import React, { useState } from 'react';
import { 
  AcademicCapIcon, 
  ChartBarIcon, 
  FireIcon,
  CalendarIcon,
  NewspaperIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  BeakerIcon,
  CalculatorIcon,
  LanguageIcon,
  BookOpenIcon,
  ClipboardDocumentCheckIcon,
  DocumentChartBarIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import UserProfileComponent from '../components/UserProfileComponent';

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

// Circle component for reusability
const ScoreCircle = ({ 
  score, 
  subject, 
  color, 
  icon: Icon 
}: { 
  score: number; 
  subject: string; 
  color: string; 
  icon: React.ElementType 
}) => (
  <div className="flex flex-col items-center">
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle 
          className="text-gray-200 stroke-current" 
          strokeWidth="10" 
          cx="50" 
          cy="50" 
          r="40" 
          fill="transparent"
        ></circle>
        <circle 
          className={`${color} stroke-current`}
          strokeWidth="10" 
          strokeLinecap="round" 
          cx="50" 
          cy="50" 
          r="40" 
          fill="transparent"
          strokeDasharray={`${Math.PI * 80 * score / 100} ${Math.PI * 80}`}
        ></circle>
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-xl font-bold">{score}%</span>
      </div>
    </div>
    <div className="flex items-center mt-2">
      <Icon className={`w-4 h-4 ${color} mr-1`} />
      <span className="text-xs font-medium text-gray-700">{subject}</span>
    </div>
  </div>
);

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState<'questions' | 'accuracy'>('questions');
  const [selectedTestType, setSelectedTestType] = useState<'quizzes' | 'mock_exams' | 'flashcards'>('quizzes');
  
  // Test type accuracy data
  const testTypeData = {
    quizzes: {
      accuracy: 72,
      total: 145,
      correct: 104,
      incorrect: 41,
      lastActivity: '2 days ago'
    },
    mock_exams: {
      accuracy: 68,
      total: 250,
      correct: 170,
      incorrect: 80,
      lastActivity: '1 week ago'
    },
    flashcards: {
      accuracy: 85,
      total: 120,
      correct: 102,
      incorrect: 18,
      lastActivity: '3 days ago'
    }
  };

  const currentTestData = testTypeData[selectedTestType];
  
  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Overview */}
        <div className="mb-6">
          <UserProfileComponent />
        </div>

        {/* Unified Progress Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Progress Overview</h2>
            
            {/* Tabs */}
            <div className="flex rounded-md overflow-hidden border border-gray-200">
              <button 
                onClick={() => setActiveTab('questions')}
                className={`px-4 py-2 text-sm font-medium flex items-center space-x-1 ${
                  activeTab === 'questions' 
                    ? 'bg-neural-purple text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <DocumentChartBarIcon className="w-4 h-4" />
                <span>Question Stats</span>
              </button>
              <button 
                onClick={() => setActiveTab('accuracy')}
                className={`px-4 py-2 text-sm font-medium flex items-center space-x-1 ${
                  activeTab === 'accuracy' 
                    ? 'bg-neural-purple text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <ClipboardDocumentCheckIcon className="w-4 h-4" />
                <span>Accuracy</span>
              </button>
            </div>
          </div>
          
          <div className="flex flex-col space-y-6">
            {/* Question Stats Tab Content */}
            {activeTab === 'questions' && (
              <>
                {/* Subject Score Circles */}
                <div className="grid grid-cols-4 gap-4">
                  <ScoreCircle 
                    score={studentData.performance.subjectMastery.science} 
                    subject="Science" 
                    color="text-sky-500"
                    icon={BeakerIcon}
                  />
                  <ScoreCircle 
                    score={studentData.performance.subjectMastery.math} 
                    subject="Mathematics" 
                    color="text-amber-500"
                    icon={CalculatorIcon}
                  />
                  <ScoreCircle 
                    score={studentData.performance.subjectMastery.english} 
                    subject="Language" 
                    color="text-emerald-500"
                    icon={LanguageIcon}
                  />
                  <ScoreCircle 
                    score={studentData.performance.subjectMastery.reading} 
                    subject="Reading" 
                    color="text-indigo-500"
                    icon={BookOpenIcon}
                  />
                </div>
                
                {/* Progress Bars */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="space-y-4">
                    <div className="mb-4">
                      <div className="flex justify-between mb-1">
                        <h3 className="text-sm font-medium text-gray-700">Question Progress</h3>
                        <span className="text-xs font-medium text-growth-green">{studentData.performance.questionsCompleted}/{studentData.performance.totalQuestions}</span>
                      </div>
                      <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-growth-green rounded-full flex items-center justify-center text-xs text-white font-medium"
                          style={{ width: `${(studentData.performance.questionsCompleted / studentData.performance.totalQuestions) * 100}%` }}
                        >
                          {Math.round((studentData.performance.questionsCompleted / studentData.performance.totalQuestions) * 100)}%
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Goal: 500 questions by next week</p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <h3 className="text-sm font-medium text-gray-700">UPCAT Goal</h3>
                        <span className="text-xs font-medium text-neural-purple">{studentData.currentScore}/{studentData.goalScore}</span>
                      </div>
                      <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-neural-purple rounded-full flex items-center justify-center text-xs text-white font-medium"
                          style={{ width: `${(studentData.currentScore / studentData.goalScore) * 100}%` }}
                        >
                          {Math.round((studentData.currentScore / studentData.goalScore) * 100)}%
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{studentData.goalScore - studentData.currentScore}% more to reach your target score</p>
                    </div>
                  </div>
                </div>
              </>
            )}
            
            {/* Accuracy Tab Content */}
            {activeTab === 'accuracy' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Overall Accuracy */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Overall Accuracy</h3>
                    <div className="flex items-center">
                      <div className="relative w-24 h-24 flex-shrink-0">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                          <circle 
                            className="text-gray-200 stroke-current" 
                            strokeWidth="10" 
                            cx="50" 
                            cy="50" 
                            r="40" 
                            fill="transparent"
                          ></circle>
                          <circle 
                            className="text-neural-purple stroke-current"
                            strokeWidth="10" 
                            strokeLinecap="round" 
                            cx="50" 
                            cy="50" 
                            r="40" 
                            fill="transparent"
                            strokeDasharray={`${Math.PI * 80 * studentData.performance.accuracyRate / 100} ${Math.PI * 80}`}
                          ></circle>
                        </svg>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <span className="text-xl font-bold text-neural-purple">{studentData.performance.accuracyRate}%</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center mb-2">
                          <div className="w-3 h-3 rounded-full bg-growth-green mr-2"></div>
                          <span className="text-sm text-gray-600">Correct Answers</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-alert-red mr-2"></div>
                          <span className="text-sm text-gray-600">Incorrect Answers</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Test Type Accuracy */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-gray-700">Test Type Accuracy</h3>
                      
                      {/* Dropdown */}
                      <div className="relative">
                        <select
                          value={selectedTestType}
                          onChange={(e) => setSelectedTestType(e.target.value as any)}
                          className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-10 py-1.5 text-sm font-medium text-gray-700 focus:outline-none focus:ring-neural-purple focus:border-neural-purple"
                        >
                          <option value="quizzes">Quizzes</option>
                          <option value="mock_exams">Mock Exams</option>
                          <option value="flashcards">Flashcards</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                          <ChevronDownIcon className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Selected Test Type Data */}
                    <div className="flex items-center">
                      <div className="relative w-20 h-20 flex-shrink-0">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                          <circle 
                            className="text-gray-200 stroke-current" 
                            strokeWidth="10" 
                            cx="50" 
                            cy="50" 
                            r="40" 
                            fill="transparent"
                          ></circle>
                          <circle 
                            className={`${
                              selectedTestType === 'quizzes' ? 'text-tech-lavender' :
                              selectedTestType === 'mock_exams' ? 'text-energy-orange' :
                              'text-growth-green'
                            } stroke-current`}
                            strokeWidth="10" 
                            strokeLinecap="round" 
                            cx="50" 
                            cy="50" 
                            r="40" 
                            fill="transparent"
                            strokeDasharray={`${Math.PI * 80 * currentTestData.accuracy / 100} ${Math.PI * 80}`}
                          ></circle>
                        </svg>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <span className="text-lg font-bold">{currentTestData.accuracy}%</span>
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Total Questions</span>
                            <span className="font-medium">{currentTestData.total}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-growth-green">Correct</span>
                            <span className="font-medium">{currentTestData.correct}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-alert-red">Incorrect</span>
                            <span className="font-medium">{currentTestData.incorrect}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Last activity: {currentTestData.lastActivity}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Subject-specific Accuracy */}
                <div className="border-t border-gray-100 pt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-4">Accuracy by Subject</h3>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <BeakerIcon className="w-5 h-5 text-sky-500 mr-3" />
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">Science</span>
                          <span className="text-gray-600">72%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full">
                          <div 
                            className="h-2 bg-sky-500 rounded-full"
                            style={{ width: '72%' }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <CalculatorIcon className="w-5 h-5 text-amber-500 mr-3" />
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">Mathematics</span>
                          <span className="text-gray-600">65%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full">
                          <div 
                            className="h-2 bg-amber-500 rounded-full"
                            style={{ width: '65%' }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <LanguageIcon className="w-5 h-5 text-emerald-500 mr-3" />
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">Language Proficiency</span>
                          <span className="text-gray-600">80%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full">
                          <div 
                            className="h-2 bg-emerald-500 rounded-full"
                            style={{ width: '80%' }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <BookOpenIcon className="w-5 h-5 text-indigo-500 mr-3" />
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">Reading Comprehension</span>
                          <span className="text-gray-600">75%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full">
                          <div 
                            className="h-2 bg-indigo-500 rounded-full"
                            style={{ width: '75%' }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Stats Summary */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
              <div className="text-center">
                <p className="text-xs text-gray-500">Weekly Streak</p>
                <div className="flex items-center justify-center mt-1">
                  <FireIcon className="w-4 h-4 text-energy-orange mr-1" />
                  <p className="text-xl font-bold text-gray-900">{studentData.streak} days</p>
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Accuracy Rate</p>
                <p className="text-xl font-bold text-gray-900">{studentData.performance.accuracyRate}%</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Time Studying</p>
                <p className="text-xl font-bold text-gray-900">18.5 hrs</p>
              </div>
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