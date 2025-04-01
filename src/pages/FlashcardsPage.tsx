import React, { useState, useEffect } from 'react';
import { 
  AcademicCapIcon, 
  ClockIcon,
  ArrowPathIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  BeakerIcon,
  BookOpenIcon,
  LanguageIcon,
  ExclamationTriangleIcon,
  ArrowUturnLeftIcon,
  SparklesIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { useFlashcards } from '../hooks/useFlashcards';

const topics = [
  {
    id: 'General',
    name: 'General',
    icon: SparklesIcon,
    description: 'Mixed questions from all categories'
  },
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

const FlashcardsPage = () => {
  const [isStarted, setIsStarted] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isTimeBased, setIsTimeBased] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(15 * 60);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const { flashcards, loading, error, fetchFlashcards } = useFlashcards();

  // Reset selected choice when moving to next/previous card
  useEffect(() => {
    setSelectedChoice(null);
    setIsFlipped(false);
  }, [currentCard]);

  useEffect(() => {
    let timer: number | undefined;
    
    if (isStarted && isTimeBased && timeRemaining > 0) {
      timer = window.setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isStarted, isTimeBased, timeRemaining]);

  const startSession = async () => {
    if (!selectedTopic) return;

    try {
      await fetchFlashcards(selectedTopic);
      setIsStarted(true);
      setCurrentCard(0);
      setIsFlipped(false);
      setSelectedChoice(null);
      if (isTimeBased) {
        setTimeRemaining(15 * 60);
      }
    } catch (err) {
      console.error('Error starting flashcard session:', err);
    }
  };

  const nextCard = () => {
    if (currentCard < flashcards.length - 1) {
      setCurrentCard(currentCard + 1);
      setIsFlipped(false);
      setSelectedChoice(null);
    }
  };

  const previousCard = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1);
      setIsFlipped(false);
      setSelectedChoice(null);
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') nextCard();
    if (e.key === 'ArrowLeft') previousCard();
    if (e.key === ' ') setIsFlipped(!isFlipped);
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentCard, isFlipped]);

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
          <p className="mt-4 text-gray-600">Loading flashcards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {!isStarted ? (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900">Flashcards</h1>
              <p className="mt-2 text-gray-600">
                Test your knowledge with interactive flashcards
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Click to flip • Use arrow keys to navigate • Space to flip
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

            <div className="flex items-center justify-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isTimeBased}
                  onChange={(e) => setIsTimeBased(e.target.checked)}
                  className="rounded border-gray-300 text-neural-purple focus:ring-neural-purple"
                />
                <span className="text-gray-700">Enable Timer (15 minutes)</span>
              </label>
            </div>

            <div className="text-center">
              <button
                onClick={startSession}
                disabled={!selectedTopic || loading}
                className={`px-8 py-3 rounded-lg font-semibold ${
                  selectedTopic && !loading
                    ? 'bg-neural-purple text-white hover:bg-tech-lavender'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                } transition-colors duration-200`}
              >
                {loading ? 'Loading...' : 'Start Flashcards'}
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Progress Bar */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex justify-between items-center">
                <div className="text-gray-600">
                  Card {currentCard + 1} of {flashcards.length}
                  {selectedTopic === 'General' && flashcards[currentCard] && (
                    <span className="ml-2 text-sm text-neural-purple">
                      ({flashcards[currentCard].category})
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  {isTimeBased && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <ClockIcon className="w-5 h-5" />
                      <span>{formatTime(timeRemaining)}</span>
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setCurrentCard(0);
                      setIsFlipped(false);
                      setSelectedChoice(null);
                      fetchFlashcards(selectedTopic);
                    }}
                    className="text-neural-purple hover:text-tech-lavender"
                  >
                    <ArrowPathIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-neural-purple h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${((currentCard + 1) / flashcards.length) * 100}%`
                  }}
                />
              </div>
            </div>

            {flashcards[currentCard] && (
              <div className="space-y-8">
                {/* Question */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {flashcards[currentCard].question}
                  </h2>
                </div>

                {/* Choices */}
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { key: 'A', value: flashcards[currentCard].option_a },
                    { key: 'B', value: flashcards[currentCard].option_b },
                    { key: 'C', value: flashcards[currentCard].option_c },
                    { key: 'D', value: flashcards[currentCard].option_d }
                  ].map((option) => (
                    <button
                      key={option.key}
                      onClick={() => {
                        setSelectedChoice(option.key);
                        if (!isFlipped) setIsFlipped(true);
                      }}
                      className={`group relative transition-all duration-300 ${
                        selectedChoice === option.key
                          ? isFlipped
                            ? option.key === flashcards[currentCard].answer
                              ? 'bg-growth-green/10 border-growth-green'
                              : 'bg-alert-red/10 border-alert-red'
                            : 'bg-neural-purple/10 border-neural-purple'
                          : 'bg-white hover:bg-gray-50 border-gray-200'
                      } border-2 rounded-xl p-4`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          selectedChoice === option.key
                            ? isFlipped
                              ? option.key === flashcards[currentCard].answer
                                ? 'bg-growth-green text-white'
                                : 'bg-alert-red text-white'
                              : 'bg-neural-purple text-white'
                            : 'bg-gray-100 text-gray-500 group-hover:bg-neural-purple/10 group-hover:text-neural-purple'
                        }`}>
                          {option.key}
                        </div>
                        <p className={`flex-1 text-left ${
                          selectedChoice === option.key && isFlipped
                            ? option.key === flashcards[currentCard].answer
                              ? 'text-growth-green'
                              : 'text-alert-red'
                            : selectedChoice === option.key
                              ? 'text-neural-purple'
                              : 'text-gray-700'
                        }`}>
                          {option.value}
                        </p>
                        {selectedChoice === option.key && isFlipped && (
                          option.key === flashcards[currentCard].answer
                            ? <CheckCircleIcon className="w-5 h-5 text-growth-green ml-2" />
                            : <XCircleIcon className="w-5 h-5 text-alert-red ml-2" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Explanation Card */}
                <div className="relative h-[200px] perspective-1000">
                  <div
                    className={`absolute inset-0 w-full h-full transition-transform duration-700 transform-style-3d cursor-pointer ${
                      isFlipped ? 'rotate-y-180' : ''
                    }`}
                    onClick={() => setIsFlipped(!isFlipped)}
                  >
                    {/* Front */}
                    <div className="absolute inset-0 w-full h-full backface-hidden bg-white rounded-lg shadow-lg p-6 flex flex-col items-center justify-center">
                      <h3 className="text-xl font-semibold text-gray-900">
                        Click to reveal explanation
                      </h3>
                      <p className="mt-2 text-sm text-gray-500">
                        Press spacebar or click to flip
                      </p>
                    </div>

                    {/* Back */}
                    <div className="absolute inset-0 w-full h-full backface-hidden bg-white rounded-lg shadow-lg p-6 rotate-y-180">
                      <div className="h-full flex flex-col justify-center">
                        <div className="p-4 bg-growth-green/5 border border-growth-green/10 rounded-lg">
                          <p className="text-sm font-medium text-growth-green mb-2">
                            Correct Answer: {flashcards[currentCard].answer}
                          </p>
                          <p className="text-sm text-gray-600">
                            {flashcards[currentCard].explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center pt-4">
              <button
                onClick={() => {
                  setIsStarted(false);
                  setSelectedChoice(null);
                  setIsFlipped(false);
                }}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-neural-purple transition-colors duration-200"
              >
                <ArrowUturnLeftIcon className="w-5 h-5 mr-2" />
                Exit
              </button>
              <div className="flex space-x-4">
                <button
                  onClick={previousCard}
                  disabled={currentCard === 0}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:border-neural-purple disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                  <span>Previous</span>
                </button>
                <button
                  onClick={nextCard}
                  disabled={currentCard === flashcards.length - 1}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:border-neural-purple disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <span>Next</span>
                  <ArrowRightIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlashcardsPage;