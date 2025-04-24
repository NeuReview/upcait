import React, { useState, useEffect } from 'react';
import { 
  AcademicCapIcon, 
  ClockIcon, 
  CheckCircleIcon,
  XCircleIcon,
  BeakerIcon,
  BookOpenIcon,
  LanguageIcon,
  ExclamationTriangleIcon,
  TrophyIcon,
  ChartBarIcon,
  ArrowPathIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useQuestions } from '../hooks/useQuestions';
import type { Question } from '../types/quiz';

type OptionKey = 'option_a' | 'option_b' | 'option_c' | 'option_d';
const OPTION_KEYS: OptionKey[] = ['option_a', 'option_b', 'option_c', 'option_d'];
const LETTERS = ['A','B','C','D'] as const;

const topics = [
  {
    id: 'Reading Comprehension',
    name: 'Reading Comprehension',
    icon: BookOpenIcon,
    description: 'Critical reading and analysis'
  },
  {
    id: 'Science',
    name: 'Science',
    icon: BeakerIcon,
    description: 'Physics, Chemistry, and Biology concepts'
  },
  {
    id: 'Mathematics',
    name: 'Mathematics',
    icon: AcademicCapIcon,
    description: 'Algebra, Geometry, Trigonometry, and more'
  },
  {
    id: 'Language Proficiency',
    name: 'Language Proficiency',
    icon: LanguageIcon,
    description: 'English and Filipino language skills'
  }
];

const difficulties = [
  { id: 'Easy', name: 'Easy', color: 'text-growth-green' },
  { id: 'Medium', name: 'Medium', color: 'text-energy-orange' },
  { id: 'Hard', name: 'Hard', color: 'text-alert-red' },
];

interface QuizScore {
  total: number;
  correct: number;
  incorrect: number;
  percentage: number;
  timeSpent: number;
  categoryScores: {
    [key: string]: {
      total: number;
      correct: number;
      percentage: number;
    }
  };
}

interface ReviewItem extends Omit<Question, 'options' | 'answer'> {
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correctAnswer: string;
  userAnswer: string | null;
  explanation: string;
}

const mapQuestionToReviewItem = (question: Question, userAnswer: string | null): ReviewItem => {
  return {
    ...question,
    option_a: question.option_a || question.options[0] || '',
    option_b: question.option_b || question.options[1] || '',
    option_c: question.option_c || question.options[2] || '',
    option_d: question.option_d || question.options[3] || '',
    correctAnswer: question.answer,
    userAnswer: userAnswer,
    explanation: question.explanation || ''
  };
};

const getScoreCategory = (percentage: number) => {
  if (percentage >= 90) return { label: 'Outstanding!', color: 'text-growth-green', message: 'Exceptional performance! You\'re well-prepared for the UPCAT.' };
  if (percentage >= 80) return { label: 'Excellent!', color: 'text-neural-purple', message: 'Great work! Keep up this level of performance.' };
  if (percentage >= 70) return { label: 'Good Job!', color: 'text-tech-lavender', message: 'Solid performance. Focus on the areas where you can improve.' };
  if (percentage >= 60) return { label: 'Keep Going!', color: 'text-energy-orange', message: 'You\'re making progress. Let\'s work on strengthening your knowledge.' };
  return { label: 'Room to Grow', color: 'text-alert-red', message: 'Don\'t worry! Every attempt helps you learn and improve.' };
};

