import React, { useState, useEffect } from 'react';
import type { Question } from '../types/quiz';
import { 
  AcademicCapIcon,
  ClockIcon,
  ArrowPathIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  BeakerIcon,
  BookOpenIcon,
  ExclamationTriangleIcon,
  CalculatorIcon,
  ChartBarSquareIcon,
  SparklesIcon,
  ArrowUturnUpIcon,
  ArrowUturnDownIcon,
  Square3Stack3DIcon,
  LanguageIcon
} from '@heroicons/react/24/outline';
import { useFlashcards } from '../hooks/useFlashcards';
import { supabase, upsertDailyTotal } from '../lib/supabase';

const generalTopic = {
  id: 'General',
  name: 'General',
  badgeText: 'Comprehensive Review',  // ← new
  icon: SparklesIcon,
  description: 'Random questions from all categories',
  questions: 50,
  time: '60m'
};

const topics = [
  {
    id: 'Science',
    name: 'Science',
    badgeText: 'Biology & physics',    // ← custom per topic
    icon: BeakerIcon,
    description: 'Biology, physics, chemistry, anatomy',
    questions: 50,
    time: '60m'
  },
  {
    id: 'Math',
    name: 'Math',
    badgeText: 'Algebra, trigonometry, calculus, geometry',
    icon: CalculatorIcon,
    description: 'Algebra, geometry, calculus problems',
    questions: 50,
    time: '60m'
  },
  {
    id: 'Reading Comprehension',
    name: 'Reading Comprehension',
    badgeText: 'Wellness, community, environment, habit',
    icon: BookOpenIcon,
    description: 'Critical reading and analysis',
    questions: 50,
    time: '60m'
  },
  {
    id: 'Language Proficiency',
    name: 'Language Proficiency',
    badgeText: 'Vocabulary, grammar, & composition',
    icon: LanguageIcon,
    description: 'English and Filipino language skills',
    questions: 50,
    time: '60m'
  }
];


interface FlashcardScore {
  total: number;
  correct: number;
  incorrect: number;
  percentage: number;
  timeSpent: number;              // in seconds
  categoryScores?: Record<       // optional, if your flashcards have a `category` field
    string,
    { total: number; correct: number; percentage: number }
  >;
  answeredByCategory?: Record<string, Question[]>;
}

