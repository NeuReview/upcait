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
  CheckCircleIcon,
  XCircleIcon,
  ChartBarIcon,
  SparklesIcon,
  ArrowUturnUpIcon,
  ArrowUturnDownIcon
} from '@heroicons/react/24/outline';
import { useFlashcards } from '../hooks/useFlashcards';

// Separate definition for the General card
const generalTopic = {
  id: 'General',
  name: 'General',
  icon: SparklesIcon,
  description: 'Random questions from all categories',
  questions: 50,
  time: '60m'
};

const FlashcardsPage = () => {
  const [isStarted, setIsStarted] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [currentCard, setCurrentCard] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [showBack, setShowBack] = useState(false);
  const [isTimeBased, setIsTimeBased] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(15 * 60);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  const [showScoreSummary, setShowScoreSummary] = useState(false);
  const { flashcards, loading, error, fetchFlashcards } = useFlashcards();

  const handleFlip = () => {
    setIsFlipping(true);
  
    setTimeout(() => {
      setShowBack((prev) => !prev);
      setIsFlipping(false);
    }, 700); // match your flip animation duration
  };
  
  useEffect(() => {
    let timer: number | undefined;
    
    if (isStarted && isTimeBased && timeRemaining > 0) {
      timer = window.setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsStarted(false);
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
      // Reset state first
      setIsStarted(false);
      setCurrentCard(0);
      setSelectedAnswer(null);
      setCorrectAnswers(0);
      setIncorrectAnswers(0);
      setShowScoreSummary(false);
      if (isTimeBased) {
        setTimeRemaining(15 * 60);
      }
  
      // Fetch flashcards from Supabase
      await fetchFlashcards(selectedTopic);
  
      // Optional: log to debug what's returned
      console.log('Fetched flashcards:', flashcards);
  
      // Start session only if flashcards were fetched
      setIsStarted(true);
  
    } catch (err) {
      console.error('Error starting flashcard session:', err);
    }
  };
  
  const nextCard = () => {
    if (currentCard < flashcards.length - 1) {
      setCurrentCard(currentCard + 1);
      setSelectedAnswer(null);
      setShowBack(false); // Flip to front when going to next card
    }
  };
  
  const previousCard = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1);
      setSelectedAnswer(null);
      setShowBack(false); // Flip to front when going to previous card
    }
  };  

  const shuffleCards = async () => {
    if (!selectedTopic) return;
    setCurrentCard(0);
    setSelectedAnswer(null);
    await fetchFlashcards(selectedTopic);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
    
    if (flashcards[currentCard] && answer === flashcards[currentCard].answer) {
      setCorrectAnswers(prev => prev + 1);
    } else {
      setIncorrectAnswers(prev => prev + 1);
    }
  };

  const finishSession = () => {
    setShowScoreSummary(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neural-purple mx-auto"></div>
          <p className="mt-4 text-gray-600">Naglo-load ang mga flashcards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {!isStarted ? (
          <>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">Flashcards</h1>
            <p className="text-gray-600 mb-6 text-center">Practice with flashcards covering all UPCAT subjects</p>
            
            {error && (
              <div className="mb-6 p-4 bg-alert-red/10 border border-alert-red rounded-lg flex items-center space-x-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-alert-red" />
                <p className="text-alert-red">{error}</p>
              </div>
            )}

            {/* Featured General Card - with reduced width */}
            <div className="flex justify-center">
              <div 
                onClick={() => setSelectedTopic(generalTopic.id)}
                className={`bg-gradient-to-br from-neural-purple/40 to-neural-purple/10 rounded-lg p-6 mb-8 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer border-2 max-w-2xl w-full ${
                  selectedTopic === generalTopic.id ? 'border-neural-purple' : 'border-transparent'
                }`}
              >
                <div className="flex flex-col md:flex-row items-center">
                  <div className={`rounded-full p-3 mb-4 md:mb-0 md:mr-5 ${
                    selectedTopic === generalTopic.id 
                      ? 'bg-neural-purple text-white' 
                      : 'bg-white text-neural-purple'
                  }`}>
                    <generalTopic.icon className="w-10 h-10" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{generalTopic.name} Topic</h3>
                      <div className="bg-neural-purple/20 text-neural-purple px-3 py-1 rounded-full text-sm font-medium mt-2 md:mt-0 inline-block">
                        Comprehensive Review
                      </div>
                    </div>
                    <p className="text-gray-700 my-2">{generalTopic.description}</p>
                    <div className="mt-4 flex flex-wrap items-center justify-center md:justify-start gap-3">
                      <div className="bg-white/80 rounded-full px-3 py-1.5 flex items-center">
                        <AcademicCapIcon className="w-4 h-4 mr-1.5 text-neural-purple" />
                        <span className="text-xs font-medium">{generalTopic.questions} questions</span>
                      </div>
                      <div className="bg-white/80 rounded-full px-3 py-1.5 flex items-center">
                        <ClockIcon className="w-4 h-4 mr-1.5 text-neural-purple" />
                        <span className="text-xs font-medium">{generalTopic.time} estimated time</span>
                      </div>
                      <div className="bg-white/80 rounded-full px-3 py-1.5 flex items-center">
                        <SparklesIcon className="w-4 h-4 mr-1.5 text-neural-purple" />
                        <span className="text-xs font-medium">Mixed difficulty levels</span>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center space-x-2">
                        <input
                          id="timer-toggle"
                          type="checkbox"
                          checked={isTimeBased}
                          onChange={() => setIsTimeBased(!isTimeBased)}
                          className="h-4 w-4 text-neural-purple rounded border-gray-300 focus:ring-neural-purple"
                        />
                        <label htmlFor="timer-toggle" className="text-sm text-gray-700">
                          Enable Timer ({generalTopic.time})
                        </label>
                      </div>

                      <button
                        onClick={startSession}
                        className="w-full sm:w-auto px-6 py-2 rounded-lg transition-colors duration-200 bg-neural-purple text-white hover:bg-neural-purple/90"
                      >
                        Start Flashcards
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-500 text-center mt-6">
              Questions will be randomly selected with varying difficulty levels
            </p>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center justify-between">
              <span>Flashcards: {selectedTopic}</span>
              <button 
                onClick={() => setShowScoreSummary(true)}
                className="text-neural-purple hover:text-tech-lavender"
              >
                <ChartBarIcon className="w-6 h-6" />
              </button>
            </h1>
          
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Progress and Controls */}
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex justify-between items-center">
                  <div className="text-gray-600">
                    Card {currentCard + 1} of {flashcards.length}
                  </div>
                  <div className="flex items-center space-x-4">
                    {isTimeBased && (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <ClockIcon className="w-5 h-5" />
                        <span>{formatTime(timeRemaining)}</span>
                      </div>
                    )}
                    <button
                      onClick={shuffleCards}
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

              {/* Question Card */}
              {flashcards[currentCard] && (
              <div className="relative w-full max-w-3xl mx-auto perspective h-[300px]">
                <div
                  className={`transition-transform duration-700 transform-style preserve-3d w-full h-full ${
                    showBack ? 'rotate-x-180' : ''
                  }`}
                >
                  {/* Front side */}
                  <div className="absolute w-full h-full backface-hidden bg-white rounded-xl shadow-lg p-8 text-center flex flex-col justify-center items-center">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">
                      {flashcards[currentCard]?.question}
                    </h2>
                    <button
                      onClick={handleFlip}
                      className="text-neural-purple hover:text-tech-lavender transition duration-200">
                      <ArrowUturnUpIcon className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Back side */}
                  <div className="absolute w-full h-full backface-hidden rotate-x-180 bg-white rounded-xl shadow-lg p-8 text-center flex flex-col justify-center items-center">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">
                      {flashcards[currentCard]?.question}
                    </h2>

                    {showBack && (
                      <>
                        <p className="text-sm text-gray-500">Answer:</p>
                        <p className="text-2xl font-bold text-growth-green text-center">
                          {(() => {
                            const answerKey = flashcards[currentCard]?.answer;
                            if (!answerKey) return 'No answer';
                            const optionMap: Record<string, string> = {
                              A: flashcards[currentCard]?.option_a ?? '',
                              B: flashcards[currentCard]?.option_b ?? '',
                              C: flashcards[currentCard]?.option_c ?? '',
                              D: flashcards[currentCard]?.option_d ?? '',
                            };
                            return optionMap[answerKey] || answerKey;
                          })()}
                        </p>

                        {flashcards[currentCard]?.explanation && (
                          <p className="mt-4 text-gray-600 text-sm">
                            {flashcards[currentCard].explanation}
                          </p>
                        )}
                      </>
                    )}
                    <button
                      onClick={handleFlip}
                      className="mt-6 text-neural-purple hover:text-tech-lavender transition duration-200"
                    >
                      <ArrowUturnDownIcon className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>
              )}
              {/* Navigation */}
              <div className="flex justify-between items-center">
                <button
                  onClick={finishSession}
                  className="px-4 py-2 rounded-lg border border-neural-purple text-neural-purple hover:bg-neural-purple hover:text-white transition-colors duration-200"
                >
                  Finish
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
                    onClick={() => {
                      setSelectedAnswer(null);
                      nextCard();
                    }}
                    disabled={currentCard === flashcards.length - 1}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:border-neural-purple disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <span>Next</span>
                    <ArrowRightIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Score Summary Modal */}
      {showScoreSummary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <ChartBarIcon className="w-7 h-7 text-neural-purple mr-2" />
              Score Summary
            </h2>
            
            <div className="mb-6">
              <div className="relative h-4 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-growth-green"
                  style={{ 
                    width: `${correctAnswers + incorrectAnswers > 0 
                      ? (correctAnswers / (correctAnswers + incorrectAnswers)) * 100 
                      : 0}%` 
                  }}
                />
              </div>
              
              <div className="mt-2 text-right">
                <span className="font-bold text-lg">
                  {correctAnswers + incorrectAnswers > 0 
                    ? Math.round((correctAnswers / (correctAnswers + incorrectAnswers)) * 100) 
                    : 0}% 
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-gray-500 text-sm">Total</p>
                <p className="font-bold text-xl text-gray-900">{correctAnswers + incorrectAnswers}</p>
              </div>
              <div className="bg-growth-green/10 p-4 rounded-lg text-center">
                <p className="text-growth-green text-sm">Correct</p>
                <p className="font-bold text-xl text-growth-green">{correctAnswers}</p>
              </div>
              <div className="bg-alert-red/10 p-4 rounded-lg text-center">
                <p className="text-alert-red text-sm">Incorrect</p>
                <p className="font-bold text-xl text-alert-red">{incorrectAnswers}</p>
              </div>
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={() => setIsStarted(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Back to Topics
              </button>
              <button
                onClick={() => setShowScoreSummary(false)}
                className="px-4 py-2 bg-neural-purple text-white rounded-lg hover:bg-neural-purple/90"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashcardsPage;
