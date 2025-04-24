import React, { useState, useEffect } from 'react';
import { 
  AcademicCapIcon, 
  ClockIcon, 
  CheckCircleIcon,
  XCircleIcon,
  BeakerIcon,
  BookOpenIcon,
  LanguageIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  TrophyIcon,
  ChartBarIcon,
  ArrowPathIcon,
  SparklesIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { useMockExam } from '../hooks/useMockExam';
import type { Question } from '../types/quiz';
import { useNavigate } from 'react-router-dom';

interface ReviewItem extends Omit<Question, 'options' | 'answer'> {
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correctAnswer: string;
  userAnswer: string | null;
  explanation: string;
}

interface ExamScore {
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
    };
  };
  reviewData: ReviewItem[];
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

const QuestionReviewPanel = ({ reviewData }: { reviewData: ReviewItem[] }) => {
  const [selectedQuestion, setSelectedQuestion] = useState<ReviewItem | null>(null);
  const [showModal, setShowModal] = useState(false);

  const grouped = reviewData.reduce((acc, q) => {
    if (!acc[q.category]) acc[q.category] = [];
    acc[q.category].push(q);
    return acc;
  }, {} as { [key: string]: ReviewItem[] });

  const getColor = (q: ReviewItem) => {
    return q.userAnswer === q.correctAnswer
      ? 'bg-green-100 text-green-700'
      : 'bg-red-100 text-red-700';
  };

  return (
    <>
      {/* Floating Sidebar */}
      <div className="hidden md:block fixed top-24 right-4 w-64 bg-white border rounded-lg shadow p-4 h-[80vh] overflow-y-auto">
        <h3 className="font-semibold mb-4 text-gray-800">Question Review</h3>
        {Object.entries(grouped).map(([category, items]) => {
          if (category === "Language Proficiency" || category === "Reading Comprehension") {
            // For these categories, the first 50 items are English and the next 50 are Filipino.
            const englishItems = items.slice(0, 50);
            const filipinoItems = items.slice(50, 100);
            return (
              <div key={category} className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">{category}</h4>
                <div className="mb-2">
                  <h5 className="text-xs font-semibold text-gray-600">English</h5>
                  <div className="flex flex-wrap gap-2">
                    {englishItems.map((q, index) => (
                      <button
                        key={q.question_id}
                        onClick={() => {
                          setSelectedQuestion(q);
                          setShowModal(true);
                        }}
                        className={`w-8 h-8 rounded-full text-sm font-medium flex items-center justify-center ${getColor(q)}`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                </div>
                <hr className="my-2" />
                <div>
                  <h5 className="text-xs font-semibold text-gray-600">Filipino</h5>
                  <div className="flex flex-wrap gap-2">
                    {filipinoItems.map((q, index) => (
                      <button
                        key={q.question_id}
                        onClick={() => {
                          setSelectedQuestion(q);
                          setShowModal(true);
                        }}
                        className={`w-8 h-8 rounded-full text-sm font-medium flex items-center justify-center ${getColor(q)}`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          } else {
            return (
              <div key={category} className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">{category}</h4>
                <div className="flex flex-wrap gap-2">
                  {items.map((q, index) => (
                    <button
                      key={q.question_id}
                      onClick={() => {
                        setSelectedQuestion(q);
                        setShowModal(true);
                      }}
                      className={`w-8 h-8 rounded-full text-sm font-medium flex items-center justify-center ${getColor(q)}`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              </div>
            );
          }
        })}
      </div>

      {/* Modal for question review */}
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
                      <span className="ml-2 text-red-700 text-sm font-semibold">✗ Your Answer</span>
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

const getScoreCategory = (percentage: number) => {
  if (percentage >= 90) return { label: 'Outstanding!', color: 'text-growth-green', message: 'Exceptional performance! You\'re well-prepared for the UPCAT.' };
  if (percentage >= 80) return { label: 'Excellent!', color: 'text-neural-purple', message: 'Great work! Keep up this level of performance.' };
  if (percentage >= 70) return { label: 'Good Job!', color: 'text-tech-lavender', message: 'Solid performance. Focus on the areas where you can improve.' };
  if (percentage >= 60) return { label: 'Keep Going!', color: 'text-energy-orange', message: 'You\'re making progress. Let\'s work on strengthening your knowledge.' };
  return { label: 'Room to Grow', color: 'text-alert-red', message: 'Don\'t worry! Every attempt helps you learn and improve.' };
};

const ExamSummary = ({
  score,
  onRetry,
}: {
  score: ExamScore;
  onRetry: () => void;
}) => {
  const scoreCategory = getScoreCategory(score.percentage);
  const minutes = Math.floor(score.timeSpent / 60);
  const seconds = score.timeSpent % 60;

  const [selectedQuestion, setSelectedQuestion] = useState<ReviewItem | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const toggleCategory = (category: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  const grouped = score.reviewData.reduce((acc, q) => {
    if (!acc[q.category]) acc[q.category] = [];
    acc[q.category].push(q);
    return acc;
  }, {} as { [key: string]: ReviewItem[] });

  const getColor = (q: ReviewItem) => {
    return q.userAnswer === q.correctAnswer
      ? 'bg-green-100 text-green-700'
      : 'bg-red-100 text-red-700';
  };

  return (
    <div className="relative">
      {/* Floating Sidebar */}
      <div className="hidden md:block fixed top-24 right-4 w-64 bg-white border rounded-lg shadow p-4 h-[80vh] overflow-y-auto">
  <h3 className="font-semibold mb-4 text-gray-800">Question Review</h3>
  {Object.entries(grouped).map(([category, items]) => {
    const isCollapsed = collapsedCategories.has(category);
    return (
      <div key={category} className="mb-4">
        <h4
          onClick={() => toggleCategory(category)}
          className="flex justify-between items-center text-sm font-medium text-gray-700 mb-2 cursor-pointer select-none"
        >
          {category}
          {isCollapsed ? (
            <ChevronUpIcon className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDownIcon className="w-4 h-4 text-gray-400" />
          )}
        </h4>
        <div
          className="overflow-hidden transition-all duration-300 ease-in-out"
          style={{ maxHeight: isCollapsed ? 0 : '1000px' }}
        >
          {(category === "Language Proficiency" || category === "Reading Comprehension") ? (
            <>
              <div className="mb-2">
                <h5 className="text-xs font-semibold text-gray-600">English</h5>
                <div className="grid grid-cols-5 gap-2">
                  {items.slice(0, 50).map((q, index) => (
                    <button
                      key={q.question_id}
                      onClick={() => {
                        setSelectedQuestion(q);
                        setShowModal(true);
                      }}
                      className={`rounded-lg px-2 py-1 text-sm font-medium flex items-center justify-center ${getColor(q)}`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              </div>
              <hr className="my-2" />
              <div>
                <h5 className="text-xs font-semibold text-gray-600">Filipino</h5>
                <div className="grid grid-cols-5 gap-2">
                  {items.slice(50, 100).map((q, index) => (
                    <button
                      key={q.question_id}
                      onClick={() => {
                        setSelectedQuestion(q);
                        setShowModal(true);
                      }}
                      className={`rounded-lg px-2 py-1 text-sm font-medium flex items-center justify-center ${getColor(q)}`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-5 gap-2">
              {items.map((q, index) => (
                <button
                  key={q.question_id}
                  onClick={() => {
                    setSelectedQuestion(q);
                    setShowModal(true);
                  }}
                  className={`rounded-lg px-2 py-1 text-sm font-medium flex items-center justify-center ${getColor(q)}`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  })}
</div>

      {/* Exam Summary Content */}
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-neural-purple/10 mb-4">
            <TrophyIcon className={`w-10 h-10 ${scoreCategory.color}`} />
          </div>
          <h2 className={`text-3xl font-bold ${scoreCategory.color} mb-2`}>
            {scoreCategory.label}
          </h2>
          <p className="text-4xl font-bold mb-2">{score.percentage}%</p>
          <p className="text-gray-600">{scoreCategory.message}</p>
        </div>

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

        <div className="mb-8">
          <div className="flex items-center justify-center space-x-2 text-gray-600">
            <ClockIcon className="w-5 h-5" />
            <span>
              Time Spent: {minutes}m {seconds}s
            </span>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Performance by Category
          </h3>
          {Object.entries(score.categoryScores).map(([category, stats]) => (
            <div key={category} className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-700">{category}</span>
                <span
                  className={`font-medium ${
                    stats.percentage >= 70
                      ? 'text-growth-green'
                      : stats.percentage >= 50
                      ? 'text-energy-orange'
                      : 'text-alert-red'
                  }`}
                >
                  {stats.percentage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    stats.percentage >= 70
                      ? 'bg-growth-green'
                      : stats.percentage >= 50
                      ? 'bg-energy-orange'
                      : 'bg-alert-red'
                  }`}
                  style={{ width: `${stats.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>

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
                  Focus on understanding core concepts in{' '}
                  {Object.entries(score.categoryScores)
                    .filter(([_, stats]) => stats.percentage < 70)
                    .map(([category]) => category)
                    .join(', ')}
                </li>
                <li className="flex items-start">
                  <BookOpenIcon className="w-5 h-5 mr-2 text-neural-purple flex-shrink-0 mt-0.5" />
                  Review the explanations for questions you got wrong
                </li>
              </>
            )}
            <li className="flex items-start">
              <AcademicCapIcon className="w-5 h-5 mr-2 text-neural-purple flex-shrink-0 mt-0.5" />
              Try questions from different categories to maintain a balanced
              preparation
            </li>
          </ul>
        </div>

        <div className="flex justify-center space-x-4">
          <button
            onClick={onRetry}
            className="flex items-center px-6 py-3 bg-neural-purple text-white rounded-lg hover:bg-tech-lavender transition-colors duration-200"
          >
            <ArrowPathIcon className="w-5 h-5 mr-2" />
            Try Another Mock Exam
          </button>
        </div>
      </div>

      {/* Modal for question review */}
      {showModal && selectedQuestion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-xl w-full relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              onClick={() => setShowModal(false)}
            >
              ✕
            </button>
            <h2 className="text-lg font-semibold mb-4">
              Question{' '}
              {score.reviewData
                .filter((q) => q.category === selectedQuestion?.category)
                .findIndex((q) => q.question_id === selectedQuestion?.question_id) + 1}
            </h2>
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
                      <span className="ml-2 text-green-700 text-sm font-semibold">
                        ✓ Correct
                      </span>
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
    </div>
  );
};

// Update examSections so that Reading Comprehension also has two subsections
const examSections = [
  {
    id: 'language',
    name: 'Language Proficiency',
    category: 'Language Proficiency',
    icon: LanguageIcon,
    questions: 100,
    timeLimit: 1.30,
    subsections: [
      { name: 'English', questions: 50 },
      { name: 'Filipino', questions: 50 }
    ]
  },
  {
    id: 'science',
    name: 'Science',
    category: 'Science',
    icon: BeakerIcon,
    questions: 60,
    timeLimit: 1.30
  },
  {
    id: 'math',
    name: 'Mathematics',
    category: 'Mathematics',
    icon: AcademicCapIcon,
    questions: 60,
    timeLimit: 1.30
  },
  {
    id: 'reading',
    name: 'Reading Comprehension',
    category: 'Reading Comprehension',
    icon: BookOpenIcon,
    questions: 100,
    timeLimit: 1.30,
    subsections: [
      { name: 'English', questions: 50 },
      { name: 'Filipino', questions: 50 }
    ]
  }
];

const MockExamsPage = () => {
  const [examStarted, setExamStarted] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isTimeBased, setIsTimeBased] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(examSections[0].timeLimit * 60);
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);
  const { questions, loading, error, fetchQuestions, clearError, setQuestions, clearUsedQuestionIds, recordScienceMockExam, recordMathMockExam, recordLangProfMockExam, recordReadingCompMockExam } = useMockExam();
  const [startTime, setStartTime] = useState<number | null>(null);
  const [score, setScore] = useState<ExamScore | null>(null);
  const [allQuestions, setAllQuestions] = useState<ExtendedQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [localError, setLocalError] = useState<string | null>(null);
  const [sectionQuestions, setSectionQuestions] = useState<Record<number, Question[]>>({});
  const [completedSections, setCompletedSections] = useState<Set<number>>(new Set());
  const [showLockedModal, setShowLockedModal] = useState(false);
  const [timerWarning, setTimerWarning] = useState<string | null>(null);
  const [forcedTransition, setForcedTransition] = useState(false);
  const [redirectWarningModal, setRedirectWarningModal] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  
  const toggleCategory = (category: string) => {
    setCollapsedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  useEffect(() => {
    if (currentSection > 0) {
      const prevCategory = examSections[currentSection - 1].category;
      setCollapsedCategories(prev => new Set(prev).add(prevCategory));
    }
  }, [currentSection]);

  type ExtendedQuestion = Question & { sectionIndex: number };

  useEffect(() => {
    const saved = localStorage.getItem('mockExamState');
    if (saved) {
      const state = JSON.parse(saved);

      if (state.examFinished && state.score) {
        setScore(state.score); // Go straight to summary
        return;
      }

      const {
        currentSection,
        currentQuestion,
        userAnswers,
        allQuestions,
        sectionQuestions,
        timeRemaining,
      } = state;

      setCurrentSection(currentSection);
      setCurrentQuestion(currentQuestion);
      setUserAnswers(userAnswers);
      setAllQuestions(allQuestions);
      setSectionQuestions(sectionQuestions);
      if (typeof timeRemaining === 'number') {
        setTimeRemaining(timeRemaining);
      } else {
        setTimeRemaining(examSections[currentSection].timeLimit * 60);
      }

      setQuestions(sectionQuestions[currentSection] || []);
      setExamStarted(true);
      setStartTime(Date.now());
    }
  }, []);

  // Save state to localStorage continuously if exam is in progress
  useEffect(() => {
    if (examStarted) {
      const baseState = {
        currentSection,
        currentQuestion,
        userAnswers,
        allQuestions,
        sectionQuestions,
        timeRemaining,
      };
  
      const fullState = score
        ? { ...baseState, score, examFinished: true }
        : baseState;
  
      localStorage.setItem('mockExamState', JSON.stringify(fullState));
    }
  }, [examStarted, currentSection, currentQuestion, userAnswers, allQuestions, sectionQuestions, score, timeRemaining]);
  

  // Timer effect (updates every second)
  // Timer effect (updates every second)
useEffect(() => {
  let timer: number | undefined;

  if (examStarted && isTimeBased && timeRemaining > 0) {
    timer = window.setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = prev - 1;

        // 5‑minute warning
        if (newTime === 300 && !timerWarning) {
          setTimerWarning("Warning: Only 5 minutes remaining in this section!");
        }

        // 1‑minute warning + trigger redirect‑warning modal
        if (
          newTime === 60 &&
          timerWarning !== "Warning: Only 1 minute remaining in this section!"
        ) {
          setTimerWarning("Warning: Only 1 minute remaining in this section!");
          setRedirectWarningModal(true);
        }

        // When time runs out, clear the interval & persist zero
        if (newTime <= 0) {
          clearInterval(timer);
          localStorage.setItem(
            "mockExamState",
            JSON.stringify({
              currentSection,
              currentQuestion,
              userAnswers,
              allQuestions,
              sectionQuestions,
              timeRemaining: 0,
            })
          );
          return 0;
        }

        // Persist every tick
        localStorage.setItem(
          "mockExamState",
          JSON.stringify({
            currentSection,
            currentQuestion,
            userAnswers,
            allQuestions,
            sectionQuestions,
            timeRemaining: newTime,
          })
        );
        return newTime;
      });
    }, 1000);
  }

  return () => {
    if (timer) clearInterval(timer);
  };
}, [ examStarted, isTimeBased, timeRemaining, timerWarning, currentSection, currentQuestion, userAnswers, allQuestions, sectionQuestions,]);

  // Effect to force transition when time expires
  useEffect(() => {
    if (examStarted && timeRemaining === 0 && !forcedTransition) {
      setForcedTransition(true);
    
      // Save current section questions to the cache
      const updatedCurrent = questions.map((q) => ({ ...q, sectionIndex: currentSection }));
      setSectionQuestions((prev) => ({
        ...prev,
        [currentSection]: updatedCurrent,
      }));
      setCompletedSections((prev) => new Set(prev).add(currentSection));
    
      setAllQuestions((prev) => {
        const map = new Map<string, ExtendedQuestion>();
        [...prev, ...updatedCurrent].forEach((q) => map.set(q.question_id, q));
        return Array.from(map.values());
      });
    
      if (currentSection < examSections.length - 1) {
        const nextSectionIndex = currentSection + 1;
        const nextSection = examSections[nextSectionIndex];
        const cached = sectionQuestions[nextSectionIndex];
    
        if (cached) {
          setQuestions(cached);
        } else {
          fetchQuestions(nextSection.category, false).then((fetched) => {
            const extended = fetched?.map((q) => ({ ...q, sectionIndex: nextSectionIndex })) || [];
            setQuestions(extended);
            setSectionQuestions((prev) => ({
              ...prev,
              [nextSectionIndex]: extended,
            }));
            setAllQuestions((prev) => {
              const map = new Map<string, ExtendedQuestion>();
              [...prev, ...extended].forEach((q) => map.set(q.question_id, q));
              return Array.from(map.values());
            });
          });
        }
    
        setCurrentSection(nextSectionIndex);
        setCurrentQuestion(0);
        setSelectedAnswer(null);
        setShowExplanation(false);
        setTimerWarning(null);
        setForcedTransition(false);
        if (isTimeBased) setTimeRemaining(nextSection.timeLimit * 60);
      } else {
        calculateScore();
      }
    }
    
  }, [timeRemaining, examStarted, forcedTransition, currentSection]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentSection, currentQuestion]);

  const calculateScore = () => {
    const examQuestions: Question[] = [...allQuestions];
    const totalQuestions = examQuestions.length;
    let correctAnswers = 0;
    const categoryScores: { [key: string]: { total: number; correct: number; percentage: number } } = {};
    const reviewItems: ReviewItem[] = [];

    examQuestions.forEach((question: Question) => {
      const userAnswer = userAnswers[question.question_id];
      const isCorrect = userAnswer === question.answer;

      if (!categoryScores[question.category]) {
        categoryScores[question.category] = { total: 0, correct: 0, percentage: 0 };
      }
      categoryScores[question.category].total++;
      if (isCorrect) {
        categoryScores[question.category].correct++;
        correctAnswers++;
      }

      const reviewItem = mapQuestionToReviewItem(question, userAnswer);
      reviewItems.push(reviewItem);
    });

    Object.keys(categoryScores).forEach((category) => {
      const { total, correct } = categoryScores[category];
      categoryScores[category].percentage = (correct / total) * 100;
    });

    const timeSpent = Math.floor((startTime ? Date.now() - startTime : 0) / 1000);

    setScore({
      total: totalQuestions,
      correct: correctAnswers,
      incorrect: totalQuestions - correctAnswers,
      percentage: (correctAnswers / totalQuestions) * 100,
      timeSpent,
      categoryScores,
      reviewData: reviewItems
    });

    localStorage.setItem('mockExamState', JSON.stringify({
      currentSection,
      currentQuestion,
      userAnswers,
      allQuestions,
      sectionQuestions,
      timeRemaining: 0,
      score: {
        total: totalQuestions,
        correct: correctAnswers,
        incorrect: totalQuestions - correctAnswers,
        percentage: (correctAnswers / totalQuestions) * 100,
        timeSpent,
        categoryScores,
        reviewData: reviewItems
      },
      examFinished: true
    }));
    
  };

  const startExam = async () => {
    // Reset all state variables
    setExamStarted(false);
    setCurrentSection(0);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(null);
    setAllQuestions([]);
    setUserAnswers({});
    setLocalError(null);
    setQuestions([]);
    setSectionQuestions({});
    setForcedTransition(false);
    setTimerWarning(null);

    if (isTimeBased) {
      setTimeRemaining(examSections[0].timeLimit * 60);
    }

    const firstSection = examSections[0];
    const fetched = await fetchQuestions(firstSection.category, false);

    if (!fetched || fetched.length === 0) {
      console.warn('No questions found for this section. Continuing exam.');
      setQuestions([]);
      setSectionQuestions({ 0: [] });
      setAllQuestions([]);
      setStartTime(Date.now());
      setExamStarted(true);
      return;
    }

    setQuestions(fetched);
    setSectionQuestions({ 0: fetched.map((q) => ({ ...q, sectionIndex: 0 })) });
    setAllQuestions(fetched.map((q) => ({ ...q, sectionIndex: 0 })));
    setStartTime(Date.now());
    setExamStarted(true);
  };

  const resetExam = () => {
    localStorage.removeItem('mockExamState');
    clearUsedQuestionIds();
    setExamStarted(false);
    setCurrentSection(0);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(null);
    setAllQuestions([]);
    setUserAnswers({});
    setShowLeaveConfirmation(false);
    setLocalError(null);
    setQuestions([]);
    setSectionQuestions({});
    setForcedTransition(false);
    setTimerWarning(null);

    if (isTimeBased) {
      setTimeRemaining(examSections[0].timeLimit * 60);
    }
  };

  const handleRetry = async () => {
    resetExam();
    await startExam();
  };

  const handleAnswerSelect = async (answer: string) => {
    // 1) Pull out the current question
    const question = questions[currentQuestion] as Question & {
      global_id: string;
      tag: string;
    };
  
    // 2) Save locally so UI updates immediately
    setUserAnswers(prev => ({
      ...prev,
      [question.question_id]: answer
    }));
    setSelectedAnswer(answer);
    setShowExplanation(true);
  
    // 3) Prepare the values we need for the upsert
    const isCorrect = answer === question.answer;
    const questionUuid = question.global_id;  // <-- use the real UUID from your table
    const tagValue    = question.tag;         // <-- the tag you fetched
  
    // 4) Fire off your per-category upsert (all of which use onConflict:user_id,question_uuid)
    try {
      switch (question.category) {
        case 'Science':
          await recordScienceMockExam(questionUuid, isCorrect, tagValue);
          break;
  
        case 'Mathematics':
          await recordMathMockExam(questionUuid, isCorrect, tagValue);
          break;
  
        case 'Language Proficiency':
          await recordLangProfMockExam(questionUuid, isCorrect, tagValue);
          break;
  
        case 'Reading Comprehension':
          await recordReadingCompMockExam(questionUuid, isCorrect, tagValue);
          break;
  
        default:
          console.warn('Unknown category in handleAnswerSelect:', question.category);
      }
    } catch (e) {
      console.error('Error recording mock-exam progress:', e);
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatTimeRemaining = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleLeaveExam = () => {
    setShowLeaveConfirmation(true);
  };

  const confirmLeaveExam = async () => {
    resetExam();
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      const prevQuestion = questions[currentQuestion - 1];
      const userAnswer = userAnswers[prevQuestion.question_id] || null;
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(userAnswer);
      setShowExplanation(!!userAnswer);
    }
  };

  const handleNextQuestion = async () => {
    if (currentQuestion < questions.length - 1) {
      const nextQuestion = questions[currentQuestion + 1];
      const userAnswer = userAnswers[nextQuestion.question_id] || null;
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(userAnswer);
      setShowExplanation(!!userAnswer);
    } else if (currentSection < examSections.length - 1) {
      const nextSectionIndex = currentSection + 1;
      const nextSection = examSections[nextSectionIndex];

      const updatedCurrent = questions.map((q) => ({ ...q, sectionIndex: currentSection }));
      setSectionQuestions((prev) => ({
        ...prev,
        [currentSection]: updatedCurrent,
      }));
      setCompletedSections((prev) => new Set(prev).add(currentSection));

      setAllQuestions((prev) => {
        const map = new Map<string, ExtendedQuestion>();
        [...prev, ...updatedCurrent].forEach((q) => map.set(q.question_id, q));
        return Array.from(map.values());
      });

      const cachedNext = sectionQuestions[nextSectionIndex];
      if (cachedNext) {
        setQuestions(cachedNext);
        setCurrentSection(nextSectionIndex);
        setCurrentQuestion(0);
        setSelectedAnswer(null);
        setShowExplanation(false);
        setForcedTransition(false);
        if (isTimeBased) setTimeRemaining(nextSection.timeLimit * 60);
        return;
      }

      const fetched = await fetchQuestions(nextSection.category, false);
      const extended = fetched?.map((q) => ({ ...q, sectionIndex: nextSectionIndex })) || [];

      setQuestions(extended);
      setSectionQuestions((prev) => ({
        ...prev,
        [nextSectionIndex]: extended,
      }));

      setAllQuestions((prev) => {
        const map = new Map<string, ExtendedQuestion>();
        [...prev, ...extended].forEach((q) => map.set(q.question_id, q));
        return Array.from(map.values());
      });

      setCurrentSection(nextSectionIndex);
      setCurrentQuestion(0);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setForcedTransition(false);
      if (isTimeBased) setTimeRemaining(nextSection.timeLimit * 60);
    } else {
      const finalSectionQuestions = questions.map((q) => ({ ...q, sectionIndex: currentSection }));
      setSectionQuestions((prev) => ({
        ...prev,
        [currentSection]: finalSectionQuestions,
      }));

      setAllQuestions((prev) => {
        const map = new Map<string, ExtendedQuestion>();
        [...prev, ...finalSectionQuestions].forEach((q) => map.set(q.question_id, q));
        return Array.from(map.values());
      });

      calculateScore();
    }
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

  if (score) {
    return (
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ExamSummary 
            score={score} 
            onRetry={() => {
              resetExam();
            }} 
          />
        </div>
      </div>
    );
  }

  const groupedSidebarQuestions = allQuestions.reduce<Record<string, ExtendedQuestion[]>>((acc, q) => {
    if (!acc[q.category]) acc[q.category] = [];
    acc[q.category].push(q);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {!examStarted ? (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900">UPCAT Mock Exam</h1>
              <p className="mt-2 text-gray-600">
                Complete mock exam covering all UPCAT subjects
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Total Questions: {examSections.reduce((acc, section) => acc + section.questions, 0)} | 
                Estimated Time: {formatTime(examSections.reduce((acc, section) => acc + section.timeLimit, 0))}
              </p>
            </div>
            {error && (
              <div className="p-4 bg-alert-red/10 border border-alert-red/20 rounded-lg flex items-start space-x-3">
                <ExclamationTriangleIcon className="w-5 h-5 text-alert-red flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-alert-red font-medium">Error</h3>
                  <p className="text-sm text-alert-red/90">{localError || error}</p>
                </div>
              </div>
            )}
            <div className="grid md:grid-cols-2 gap-4">
              {examSections.map((section) => (
                <div
                  key={section.id}
                  className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-neural-purple/10 rounded-lg flex items-center justify-center">
                      <section.icon className="w-6 h-6 text-neural-purple" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{section.name}</h3>
                      <p className="text-sm text-gray-500">
                        {section.questions} questions | {formatTime(section.timeLimit)}
                      </p>
                      {section.subsections && (
                        <div className="mt-2 text-sm text-gray-500">
                          {section.subsections.map((sub) => (
                            <span key={sub.name} className="mr-4">
                              {sub.name}: {sub.questions} questions
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isTimeBased}
                  onChange={(e) => setIsTimeBased(e.target.checked)}
                  className="rounded border-gray-300 text-neural-purple focus:ring-neural-purple"
                />
                <span className="text-gray-700">Enable Section Timers</span>
              </label>
            </div>
            <div className="text-center">
              <button
                onClick={startExam}
                className="px-8 py-3 rounded-lg font-semibold bg-neural-purple text-white hover:bg-tech-lavender transition-colors duration-200"
              >
                Start Mock Exam
              </button>
              <p className="mt-2 text-sm text-gray-500">
                Questions will be randomly selected with varying difficulty levels
              </p>
            </div>
          </div>
        ) : (
          <div className="relative">
            <div className="max-w-3xl mx-auto space-y-6 mr-72">
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      {examSections[currentSection].name}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Question {currentQuestion + 1} of {questions.length}
                    </p>
                  </div>
                  {isTimeBased && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <ClockIcon className="w-5 h-5" />
                      <span>{formatTimeRemaining(timeRemaining)}</span>
                    </div>
                  )}
                </div>
                <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-neural-purple h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${((currentQuestion + 1) / questions.length) * 100}%`
                    }}
                  />
                </div>
              </div>
              {questions[currentQuestion] && (
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    {questions[currentQuestion].question}
                  </h2>
                  <div className="space-y-3">
                    {[
                      { key: 'A', value: questions[currentQuestion].option_a },
                      { key: 'B', value: questions[currentQuestion].option_b },
                      { key: 'C', value: questions[currentQuestion].option_c },
                      { key: 'D', value: questions[currentQuestion].option_d },
                    ].map((option) => {
                      const currentQuestionId = questions[currentQuestion].question_id;
                      const isSelected = userAnswers[currentQuestionId] === option.key;
                      return (
                        <button
                          key={option.key}
                          onClick={() => handleAnswerSelect(option.key)}
                          disabled={false}
                          className={`w-full p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                            isSelected
                              ? 'border-neural-purple bg-neural-purple/10'
                              : 'border-gray-200 hover:border-neural-purple'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{option.value}</span>
                            {isSelected && (
                              <span className="w-3 h-3 rounded-full bg-neural-purple inline-block ml-2" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              <div className="flex justify-between items-center mt-6">
                <button
                  onClick={handleLeaveExam}
                  className="flex items-center px-4 py-2 text-gray-600 hover:text-neural-purple transition-colors duration-200"
                >
                  <ArrowLeftIcon className="w-5 h-5 mr-2" />
                  Leave Exam
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={handlePrevQuestion}
                    disabled={currentQuestion === 0}
                    className={`px-4 py-2 rounded-lg ${
                      currentQuestion === 0
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleNextQuestion}
                    className="px-4 py-2 rounded-lg bg-neural-purple text-white hover:bg-tech-lavender transition-colors duration-200"
                  >
                    {currentQuestion < questions.length - 1
                      ? 'Next Question'
                      : currentSection < examSections.length - 1
                      ? 'Next Section'
                      : 'Finish Exam'}
                  </button>
                </div>
              </div>
            </div>
            {/* Right-side Floating Sidebar */}
            <div className="hidden md:block fixed top-24 right-4 w-64 bg-white border rounded-lg shadow p-4 h-[80vh] overflow-y-auto z-40">
              <h3 className="font-semibold mb-4 text-gray-800">Question Review</h3>

              {Object.entries(groupedSidebarQuestions).map(
                ([category, items]: [string, ExtendedQuestion[]]) => {
                  const isCollapsed = collapsedCategories.has(category);

                  return (
                    <div key={category} className="mb-4">
                      {/* Header with chevron */}
                      <h4
                        onClick={() => toggleCategory(category)}
                        className="flex justify-between items-center text-sm font-medium text-gray-700 mb-2 cursor-pointer select-none"
                      >
                        {category}
                        {isCollapsed ? (
                          <ChevronUpIcon className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                        )}
                      </h4>

                      {/* Sliding container */}
                      <div
                        className="overflow-hidden transition-all duration-300 ease-in-out"
                        style={{ maxHeight: isCollapsed ? 0 : '1000px' }}
                      >
                        {(category === "Language Proficiency" || category === "Reading Comprehension") ? (
                          <>
                            {/* English subsection */}
                            <div className="mb-2">
                              <h5 className="text-xs font-semibold text-gray-600">English</h5>
                              <div className="flex flex-wrap gap-2">
                                {items.slice(0, 50).map((q, idx) => {
                                  const ua = userAnswers[q.question_id] ?? null;
                                  return (
                                    <button
                                      key={`${q.sectionIndex}-${q.question_id}`}
                                      onClick={() => {
                                        // …existing navigation logic…
                                        if (q.sectionIndex !== currentSection) {
                                          if (completedSections.has(q.sectionIndex)) {
                                            setShowLockedModal(true);
                                            return;
                                          }
                                          setSectionQuestions(prev => ({
                                            ...prev,
                                            [currentSection]: questions.map(qq => ({
                                              ...qq,
                                              sectionIndex: currentSection,
                                            })),
                                          }));
                                          const cached = sectionQuestions[q.sectionIndex];
                                          if (cached) {
                                            setQuestions(cached);
                                            const all = Object.entries({
                                              ...sectionQuestions,
                                              [q.sectionIndex]: cached,
                                            })
                                              .flatMap(([i, list]) =>
                                                list.map(item => ({ ...item, sectionIndex: Number(i) }))
                                              );
                                            setAllQuestions(
                                              Array.from(
                                                new Map(all.map(item => [item.question_id, item])).values()
                                              )
                                            );
                                          }
                                          setCurrentSection(q.sectionIndex);
                                          const idxInSec =
                                            sectionQuestions[q.sectionIndex]?.findIndex(
                                              qq => qq.question_id === q.question_id
                                            ) ?? 0;
                                          setCurrentQuestion(idxInSec);
                                        } else {
                                          const idxInCurr = questions.findIndex(
                                            qq => qq.question_id === q.question_id
                                          );
                                          if (idxInCurr !== -1) setCurrentQuestion(idxInCurr);
                                        }
                                        setSelectedAnswer(ua);
                                        setShowExplanation(!!ua);
                                      }}
                                      className={`w-8 h-8 rounded-full text-sm font-medium flex items-center justify-center ${
                                        !ua
                                          ? 'bg-gray-100 text-gray-600'
                                          : 'bg-neural-purple/20 text-neural-purple'
                                      }`}
                                    >
                                      {idx + 1}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            <hr className="my-2" />

                            {/* Filipino subsection */}
                            <div>
                              <h5 className="text-xs font-semibold text-gray-600">Filipino</h5>
                              <div className="flex flex-wrap gap-2">
                                {items.slice(50, 100).map((q, idx) => {
                                  const ua = userAnswers[q.question_id] ?? null;
                                  return (
                                    <button
                                      key={`${q.sectionIndex}-${q.question_id}-filipino`}
                                      onClick={() => {
                                        // …same logic as above…
                                        if (q.sectionIndex !== currentSection) {
                                          if (completedSections.has(q.sectionIndex)) {
                                            setShowLockedModal(true);
                                            return;
                                          }
                                          setSectionQuestions(prev => ({
                                            ...prev,
                                            [currentSection]: questions.map(qq => ({
                                              ...qq,
                                              sectionIndex: currentSection,
                                            })),
                                          }));
                                          const cached = sectionQuestions[q.sectionIndex];
                                          if (cached) {
                                            setQuestions(cached);
                                            const all = Object.entries({
                                              ...sectionQuestions,
                                              [q.sectionIndex]: cached,
                                            })
                                              .flatMap(([i, list]) =>
                                                list.map(item => ({
                                                  ...item,
                                                  sectionIndex: Number(i),
                                                }))
                                              );
                                            setAllQuestions(
                                              Array.from(
                                                new Map(all.map(item => [item.question_id, item])).values()
                                              )
                                            );
                                          }
                                          setCurrentSection(q.sectionIndex);
                                          const idxInSec =
                                            sectionQuestions[q.sectionIndex]?.findIndex(
                                              qq => qq.question_id === q.question_id
                                            ) ?? 0;
                                          setCurrentQuestion(idxInSec);
                                        } else {
                                          const idxInCurr = questions.findIndex(
                                            qq => qq.question_id === q.question_id
                                          );
                                          if (idxInCurr !== -1) setCurrentQuestion(idxInCurr);
                                        }
                                        setSelectedAnswer(ua);
                                        setShowExplanation(!!ua);
                                      }}
                                      className={`w-8 h-8 rounded-full text-sm font-medium flex items-center justify-center ${
                                        !ua
                                          ? 'bg-gray-100 text-gray-600'
                                          : 'bg-neural-purple/20 text-neural-purple'
                                      }`}
                                    >
                                      {idx + 1}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </>
                        ) : (
                          /* Other categories */
                          <div className="flex flex-wrap gap-2">
                            {items.map((q, idx) => {
                              const ua = userAnswers[q.question_id] ?? null;
                              return (
                                <button
                                  key={`${q.sectionIndex}-${q.question_id}`}
                                  onClick={() => {
                                    // …existing navigation logic…
                                    if (q.sectionIndex !== currentSection) {
                                      if (completedSections.has(q.sectionIndex)) {
                                        setShowLockedModal(true);
                                        return;
                                      }
                                      setSectionQuestions(prev => ({
                                        ...prev,
                                        [currentSection]: questions.map(qq => ({
                                          ...qq,
                                          sectionIndex: currentSection,
                                        })),
                                      }));
                                      const cached = sectionQuestions[q.sectionIndex];
                                      if (cached) {
                                        setQuestions(cached);
                                        const all = Object.entries({
                                          ...sectionQuestions,
                                          [q.sectionIndex]: cached,
                                        })
                                          .flatMap(([i, list]) =>
                                            list.map(item => ({
                                              ...item,
                                              sectionIndex: Number(i),
                                            }))
                                          );
                                        setAllQuestions(
                                          Array.from(
                                            new Map(all.map(item => [item.question_id, item])).values()
                                          )
                                        );
                                      }
                                      setCurrentSection(q.sectionIndex);
                                      const idxInSec =
                                        sectionQuestions[q.sectionIndex]?.findIndex(
                                          qq => qq.question_id === q.question_id
                                        ) ?? 0;
                                      setCurrentQuestion(idxInSec);
                                    } else {
                                      const idxInCurr = questions.findIndex(
                                        qq => qq.question_id === q.question_id
                                      );
                                      if (idxInCurr !== -1) setCurrentQuestion(idxInCurr);
                                    }
                                    setSelectedAnswer(ua);
                                    setShowExplanation(!!ua);
                                  }}
                                  className={`w-8 h-8 rounded-full text-sm font-medium flex items-center justify-center ${
                                    !ua
                                      ? 'bg-gray-100 text-gray-600'
                                      : 'bg-neural-purple/20 text-neural-purple'
                                  }`}
                                >
                                  {idx + 1}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        )}
        {showLeaveConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Leave Exam?
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to leave the exam? Your progress will be lost.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowLeaveConfirmation(false)}
                  className="px-4 py-2 text-gray-600 hover:text-neural-purple"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLeaveExam}
                  className="px-4 py-2 bg-alert-red text-white rounded-lg hover:bg-alert-red/90"
                >
                  Leave Exam
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {showLockedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 text-center">
            <div className="flex justify-center mb-4">
              <ExclamationTriangleIcon className="w-10 h-10 text-alert-red" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Section Locked
            </h3>
            <p className="text-gray-600 mb-6">
              You cannot go back to a previous section. It is locked.
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => setShowLockedModal(false)}
                className="px-6 py-2 bg-neural-purple text-white rounded-lg hover:bg-tech-lavender transition"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Timer Warning Modal */}
      {timerWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 text-center">
            <p className="text-lg font-semibold mb-4">{timerWarning}</p>
            <button
              onClick={() => setTimerWarning(null)}
              className="px-4 py-2 bg-neural-purple text-white rounded-lg hover:bg-tech-lavender transition"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MockExamsPage;
