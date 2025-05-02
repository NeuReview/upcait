import React, { useState, useEffect } from 'react';
import { 
  AcademicCapIcon,
  ClockIcon,
  ArrowPathIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  BeakerIcon,
  BookOpenIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  SparklesIcon,
  ArrowUturnUpIcon,
  ArrowUturnDownIcon
} from '@heroicons/react/24/outline';
import { useFlashcards } from '../hooks/useFlashcards';

const generalTopic = {
  id: 'General',
  name: 'General',
  icon: SparklesIcon,
  description: 'Random questions from all categories',
  questions: 50,
  time: '60m'
};

const FlashcardsPage: React.FC = () => {
  // ─── State ───────────────────────────────────────────────────────────────
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

  // ─── Effects ─────────────────────────────────────────────────────────────
  // Timer
  useEffect(() => {
    let timer: number | undefined;
    if (isStarted && isTimeBased && timeRemaining > 0) {
      timer = window.setInterval(() => {
        setTimeRemaining(t => {
          if (t <= 1) {
            clearInterval(timer);
            setIsStarted(false);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => void (timer && clearInterval(timer));
  }, [isStarted, isTimeBased, timeRemaining]);

  // ─── Handlers ────────────────────────────────────────────────────────────
  const startSession = async () => {
    if (!selectedTopic) return;
    setIsStarted(false);
    setCurrentCard(0);
    setSelectedAnswer(null);
    setCorrectAnswers(0);
    setIncorrectAnswers(0);
    setShowScoreSummary(false);
    if (isTimeBased) setTimeRemaining(15 * 60);

    const cards = await fetchFlashcards(selectedTopic);
    console.log('Fetched flashcards:', cards);
    setIsStarted(true);
  };

  const handleFlip = () => {
    if (isFlipping) return;
    setIsFlipping(true);
    setTimeout(() => {
      setShowBack(b => !b);
      setIsFlipping(false);
    }, 700);
  };

  const handleAnswerSelect = (letter: string) => {
    setSelectedAnswer(letter);
    const correct = flashcards[currentCard]?.answer?.toUpperCase();
    if (letter === correct) setCorrectAnswers(n => n + 1);
    else setIncorrectAnswers(n => n + 1);
    handleFlip();
  };

  const nextCard = () => {
    if (currentCard < flashcards.length - 1) {
      setCurrentCard(i => i + 1);
      setSelectedAnswer(null);
      setShowBack(false);
    }
  };

  const previousCard = () => {
    if (currentCard > 0) {
      setCurrentCard(i => i - 1);
      setSelectedAnswer(null);
      setShowBack(false);
    }
  };

  const shuffleCards = async () => {
    if (!selectedTopic) return;
    setCurrentCard(0);
    setSelectedAnswer(null);
    await fetchFlashcards(selectedTopic);
  };

  const finishSession = () => setShowScoreSummary(true);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  // ─── Loading State ───────────────────────────────────────────────────────
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

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {!isStarted ? (
          // ─── Topic Selection ────────────────────────────────────────────────
          <>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">Flashcards</h1>
            <p className="text-gray-600 mb-6 text-center">
              Practice with flashcards covering all UPCAT subjects
            </p>
            {error && (
              <div className="mb-6 p-4 bg-alert-red/10 border border-alert-red rounded-lg flex items-center space-x-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-alert-red" />
                <p className="text-alert-red">{error}</p>
              </div>
            )}
            <div className="flex justify-center">
              <div
                onClick={() => setSelectedTopic(generalTopic.id)}
                className={`
                  bg-gradient-to-br from-neural-purple/40 to-neural-purple/10
                  rounded-lg p-6 mb-8 shadow-md hover:shadow-lg transition
                  cursor-pointer border-2 max-w-2xl w-full
                  ${selectedTopic === generalTopic.id
                    ? 'border-neural-purple'
                    : 'border-transparent'}
                `}
              >
                <div className="flex flex-col md:flex-row items-center">
                  <div className={`
                    rounded-full p-3 mb-4 md:mb-0 md:mr-5
                    ${selectedTopic === generalTopic.id
                      ? 'bg-neural-purple text-white'
                      : 'bg-white text-neural-purple'}
                  `}>
                    <SparklesIcon className="w-10 h-10" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {generalTopic.name} Topic
                      </h3>
                      <div className="bg-neural-purple/20 text-neural-purple px-3 py-1 rounded-full text-sm font-medium mt-2 md:mt-0">
                        Comprehensive Review
                      </div>
                    </div>
                    <p className="text-gray-700 my-2">{generalTopic.description}</p>
                    <div className="mt-4 flex flex-wrap items-center justify-center md:justify-start gap-3">
                      <div className="bg-white/80 rounded-full px-3 py-1.5 flex items-center">
                        <AcademicCapIcon className="w-4 h-4 mr-1.5 text-neural-purple" />
                        <span className="text-xs font-medium">
                          {generalTopic.questions} questions
                        </span>
                      </div>
                      <div className="bg-white/80 rounded-full px-3 py-1.5 flex items-center">
                        <ClockIcon className="w-4 h-4 mr-1.5 text-neural-purple" />
                        <span className="text-xs font-medium">
                          {generalTopic.time} estimated time
                        </span>
                      </div>
                      <div className="bg-white/80 rounded-full px-3 py-1.5 flex items-center">
                        <SparklesIcon className="w-4 h-4 mr-1.5 text-neural-purple" />
                        <span className="text-xs font-medium">
                          Mixed difficulty levels
                        </span>
                      </div>
                    </div>
                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center space-x-2">
                        <input
                          id="timer-toggle"
                          type="checkbox"
                          checked={isTimeBased}
                          onChange={() => setIsTimeBased(b => !b)}
                          className="h-4 w-4 text-neural-purple rounded border-gray-300 focus:ring-neural-purple"
                        />
                        <label htmlFor="timer-toggle" className="text-sm text-gray-700">
                          Enable Timer ({generalTopic.time})
                        </label>
                      </div>
                      <button
                        onClick={startSession}
                        className="w-full sm:w-auto px-6 py-2 rounded-lg bg-neural-purple text-white hover:bg-neural-purple/90 transition"
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
          // ─── Flashcard Session ─────────────────────────────────────────────
          <>
            <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center justify-between">
              <span>Flashcards: {selectedTopic}</span>
              <button
                onClick={() => setShowScoreSummary(true)}
                aria-label="Show score summary"
              >
                <ChartBarIcon className="w-6 h-6 text-neural-purple hover:text-tech-lavender" />
              </button>
            </h1>
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Progress & Controls */}
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
                    <button onClick={shuffleCards} aria-label="Shuffle cards">
                      <ArrowPathIcon className="w-5 h-5 text-neural-purple hover:text-tech-lavender" />
                    </button>
                  </div>
                </div>
                <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-full bg-neural-purple rounded-full transition-all duration-300"
                    style={{
                      width: `${((currentCard + 1) / flashcards.length) * 100}%`
                    }}
                  />
                </div>
              </div>

              {/* Grid-stacked Flashcard */}
              {flashcards[currentCard] && (
                <div className="w-full max-w-3xl mx-auto perspective">
                  <div
                    className={`
                      grid grid-cols-1 grid-rows-1
                      transition-transform duration-700
                      transform-style preserve-3d
                      ${showBack ? 'rotate-x-180' : ''}
                    `}
                  >
                    {/* Front face */}
                    <div className="col-start-1 row-start-1 backface-hidden bg-white rounded-xl shadow-lg p-8 flex flex-col justify-center items-center">
  <h2 className="text-xl font-bold text-gray-800 mb-6">
    {flashcards[currentCard].question}
  </h2>
  <div className="mt-6 grid grid-cols-2 gap-4 w-full">
    {(['A', 'B', 'C', 'D'] as const).map((letter) => {
      const card = flashcards[currentCard];
      if (!card) return null;

      // dual-key lookup
      const lowerKey = `option_${letter.toLowerCase()}` as
        | 'option_a' | 'option_b' | 'option_c' | 'option_d';
      const upperKey = `option_${letter}` as
        | 'option_A' | 'option_B' | 'option_C' | 'option_D';
      const text =
        (card as any)[lowerKey] ?? (card as any)[upperKey] ?? '';

      return (
        <button
          key={letter}
          onClick={() => handleAnswerSelect(letter)}
          disabled={isFlipping}
          className={`w-full text-left px-4 py-2 border rounded-lg transition ${
            selectedAnswer === letter
              ? 'bg-neural-purple text-white border-neural-purple'
              : 'bg-white text-gray-800 border-gray-300 hover:border-neural-purple'
          }`}
        >
          <span className="font-bold mr-2">{letter}.</span> {text}
        </button>
      );
    })}
  </div>
  <button
    onClick={handleFlip}
    disabled={isFlipping}
    aria-label="Flip card"
    className="mt-6 text-neural-purple hover:text-tech-lavender transition"
  >
    <ArrowUturnUpIcon className="w-6 h-6" />
  </button>
</div>


                    {/* Back face */}
                    <div className="col-start-1 row-start-1 backface-hidden rotate-x-180 bg-white rounded-xl shadow-lg p-8 flex flex-col justify-center items-center">
                      <h2 className="text-xl font-bold text-gray-800 mb-6">
                        {flashcards[currentCard].question}
                      </h2>
                      {showBack && (
                        <>
                          <p className="text-sm text-gray-500">Answer:</p>
                          <p className="text-2xl font-bold text-growth-green text-center">
                          {(() => {
                            const ans = flashcards[currentCard].answer;
                            if (!ans) return 'No answer';
                            const optionMap: Record<string, string> = {
                              A: flashcards[currentCard].option_a ?? '',
                              B: flashcards[currentCard].option_b ?? '',
                              C: flashcards[currentCard].option_c ?? '',
                              D: flashcards[currentCard].option_d ?? ''
                            };
                            return optionMap[ans] || ans;
                          })()}
                          </p>
                          {flashcards[currentCard].explanation && (
                            <p className="mt-4 text-gray-600 text-sm">
                              {flashcards[currentCard].explanation}
                            </p>
                          )}
                        </>
                      )}
                      <button
                        onClick={handleFlip}
                        disabled={isFlipping}
                        aria-label="Flip back"
                        className="mt-6 text-neural-purple hover:text-tech-lavender transition"
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
                  className="px-4 py-2 rounded-lg border border-neural-purple text-neural-purple hover:bg-neural-purple hover:text-white transition"
                >
                  Finish
                </button>
                <div className="flex space-x-4">
                  <button
                    onClick={previousCard}
                    disabled={currentCard === 0 || isFlipping}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:border-neural-purple disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <ArrowLeftIcon className="w-5 h-5" />
                    <span>Previous</span>
                  </button>
                  <button
                    onClick={nextCard}
                    disabled={currentCard === flashcards.length - 1 || isFlipping}
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
                      : 0
                    }%`
                  }}
                />
              </div>
              <div className="mt-2 text-right">
                <span className="font-bold text-lg">
                  {correctAnswers + incorrectAnswers > 0
                    ? Math.round((correctAnswers / (correctAnswers + incorrectAnswers)) * 100)
                    : 0
                  }%
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
                onClick={() => {
                  setIsStarted(false);
                  setShowScoreSummary(false);
                }}
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
