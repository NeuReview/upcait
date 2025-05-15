import React, { useState, useEffect, useRef, memo } from 'react';
import { 
  AcademicCapIcon, 
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  BeakerIcon,
  CalculatorIcon,
  LanguageIcon,
  BookOpenIcon,
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
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
  } from 'recharts';


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
  id?: number;
  user_id?: string;
  user_fullname: string;
  user_username: string;
  user_bio: string;
  user_location: string;
  user_school: string;
  user_socials: string;
  user_year_level: string;
  accept_tos?: boolean;

  // ← add these two
  created_at?: string;
  updated_at?: string;
}

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: UserData;
}

function TermsAndConditionsModal({
  userData,
  setShowTOSModal,
  setUserAcceptedTOS,
}: {
  userData: { user_id?: string };
  setShowTOSModal: (show: boolean) => void;
  setUserAcceptedTOS: (accepted: boolean) => void;
}) {
  const [termsHtml, setTermsHtml] = useState<string>('<p>Loading…</p>');
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/terms.html')
      .then(r => r.text())
      .then(setTermsHtml)
      .catch(() => setTermsHtml('<p>Failed to load.</p>'));
  }, []);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.innerHTML = termsHtml;
    }
  }, [termsHtml]);

  const handleScroll = () => {
    const el = contentRef.current;
    if (el && el.scrollTop + el.clientHeight >= el.scrollHeight - 1) {
      setHasScrolledToBottom(true);
    }
  };

  const handleAccept = async () => {
    await supabase
      .from('user_profile')
      .upsert(
        { user_id: userData.user_id, accept_tos: true, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      );
    setUserAcceptedTOS(true);
    setShowTOSModal(false);
  };
  const handleDisagree = () => supabase.auth.signOut();

  return (
    <div className="fixed inset-0 bg-purple-200 bg-opacity-75 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4">
        <div className="bg-purple-600 px-6 py-4 rounded-t-lg">
          <h2 className="text-white text-lg font-semibold">Terms of Service</h2>
        </div>
        <div
          ref={contentRef}
          onScroll={handleScroll}
          className="p-6 max-h-[60vh] overflow-y-auto text-sm text-gray-700 space-y-4"
        />
        <div className="flex justify-end space-x-3 p-4 border-t border-gray-200">
          <button onClick={handleDisagree} className="px-4 py-2 bg-gray-100 rounded-lg">
            I Disagree
          </button>
          <button
            onClick={handleAccept}
            disabled={!hasScrolledToBottom}
            className={
              hasScrolledToBottom
                ? 'px-4 py-2 bg-purple-600 text-white rounded-lg'
                : 'px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed'
            }
          >
            I Agree
          </button>
        </div>
      </div>
    </div>
  );
}


const TermsContent = memo(({ html }: { html: string }) => (
  <div dangerouslySetInnerHTML={{ __html: html }} />
));

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

