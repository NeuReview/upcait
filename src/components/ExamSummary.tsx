import React, { useState } from 'react';
import { TrophyIcon, ClockIcon, SparklesIcon, ChartBarIcon, BookOpenIcon, AcademicCapIcon, ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ReviewItem {
  question_id: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correctAnswer: string;
  userAnswer: string | null;
  explanation: string;
  category: string;
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

const getScoreCategory = (percentage: number) => {
  if (percentage >= 90) return { label: 'Outstanding!', color: 'text-growth-green', message: "Exceptional performance! You're well-prepared for the UPCAT." };
  if (percentage >= 80) return { label: 'Excellent!', color: 'text-neural-purple', message: 'Great work! Keep up this level of performance.' };
  if (percentage >= 70) return { label: 'Good Job!', color: 'text-tech-lavender', message: 'Solid performance. Focus on the areas where you can improve.' };
  if (percentage >= 60) return { label: 'Keep Going!', color: 'text-energy-orange', message: "You're making progress. Let's work on strengthening your knowledge." };
  return { label: 'Room to Grow', color: 'text-alert-red', message: "Don't worry! Every attempt helps you learn and improve." };
};

const ExamSummary = ({ score, onRetry }: { score: ExamScore; onRetry: () => Promise<void>; }) => {
  const scoreCategory = getScoreCategory(score.percentage);
  const minutes = Math.floor(score.timeSpent / 60);
  const seconds = score.timeSpent % 60;
  const [selectedQuestion, setSelectedQuestion] = useState<ReviewItem | null>(null);
  const [showModal, setShowModal] = useState(false);

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
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category} className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">{category}</h4>
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
          </div>
        ))}
      </div>

      {/* Summary Content */}
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
              Try questions from different categories to maintain a balanced preparation
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

      {/* Modal */}
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

export default ExamSummary;
