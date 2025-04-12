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
import CustomDropdownButton from '../components/CustomDropdownButton';

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

const QuizSummary = ({ score, onRetry }: { score: QuizScore; onRetry: () => void }) => {
  // Use minutes and seconds format
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSecs = seconds % 60;
    return `${minutes}m ${remainingSecs}s`;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="flex items-center mb-8">
        <TrophyIcon className="w-10 h-10 text-energy-orange mr-4" />
        <h2 className="text-2xl font-bold text-gray-900">Quiz Summary</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-neural-purple/10 p-6 rounded-lg text-center">
          <p className="text-neural-purple font-semibold mb-1">Score</p>
          <p className="text-3xl font-bold">{score.percentage}%</p>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <p className="text-gray-700 font-semibold mb-1">Questions</p>
          <div className="flex items-center justify-center text-xl">
            <span className="text-growth-green font-bold">{score.correct}</span>
            <span className="px-2 text-gray-400">/</span>
            <span className="text-gray-700">{score.total}</span>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <p className="text-gray-700 font-semibold mb-1">Time Spent</p>
          <p className="text-xl font-bold text-gray-700">{formatTime(score.timeSpent)}</p>
        </div>
      </div>

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
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <SparklesIcon className="w-5 h-5 text-energy-orange mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Recommendations</h3>
        </div>
        <div className="bg-energy-orange/10 rounded-lg p-4 border border-energy-orange/20">
          <p className="text-gray-700">
            {score.percentage >= 80 
              ? 'Excellent work! Try increasing the difficulty for more challenge.'
              : score.percentage >= 60
                ? 'Good job! Focus on the categories where you scored below 70% to improve.'
                : 'Keep practicing! Try reviewing the topics where you scored lowest and try again with a lower difficulty.'}
          </p>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={onRetry}
          className="inline-flex items-center px-6 py-3 bg-neural-purple text-white font-medium rounded-lg hover:bg-neural-purple/90 transition-colors duration-200"
        >
          <ArrowPathIcon className="w-5 h-5 mr-2" />
          Try Another Quiz
        </button>
      </div>
    </div>
  );
};

