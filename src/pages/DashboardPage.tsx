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
  XCircleIcon,
  UserCircleIcon,
  MapPinIcon,
  GlobeAltIcon,
  LinkIcon,
  PencilIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { supabase, checkSupabaseConnection } from '../lib/supabase';
import { useQuestions, scienceProgressStore } from '../hooks/useQuestions';
import { useUserProfile } from '../hooks/useUserProfile';


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

// Add interfaces for the user data and modal props
interface UserData {
  name: string;
  username: string;
  bio: string;
  location: string;
  school: string;
  socials: string;
}

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: UserData;
  onSave: (data: {
    name: string;
    username: string;
    bio: string;
    location: string;
    school: string;
    socials: string;
  }) => Promise<void>;
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
// Compact donut used in "Answered Questions"
const ScoreCircle = ({
  score,
  color,
  label,
}: {
  score: number;
  color: string;   // e.g. "text-sky-500"
  label: string;
}) => (
  <div className="flex flex-col items-center space-y-2">
    <div className="relative w-20 h-20">
      <svg
        className="w-full h-full transform -rotate-90"
        viewBox="0 0 100 100"
      >
        <circle
          className="text-gray-200 stroke-current"
          strokeWidth="8"
          cx="50"
          cy="50"
          r="44"
          fill="transparent"
        />
        <circle
          className={`${color} stroke-current`}
          strokeWidth="8"
          strokeLinecap="round"
          cx="50"
          cy="50"
          r="44"
          fill="transparent"
          strokeDasharray={`${Math.PI * 88 * (score / 100)} ${
            Math.PI * 88
          }`}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold">
        {score}%
      </span>
    </div>
    <span className="text-xs text-gray-600">{label}</span>
  </div>
);

// Add new interface for science progress data
interface ScienceProgressData {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracy: number;
}