const QuizSummary = ({ score, onRetry }: { score: QuizScore; onRetry: () => void }) => {
  const scoreCategory = getScoreCategory(score.percentage);
  const minutes = Math.floor(score.timeSpent / 60);
  const seconds = score.timeSpent % 60;

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-3xl mx-auto">
      {/* Score Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-neural-purple/10 mb-4">
          <TrophyIcon className={`w-10 h-10 ${scoreCategory.color}`} />
        </div>
        <h2 className={`text-3xl font-bold ${scoreCategory.color} mb-2`}>
          {scoreCategory.label}
        </h2>
        <p className="text-4xl font-bold mb-2">
          {score.percentage}%
        </p>
        <p className="text-gray-600">
          {scoreCategory.message}
        </p>
      </div>

      {/* Score Details */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-500">Total Questions</p>
          <p className="text-2xl font-bold text-gray-900">{score.total}</p>
        </div>
        <div className="bg-growth-green/5 rounded-lg p-4 text-center">
          <p className="text-sm text-growth-green">Correct</p>
          <p className="text-2xl font-bold text-growth-green">{score.correct}</p>
        </div>
        <div className="bg-alert-red/5 rounded-lg p-4 text-center">
          <p className="text-sm text-alert-red">Incorrect</p>
          <p className="text-2xl font-bold text-alert-red">{score.incorrect}</p>
        </div>
      </div>

      {/* Time Spent */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-2 text-gray-600">
          <ClockIcon className="w-5 h-5" />
          <span>Time Spent: {minutes}m {seconds}s</span>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="space-y-4 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance by Category</h3>
        {Object.entries(score.categoryScores).map(([category, stats]) => (
          <div key={category} className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-gray-700">{category}</span>
              <span className={`font-medium ${
                stats.percentage >= 70 ? 'text-growth-green' : 
                stats.percentage >= 50 ? 'text-energy-orange' : 
                'text-alert-red'
              }`}>
                {stats.percentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  stats.percentage >= 70 ? 'bg-growth-green' : 
                  stats.percentage >= 50 ? 'bg-energy-orange' : 
                  'bg-alert-red'
                }`}
                style={{ width: `${stats.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      <div className="bg-neural-purple/5 rounded-lg p-6 mb-8">
        <h3 className="flex items-center text-lg font-semibold text-neural-purple mb-4">
          <SparklesIcon className="w-5 h-5 mr-2" />
          Recommendations
        </h3>
        <ul className="space-y-2 text-gray-600">
          {score.percentage < 70 && (
            <>
              <li className="flex items-start">
                <ChartBarIcon className="w-5 h-5 mr-2 text-neural-purple flex-shrink-0 mt-0.5" />
                Focus on understanding core concepts in {
                  Object.entries(score.categoryScores)
                    .filter(([_, stats]) => stats.percentage < 70)
                    .map(([category]) => category)
                    .join(', ')
                }
              </li>
              <li className="flex items-start">
                <BookOpenIcon className="w-5 h-5 mr-2 text-neural-purple flex-shrink-0 mt-0.5" />
                Review the explanations for questions you got wrong
              </li>
            </>
          )}
          <li className="flex items-start">
            <AcademicCapIcon className="w-5 h-5 mr-2 text-neural-purple flex-shrink-0 mt-0.5" />
            Try questions from different categories to maintain a balanced preparation
          </li>
        </ul>
      </div>

      {/* Actions */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={onRetry}
          className="flex items-center px-6 py-3 bg-neural-purple text-white rounded-lg hover:bg-tech-lavender transition-colors duration-200"
        >
          <ArrowPathIcon className="w-5 h-5 mr-2" />
          Try Another Quiz
        </button>
      </div>
    </div>
  );
};

/* 
  NEW: This is our summary-only review sidebar, 
  showing correctness by category (like MockExamsPage).
*/
const QuizSummarySidebar = ({ reviewData }: { reviewData: ReviewItem[] }) => {
  const [selectedQuestion, setSelectedQuestion] = useState<ReviewItem | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Group items by category
  const grouped = reviewData.reduce((acc, q) => {
    if (!acc[q.category]) acc[q.category] = [];
    acc[q.category].push(q);
    return acc;
  }, {} as { [key: string]: ReviewItem[] });

  // Color each question button
  const getColor = (item: ReviewItem) => {
    return item.userAnswer === item.correctAnswer
      ? 'bg-green-100 text-green-700'
      : 'bg-red-100 text-red-700';
  };

  return (
    <>
      {/* Floating Sidebar - Summaries */}
      <div className="hidden md:block fixed top-24 right-4 w-64 bg-white border rounded-lg shadow p-4 h-[80vh] overflow-y-auto z-40">
        <h3 className="font-semibold mb-4 text-gray-800">Question Review</h3>
        {Object.entries(grouped).map(([category, items]) => (
          <div key={`category-${category}`} className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">{category}</h4>
            <div className="flex flex-wrap gap-2">
              {items.map((q, idx) => (
                <button
                  key={`question-${q.question_id}-${idx}`}
                  onClick={() => {
                    setSelectedQuestion(q);
                    setShowModal(true);
                  }}
                  className={`w-8 h-8 rounded-full text-sm font-medium flex items-center justify-center ${getColor(q)}`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Modal for detailed question info */}
      {showModal && selectedQuestion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-xl w-full relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              onClick={() => setShowModal(false)}
            >
              ✕
            </button>
            <h2 className="text-lg font-semibold mb-4">Question</h2>
            <p className="text-gray-800 mb-4">{selectedQuestion.question}</p>

            <ul className="space-y-2 mb-4">
              {(['A', 'B', 'C', 'D'] as const).map((letter) => {
                const optionKey = `option_${letter.toLowerCase()}` as keyof ReviewItem;
                const text = selectedQuestion[optionKey] as string;
                const isUser = selectedQuestion.userAnswer === letter;
                const isCorrect = selectedQuestion.correctAnswer === letter;

                return (
                  <li
                    key={letter}
                    className={`p-3 rounded-lg border ${
                      isCorrect
                        ? 'bg-green-100 border-green-300'
                        : isUser
                        ? 'bg-red-100 border-red-300'
                        : 'border-gray-200'
                    }`}
                  >
                    <span className="font-semibold">{letter}.</span> {text}
                    {isCorrect && (
                      <span className="ml-2 text-green-700 text-sm font-semibold">✓ Correct</span>
                    )}
                    {isUser && !isCorrect && (
                      <span className="ml-2 text-red-700 text-sm font-semibold">
                        ✗ Your Answer
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>

            <p className="text-sm text-gray-500 mb-1">Explanation</p>
            <p className="text-gray-700">{selectedQuestion.explanation}</p>
          </div>
        </div>
      )}
    </>
  );
};

// Type for extending Question to ensure tag is recognized
type QuestionWithTag = Question & { tag?: string };

const QuizzesPage = () => {
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [isTimeBased, setIsTimeBased] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(.5 * 60);
  const [showOneMinuteModal, setShowOneMinuteModal] = useState(false);
  const {questions, loading, error, fetchQuestions, updateUserStats, recordScienceProgress, recordMathProgress, recordLanguageProficiencyProgress, recordReadingCompProgress} = useQuestions();
  
  const [score, setScore] = useState<QuizScore | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState<Set<number>>(new Set());
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);

  // Keep a live copy of questions in allQuestions for the in-progress sidebar
  useEffect(() => {
    if (questions.length > 0) {
      setAllQuestions(questions);
    }
  }, [questions]);

  useEffect(() => {
    if (quizStarted && isTimeBased && timeRemaining === 60) {
      setShowOneMinuteModal(true);
    }
  }, [quizStarted, isTimeBased, timeRemaining]);

  useEffect(() => {
    if (!quizStarted || score !== null) return;
    const answeredCount = Object.keys(userAnswers).length;
    if (answeredCount === questions.length) {
      const timer = window.setTimeout(calculateScore, 1500);
      return () => clearTimeout(timer);
    }
  }, [userAnswers, quizStarted, questions.length, score]);

  useEffect(() => {
    let timer: number | undefined;
    if (quizStarted && isTimeBased && timeRemaining > 0) {
      timer = window.setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setShowOneMinuteModal(false);
            calculateScore();            // ← auto-finish quiz
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [quizStarted, isTimeBased, timeRemaining]);

  const calculateScore = () => {
    const endTime = Date.now();
    const timeSpent = startTime ? Math.floor((endTime - startTime) / 1000) : 0;
    
    const categoryScores: { [key: string]: { total: number; correct: number; percentage: number } } = {};
    
    questions.forEach((q, index) => {
      if (!categoryScores[q.category]) {
        categoryScores[q.category] = { total: 0, correct: 0, percentage: 0 };
      }
      categoryScores[q.category].total++;
      if (correctAnswers.has(index)) {
        categoryScores[q.category].correct++;
      }
    });

    Object.values(categoryScores).forEach(score => {
      score.percentage = Math.round((score.correct / score.total) * 100);
    });

    const totalCorrect = correctAnswers.size;
    const scoreData: QuizScore = {
      total: questions.length,
      correct: totalCorrect,
      incorrect: questions.length - totalCorrect,
      percentage: Math.round((totalCorrect / questions.length) * 100),
      timeSpent,
      categoryScores
    };

    setScore(scoreData);
  };

  const startQuiz = async () => {
    if (selectedTopic && selectedDifficulty) {
      try {
        await fetchQuestions(selectedTopic, selectedDifficulty);
  
        // **reset all of our “in‐quiz” state**
        setQuizStarted(true);
        setCurrentQuestion(0);
        setSelectedAnswer(null);
        setShowExplanation(false);
        setScore(null);
        setCorrectAnswers(new Set());
        setUserAnswers({});           // ← ADD THIS LINE
        setAllQuestions(questions);   // (you already do this in the effect, but no harm)
  
        setStartTime(Date.now());
        if (isTimeBased) {
          setTimeRemaining(1.5 * 60);
        }
      } catch (err) {
        console.error('Error starting quiz:', err);
      }
    }
  };
  
  const handleAnswerSelect = (answer: string) => {
    if (!questions[currentQuestion]) return;

    setSelectedAnswer(answer);
    // Mark this question as answered
    // new:
    const q = questions[currentQuestion] as Question & { global_id: string };
    setUserAnswers(prev => ({
      ...prev,
      // use the UUID for every category
      [q.global_id]: answer
    }));

    
    // Track if the answer is correct
    const isCorrect = answer === questions[currentQuestion].answer;

    // Update the score - using correctAnswers Set which is what the original code was using
    if (isCorrect) {
      setCorrectAnswers(prev => new Set(prev).add(currentQuestion));
    }
    
    // Get the current question data
    const currentQuestionData = questions[currentQuestion] as QuestionWithTag;
    
    // Track progress in the database based on category
    // after
    if (currentQuestionData.category === 'Science' && currentQuestionData.global_id) {
      const tagValue = currentQuestionData.tag || '';
      console.log(`Calling recordScienceProgress with global_id=${currentQuestionData.global_id}, isCorrect=${isCorrect}, tag=${tagValue}`);
      recordScienceProgress(
        currentQuestionData.global_id,
        isCorrect,
        tagValue
      );
    }

    else if (currentQuestionData.category === 'Mathematics' && currentQuestionData.global_id) {
      const tagValue = currentQuestionData.tag || '';
      console.log(`Calling recordMathProgress with global_id=${currentQuestionData.global_id}, isCorrect=${isCorrect}, tag=${tagValue}`);
      recordMathProgress(
        currentQuestionData.global_id,
        isCorrect,
        tagValue
      );
    }
    
    else if (currentQuestionData.category === 'Language Proficiency' && currentQuestionData.global_id) {
      // Use the tag from the current question or default to empty string
      const tagValue = currentQuestionData.tag || '';
      
      // More detailed logging of UUID
      console.log('Language Proficiency Question UUID Details:', {
        question_id: currentQuestionData.question_id,
        global_id: currentQuestionData.global_id,
        global_id_type: typeof currentQuestionData.global_id,
        length: currentQuestionData.global_id.length,
        // Log each segment to spot any encoding issues
        segments: currentQuestionData.global_id.split('-')
      });
      
      console.log(`Calling recordLanguageProficiencyProgress with global_id=${currentQuestionData.global_id}, isCorrect=${isCorrect}, tag=${tagValue}`);
      
      // Ensure we're passing the exact UUID string without modifications
      const uuid = String(currentQuestionData.global_id);
      recordLanguageProficiencyProgress(
        uuid, 
        isCorrect,
        tagValue
      );
    }else if (currentQuestionData.category === 'Reading Comprehension' && currentQuestionData.global_id) {
      // use the tag ('English' or 'Filipino') from the question
      const tagValue = currentQuestionData.tag || '';
      console.log(
        `Calling recordReadingCompProgress with global_id=${currentQuestionData.global_id}, ` +
        `isCorrect=${isCorrect}, tag=${tagValue}`
      );
      recordReadingCompProgress(
        currentQuestionData.global_id,
        isCorrect,
        tagValue
      );
    }
  };
  
  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setSelectedAnswer(null);
      setShowExplanation(false);
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateScore();
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neural-purple mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading questions...</p>
        </div>
      </div>
    );
  }

  // Once we have a score, show summary + new summary sidebar
  if (score) {
    // Build ReviewItem data for summary
    const reviewData: ReviewItem[] = allQuestions.map(q => {
         // global_id is guaranteed—assert non‐null
        const key = q.global_id!;
        return mapQuestionToReviewItem(q, userAnswers[key] || null);
    });

    return (
      <div className="min-h-screen bg-gray-50 py-6 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <QuizSummary 
            score={score} 
            onRetry={() => {
              setQuizStarted(false);
              setScore(null);
              setUserAnswers({});        // ← clear previous answers
              setCorrectAnswers(new Set());
            }} 
          />
        </div>

        {/* Add the summary-only sidebar, just like mock exams */}
        <QuizSummarySidebar reviewData={reviewData} />
      </div>
    );
  }

  // While quiz is ongoing, show the original "Question Review" sidebar
  return (
    <>
      {/* 1-Minute Warning Modal */}
      {showOneMinuteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm mx-auto text-center">
            <h2 className="text-xl font-semibold mb-2">1 Minute Remaining</h2>
            <p className="mb-4">
              Only one minute left! When the timer hits zero, the quiz will end automatically.
            </p>
            <button
              onClick={() => setShowOneMinuteModal(false)}
              className="px-4 py-2 bg-neural-purple text-white rounded-lg hover:bg-tech-lavender"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* ── Existing Quiz Page ── */}
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* If quiz not started, show the intro screen */}
          {!quizStarted ? (
            <div className="space-y-8">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900">Practice Quizzes</h1>
                <p className="mt-2 text-gray-600">
                  Choose your topic and difficulty to get started
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  20 questions per quiz | Personalized feedback
                </p>
              </div>

              {error && (
                <div className="p-4 bg-alert-red/10 border border-alert-red/20 rounded-lg flex items-start space-x-3">
                  <ExclamationTriangleIcon className="w-5 h-5 text-alert-red flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-alert-red font-medium">Error</h3>
                    <p className="text-sm text-alert-red/90">{error}</p>
                  </div>
                </div>
              )}

              {/* Topic selection */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Topic</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {topics.map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => setSelectedTopic(topic.id)}
                      className={`p-6 rounded-lg border-2 transition-all duration-200 ${
                        selectedTopic === topic.id
                          ? 'border-neural-purple bg-neural-purple/5'
                          : 'border-gray-200 hover:border-neural-purple'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          selectedTopic === topic.id 
                            ? 'bg-neural-purple text-white' 
                            : 'bg-neural-purple/10 text-neural-purple'
                        }`}>
                          <topic.icon className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold text-gray-900">{topic.name}</h3>
                          <p className="text-sm text-gray-500">{topic.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty selection */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Difficulty</h2>
                <div className="grid md:grid-cols-3 gap-4">
                  {difficulties.map((difficulty) => (
                    <button
                      key={difficulty.id}
                      onClick={() => setSelectedDifficulty(difficulty.id)}
                      className={`p-6 rounded-lg border-2 transition-all duration-200 ${
                        selectedDifficulty === difficulty.id
                          ? 'border-neural-purple bg-neural-purple/5'
                          : 'border-gray-200 hover:border-neural-purple'
                      }`}
                    >
                      <h3 className={`font-semibold ${difficulty.color}`}>{difficulty.name}</h3>
                    </button>
                  ))}
                </div>
              </div>

              {/* Timer toggle */}
              <div className="flex items-center justify-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={isTimeBased}
                    onChange={(e) => setIsTimeBased(e.target.checked)}
                    className="rounded border-gray-300 text-neural-purple focus:ring-neural-purple"
                  />
                  <span className="text-gray-700">Enable Timer (30 minutes)</span>
                </label>
              </div>

              {/* Start Quiz button */}
              <div className="text-center">
                <button
                  onClick={startQuiz}
                  disabled={!selectedTopic || !selectedDifficulty || loading}
                  className={`px-8 py-3 rounded-lg font-semibold ${
                    selectedTopic && selectedDifficulty && !loading
                      ? 'bg-neural-purple text-white hover:bg-tech-lavender'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  } transition-colors duration-200`}
                >
                  {loading ? 'Loading...' : 'Start Quiz'}
                </button>
              </div>
            </div>
          ) : (
            // Quiz is ongoing
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Header & progress bar */}
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      {selectedTopic}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Question {currentQuestion + 1} of {questions.length}
                    </p>
                  </div>
                  {isTimeBased && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <ClockIcon className="w-5 h-5" />
                      <span>{formatTime(timeRemaining)}</span>
                    </div>
                  )}
                </div>
                <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-neural-purple h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question + answer options */}
              {questions[currentQuestion] && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    {questions[currentQuestion].question}
                  </h2>

                  <div className="space-y-3">
                    {OPTION_KEYS.map((optKey, idx) => {
                      const letter = LETTERS[idx];
                      const text  = questions[currentQuestion][optKey];
                      const q = questions[currentQuestion] as QuestionWithTag;

                      return (
                        <button
                          key={letter}
                          onClick={() => {
                            if (q.category === 'Science' && q.global_id) {
                              const isCorrect = letter === q.answer;
                              recordScienceProgress(q.global_id, isCorrect, q.tag!);
                            }
                            handleAnswerSelect(letter);
                          }}
                          className={`w-full p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                            selectedAnswer === letter
                              ? 'border-neural-purple bg-neural-purple/10 text-neural-purple'
                              : 'border-gray-200 hover:border-neural-purple'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{text}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Ongoing "Question Review" sidebar */}
              <div className="hidden md:block fixed top-24 right-4 w-64 bg-white border rounded-lg shadow p-4 h-[80vh] overflow-y-auto z-40">
                <h3 className="font-semibold mb-4 text-gray-800">Question Review</h3>
                <div className="flex flex-wrap gap-2">
                  {allQuestions.map((q, idx) => {
                    const isCurrent = idx === currentQuestion;
                    const key = q.global_id!;
                    const isAnswered = userAnswers[key] !== undefined;

                    return (
                      <button
                        key={`ongoing-review-${q.question_id}-${idx}`}
                        onClick={() => {
                          setCurrentQuestion(idx);
                          setSelectedAnswer(userAnswers[key] || null);
                          setShowExplanation(!!userAnswers[q.question_id]);
                        }}
                        className={`w-8 h-8 rounded-full text-sm font-medium flex items-center justify-center ${
                          isCurrent
                            ? 'bg-neural-purple text-white'
                            : isAnswered
                            ? 'bg-neural-purple/20 text-neural-purple'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Footer actions */}
              <div className="flex justify-between items-center">
                <button
                  onClick={() => {
                    setQuizStarted(false);
                    setScore(null);
                    setSelectedTopic('');
                    setSelectedDifficulty('');
                    setSelectedAnswer(null);
                    setShowExplanation(false);
                    setCurrentQuestion(0);
                  }}
                  className="px-4 py-2 rounded-lg text-alert-red border border-alert-red hover:bg-alert-red/10"
                >
                  Leave Quiz
                </button>

                <div className="flex space-x-4">
                  <button
                    onClick={() => {
                      setSelectedAnswer(null);
                      setShowExplanation(false);
                      setCurrentQuestion(Math.max(0, currentQuestion - 1));
                    }}
                    disabled={currentQuestion === 0}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:border-neural-purple disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleNextQuestion}
                    className="px-4 py-2 rounded-lg bg-neural-purple text-white hover:bg-tech-lavender"
                  >
                    {currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );

};

export default QuizzesPage;