const QuizzesPageNew = () => {
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [isTopicMenuOpen, setIsTopicMenuOpen] = useState(false);
  const [isDifficultyMenuOpen, setIsDifficultyMenuOpen] = useState(false);
  const [isTimeBased, setIsTimeBased] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30 * 60);
  const { questions, loading, error, fetchQuestions } = useQuestions();
  const [score, setScore] = useState<QuizScore | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState<Set<number>>(new Set());

  useEffect(() => {
    let timer: number | undefined;
    
    if (quizStarted && isTimeBased && timeRemaining > 0) {
      timer = window.setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setQuizStarted(false);
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
        setQuizStarted(true);
        setCurrentQuestion(0);
        setSelectedAnswer(null);
        setShowExplanation(false);
        setScore(null);
        setCorrectAnswers(new Set());
        setStartTime(Date.now());
        if (isTimeBased) {
          setTimeRemaining(30 * 60);
        }
      } catch (err) {
        console.error('Error starting quiz:', err);
      }
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
    setShowExplanation(true);
    
    if (answer === questions[currentQuestion].answer) {
      setCorrectAnswers(prev => new Set(prev).add(currentQuestion));
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

  const handleTopicSelect = (topicId: string) => {
    setSelectedTopic(topicId);
    setIsTopicMenuOpen(false);
  };

  const handleDifficultySelect = (difficultyId: string) => {
    setSelectedDifficulty(difficultyId);
    setIsDifficultyMenuOpen(false);
  };

  const getSelectedTopicName = () => {
    const topic = topics.find(t => t.id === selectedTopic);
    return topic ? topic.name : 'Select Topic';
  };

  const getSelectedDifficultyName = () => {
    const difficulty = difficulties.find(d => d.id === selectedDifficulty);
    return difficulty ? difficulty.name : 'Select Difficulty';
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
          <QuizSummary 
            score={score} 
            onRetry={() => {
              setQuizStarted(false);
              setScore(null);
            }} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {!quizStarted ? (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900">Practice Quizzes</h1>
              <p className="mt-2 text-gray-600">
                Choose your topic and difficulty to get started
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

            <div className="max-w-2xl mx-auto space-y-6">
              {/* Topic Dropdown */}
              <div>
                <CustomDropdownButton 
                  label={getSelectedTopicName()}
                  onClick={() => {
                    setIsTopicMenuOpen(!isTopicMenuOpen);
                    setIsDifficultyMenuOpen(false);
                  }}
                  isOpen={isTopicMenuOpen}
                />
                
                {isTopicMenuOpen && (
                  <div className="dropdown-content mt-2 bg-white rounded-xl shadow-lg border-2 border-neural-purple overflow-hidden">
                    <div className="p-2">
                      {topics.map((topic) => (
                        <button
                          key={topic.id}
                          onClick={() => handleTopicSelect(topic.id)}
                          className={`dropdown-item w-full p-4 rounded-lg flex items-center space-x-4 transition-colors ${
                            selectedTopic === topic.id
                              ? 'bg-neural-purple/10'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            selectedTopic === topic.id 
                              ? 'bg-neural-purple text-white' 
                              : 'bg-neural-purple/10 text-neural-purple'
                          }`}>
                            <topic.icon className="w-6 h-6" />
                          </div>
                          <div className="flex-1 text-left">
                            <h3 className="font-semibold text-gray-900">{topic.name}</h3>
                            <p className="text-sm text-gray-500">{topic.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Difficulty Dropdown */}
              <div>
                <CustomDropdownButton 
                  label={getSelectedDifficultyName()}
                  onClick={() => {
                    setIsDifficultyMenuOpen(!isDifficultyMenuOpen);
                    setIsTopicMenuOpen(false);
                  }}
                  isOpen={isDifficultyMenuOpen}
                />
                
                {isDifficultyMenuOpen && (
                  <div className="dropdown-content mt-2 bg-white rounded-xl shadow-lg border-2 border-neural-purple overflow-hidden">
                    <div className="p-2">
                      {difficulties.map((difficulty) => (
                        <button
                          key={difficulty.id}
                          onClick={() => handleDifficultySelect(difficulty.id)}
                          className={`dropdown-item w-full p-4 rounded-lg flex justify-between items-center transition-colors ${
                            selectedDifficulty === difficulty.id
                              ? 'bg-neural-purple/10'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <span className={`text-lg font-semibold ${difficulty.color}`}>
                            {difficulty.name}
                          </span>
                          
                          {selectedDifficulty === difficulty.id && (
                            <CheckCircleIcon className="w-6 h-6 text-neural-purple" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Timer Option */}
              <div className="flex items-center justify-center py-2">
                <div className="relative flex items-center">
                  <input
                    id="timer-toggle"
                    type="checkbox"
                    checked={isTimeBased}
                    onChange={() => setIsTimeBased(!isTimeBased)}
                    className="sr-only"
                  />
                  <div
                    className={`w-14 h-7 rounded-full transition-colors duration-200 ease-in-out ${
                      isTimeBased ? 'bg-neural-purple' : 'bg-gray-200'
                    }`}
                  >
                    <div
                      className={`transform transition duration-200 ease-in-out h-7 w-7 rounded-full bg-white shadow-md ${
                        isTimeBased ? 'translate-x-7' : 'translate-x-0'
                      }`}
                    />
                  </div>
                  <label htmlFor="timer-toggle" className="ml-3 text-gray-700 cursor-pointer">
                    Enable 30-minute Timer
                  </label>
                </div>
              </div>

              {/* Start Button */}
              <div className="py-4">
                <button
                  onClick={startQuiz}
                  disabled={!selectedTopic || !selectedDifficulty || loading}
                  className={`w-full py-3 rounded-lg font-semibold text-lg transition-colors duration-200 ${
                    selectedTopic && selectedDifficulty && !loading
                      ? 'bg-neural-purple text-white hover:bg-tech-lavender'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {loading ? 'Loading...' : 'Start Quiz'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
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
                  ].map((option) => (
                    <button
                      key={option.key}
                      onClick={() => handleAnswerSelect(option.key)}
                      disabled={showExplanation}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                        selectedAnswer === option.key
                          ? option.key === questions[currentQuestion].answer
                            ? 'border-growth-green bg-growth-green/10'
                            : 'border-alert-red bg-alert-red/10'
                          : 'border-gray-200 hover:border-neural-purple'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{option.value}</span>
                        {showExplanation && selectedAnswer === option.key && (
                          option.key === questions[currentQuestion].answer
                            ? <CheckCircleIcon className="w-6 h-6 text-growth-green" />
                            : <XCircleIcon className="w-6 h-6 text-alert-red" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {showExplanation && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="mb-2">
                      <span className="font-medium text-gray-900">Correct Answer: </span>
                      <span className="text-growth-green font-medium">
                        {questions[currentQuestion].answer}
                      </span>
                    </div>
                    <p className="text-gray-600">{questions[currentQuestion].explanation}</p>
                  </div>
                )}

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleNextQuestion}
                    disabled={!showExplanation}
                    className={`px-6 py-3 rounded-lg font-medium ${
                      showExplanation
                        ? 'bg-neural-purple text-white hover:bg-tech-lavender'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    } transition-colors duration-200`}
                  >
                    {currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizzesPageNew; 