interface ProfileSectionProps {
  setIsEditProfileOpen: (isOpen: boolean) => void;
  userData: UserData;
  supabaseStatus: { connected: boolean; error?: string };
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
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<'science' | 'mathematics' | 'language' | 'reading'>('science');
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);


  const [showSuccess, setShowSuccess] = useState(false);

  
  // Add useQuestions hook to access science progress stats
  const { getScienceProgressStats } = useQuestions();

  interface StudyHoursData { day: string; hours: number }

  function StudyTimeChart({ data }: { data: StudyHoursData[] }) {
    return (
      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 20, right: 20, bottom: 20, left: 0 }}
          >
            <defs>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#9333EA" />
                <stop offset="100%" stopColor="#A855F7" />
              </linearGradient>
            </defs>
  
            <XAxis
              dataKey="day"
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={false}
              tickLine={false}
              interval={0}
              padding={{ left: 10, right: 10 }}
            />
  
            <YAxis
              tick={{ fontSize: 12, fill: '#6B7280' }}
              domain={[0, 4]}
              ticks={[4, 3, 2, 1, 0]}
              tickFormatter={(val: number) => `${val}h`}
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
            />
  
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
  
            <Tooltip
      contentStyle={{
        backgroundColor: '#1F2937',
        border: 'none',
        borderRadius: 4,
      }}
      cursor={false}
      labelFormatter={() => ''}
      itemStyle={{ color: '#fff' }}
      separator=""   
      formatter={(value: number, _name: string, entry: any) =>
        [`${value.toFixed(1)}h • ${entry.payload.day}`, '']
      }
    />
  
            <Line
              type="monotone"
              dataKey="hours"
              stroke="url(#lineGradient)"
              strokeWidth={2.5}
              dot={{
                r: 6,
                stroke: '#9333EA',
                strokeWidth: 2,
                fill: '#fff',
              }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

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

  // ──────────────────────────────────────────────────────────────
  //  Quizzes → Science stats pulled from Supabase
  // ──────────────────────────────────────────────────────────────
  interface QuizStats {
    total: number;
    correct: number;
    incorrect: number;
  }

  const [quizScienceStats, setQuizScienceStats] = useState<QuizStats>({
    total: 0,
    correct: 0,
    incorrect: 0
  });
  const [quizMathStats, setQuizMathStats] = useState<QuizStats>({
    total: 0,
    correct: 0,
    incorrect: 0
  });
  // Language‑quiz stats
  const [quizLangStats, setQuizLangStats] = useState<QuizStats>({
    total: 0,
    correct: 0,
    incorrect: 0
  });
  // Reading‑quiz stats
  const [quizReadingStats, setQuizReadingStats] = useState<QuizStats>({
    total: 0,
    correct: 0,
    incorrect: 0
  });

  // Science-MockExam stats
  const [mockScienceStats, setMockScienceStats] = useState<QuizStats>({
    total: 0,
    correct: 0,
    incorrect: 0
  });
  // Math-MockExam stats
  const [mockMathStats, setMockMathStats] = useState<QuizStats>({
    total: 0,
    correct: 0,
    incorrect: 0
  });
  // Language-MockExam stats
  const [mockLangStats, setMockLangStats] = useState<QuizStats>({
    total: 0,
    correct: 0,
    incorrect: 0
  });
  // Reading-MockExam stats
  const [mockReadingStats, setMockReadingStats] = useState<QuizStats>({
    total: 0,
    correct: 0,
    incorrect: 0
  });
  
  // ──────────────────────────────────────────────────────────────
  // Answered questions stats (quizzes + mock)
  // ──────────────────────────────────────────────────────────────
  type SubjectKey = 'science' | 'mathematics' | 'language' | 'reading';

  interface AnswerStats {
    total: number;          // answered (quizzes + mock)
    cap: number;            // e.g. 2000 per subject
    percentage: number;     // total / cap * 100
  }

  const [answeredStats, setAnsweredStats] = useState<Record<SubjectKey, AnswerStats>>({
    science:      { total: 0, cap: 2000, percentage: 0 },
    mathematics:  { total: 0, cap: 2000, percentage: 0 },
    language:     { total: 0, cap: 2000, percentage: 0 },
    reading:      { total: 0, cap: 2000, percentage: 0 },
  });

  // Define a new state variable for the overall progress
  const [overallProgress, setOverallProgress] = useState({
    totalQuestions: 0,
    totalCap: 0,
    percentage: 0
  });

  // Add useEffect to update overall progress when answeredStats changes
  useEffect(() => {
    const totalQuestions = Object.values(answeredStats).reduce((sum, stat) => sum + stat.total, 0);
    const totalCap = Object.values(answeredStats).reduce((sum, stat) => sum + stat.cap, 0);
    const percentage = totalCap === 0 ? 0 : Math.round((totalQuestions / totalCap) * 100);
    
    setOverallProgress({
      totalQuestions,
      totalCap,
      percentage
    });
  }, [answeredStats]);

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

  const [userData, setUserData] = useState<UserData>({
    user_fullname: "",
    user_username: "",
    user_bio: "",
    user_location: "",
    user_school: "",
    user_socials: "",
    user_year_level: ""
  });

  // Fetch user profile data
  // Fetch user profile data

  const fetchUserProfile = async (): Promise<boolean> => {
  try {
    // 1) Get the currently authenticated user
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();
    if (authError || !user) {
      console.log("Not logged in; cannot fetch profile.");
      return false;
    }

    // 2) Try to load their existing profile row
    const { data: profileRow, error: profileError } = await supabase
      .from("user_profile")
      .select("*")
      .eq("user_id", user.id)
      .single();

    let row = profileRow;

    // 3) If no row exists (PG error PGRST116), create a default one
    if (profileError && profileError.code === "PGRST116") {
      const { data: newRow, error: insertErr } = await supabase
        .from("user_profile")
        .insert([{ user_id: user.id }])
        .select("*")
        .single();

      if (insertErr) {
        console.error("Could not create default profile", insertErr);
        return false;
      }
      row = newRow;
    } else if (profileError) {
      console.error("Error loading profile", profileError);
      return false;
    }

    // 4) Save the fetched/created profile into component state
    setUserData(row);

    // 5) Return whether they’ve already accepted the TOS
    return row.accept_tos === true;
  } catch (err) {
    console.error("fetchUserProfile:", err);
    return false;
  }
};
    
  useEffect(() => {
    fetchUserProfile();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, sess) => {
      if (sess?.user) fetchUserProfile();
    });
    return () => subscription.unsubscribe();
  }, []);
  
  useEffect(() => {
    const fetchStudyGoal = async () => {
      const { data, error } = await supabase
        .from('user_study_goals')
        .select('weekly_goal_min')
        .eq('user_id', userData.user_id)
        .limit(1);
  
      if (error) {
        console.error('Error loading study goal:', error);
        return;
      }
  
      // data may be null or an empty array
      if (Array.isArray(data) && data.length > 0) {
        const goalRow = data[0];
        const hours = Math.floor(goalRow.weekly_goal_min / 60);
        const mins  = goalRow.weekly_goal_min % 60;
        setGoalHours(hours);
        setGoalMinutes(mins);
        setStudyStats(prev => ({
          ...prev,
          weeklyTarget: goalRow.weekly_goal_min / 60
        }));
      }
    };
  
    if (userData.user_id) {
      fetchStudyGoal();
    }
  }, [userData.user_id]);
  
  // Update user profile data
  // Update user profile data