// Update the EditProfileModal component with proper types
const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, userData, onSave }) => {
  const [formData, setFormData] = useState<UserData>({
    name: userData.name || '',
    username: userData.username || '',
    bio: userData.bio || '',
    location: userData.location || '',
    school: userData.school || '',
    socials: userData.socials || ''
  });

    // → 6. Call onSave, then close
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      await onSave({
        name:     formData.name,
        username: formData.username,
        bio:      formData.bio,
        location: formData.location,
        school:   formData.school,
        socials:  formData.socials
      });
      onClose();
    };
  

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-8 border w-full max-w-2xl shadow-lg rounded-lg bg-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Edit Profile</h3>
            <p className="mt-1 text-sm text-gray-500">Update your profile information</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Info Section */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Username
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  @
                </span>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Write a short bio about yourself"
              />
            </div>
          </div>

          {/* Location and Education */}
          <div className="space-y-6">
            <h4 className="text-lg font-medium text-gray-900">Location & Education</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="City, Country"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  School
                </label>
                <input
                  type="text"
                  value={formData.school}
                  onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your school name"
                />
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-6">
            <h4 className="text-lg font-medium text-gray-900">Social Links</h4>
            <div className="grid grid-cols-1 gap-6">
              <div className="flex items-center">
                <div className="w-10 h-10 flex-shrink-0 mr-3 rounded-lg bg-purple-50 flex items-center justify-center">
                  <GlobeAltIcon className="w-5 h-5 text-purple-600" />
                </div>
                <input
                  type="url"
                  value={formData.socials}
                  onChange={(e) => setFormData({ ...formData, socials: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Social media or portfolio URL"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface StudyHoursData {
  day: string;
  hours: number;
}

const DashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'questions' | 'accuracy'>('questions');
  const [selectedTestType, setSelectedTestType] = useState<'quizzes' | 'mock_exams' | 'flashcards'>('quizzes');
  const [scienceProgress, setScienceProgress] = useState<ScienceProgressData>({totalQuestions: 0, correctAnswers: 0, incorrectAnswers: 0, accuracy: 0});
  const [loadingScienceData, setLoadingScienceData] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState<{ connected: boolean; error?: string }>({ connected: true });
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<'science' | 'mathematics' | 'language' | 'reading'>('science');
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const { profile, loading: profileLoading, error: profileError, updateProfile, fetchProfile } = useUserProfile();

  

  
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

  if (profileLoading) return <div className="p-6">Loading profile…</div>;
  if (profileError)   return <div className="p-6 text-red-600">Error: {profileError}</div>;
  if (!profile) {return <div className="p-6">Loading profile…</div>;
  }



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

    // → 4. Replace static data with fields from `profile`
  const userData = {
    name:     profile.user_fullname || '',
    username: profile.user_username || '',
    bio:      profile.user_bio      || '',
    location: profile.user_location || '',
    school:   profile.user_school   || '',
    socials:  profile.user_socials  || ''
  };


  const ProfileSection = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        {/* Profile Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center">
                <UserCircleIcon className="w-12 h-12 text-purple-600" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{userData.name}</h2>
              <p className="text-sm text-gray-500">@{userData.username}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {!supabaseStatus.connected && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                <XCircleIcon className="w-4 h-4 mr-1" />
                Offline
              </span>
            )}
            <button
              onClick={() => setIsEditProfileOpen(true)}
              className="inline-flex items-center px-3 py-1 border border-purple-200 rounded-full text-sm text-purple-600 bg-purple-50 hover:bg-purple-100 transition-colors"
            >
              <PencilIcon className="w-4 h-4 mr-1" />
              Edit
            </button>
          </div>
        </div>

        {/* Bio */}
        <p className="mt-4 text-sm text-gray-600">{userData.bio}</p>

        {/* Location and School Info */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center text-sm text-gray-500">
            <MapPinIcon className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="truncate">{userData.location}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <AcademicCapIcon className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="truncate">{userData.school}</span>
          </div>
        </div>

        {/* Social Links */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex flex-wrap gap-3">
            {userData.socials && (
              <a 
                href={userData.socials} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
              >
                <LinkIcon className="w-4 h-4 mr-2" />
                Social Links
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const subjectData = {
    science: {
      icon: BeakerIcon,
      color: 'sky',
      percentage: 75,
      correct: 112,
      total: 150,
      label: 'Science'
    },
    mathematics: {
      icon: CalculatorIcon,
      color: 'amber',
      percentage: 68,
      correct: 82,
      total: 120,
      label: 'Mathematics'
    },
    language: {
      icon: LanguageIcon,
      color: 'emerald',
      percentage: 82,
      correct: 131,
      total: 160,
      label: 'Language'
    },
    reading: {
      icon: BookOpenIcon,
      color: 'indigo',
      percentage: 78,
      correct: 109,
      total: 140,
      label: 'Reading'
    }
  };

  const currentSubject = subjectData[selectedSubject];

  // Simplified study hours data
  const studyHoursData: StudyHoursData[] = [
    { day: 'Jan 1', hours: 2.5 },
    { day: 'Jan 2', hours: 3.2 },
    { day: 'Jan 3', hours: 1.8 },
    { day: 'Jan 4', hours: 2.9 },
    { day: 'Jan 5', hours: 3.5 },
    { day: 'Jan 6', hours: 2.1 },
    { day: 'Jan 7', hours: 2.7 }
  ];

  // Graph dimensions and settings
  const graphWidth = 400;
  const graphHeight = 200;
  const maxHours = 4;

  // Calculate points for the line graph
  const graphPoints = studyHoursData.map((d, i) => ({
    x: (i * (graphWidth - 40)) / (studyHoursData.length - 1) + 20,
    y: graphHeight - ((d.hours * (graphHeight - 40)) / maxHours) - 20,
    hours: d.hours,
    day: d.day
  }));

  const studyStats = {
    currentStreak: 5,
    longestStreak: 7,
    totalHours: studyHoursData.reduce((sum, d) => sum + d.hours, 0),
    averageHours: studyHoursData.reduce((sum, d) => sum + d.hours, 0) / studyHoursData.length,
    subjectBreakdown: {
      science: studyHoursData.reduce((sum, d) => sum + d.hours, 0),
      math: 0,
      language: 0,
      reading: 0
    },
    weeklyTarget: 21,
    bestDay: studyHoursData.reduce((max, d) => d.hours > max.hours ? d : max),
    improvement: 15 // percentage improvement from previous week
  };

  return (
    <>
    <EditProfileModal
      isOpen={isEditProfileOpen}
      onClose={() => setIsEditProfileOpen(false)}
      userData={userData}
      onSave={async (data) => {
        await updateProfile({
          user_fullname: data.name,
          user_username: data.username,
          user_bio: data.bio,
          user_location: data.location,
          user_school: data.school,
          user_socials: data.socials
        });
        // re-pull your fresh profile and clear the loading flag
        await fetchProfile(profile!.user_id!);
      }}
    />


    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-1">
            <ProfileSection />
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Questions Answered */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Questions Answered</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Science */}
                <div className="flex flex-col items-center">
                  <div className="relative w-36 h-36">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        className="text-gray-200 stroke-current"
                        strokeWidth="8"
                        cx="50"
                        cy="50"
                        r="42"
                        fill="transparent"
                      />
                      <circle
                        className="text-sky-500 stroke-current"
                        strokeWidth="8"
                        strokeLinecap="round"
                        cx="50"
                        cy="50"
                        r="42"
                        fill="transparent"
                        strokeDasharray={`${2.51 * 75} ${2.51 * 100}`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold text-gray-700">75%</span>
                      <span className="text-sm text-gray-500 mt-1">150/2000</span>
                      <span className="text-xs font-medium text-gray-600 mt-1">Science</span>
                    </div>
                  </div>
                </div>

                {/* Mathematics */}
                <div className="flex flex-col items-center">
                  <div className="relative w-36 h-36">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        className="text-gray-200 stroke-current"
                        strokeWidth="8"
                        cx="50"
                        cy="50"
                        r="42"
                        fill="transparent"
                      />
                      <circle
                        className="text-amber-500 stroke-current"
                        strokeWidth="8"
                        strokeLinecap="round"
                        cx="50"
                        cy="50"
                        r="42"
                        fill="transparent"
                        strokeDasharray={`${2.51 * 60} ${2.51 * 100}`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold text-gray-700">60%</span>
                      <span className="text-sm text-gray-500 mt-1">120/2000</span>
                      <span className="text-xs font-medium text-gray-600 mt-1">Mathematics</span>
                    </div>
                  </div>
                </div>

                {/* Language */}
                <div className="flex flex-col items-center">
                  <div className="relative w-36 h-36">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        className="text-gray-200 stroke-current"
                        strokeWidth="8"
                        cx="50"
                        cy="50"
                        r="42"
                        fill="transparent"
                      />
                      <circle
                        className="text-emerald-500 stroke-current"
                        strokeWidth="8"
                        strokeLinecap="round"
                        cx="50"
                        cy="50"
                        r="42"
                        fill="transparent"
                        strokeDasharray={`${2.51 * 80} ${2.51 * 100}`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold text-gray-700">80%</span>
                      <span className="text-sm text-gray-500 mt-1">160/2000</span>
                      <span className="text-xs font-medium text-gray-600 mt-1">Language</span>
                    </div>
                  </div>
                </div>

                {/* Reading */}
                <div className="flex flex-col items-center">
                  <div className="relative w-36 h-36">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        className="text-gray-200 stroke-current"
                        strokeWidth="8"
                        cx="50"
                        cy="50"
                        r="42"
                        fill="transparent"
                      />
                      <circle
                        className="text-indigo-500 stroke-current"
                        strokeWidth="8"
                        strokeLinecap="round"
                        cx="50"
                        cy="50"
                        r="42"
                        fill="transparent"
                        strokeDasharray={`${2.51 * 70} ${2.51 * 100}`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold text-gray-700">70%</span>
                      <span className="text-sm text-gray-500 mt-1">140/2000</span>
                      <span className="text-xs font-medium text-gray-600 mt-1">Reading</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Overall Progress Bar */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Total Progress</h3>
                    <p className="text-sm text-gray-500">570/8000 questions answered</p>
                  </div>
                  <span className="text-sm font-medium text-gray-900">7.1%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-cyan-500 transition-all duration-500" 
                       style={{ width: '7.1%' }}>
                    <div className="h-full w-full opacity-50 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.2)_10px,rgba(255,255,255,0.2)_20px)]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Analytics */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Performance Analytics</h3>
                <div className="relative">
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value as typeof selectedSubject)}
                    className="appearance-none bg-white border border-gray-300 rounded-lg pl-4 pr-10 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer"
                  >
                    <option value="science">Science</option>
                    <option value="mathematics">Mathematics</option>
                    <option value="language">Language</option>
                    <option value="reading">Reading</option>
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              
              {/* Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                {/* Left Column - Chart */}
                <div className="md:col-span-2">
                  <div className="flex flex-col items-center">
                    <div className="relative w-40 h-40">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          className="text-gray-200 stroke-current"
                          strokeWidth="10"
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                        />
                        <circle
                          className={`text-${currentSubject.color}-500 stroke-current`}
                          strokeWidth="10"
                          strokeLinecap="round"
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          strokeDasharray={`${2.51 * currentSubject.percentage} ${2.51 * 100}`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-gray-700">{currentSubject.percentage}%</span>
                        <span className="text-sm text-gray-500 mt-1">{currentSubject.correct}/{currentSubject.total}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mt-4">
                      <currentSubject.icon className={`w-6 h-6 text-${currentSubject.color}-500`} />
                      <span className="text-lg font-medium text-gray-700">{currentSubject.label}</span>
                    </div>
                  </div>
                </div>

                {/* Right Column - Stats */}
                <div className="md:col-span-3 space-y-6">
                  {/* Questions Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-500">Total Questions</p>
                      <p className="text-2xl font-bold text-gray-900">{currentSubject.total}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-sm text-green-600">Correct</p>
                      <p className="text-2xl font-bold text-green-700">{currentSubject.correct}</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4">
                      <p className="text-sm text-red-600">Incorrect</p>
                      <p className="text-2xl font-bold text-red-700">
                        {currentSubject.total - currentSubject.correct}
                      </p>
                    </div>
                  </div>

                  {/* Progress Section */}
                  <div className="bg-white rounded-lg">
                    <div className="mb-4">
                      <p className="mt-2 text-xs text-gray-500">
                        {currentSubject.total} of 2000 questions completed
                      </p>
                    </div>

                    {/* Recent Performance */}
                    <div className="mt-6">
                      <p className="text-sm font-medium text-gray-700 mb-3">Recent Performance</p>
                      <div className="flex items-center space-x-2">
                        <ArrowTrendingUpIcon className={`w-5 h-5 text-${currentSubject.color}-500`} />
                        <span className="text-sm text-gray-600">
                          Last 7 days: +{Math.round(currentSubject.percentage * 0.1)}% improvement
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Study Hours Card */}
            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Study Time Analytics</h3>
                  <p className="text-sm text-gray-500">Last 7 days • {studyStats.totalHours.toFixed(1)} total hours</p>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Daily Average</p>
                    <p className="text-xl font-bold text-gray-900">{studyStats.averageHours.toFixed(1)}h</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Current Streak</p>
                    <p className="text-xl font-bold text-purple-600">{studyStats.currentStreak} days</p>
                  </div>
                </div>
              </div>

              {/* Line Chart */}
              <div className="relative h-[300px] mb-8">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-4 bottom-8 w-12 flex flex-col justify-between text-xs text-gray-400 font-medium">
                  {[4, 3, 2, 1, 0].map((hour) => (
                    <span key={hour} className="text-right pr-2">
                      {hour}h
                    </span>
                  ))}
                </div>

                {/* Chart Area */}
                <div className="ml-12 h-full">
                  {/* Grid lines */}
                  <div className="absolute inset-0 bottom-8">
                    {[4, 3, 2, 1, 0].map((hour, i) => (
                      <div
                        key={hour}
                        className={`absolute w-full border-t ${i === 4 ? 'border-gray-200' : 'border-gray-100'}`}
                        style={{ top: `${(i * 25)}%` }}
                      />
                    ))}
                  </div>

                  {/* Line Chart */}
                  <div className="relative h-full pb-8">
                    <svg
                      className="w-full h-full"
                      viewBox={`0 0 ${graphWidth} ${graphHeight}`}
                      preserveAspectRatio="xMidYMid meet"
                    >
                      {/* Background Gradient */}
                      <defs>
                        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#9333EA" stopOpacity="0.12" />
                          <stop offset="100%" stopColor="#9333EA" stopOpacity="0.02" />
                        </linearGradient>
                        <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#9333EA" />
                          <stop offset="100%" stopColor="#A855F7" />
                        </linearGradient>
                      </defs>
                      
                      {/* Area under the line */}
                      <path
                        d={`
                          M ${graphPoints[0].x} ${graphHeight}
                          L ${graphPoints[0].x} ${graphPoints[0].y}
                          ${graphPoints.map((p) => `L ${p.x} ${p.y}`).join(' ')}
                          L ${graphPoints[graphPoints.length - 1].x} ${graphHeight}
                          Z
                        `}
                        fill="url(#areaGradient)"
                        className="transition-all duration-300"
                      />

                      {/* The line itself */}
                      <path
                        d={graphPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')}
                        stroke="url(#lineGradient)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        fill="none"
                        className="transition-all duration-300"
                      />

                      {/* Interactive Data points */}
                      {graphPoints.map((point, i) => (
                        <g 
                          key={i}
                          onMouseEnter={() => setHoveredPoint(i)}
                          onMouseLeave={() => setHoveredPoint(null)}
                          className="cursor-pointer"
                        >
                          {/* Outer circle */}
                          <circle
                            cx={point.x}
                            cy={point.y}
                            r="6"
                            fill="white"
                            stroke="#9333EA"
                            strokeWidth="2"
                            className={`transform transition-all duration-150 ${hoveredPoint === i ? 'scale-125' : ''}`}
                          />
                          {/* Inner circle */}
                          <circle
                            cx={point.x}
                            cy={point.y}
                            r="3"
                            fill="#9333EA"
                            className={`transform transition-all duration-150 ${hoveredPoint === i ? 'scale-125' : ''}`}
                          />
                          
                          {/* Hover tooltip */}
                          {hoveredPoint === i && (
                            <g>
                              <rect
                                x={point.x - 40}
                                y={point.y - 45}
                                width="80"
                                height="32"
                                rx="6"
                                fill="#1F2937"
                                className="opacity-95"
                              />
                              <text
                                x={point.x}
                                y={point.y - 24}
                                textAnchor="middle"
                                fill="white"
                                fontSize="13"
                                fontWeight="500"
                                className="font-medium"
                              >
                                {point.hours}h • {point.day}
                              </text>
                            </g>
                          )}
                        </g>
                      ))}
                    </svg>
                  </div>

                  {/* X-axis labels */}
                  <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-400 font-medium">
                    {studyHoursData.map((d, i) => (
                      <div
                        key={i}
                        className={`text-center transition-colors duration-150 ${
                          hoveredPoint === i ? 'text-purple-600 font-semibold' : ''
                        }`}
                        style={{ width: `${100 / studyHoursData.length}%` }}
                      >
                        {d.day}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm text-purple-600">Most Productive</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {studyHoursData.reduce((max, d) => d.hours > max.hours ? d : max).day}
                  </p>
                  <p className="text-sm text-purple-600">
                    {Math.max(...studyHoursData.map(d => d.hours))}h studied
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-600">Weekly Progress</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {Math.round((studyStats.totalHours / studyStats.weeklyTarget) * 100)}%
                  </p>
                  <p className="text-sm text-blue-600">
                    of {studyStats.weeklyTarget}h target
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-600">Improvement</p>
                  <p className="text-2xl font-bold text-green-700">
                    +{studyStats.improvement}%
                  </p>
                  <p className="text-sm text-green-600">vs last week</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-4">
                  <p className="text-sm text-amber-600">Daily Average</p>
                  <p className="text-2xl font-bold text-amber-700">
                    {studyStats.averageHours.toFixed(1)}h
                  </p>
                  <p className="text-sm text-amber-600">per day</p>
                </div>
              </div>
            </div>

            {/* Study Time Distribution */}
            {/* ... existing code ... */}
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default DashboardPage;