const FlashcardsPage: React.FC = () => {
  // ─── State ───────────────────────────────────────────────────────────────
  const [isStarted, setIsStarted] = useState(false);
  const [flashScore, setFlashScore] = useState<FlashcardScore | null>(null);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [currentCard, setCurrentCard] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [showBack, setShowBack] = useState(false);
  const [isTimeBased, setIsTimeBased] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(15 * 60);
  const [cardCount, setCardCount] = useState<number>(generalTopic.questions);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  const [showScoreSummary, setShowScoreSummary] = useState(false);
  const [hasReturned, setHasReturned] = useState(false);
  const [byCategory, setByCategory] = useState<Record<string,{total:number;correct:number}>>({});
  const [answeredByCategory, setAnsweredByCategory] = useState<Record<string, Question[]>>({});



  // <<< NEW: track flashcards session start timestamp >>>
  const [flashStartTime, setFlashStartTime] = useState<number | null>(null);
  const { flashcards, loading, error, fetchFlashcards } = useFlashcards();

  // initialize each topic to its default question count
  const [cardCounts, setCardCounts] = useState<Record<string, number>>(
    () => topics.reduce((acc, t) => ({ ...acc, [t.id]: t.questions }), {})
  );


  // ─── Effects ─────────────────────────────────────────────────────────────
  // Timer ticking every second
  useEffect(() => {
    let timer: number | undefined;
    if (isStarted && isTimeBased && timeRemaining > 0) {
      timer = window.setInterval(() => {
        setTimeRemaining(t => Math.max(0, t - 1));
      }, 1000);
    }
    return () => {
      if (timer !== undefined) {
        clearInterval(timer);
      }
    };
  }, [isStarted, isTimeBased, timeRemaining]);

  useEffect(() => {
    const t = topics.find(t => t.id === selectedTopic);
    if (t) setCardCount(t.questions);
  }, [selectedTopic]);


  const buildCategoryScores = (store: Record<string, {total:number; correct:number}>) =>
  Object.fromEntries(
    Object.entries(store).map(([c, s]) => [
      c,
      {
        ...s,
        percentage: s.total ? Math.round((s.correct / s.total) * 100) : 0,
      },
    ]),
  );


  const handleEndSession = async () => {
    if (hasReturned) return;
    setHasReturned(true);

    await recordFlashSession();

    const endMs    = Date.now();
    const elapsed = flashStartTime
      ? Math.floor((endMs - flashStartTime) / 1000)
      : 0;

    const total     = correctAnswers + incorrectAnswers;
    const correct   = correctAnswers;
    const incorrect = incorrectAnswers;
    const percentage =
      total > 0 ? Math.round((correct / total) * 100) : 0;

    const categoryScores = Object.fromEntries(
      Object.entries(byCategory).map(([cat, { total, correct }]) => [
        cat,
        {
          total,
          correct,
          percentage: Math.round((correct / total) * 100),
        },
      ]),
    );

    setFlashScore({
      total,
      correct,
      incorrect,
      percentage,
      timeSpent: elapsed,
      answeredByCategory,
      categoryScores,
    });
  };


  

  // ─── Handlers ────────────────────────────────────────────────────────────
  const startSession = async () => {
    // Re-enable the “Back to Topics” button on each new run
    setByCategory({});
    setHasReturned(false);
  
    if (!selectedTopic) return;
  
    // reset all session state
    setIsStarted(false);
    setCurrentCard(0);
    setSelectedAnswer(null);
    setShowBack(false);
    setCorrectAnswers(0);
    setIncorrectAnswers(0);
    setShowScoreSummary(false);
    if (isTimeBased) {
      setTimeRemaining(15 * 60);
    }
  
    // stamp start time
    setFlashStartTime(Date.now());
  
    // fetch the new batch of flashcards
    await fetchFlashcards(selectedTopic, cardCount);
       // if the hook stored all cards in `flashcards`, override to first `cardCount`

  
    // kick off the session
    setIsStarted(true);
  };
  
  // flip front ↔ back
  const handleFlip = () => {
    if (isFlipping) return;
    setIsFlipping(true);
    setTimeout(() => {
      setShowBack(b => !b);
      setIsFlipping(false);
    }, 700);
  };

  const handleAnswerSelect = (letter: string) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(letter);

    // 1️⃣ Update your correct/incorrect totals
    const correct = flashcards[currentCard]?.answer?.toUpperCase();
    if (letter === correct) setCorrectAnswers(n => n + 1);
    else setIncorrectAnswers(n => n + 1);

    // 2️⃣ Flip the card so the user sees the back
    handleFlip();

    // 3️⃣ Compute the category key
    const cat = flashcards[currentCard].category || 'Ungrouped';

    // 4️⃣ Update your per-category counts
    setByCategory(prev => ({
      ...prev,
      [cat]: {
        total:   (prev[cat]?.total   ?? 0) + 1,
        correct: (prev[cat]?.correct ?? 0) +
                (letter === correct ? 1 : 0),
      },
    }));

    // 5️⃣ —— Place your new line here 🤓 ——  
    setAnsweredByCategory(prev => ({
      ...prev,
      [cat]: [...(prev[cat] || []), flashcards[currentCard]],
    }));
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

  const finishSession = () => {
    setShowScoreSummary(true);
  };

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  // ─── Persist flashcard session into daily_session_time ───────────────────
  const recordFlashSession = async () => {
    if (!flashStartTime) return;
    const endMs      = Date.now();
    const elapsedSec = Math.floor((endMs - flashStartTime) / 1000);
    const startISO   = new Date(flashStartTime).toISOString();
    const endISO     = new Date(endMs).toISOString();
  
    // get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return console.error('Not authenticated');
  
    // 1) log the single flashcard session
    const { error: sessionErr } = await supabase
      .from('flashcard_sessions')
      .insert({
        user_id:    user.id,
        start_time: startISO,
        end_time:   endISO,
        duration:   elapsedSec
      });
    if (sessionErr) console.error('Error logging flashcard session:', sessionErr);
  
    // 2) bump the daily total for all session types
    //    (quizzes + mock exams + flashcards)
    await upsertDailyTotal(user.id, startISO.slice(0,10));
  };
  

    if (!flashScore) {
       // we’re not showing results yet, fall through to normal UI below
     } else {
       // guard passed: flashScore is definitely non-null
       const { percentage, total, correct, incorrect, timeSpent, categoryScores } = flashScore;

       return (

      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* reuse your Mock Exam summary UI, swapping in flashScore */}
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-neural-purple/10 mb-4">
              <SparklesIcon className="w-10 h-10 text-neural-purple" />
            </div>
            <h2 className={`text-3xl font-bold ${flashScore.percentage >= 70 ? 'text-growth-green' : 'text-alert-red' } mb-2`}>
              {flashScore.percentage >= 70 ? 'Great Job!' : 'Room to Grow'}
            </h2>
            <p className="text-4xl font-bold mb-2">{flashScore!.percentage}%</p>
            <p className="text-gray-600 mb-8">
              You answered {flashScore.correct} out of {flashScore.total} correctly in {Math.floor(flashScore.timeSpent/60)}m {flashScore.timeSpent%60}s
            </p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold text-gray-900">{flashScore.total}</p>
              </div>
              <div className="bg-growth-green/5 rounded-lg p-4 text-center">
                <p className="text-sm text-growth-green">Correct</p>
                <p className="text-2xl font-bold text-growth-green">{flashScore.correct}</p>
              </div>
              <div className="bg-alert-red/5 rounded-lg p-4 text-center">
                <p className="text-sm text-alert-red">Incorrect</p>
                <p className="text-2xl font-bold text-alert-red">{flashScore.incorrect}</p>
              </div>
            </div>

            {flashScore.categoryScores && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 ">
                  Performance by Category
                </h3>

                {Object.entries(flashScore.categoryScores).map(([cat, stats]) => {
                  const { total, correct, percentage } = stats;
                  // pick colors based on percentage
                  const labelColor =
                    percentage >= 70
                      ? 'text-growth-green'
                      : percentage >= 50
                      ? 'text-energy-orange'
                      : 'text-alert-red';
                  const barColor =
                    percentage >= 70
                      ? 'bg-growth-green'
                      : percentage >= 50
                      ? 'bg-energy-orange'
                      : 'bg-alert-red';

                  return (
                    <div key={cat} className="bg-gray-50 rounded-lg mb-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-gray-700">{cat}</span>
                        <span className={`font-medium ${labelColor}`}>
                          {percentage}%
                        </span>
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${barColor}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>

                      <div className="mt-2 flex justify-start">
                      <p className="text-sm text-gray-600">
                        {correct}/{total}
                      </p>
                    </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="bg-neural-purple/5 rounded-lg p-6 mb-8">
              <h3 className="flex items-center text-lg font-semibold text-neural-purple mb-4">
                <ChartBarSquareIcon className="w-5 h-5 mr-2" />
                Recommendations
              </h3>
              <ul className="space-y-2 text-gray-600">
                {flashScore.percentage < 70 && (
                  <li className="flex items-start">
                    <BookOpenIcon className="w-5 h-5 mr-2 mt-0.5 text-neural-purple flex-shrink-0" />
                    Review the explanations for cards you got wrong
                  </li>
                )}
                <li className="flex items-start">
                  <AcademicCapIcon className="w-5 h-5 mr-2 mt-0.5 text-neural-purple flex-shrink-0" />
                  Try another flashcard session to reinforce what you’ve learned
                </li>
              </ul>
            </div>

            <button
              onClick={() => {
                setFlashScore(null);

                setShowScoreSummary(false);
                // reset everything to start a new session
                setIsStarted(false);          // go back to topic selection
                 setCardCount(generalTopic.questions);
                setFlashScore(null);
                setSelectedAnswer(null);
                setCurrentCard(0);
                setCorrectAnswers(0);
                setIncorrectAnswers(0);
                setHasReturned(false);
                setByCategory({});
              }}
              className="px-6 py-3 bg-neural-purple text-white rounded-lg hover:bg-tech-lavender transition"
            >
              Try Another Flashcard Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Loading State ───────────────────────────────────────────────────────
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

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {!isStarted ? (
  <>
    <div className="text-center">
      <h1 className="text-3xl font-bold text-gray-900">Flashcards</h1>
      <p className="mt-2 text-gray-600">
        Choose your topic 
      </p>
      <p className="mt-1 text-sm text-gray-500">
        50 questions per session (default)
      </p>
    </div>
           <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Topic</h2>
  

  {error && (
    <div className="mb-6 p-4 bg-alert-red/10 border border-alert-red rounded-lg flex items-center space-x-2">
      <ExclamationTriangleIcon className="w-5 h-5 text-alert-red" />
      <p className="text-alert-red">{error}</p>
    </div>
  )}

  {/* Grid of 4 + General */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
    {topics
      .filter(t => t.id !== 'General')
      .map(topic => {
        const Icon = topic.icon;
        const isSelected = selectedTopic === topic.id;
        return (
          <div
            key={topic.id}
            onClick={() => setSelectedTopic(topic.id)}
            className={`
              bg-gradient-to-br from-neural-purple/20 to-neural-purple/10
              rounded-lg p-4 shadow-md hover:shadow-lg transition
              cursor-pointer border-2 max-w-2xl w-full
              ${isSelected ? 'border-neural-purple' : 'border-transparent'}
            `}
          >
            {/* icon + title + badge */}
            <div className="flex flex-col md:flex-row items-center">
              <div className={`
                rounded-full p-2 mb-3 md:mb-0 md:mr-5
                ${isSelected
                  ? 'bg-neural-purple text-white'
                  : 'bg-white text-neural-purple'}
              `}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <h3 className="text-m font-bold text-gray-900">
                    {topic.name}
                  </h3>
                   <span className="bg-neural-purple/20 text-neural-purple px-3 py-1 rounded-full text-sm font-medium">
                     {topic.badgeText}
                   </span>
                </div>
                <p className="text-sm text-gray-700">{topic.description}</p>
              </div>
            </div>
          </div>
        );
      })}

    {/* ─── General spans two cols, centered ───────────────────────────── */}
    <div className="md:col-span-2 flex justify-center">
      <div
        onClick={() => setSelectedTopic(generalTopic.id)}
        className={`
          bg-gradient-to-br from-neural-purple/20 to-neural-purple/10
          rounded-lg p-4 shadow-md hover:shadow-lg transition
          cursor-pointer border-2 w-full max-w-2xl mx-auto
          ${selectedTopic === generalTopic.id
            ? 'border-neural-purple'
            : 'border-transparent'}
        `}
      >
        {/* icon + title + badge */}
        <div className="flex flex-col md:flex-row items-center">
          <div className={`
            rounded-full p-2 mb-3 md:mb-0 md:mr-5
            ${selectedTopic === generalTopic.id
              ? 'bg-neural-purple text-white'
              : 'bg-white text-neural-purple'}
          `}>
            <generalTopic.icon className="w-6 h-6" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <h3 className="text-m font-bold text-gray-900">
                {generalTopic.name}
              </h3>
              <span className="bg-neural-purple/20 text-neural-purple px-3 py-1 rounded-full text-sm font-medium">
                Comprehensive Review
              </span>
            </div>
            <p className="text-sm text-gray-700">{generalTopic.description}</p>
          </div>
        </div>

        {/* top-row tags */}
        
      </div>
    </div>
  </div>


  {/* ─── Global Controls ─────────────────────────────────────────────────── */}
  <div className="mt-8 flex items-center justify-center space-x-4">
    <label className="flex items-center space-x-2">
      <input
        type="checkbox"
        checked={isTimeBased}
        onChange={() => setIsTimeBased(b => !b)}
        className="h-4 w-4 text-neural-purple rounded border-gray-300 focus:ring-neural-purple"
      />
      <span className="text-gray-700">Enable Timers</span>
    </label>

    <label className="flex items-center space-x-2">
      <span className="text-gray-700">Cards:</span>
      <input
        type="number"
        min={1}
        value={cardCount}
        onChange={e => setCardCount(Math.max(1, Number(e.target.value)))}
        className="w-16 px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-neural-purple"
      />
    </label>
  </div>

  <div className="mt-6 flex justify-center">
    <button
      onClick={startSession}
      className="px-6 py-3 bg-neural-purple text-white rounded-lg hover:bg-neural-purple/90 transition"
    >
      Start Flashcards
    </button>
  </div>
      
   <p className="mt-2 text-sm text-gray-500 text-center">
      Questions will be randomly selected with varying difficulty levels
    </p>
  

  </>
) : (
          // ─── Flashcard Session ─────────────────────────────────────────────
          <>
            <div className="max-w-3xl mx-auto space-y-4">
                            {/* Progress & Controls */}
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      {selectedTopic}
                    </h2>
                    <p className="text-sm text-gray-600">
                      Card {currentCard + 1} of {flashcards.length}
                    </p>
                  </div>
                  <div className="flex flex-col items-end w-20">
                    {isTimeBased && (
                      <div className="flex items-center justify-center  space-x-1 text-gray-600 w-full mt-1">
                        <ClockIcon className="w-5 h-5" />
                        <span>{formatTime(timeRemaining)}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2 pr-2.5">
                      <button
                        onClick={() => setShowScoreSummary(true)}
                        aria-label="Show score summary"
                      >
                        <Square3Stack3DIcon className="w-5 h-5 text-neural-purple hover:text-tech-lavender" />
                      </button>
                      <button onClick={shuffleCards} aria-label="Shuffle cards">
                        <ArrowPathIcon className="w-5 h-5 text-neural-purple hover:text-tech-lavender" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* ─── Progress Bar ───────────────────────────────────────── */}
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-full bg-neural-purple rounded-full transition-all duration-300"
                    style={{
                      width: `${((currentCard + 1) / flashcards.length) * 100}%`
                    }}
                  />
                </div>
              </div>


              {/* Flashcard */}
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
                    {/* Front */}
                    <div className="col-start-1 row-start-1 backface-hidden bg-white rounded-xl shadow-lg p-8 flex flex-col justify-center items-center">
  <h2 className="text-xl font-bold text-gray-800 mb-6">
    {flashcards[currentCard].question}
  </h2>
  <div className="mt-6 grid grid-cols-2 gap-4 w-full">
    {(['A','B','C','D'] as const).map(letter => {
    const card = flashcards[currentCard];
    if (!card) return null;

    // look up the option text however you already do...
    const lowerKey = `option_${letter.toLowerCase()}` as any;
    const upperKey = `option_${letter}` as any;
    const text = (card as any)[lowerKey] ?? (card as any)[upperKey] ?? '';

    const isSel = selectedAnswer === letter;
    return (
      <button
        key={letter}
        onClick={() => handleAnswerSelect(letter)}
        disabled={isFlipping || selectedAnswer !== null}
        className={`
          w-full text-left px-4 py-2 border rounded-lg transition-all duration-200
          ${isSel
            ? 'border-neural-purple bg-neural-purple/10 text-neural-purple'
            : 'border-gray-300 bg-white text-gray-800 hover:border-neural-purple'}
        `}
      >
        {text}
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


                    {/* Back */}
                    <div className="col-start-1 row-start-1 backface-hidden rotate-x-180 bg-white rounded-xl shadow-lg p-8 flex flex-col justify-center items-center">
                      <h2 className="text-xl font-bold text-gray-800 mb-6">
                        {flashcards[currentCard].question}
                      </h2>
                      {showBack && (
                        <>
                          <p className="text-sm text-gray-500">Answer:</p>
                          <p className="text-2xl font-bold text-growth-green text-center">
                            {(() => {
                             const card = flashcards[currentCard];
                             const ans  = card.answer?.toUpperCase() || '';
                             // build the key dynamically (lowercase lookup)
                             const lowerKey = `option_${ans.toLowerCase()}` as
                               'option_a'|'option_b'|'option_c'|'option_d';
                             // fallback in case your props are uppercase
                             const upperKey = `option_${ans}` as
                               'option_A'|'option_B'|'option_C'|'option_D';
                             const text = (card as any)[lowerKey] ?? (card as any)[upperKey] ?? 'No answer';
                             return text;
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
                    onClick={() => setShowScoreSummary(true)}
                    className="transition-colors hover:text-red-500"
                  >
                    End Session
                  </button>
                <div className="flex space-x-4">
                  <button
                    onClick={previousCard}
                    disabled={currentCard===0 || isFlipping}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:border-neural-purple disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <ArrowLeftIcon className="w-5 h-5" /><span>Previous</span>
                  </button>
                  <button
                    onClick={nextCard}
                    disabled={currentCard===flashcards.length-1 || isFlipping}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:border-neural-purple disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <span>Next</span><ArrowRightIcon className="w-5 h-5" />
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
              <Square3Stack3DIcon className="w-7 h-7 text-neural-purple mr-2" />
              Score Summary
            </h2>
            <div className="mb-6">
              <div className="relative h-4 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-growth-green"
                  style={{
                    width: `${
                      correctAnswers + incorrectAnswers > 0
                        ? (correctAnswers / (correctAnswers + incorrectAnswers)) * 100
                        : 0
                    }%`
                  }}
                />
              </div>
              <div className="mt-2 text-right">
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-gray-500 text-sm">Total</p>
                <p className="font-bold text-xl text-gray-900">
                  {correctAnswers + incorrectAnswers}
                </p>
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
              {/* <<< NEW: record and then exit >>> */}
              <button
                onClick={handleEndSession}
                disabled={hasReturned}
                className="
                  px-4 py-2
                  bg-red-500 text-white
                  rounded-lg
                  hover:bg-red-600
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors
                "
              >
                End Session
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