const updateUserProfile = async (updatedData: Partial<UserData>) => {
  try {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      alert('You must be logged in to update your profile.');
      return false;
    }
    const uid = authData.user.id;

    // Build a payload with only the editable fields
    const payload: Partial<UserData> = {
      user_fullname:   updatedData.user_fullname,
      user_username:   updatedData.user_username,
      user_bio:        updatedData.user_bio,
      user_location:   updatedData.user_location,
      user_school:     updatedData.user_school,
      user_socials:    updatedData.user_socials,
      user_year_level: updatedData.user_year_level,
      updated_at:      new Date().toISOString(),
    };

    // Try to update first
    const { data: existingProfile } = await supabase
      .from('user_profile')
      .select('user_id')
      .eq('user_id', uid)
      .single();

    if (existingProfile) {
      const { error } = await supabase
        .from('user_profile')
        .update(payload)
        .eq('user_id', uid);

      if (error) {
        console.error('Error updating profile:', error);
        alert('Failed to update profile. Please try again.');
        return false;
      }
    } else {
      // Insert new row if it didn’t exist
      const { error } = await supabase
        .from('user_profile')
        .insert([{ user_id: uid, ...payload, created_at: new Date().toISOString() }]);

      if (error) {
        console.error('Error creating profile:', error);
        alert('Failed to create profile. Please try again.');
        return false;
      }
    }

    await fetchUserProfile();
    return true;
  } catch (err) {
    console.error('Error in updateUserProfile:', err);
    return false;
  }
};


  // Update EditProfileModal component
  const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, userData }) => {
    const defaultFormData: UserData = {
      user_fullname: '',
      user_username: '',
      user_bio: '',
      user_location: '',
      user_school: '',
      user_socials: '',
      user_year_level: ''
    };

    const [formData, setFormData] = useState<UserData>(() => ({
      ...defaultFormData,
      ...Object.fromEntries(
        Object.entries(userData).map(([key, value]) => [key, value ?? ''])
      )
    }));
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
      setFormData({
        ...defaultFormData,
        ...Object.fromEntries(
          Object.entries(userData).map(([key, value]) => [key, value ?? ''])
        )
      });
    }, [userData]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setIsSubmitting(true);

      try {
        const success = await updateUserProfile(formData);
        if (success) {
          setShowSuccess(true);
        }        
      } finally {
        setIsSubmitting(false);
      }
    };

    if (!isOpen) return null;

    // If saved successfully, show this and nothing else:
    if (showSuccess) {
      return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-lg text-center">
            <CheckCircleIcon className="mx-auto w-12 h-12 text-green-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Profile Updated</h3>
            <p className="mb-6">Your profile was updated successfully!</p>
            <button
              onClick={() => {
                setShowSuccess(false);
                onClose();
              }}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              OK
            </button>
          </div>
        </div>
      );
    }


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
              disabled={isSubmitting}
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.user_fullname}
                  onChange={(e) => setFormData({ ...formData, user_fullname: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your full name"
                  disabled={isSubmitting}
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
                    value={formData.user_username}
                    onChange={(e) => setFormData({ ...formData, user_username: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="username"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Bio
                </label>
                <textarea
                  value={formData.user_bio}
                  onChange={(e) => setFormData({ ...formData, user_bio: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Write a short bio about yourself"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-lg font-medium text-gray-900">Location & Education</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.user_location}
                    onChange={(e) => setFormData({ ...formData, user_location: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="City, Country"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    School
                  </label>
                  <input
                    type="text"
                    value={formData.user_school}
                    onChange={(e) => setFormData({ ...formData, user_school: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your school name"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-lg font-medium text-gray-900">Social Links</h4>
              <div className="grid grid-cols-1 gap-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 flex-shrink-0 mr-3 rounded-lg bg-purple-50 flex items-center justify-center">
                    <GlobeAltIcon className="w-5 h-5 text-purple-600" />
                  </div>
                  <input
                    type="url"
                    value={formData.user_socials}
                    onChange={(e) => setFormData({ ...formData, user_socials: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Portfolio website URL"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const ProfileSection: React.FC<ProfileSectionProps> = ({ setIsEditProfileOpen, userData, supabaseStatus }) => {
    // ---------- placeholder fallbacks ----------
    const fullName        = userData.user_fullname?.trim() || 'Your Name';
    const usernameDisplay = userData.user_username?.trim() || 'username';
    const bioDisplay      = userData.user_bio?.trim() || 'Click “Edit” to add a short bio and share something about yourself!';
    const locationDisplay = userData.user_location?.trim() || 'Add your location';
    const schoolDisplay   = userData.user_school?.trim() || 'Add your school';
    // -------------------------------------------
    return (
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
                <h2 className="text-xl font-bold text-gray-900">{fullName}</h2>
                <p className="text-sm text-gray-500">@{usernameDisplay}</p>
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
                type="button"
                onClick={() => setIsEditProfileOpen(true)}
                className="inline-flex items-center px-3 py-1 border border-purple-200 rounded-full text-sm text-purple-600 bg-purple-50 hover:bg-purple-100 transition-colors"
              >
                <PencilIcon className="w-4 h-4 mr-1" />
                Edit
              </button>
            </div>
          </div>

          {/* Bio */}
          <p className="mt-4 text-sm text-gray-600">{bioDisplay}</p>

          {/* Location and School Info */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center text-sm text-gray-500">
              <MapPinIcon className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate">{locationDisplay}</span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <AcademicCapIcon className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate">{schoolDisplay}</span>
            </div>
          </div>

          {/* Social Links */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex flex-wrap gap-3">
              {userData.user_socials ? (
                <a
                  href={userData.user_socials}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
                >
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Visit your link
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(true)}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                >
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Add social link
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const subjectData = {
  science: {
    icon: BeakerIcon,
    color: 'sky',
    strokeClass: 'stroke-sky-500',
    textClass: 'text-sky-500',   // ← for the icon
    percentage: 75,
    correct: 112,
    total: 150,
    label:'Science'
  },
  mathematics: {
    icon: CalculatorIcon,
    color: 'amber',
    strokeClass: 'stroke-amber-500',
    textClass: 'text-amber-500',
    percentage: 68,
    correct: 82,
    total: 120,
    label: 'Mathematics'
  },
  language: {
    icon: LanguageIcon,
    color: 'emerald',
    strokeClass: 'stroke-emerald-500',
    textClass: 'text-emerald-500',
    percentage: 82,
    correct: 131,
    total: 160,
    label:'Language\nProficiency'
  },
  reading: {
    icon: BookOpenIcon,
    color: 'indigo',
    strokeClass: 'stroke-indigo-500',
    textClass: 'text-indigo-500',
    percentage: 78,
    correct: 109,
    total: 140,
    label: 'Reading\nComprehension'
  }
};


  // Merge dynamic quiz‑science stats into the base subject data
  const baseSubject = subjectData[selectedSubject];

  const currentSubject =
    selectedTestType === 'quizzes' && selectedSubject === 'science'
      ? {
          ...baseSubject,
          total: scienceProgress.totalQuestions,
          correct: scienceProgress.correctAnswers,
          percentage:
            scienceProgress.totalQuestions === 0
              ? 0
              : Math.round(
                  (scienceProgress.correctAnswers / scienceProgress.totalQuestions) * 100
                ),
          color: baseSubject.color
        }
      : selectedTestType === 'quizzes' && selectedSubject === 'mathematics'
      ? {
          ...baseSubject,
          total: quizMathStats.total,
          correct: quizMathStats.correct,
          percentage:
            quizMathStats.total === 0
              ? 0
              : Math.round(
                  (quizMathStats.correct / quizMathStats.total) * 100
                ),
          color: baseSubject.color
        }
      : selectedTestType === 'quizzes' && selectedSubject === 'language'
      ? {
          ...baseSubject,
          total: quizLangStats.total,
          correct: quizLangStats.correct,
          percentage:
            quizLangStats.total === 0
              ? 0
              : Math.round(
                  (quizLangStats.correct / quizLangStats.total) * 100
                ),
          color: baseSubject.color
        }
      : selectedTestType === 'quizzes' && selectedSubject === 'reading'
      ? {
          ...baseSubject,
          total: quizReadingStats.total,
          correct: quizReadingStats.correct,
          percentage:
            quizReadingStats.total === 0
              ? 0
              : Math.round((quizReadingStats.correct / quizReadingStats.total) * 100),
          color: baseSubject.color
        }
      : selectedTestType === 'mock_exams' && selectedSubject === 'science'
      ? {
          ...baseSubject,
          total: mockScienceStats.total,
          correct: mockScienceStats.correct,
          percentage:
            mockScienceStats.total === 0
              ? 0
              : Math.round((mockScienceStats.correct / mockScienceStats.total) * 100),
          color: baseSubject.color
        }
      : selectedTestType === 'mock_exams' && selectedSubject === 'mathematics'
      ? {
          ...baseSubject,
          total: mockMathStats.total,
          correct: mockMathStats.correct,
          percentage:
            mockMathStats.total === 0
              ? 0
              : Math.round((mockMathStats.correct / mockMathStats.total) * 100),
          color: baseSubject.color
        }
        : selectedTestType === 'mock_exams' && selectedSubject === 'mathematics'
        ? {
            ...baseSubject,
            total: mockMathStats.total,
            correct: mockMathStats.correct,
            percentage:
              mockMathStats.total === 0
                ? 0
                : Math.round((mockMathStats.correct / mockMathStats.total) * 100),
            color: baseSubject.color
          }
        : selectedTestType === 'mock_exams' && selectedSubject === 'language'
        ? {
            ...baseSubject,
            total: mockLangStats.total,
            correct: mockLangStats.correct,
            percentage:
              mockLangStats.total === 0
                ? 0
                : Math.round((mockLangStats.correct / mockLangStats.total) * 100),
            color: baseSubject.color
          }  
        : selectedTestType === 'mock_exams' && selectedSubject === 'reading'
        ? {
            ...baseSubject,
            total: mockReadingStats.total,
            correct: mockReadingStats.correct,
            percentage:
              mockReadingStats.total === 0
                ? 0
                : Math.round((mockReadingStats.correct / mockReadingStats.total) * 100),
            color: baseSubject.color
          }
      : baseSubject;
  // Fetch Reading-Quizzes performance whenever the dropdowns change
  useEffect(() => {
    const fetchReadingQuizStats = async () => {
      if (selectedTestType !== 'quizzes' || selectedSubject !== 'reading') return;

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.warn('[Reading-Quiz] No user logged‑in');
          return;
        }

        // 1) Try user-specific rows
        const { data, error } = await supabase
          .from('reading_comp_progress_report_quizzes')
          .select('correct_question')
          .eq('user_id', user.id);
        console.log('[Reading-Quiz] post-filter rows →', data, 'error →', error);

        // 2) Fallback to all rows if none
        let quizData = data ?? [];
        if (!error && quizData.length === 0) {
          console.warn('[Reading-Quiz] No rows for this user, falling back to all rows...');
          const { data: allData, error: allError } = await supabase
            .from('reading_comp_progress_report_quizzes')
            .select('correct_question');
          console.log('[Reading-Quiz] fallback rows →', allData, 'error →', allError);
          if (!allError && allData) quizData = allData;
        }

        // 3) Handle error
        if (error) {
          console.error('Error fetching reading quiz stats', error);
          return;
        }

        // 4) Compute stats
        const total     = quizData.length;
        const correct   = quizData.filter(r => Number(r.correct_question) === 1).length;
        const incorrect = total - correct;
        console.log('[Reading-Quiz] Computed →', { total, correct, incorrect });

        // 5) Update state
        setQuizReadingStats({ total, correct, incorrect });
      } catch (err) {
        console.error('Unexpected error fetching reading quiz stats', err);
      }
    };

    fetchReadingQuizStats();
  }, [selectedTestType, selectedSubject]);

  // Fetch Science-MockExam performance whenever the dropdowns change
  useEffect(() => {
    const fetchMockScienceStats = async () => {
      if (selectedTestType !== 'mock_exams' || selectedSubject !== 'science') return;

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.warn('[Mock-Sci] No user logged-in');
          return;
        }

        const { data, error } = await supabase
          .from('science_progress_report_mockexam')
          .select('correct_question')
          .eq('user_id', user.id);

        console.log('[Mock-Sci] Raw rows →', data, 'error →', error);

        if (error) {
          console.error('[Mock-Sci] Error fetching mock-exam stats', error);
          return;
        }

        const total     = data.length;
        const correct   = data.filter(r => Number(r.correct_question) === 1).length;
        const incorrect = total - correct;

        console.log('[Mock-Sci] Computed →', { total, correct, incorrect });

        setMockScienceStats({ total, correct, incorrect });
      } catch (err) {
        console.error('[Mock-Sci] Unexpected error fetching mock-exam stats', err);
      }
    };

    fetchMockScienceStats();
  }, [selectedTestType, selectedSubject]);
  // Fetch Math-MockExam performance whenever the dropdowns change
  useEffect(() => {
    const fetchMockMathStats = async () => {
      if (selectedTestType !== 'mock_exams' || selectedSubject !== 'mathematics') return;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data, error } = await supabase
          .from('math_progress_report_mockexam')
          .select('correct_question')
          .eq('user_id', user.id);
        console.log('[Mock-Math] Raw rows →', data, 'error →', error);
        if (error) {
          console.error('[Mock-Math] Error fetching mock-exam stats', error);
          return;
        }
        const total     = data.length;
        const correct   = data.filter(r => Number(r.correct_question) === 1).length;
        const incorrect = total - correct;
        console.log('[Mock-Math] Computed →', { total, correct, incorrect });
        setMockMathStats({ total, correct, incorrect });
      } catch (err) {
        console.error('[Mock-Math] Unexpected error fetching mock-exam stats', err);
      }
    };
    fetchMockMathStats();
  }, [selectedTestType, selectedSubject]);
  // Fetch Language‑Quizzes performance whenever the dropdowns change
  useEffect(() => {
    const fetchLangQuizStats = async () => {
      if (selectedTestType !== 'quizzes' || selectedSubject !== 'language') return;

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.warn('[Lang‑Quiz] No user logged‑in');
          return;
        }

        // 1) Try user-specific rows, include user_id in select
        const { data, error } = await supabase
          .from('lang_prof_progress_report_quizzes')
          .select('user_id, correct_question')
          .eq('user_id', user.id);
        console.log('[Lang-Quiz] post-filter rows →', data, 'error →', error);

        // 2) If none found for this user, fetch all rows as fallback (include user_id)
        let quizData = data ?? [];
        if (!error && quizData.length === 0) {
          console.warn('[Lang-Quiz] No rows for this user, falling back to all rows...');
          const { data: allData, error: allError } = await supabase
            .from('lang_prof_progress_report_quizzes')
            .select('user_id, correct_question');
          console.log('[Lang-Quiz] fallback rows →', allData, 'error →', allError);
          if (!allError && allData) {
            quizData = allData;
          }
        }

        // 3) Handle any real error
        if (error) {
          console.error('Error fetching language quiz stats', error);
          return;
        }

        // 4) Compute stats from the chosen dataset
        const total     = quizData.length;
        const correct   = quizData.filter(r => Number(r.correct_question) === 1).length;
        const incorrect = total - correct;
        console.log('[Lang-Quiz] Computed →', { total, correct, incorrect });

        // 5) Update state
        setQuizLangStats({ total, correct, incorrect });
      } catch (err) {
        console.error('Unexpected error fetching language quiz stats', err);
      }
    };

    fetchLangQuizStats();
  }, [selectedTestType, selectedSubject]);
  // Fetch Science‑Quizzes performance whenever the dropdowns change
  useEffect(() => {
    const fetchScienceQuizStats = async () => {
      if (selectedTestType !== 'quizzes' || selectedSubject !== 'science') return;

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('science_progress_report_quizzes')
          .select('correct_question')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching science quiz stats', error);
          return;
        }

        const total = data.length;
        const correct = data.filter(r => Number(r.correct_question) === 1).length;
        const incorrect = total - correct;

        setQuizScienceStats({ total, correct, incorrect });
      } catch (err) {
        console.error('Unexpected error fetching science quiz stats', err);
      }
    };

    fetchScienceQuizStats();
  }, [selectedTestType, selectedSubject]);

  // Fetch Math‑Quizzes performance whenever the dropdowns change
  useEffect(() => {
    const fetchMathQuizStats = async () => {
      if (selectedTestType !== 'quizzes' || selectedSubject !== 'mathematics') return;

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.warn('[Math‑Quiz] No user logged‑in');
          return;
        }

        const { data, error } = await supabase
          .from('math_progress_report_quizzes')
          .select('correct_question')
          .eq('user_id', user.id);

        console.log('[Math‑Quiz] Raw rows →', data);

        if (error) {
          console.error('Error fetching math quiz stats', error);
          return;
        }

        const total     = data.length;
        const correct   = data.filter(r => Number(r.correct_question) === 1).length;
        const incorrect = total - correct;

        console.log('[Math‑Quiz] Computed →', { total, correct, incorrect });

        setQuizMathStats({ total, correct, incorrect });
      } catch (err) {
        console.error('Unexpected error fetching math quiz stats', err);
      }
    };

    fetchMathQuizStats();
  }, [selectedTestType, selectedSubject]);

  // Fetch Language-MockExam performance whenever the dropdowns change
  useEffect(() => {
    const fetchMockLangStats = async () => {
      if (selectedTestType !== 'mock_exams' || selectedSubject !== 'language') return;

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.warn('[Mock-Lang] No user logged-in');
          return;
        }

        const { data, error } = await supabase
          .from('lang_prof_progress_report_mockexam')
          .select('correct_question')
          .eq('user_id', user.id);

        console.log('[Mock-Lang] Raw rows →', data, 'error →', error);

        if (error) {
          console.error('[Mock-Lang] Error fetching mock-exam stats', error);
          return;
        }

        const total     = data.length;
        const correct   = data.filter(r => Number(r.correct_question) === 1).length;
        const incorrect = total - correct;

        console.log('[Mock-Lang] Computed →', { total, correct, incorrect });

        setMockLangStats({ total, correct, incorrect });
      } catch (err) {
        console.error('[Mock-Lang] Unexpected error fetching mock-exam stats', err);
      }
    };
    fetchMockLangStats();
  }, [selectedTestType, selectedSubject]);

  // Fetch Reading-MockExam performance whenever the dropdowns change
  useEffect(() => {
    const fetchMockReadingStats = async () => {
      if (selectedTestType !== 'mock_exams' || selectedSubject !== 'reading') return;

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.warn('[Mock-Read] No user logged-in');
          return;
        }

        const { data, error } = await supabase
          .from('reading_comp_progress_report_mockexam')
          .select('correct_question')
          .eq('user_id', user.id);

        console.log('[Mock-Read] Raw rows →', data, 'error →', error);

        if (error) {
          console.error('[Mock-Read] Error fetching mock-exam stats', error);
          return;
        }

        const total     = data.length;
        const correct   = data.filter(r => Number(r.correct_question) === 1).length;
        const incorrect = total - correct;

        console.log('[Mock-Read] Computed →', { total, correct, incorrect });

        setMockReadingStats({ total, correct, incorrect });
      } catch (err) {
        console.error('[Mock-Read] Unexpected error fetching mock-exam stats', err);
      }
    };

    fetchMockReadingStats();
  }, [selectedTestType, selectedSubject]);

  // Pull answered-question counts for every subject (quizzes + mock)
  useEffect(() => {
    const fetchAnsweredStats = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.warn('[Answered] No logged-in user');
          return;
        }
        const uid = user.id;

        // Helper to get count(*) from a table for this user
        const countRows = async (table: string) => {
          const { count, error } = await supabase
            .from(table)
            .select('*', { head: true, count: 'exact' })
            .eq('user_id', uid);
          if (error) {
            console.error(`[Answered] ${table} →`, error);
            return 0;
          }
          return count ?? 0;
        };

        // Map subject → its two tables
        const tables: Record<SubjectKey, string[]> = {
          science:     ['science_progress_report_quizzes',     'science_progress_report_mockexam'],
          mathematics: ['math_progress_report_quizzes',        'math_progress_report_mockexam'],
          language:    ['lang_prof_progress_report_quizzes',   'lang_prof_progress_report_mockexam'],
          reading:     ['reading_comp_progress_report_quizzes', 'reading_comp_progress_report_mockexam'],
        };

        // Fetch all counts in parallel
        const newStats: Record<SubjectKey, AnswerStats> = { ...answeredStats };
        await Promise.all(
          (Object.keys(tables) as SubjectKey[]).map(async (subject) => {
            const [quizCnt, mockCnt] = await Promise.all(
              tables[subject].map((tbl) => countRows(tbl))
            );
            const total = quizCnt + mockCnt;
            newStats[subject] = {
              total,
              cap: newStats[subject].cap,
              percentage: newStats[subject].cap
                ? Math.round((total / newStats[subject].cap) * 100)
                : 0,
            };
            console.log(`[Answered] ${subject} → quizzes=${quizCnt} mock=${mockCnt} total=${total}`);
          })
        );

        setAnsweredStats(newStats);
      } catch (err) {
        console.error('[Answered] Unexpected error', err);
      }
    };

    fetchAnsweredStats();
  }, []);                // ← run once on mount

  // ──────────────────────────────────────────────────────────────
  // Study‑time analytics state (fetched from Supabase)
  // ──────────────────────────────────────────────────────────────
  const [studyHoursData, setStudyHoursData] = useState<StudyHoursData[]>([]);

  interface StudyStats {
    currentStreak: number;
    totalHours: number;
    averageHours: number;
    weeklyTarget: number;
    improvement: number;
    bestDay: { day: string; hours: number };
  }

  const [studyStats, setStudyStats] = useState<StudyStats>({
    currentStreak: 0,
    totalHours: 0,
    averageHours: 0,
    weeklyTarget: 21,          // default fallback
    improvement: 0,
    bestDay: { day: '', hours: 0 }
  });

  const [isStudyGoalModalOpen, setIsStudyGoalModalOpen] = useState(false);

  const initialHours = Math.floor(studyStats.weeklyTarget);
  const initialMinutes = Math.round((studyStats.weeklyTarget - initialHours) * 60);

  const [goalHours, setGoalHours]     = useState<number>(initialHours);
  const [goalMinutes, setGoalMinutes] = useState<number>(initialMinutes);

  const [weeklyGoalInput, setWeeklyGoalInput] = useState(studyStats.weeklyTarget);

  // Fetch the last 7 days of study‑time analytics for the logged‑in user
  // --- inside DashboardPage, remove the old useEffect and paste this instead: ---
  useEffect(() => {
    const fetchStudyTimeAnalytics = async () => {
      try {
        // 1) get current user
        const { data: authData, error: authErr } = await supabase.auth.getUser();
        if (authErr || !authData.user) throw authErr ?? new Error("Not authenticated");
        const uid = authData.user.id;
  
        // 2) fetch up to one year of daily totals, newest first
        const { data, error: fetchErr } = await supabase
          .from("daily_session_time")
          .select("day, total_secs")
          .eq("user_id", uid)
          .order("day", { ascending: false })
          .limit(365);
  
        if (fetchErr) {
          console.error("Error fetching daily totals", fetchErr);
          return;
        }
        const allRows = data ?? [];
        if (allRows.length === 0) {
          setStudyHoursData([]);
          setStudyStats(prev => ({ ...prev, currentStreak: 0, improvement: 0 }));
          return;
        }
  
        // 3) compute calendar-aware streak:
        //    iterate newest→oldest, require each row.day to be exactly
        //    one calendar day before the previous, AND total_secs>0.
        let streak = 0;
        let prevDate = new Date(allRows[0].day); // most recent day
        for (const row of allRows) {
          const d = new Date(row.day);
          // difference in days
          const diffMs  = prevDate.getTime() - d.getTime();
          const diffDay = diffMs / (1000 * 60 * 60 * 24);
          // first iteration diffDay===0, allow it; subsequent must be ≈1
          const isConsecutive = streak === 0 ? row.total_secs > 0
                                 : row.total_secs > 0 && Math.round(diffDay) === 1;
  
          if (isConsecutive) {
            streak++;
            prevDate = d;
          } else {
            break;
          }
        }
  
        // 4) build chart window: last 7 rows reversed → chronological
        const last7 = allRows.slice(0, 7).reverse();
        const mapped: StudyHoursData[] = last7.map(r => ({
          day:   new Date(r.day).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          hours: +(r.total_secs / 3600).toFixed(2)
        }));
        setStudyHoursData(mapped);
  
        // 5) simple totals & average for those 7 days
        const totalH = mapped.reduce((sum, d) => sum + d.hours, 0);
        const avgH   = mapped.length ? totalH / mapped.length : 0;
  
        // 6) best day in that window
        const best = mapped.reduce((b, d) => (d.hours > b.hours ? d : b), { day: "", hours: 0 });
  
        // 7) improvement vs. the prior 7-day block
        const sumHours = (rows: { total_secs: number }[]) =>
          rows.reduce((acc, r) => acc + r.total_secs / 3600, 0);
        const thisTotal = sumHours(allRows.slice(0, 7));
        const lastTotal = sumHours(allRows.slice(7, 14));
        const improvement =
          lastTotal === 0
            ? thisTotal === 0 ? 0 : 100
            : ((thisTotal - lastTotal) / lastTotal) * 100;
  
        // 8) commit
        setStudyStats(prev => ({
          ...prev,
          currentStreak: streak,
          totalHours:   totalH,
          averageHours: avgH,
          bestDay:      best,
          improvement:  Math.round(improvement)
        }));
      } catch (err) {
        console.error("Unexpected error fetching study analytics", err);
      }
    };
  
    fetchStudyTimeAnalytics();
  }, []);
  
  
  // Graph dimensions and settings
  const graphWidth = 400;
  const graphHeight = 200;
  const maxHours = Math.max(4, ...studyHoursData.map(d => d.hours));

  // Calculate points for the line graph
  const graphPoints = studyHoursData.map((d, i) => ({
    x: (i * (graphWidth - 40)) / (studyHoursData.length - 1) + 20,
    y: graphHeight - ((d.hours * (graphHeight - 40)) / maxHours) - 20,
    hours: d.hours,
    day: d.day
  }));

    // ─── Terms & Conditions Modal ────────────────────────────

    
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-1">
            <ProfileSection
              setIsEditProfileOpen={setIsEditProfileOpen}
              userData={userData}
              supabaseStatus={supabaseStatus}
            />
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Questions Answered */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Questions Answered</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {(['science','mathematics','language','reading'] as SubjectKey[]).map((sKey) => {
                  const subj = subjectData[sKey];
                  const stats = answeredStats[sKey];
                  return (
                    <div key={sKey} className="flex flex-col items-center">
                      <div className="relative w-44 h-44">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          <circle
                            className="stroke-gray-200"
                            strokeWidth="8"
                            cx="50"
                            cy="50"
                            r="45"
                            fill="transparent"
                          />
                          <circle
                            className={`stroke-${subj.color}-500`}
                            strokeWidth="8"
                            strokeLinecap="round"
                            cx="50"
                            cy="50"
                            r="45"
                            fill="transparent"
                            strokeDasharray={2 * Math.PI * 45}
                            strokeDashoffset={(1 - stats.percentage / 100) * 2 * Math.PI * 45}
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-3xl font-bold text-gray-700">{stats.percentage.toFixed(2)}%</span>
                          <span className="text-sm text-gray-500 mt-1">{stats.total}/{stats.cap}</span>
                          <span className="text-xs font-medium text-gray-600 mt-1 text-center whitespace-pre-line">
                            {subj.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Overall Progress Bar */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Total Progress</h3>
                    <p className="text-sm text-gray-500">
                      {overallProgress.totalQuestions}/{overallProgress.totalCap} questions answered
                    </p>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {overallProgress.percentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-cyan-500 transition-all duration-500" 
                    style={{ width: `${overallProgress.percentage}%` }}>
                    <div className="h-full w-full opacity-50 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.2)_10px,rgba(255,255,255,0.2)_20px)]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Analytics */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Performance Analytics</h3>

                {/* Dropdowns for test type and subject */}
                <div className="flex items-center space-x-4">
                  {/* Test‑type selector */}
                  <div className="relative">
                    <select
                      value={selectedTestType}
                      onChange={(e) =>
                        setSelectedTestType(
                          e.target.value as typeof selectedTestType
                        )
                      }
                      className="appearance-none bg-white border border-gray-300 rounded-lg pl-4 pr-10 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer"
                    >
                      <option value="quizzes">Quizzes</option>
                      <option value="mock_exams">Mock Exams</option>
                    </select>
                    <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>

                  {/* Subject selector */}
                  <div className="relative">
                    <select
                      value={selectedSubject}
                      onChange={(e) =>
                        setSelectedSubject(
                          e.target.value as typeof selectedSubject
                        )
                      }
                      className="appearance-none bg-white border border-gray-300 rounded-lg pl-4 pr-10 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer"
                    >
                      <option value="science">Science</option>
                      <option value="mathematics">Mathematics</option>
                      <option value="language">Language Proficiency</option>
                      <option value="reading">Reading Comprehension</option>
                    </select>
                    <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
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
                          r="45"
                          fill="transparent"
                        />
                        <circle
                          className={`text-${currentSubject.color}-500 stroke-current`}
                          strokeWidth="10"
                          strokeLinecap="round"
                          cx="50"
                          cy="50"
                          r="45"
                          fill="transparent"
                          strokeDasharray={2 * Math.PI * 45}
                          strokeDashoffset={(1 - currentSubject.percentage / 100) * 2 * Math.PI * 45}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-gray-700">{currentSubject.percentage.toFixed(2)}%</span>
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

                  <button
        onClick={() => setIsStudyGoalModalOpen(true)}
        className="px-3 py-1.5 text-xs font-semibold border border-purple-600 text-purple-600 rounded-md hover:bg-purple-50 transition"
      >
        Set Study Goal
      </button>

                </div>
              </div>

              {/* Line Chart */}
              {/* Recharts Line Chart */}
             <StudyTimeChart data={studyHoursData} />

              {/* Stats Cards */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm text-purple-600">Most Productive</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {studyStats.bestDay.day || '—'}
                  </p>
                  <p className="text-sm text-purple-600">
                    {studyStats.bestDay.hours.toFixed(1)}h studied
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
                    {studyStats.improvement}%
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

      {/* Study Goal Modal */}
      {isStudyGoalModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
    <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-lg">
      <h2 className="text-lg font-bold text-gray-900 mb-4">
        Set Weekly Study Goal
      </h2>
      <p className="text-sm text-gray-600 mb-6">
        How much time per week do you aim to study?
      </p>

      {/* <-- add justify-center here */}
      <div className="flex items-center justify-center space-x-2 mb-6">
        {/* Hour input */}
        <div className="flex flex-col items-center justify-center">
          <label className="text-xs text-gray-500 mb-1">Hour</label>
          <input
            type="number"
            min={0}
            max={168}
            value={goalHours}
            onChange={e => setGoalHours(Math.max(0, Number(e.target.value)))}
            className="w-16 h-12 text-center border-2 border-purple-600 rounded-lg focus:outline-none"
          />
        </div>

        <span className="text-2xl font-semibold relative top-2">:</span>


        {/* Minute input */}
        <div className="flex flex-col items-center justify-center">
          <label className="text-xs text-gray-500 mb-1">Minute</label>
          <input
            type="number"
            min={0}
            max={59}
            step={15}
            value={goalMinutes}
            onChange={e => {
              let m = Math.max(0, Math.min(59, Number(e.target.value)));
              setGoalMinutes(m);
            }}
            className="w-16 h-12 text-center border border-gray-300 rounded-lg focus:outline-none"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          onClick={() => setIsStudyGoalModalOpen(false)}
          className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          onClick={async () => {
            const totalMin = goalHours * 60 + goalMinutes;
            const { error } = await supabase
              .from('user_study_goals')
              .upsert(
                {
                  user_id:         userData.user_id,
                  weekly_goal_min: totalMin,
                  updated_at:      new Date().toISOString()
                },
                { onConflict: 'user_id' }
              );
            if (error) {
              console.error('Failed to save study goal:', error);
              alert('Error saving your goal. Please try again.');
              return;
            }
            setStudyStats(prev => ({ ...prev, weeklyTarget: totalMin / 60 }));
            setIsStudyGoalModalOpen(false);
          }}
          className="px-4 py-2 text-sm rounded-md bg-purple-600 text-white hover:bg-purple-700"
        >
          Save Goal
        </button>
      </div>
    </div>
  </div>
)}
               
      
      {/* Add EditProfileModal */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        userData={userData}
      />

    </div>
  );
};

export default DashboardPage;