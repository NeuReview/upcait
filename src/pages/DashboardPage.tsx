import React, { useState, useEffect } from 'react';
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
  ChevronDownIcon,
  WifiIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import UserProfileComponent from '../components/UserProfileComponent';
import { supabase, checkSupabaseConnection } from '../lib/supabase';
import { useQuestions, scienceProgressStore } from '../hooks/useQuestions';

// Define needed interfaces
interface ProgressRecord {
  user_id: string;
  question_uuid: string;
  correct_question: number;
  timestamp?: string;
}

interface ProgressStore {
  records: {
    userId: string;
    questionId: string;
    isCorrect: boolean;
    timestamp: string;
  }[];
  getRecords: (userId: string) => {
    userId: string;
    questionId: string;
    isCorrect: boolean;
    timestamp: string;
  }[];
  add: (userId: string, questionId: string, isCorrect: boolean) => boolean;
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => void;
  getStats: (userId: string) => {
    totalQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    accuracy: number;
  };
}

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

// Add new interface for science progress data
interface ScienceProgressData {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracy: number;
}

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState<'questions' | 'accuracy'>('questions');
  const [selectedTestType, setSelectedTestType] = useState<'quizzes' | 'mock_exams' | 'flashcards'>('quizzes');
  const [scienceProgress, setScienceProgress] = useState<ScienceProgressData>({
    totalQuestions: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    accuracy: 0
  });
  const [loadingScienceData, setLoadingScienceData] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState<{ connected: boolean; error?: string }>({ connected: true });
  
  // Add useQuestions hook to access science progress stats
  const { getScienceProgressStats } = useQuestions();
  
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
  
  // Check Supabase connection on component mount
  useEffect(() => {
    async function checkConnection() {
      const connectionStatus = await checkSupabaseConnection();
      setSupabaseStatus(connectionStatus);
    }
    
    checkConnection();
  }, []);
  
  // Fetch science progress data on component mount
  useEffect(() => {
    fetchScienceProgressData();
  }, []);

  // Update function to fetch science progress data from Supabase Storage or local storage
  const fetchScienceProgressData = async () => {
    try {
      setLoadingScienceData(true);
      
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        console.log('No user logged in, cannot fetch science progress');
        return;
      }
      
      // Get progress data from storage service
      const progressData = await getScienceProgressStats(user.data.user.id);
      
      // Update state with the data
      setScienceProgress(progressData);
      
      console.log('Science progress data loaded:', progressData);
    } catch (err) {
      console.error('Error fetching science progress data:', err);
    } finally {
      setLoadingScienceData(false);
    }
  };

  // Update function to sync localStorage data to database
  const syncLocalProgressToDatabase = async () => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        alert('Hindi ka naka-login.');
        return;
      }
      
      const userId = user.data.user.id;
      
      // Get all local data sources
      let allLocalRecords: ProgressRecord[] = [];
      
      // First from localStorage
      try {
        const storedData = localStorage.getItem('science_progress_data');
        if (storedData) {
          const records = JSON.parse(storedData) as ProgressRecord[];
          // Filter to get only this user's records
          const userRecords = records.filter((record: ProgressRecord) => record.user_id === userId);
          allLocalRecords = [...allLocalRecords, ...userRecords];
        }
      } catch (err) {
        console.error('Error reading science_progress_data from localStorage:', err);
      }
      
      // Then from scienceProgressStore that was imported at the top of the file
      try {
        // Get records from the imported scienceProgressStore
        const storeRecords = scienceProgressStore.getRecords(userId);
        // Map to match the expected format
        const mappedRecords = storeRecords.map((record: { userId: string; questionId: string; isCorrect: boolean; timestamp: string }) => ({
          user_id: record.userId,
          question_uuid: record.questionId,
          correct_question: record.isCorrect ? 1 : 0,
          timestamp: record.timestamp
        }));
        
        // Add to all records
        allLocalRecords = [...allLocalRecords, ...mappedRecords];
      } catch (err) {
        console.error('Error getting records from scienceProgressStore:', err);
      }
      
      // Check if we have any records to sync
      if (allLocalRecords.length === 0) {
        alert('Walang lokal na data na mai-sync sa database.');
        return;
      }
      
      // Confirm with user
      if (!confirm(`Nais mo bang i-sync ang ${allLocalRecords.length} (na) lokal na record sa database?`)) {
        return;
      }
      
      // Show progress indicator
      setLoadingScienceData(true);
      
      // Sync records to database
      let successCount = 0;
      let errorCount = 0;
      
      for (const record of allLocalRecords) {
        try {
          const { error } = await supabase
            .from('science_progress_report')
            .insert({
              user_id: record.user_id,
              question_uuid: record.question_uuid,
              correct_question: record.correct_question
              // created_at will be set by default
            });
            
          if (error) {
            console.error('Error syncing record to database:', error);
            errorCount++;
          } else {
            successCount++;
          }
        } catch (err) {
          console.error('Exception syncing record to database:', err);
          errorCount++;
        }
      }
      
      // Hide progress indicator
      setLoadingScienceData(false);
      
      // Refresh the data
      fetchScienceProgressData();
      
      // Show results
      alert(`Sync result:\n✅ ${successCount} na record ang matagumpay na na-sync\n❌ ${errorCount} na record ang nagka-error`);
    } catch (err) {
      console.error('Error syncing local progress to database:', err);
      setLoadingScienceData(false);
      alert('May naganap na error habang nag-sisync ng data.');
    }
  };

  // Update exportScienceProgressData to export from database
  const exportScienceProgressData = async () => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        alert('Hindi ka naka-login.');
        return;
      }
      
      const userId = user.data.user.id;
      setLoadingScienceData(true);
      
      // Query the database first
      try {
        const { data, error } = await supabase
          .from('science_progress_report')
          .select('*')
          .eq('user_id', userId);
          
        if (error) {
          throw error;
        }
        
        if (!data || data.length === 0) {
          // If no database data, try localStorage
          const storedData = localStorage.getItem('science_progress_data');
          if (!storedData) {
            alert('Walang science progress data na ma-export.');
            setLoadingScienceData(false);
            return;
          }
          
          // Create a downloadable file from localStorage
          const blob = new Blob([storedData], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          
          // Create a temporary anchor element and trigger download
          const a = document.createElement('a');
          a.href = url;
          a.download = `science_progress_local_${new Date().toISOString().slice(0, 10)}.json`;
          document.body.appendChild(a);
          a.click();
          
          // Clean up
          URL.revokeObjectURL(url);
          document.body.removeChild(a);
          
          alert('Matagumpay na na-export ang science progress data mula sa localStorage.');
          setLoadingScienceData(false);
          return;
        }
        
        // Format the data for export
        const jsonData = JSON.stringify(data, null, 2);
        
        // Create a downloadable file
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // Create a temporary anchor element and trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = `science_progress_db_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        alert(`Matagumpay na na-export ang ${data.length} (na) science progress record mula sa database.`);
      } catch (dbErr) {
        console.error('Database export failed, falling back to localStorage:', dbErr);
        
        // Fall back to localStorage
        const storedData = localStorage.getItem('science_progress_data');
        if (!storedData) {
          alert('Walang science progress data na ma-export sa localStorage.');
          setLoadingScienceData(false);
          return;
        }
        
        // Create a downloadable file
        const blob = new Blob([storedData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // Create a temporary anchor element and trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = `science_progress_local_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        alert('Matagumpay na na-export ang science progress data mula sa localStorage.');
      }
    } catch (err) {
      console.error('Error exporting science progress data:', err);
      alert('May naganap na error habang ine-export ang data.');
    } finally {
      setLoadingScienceData(false);
    }
  };

  // Update importScienceProgressData to import to database
  const importScienceProgressData = async () => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        alert('Hindi ka naka-login.');
        return;
      }
      
      const userId = user.data.user.id;
      
      // Create file input element
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '.json';
      fileInput.style.display = 'none';
      
      // When a file is selected
      fileInput.onchange = async (e) => {
        const target = e.target as HTMLInputElement;
        if (!target.files || target.files.length === 0) {
          return;
        }
        
        const file = target.files[0];
        const reader = new FileReader();
        
        reader.onload = async (event) => {
          try {
            setLoadingScienceData(true);
            
            const result = event.target?.result;
            if (typeof result !== 'string') {
              throw new Error('Invalid file format');
            }
            
            // Validate the JSON structure
            const data = JSON.parse(result);
            if (!Array.isArray(data)) {
              throw new Error('Invalid data format: Expected an array');
            }
            
            // Confirm with user
            if (!confirm(`Nais mo bang i-import ang ${data.length} (na) record?`)) {
              setLoadingScienceData(false);
              return;
            }
            
            // Try to import directly to database
            let successCount = 0;
            let errorCount = 0;
            
            for (const item of data) {
              // Validate record
              if (!item.user_id || !item.question_uuid || item.correct_question === undefined) {
                console.warn('Skipping invalid record:', item);
                errorCount++;
                continue;
              }
              
              // Only import records for this user
              if (item.user_id !== userId) {
                console.warn('Skipping record for different user:', item.user_id);
                continue;
              }
              
              try {
                const { error } = await supabase
                  .from('science_progress_report')
                  .insert({
                    user_id: item.user_id,
                    question_uuid: item.question_uuid,
                    correct_question: typeof item.correct_question === 'boolean' 
                      ? (item.correct_question ? 1 : 0) 
                      : item.correct_question
                  });
                  
                if (error) {
                  console.error('Error importing record to database:', error);
                  errorCount++;
                } else {
                  successCount++;
                }
              } catch (insertErr) {
                console.error('Exception importing record:', insertErr);
                errorCount++;
              }
            }
            
            // Store in localStorage as backup in case of database failures
            localStorage.setItem('science_progress_data', result);
            
            // Refresh the displayed data
            await fetchScienceProgressData();
            
            alert(`Import result:\n✅ ${successCount} na record ang matagumpay na na-import\n❌ ${errorCount} na record ang nagka-error`);
          } catch (error) {
            console.error('Error parsing imported file:', error);
            alert('Invalid file format o data structure. Siguraduhing tama ang file format.');
          } finally {
            setLoadingScienceData(false);
          }
        };
        
        reader.onerror = () => {
          alert('Error reading file');
          setLoadingScienceData(false);
        };
        
        reader.readAsText(file);
      };
      
      // Trigger file selection
      document.body.appendChild(fileInput);
      fileInput.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(fileInput);
      }, 1000);
    } catch (err) {
      console.error('Error importing science progress data:', err);
      alert('May naganap na error habang ini-import ang data.');
      setLoadingScienceData(false);
    }
  };

  // Add connection status bar at the top of the dashboard
  const ConnectionStatusBar = () => {
    if (supabaseStatus.connected) return null;
    
    return (
      <div className="bg-amber-50 border-b border-amber-200 p-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <XCircleIcon className="h-5 w-5 text-amber-500 mr-2" />
              <p className="text-sm text-amber-700">
                Hindi makonekta sa database. Gumagamit ng lokal na storage para sa data. 
                <span className="ml-1 text-amber-600 font-medium">Error: {supabaseStatus.error}</span>
              </p>
            </div>
            <button 
              onClick={async () => {
                const status = await checkSupabaseConnection();
                setSupabaseStatus(status);
              }}
              className="text-xs font-medium text-amber-700 hover:text-amber-800 bg-amber-100 hover:bg-amber-200 px-2 py-1 rounded"
            >
              Subukang muli
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <ConnectionStatusBar />
      
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

        {/* Add Science Progress Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Science Progress Report</h2>
            
            {/* Updated note with connection status and database table info */}
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <div className="flex">
                <ExclamationTriangleIcon className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-amber-800">
                    Progress Tracking Note 
                    {!supabaseStatus.connected && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                        <XCircleIcon className="h-3 w-3 mr-1" />
                        Offline
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-amber-700 mt-1">
                    Ang iyong Science progress ay ine-save na direkta sa database table na "science_progress_report". 
                    Kung may error sa pag-save, gumagamit ng local storage bilang fallback.
                  </p>
                  <p className="text-xs text-amber-600 mt-2">
                    <strong>Para sa Admin:</strong> Kung patuloy na nakaka-encounter ng 403 Forbidden errors, 
                    baka kailangang i-update pa ang RLS policy ng table para mapayagan ang authenticated users 
                    na mag-insert ng records.
                  </p>
                  <p className="text-xs text-amber-600 mt-1">
                    <em>Paalala:</em> Para sa karagdagang backup, maaring i-export ang data gamit ang 
                    Import/Export buttons sa ibaba.
                  </p>
                </div>
              </div>
            </div>
            
            {loadingScienceData ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-neural-purple"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <BeakerIcon className="w-6 h-6 text-sky-500 mr-2" />
                    <h3 className="text-lg font-medium">Science Questions</h3>
                  </div>
                  
                  {/* Add Export/Import/Sync buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={syncLocalProgressToDatabase}
                      className="inline-flex items-center px-3 py-1.5 border border-purple-300 text-sm font-medium rounded-md text-purple-700 bg-purple-50 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" />
                      </svg>
                      I-sync ang Data
                    </button>
                  
                    <button
                      onClick={importScienceProgressData}
                      className="inline-flex items-center px-3 py-1.5 border border-indigo-300 text-sm font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" transform="rotate(180, 10, 10)" />
                      </svg>
                      I-import ang Data
                    </button>
                    
                    <button
                      onClick={exportScienceProgressData}
                      className="inline-flex items-center px-3 py-1.5 border border-sky-300 text-sm font-medium rounded-md text-sky-700 bg-sky-50 hover:bg-sky-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      I-export ang Data
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="w-1/3">
                    <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-sky-200 text-sky-600">
                            Accuracy
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold inline-block text-sky-600">
                            {scienceProgress.accuracy}%
                          </span>
                        </div>
                      </div>
                      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-sky-200">
                        <div 
                          style={{ width: `${scienceProgress.accuracy}%` }} 
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-sky-500">
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-2/3 grid grid-cols-3 gap-4 pl-6">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500">Total Questions</p>
                      <p className="text-lg font-semibold">{scienceProgress.totalQuestions}</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-xs text-green-600">Correct</p>
                      <p className="text-lg font-semibold text-green-600">{scienceProgress.correctAnswers}</p>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <p className="text-xs text-red-600">Incorrect</p>
                      <p className="text-lg font-semibold text-red-600">{scienceProgress.incorrectAnswers}</p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 text-sm text-gray-500">
                  <p>Continue practicing science quizzes to improve your score!</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;