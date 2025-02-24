import React, { useEffect, useState } from 'react';
import { supabase, testConnection, type ConnectionTestResult, type CategoryStats } from '../lib/supabase';
import type { Question } from '../types/quiz';
import { CheckCircleIcon, XCircleIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const SupabaseTest = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<ConnectionTestResult[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    async function runTests() {
      try {
        setLoading(true);
        const results = await testConnection();
        setTestResults(results);

        // If all tests passed, fetch some sample questions
        if (results.every(r => r.success)) {
          const { data, error: fetchError } = await supabase
            .from('question_bank')
            .select('*')
            .limit(5);

          if (fetchError) throw fetchError;
          setQuestions(data || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    runTests();
  }, []);

  const isConnected = testResults.every(r => r.success);
  const diagnostics = testResults.find(r => r.step === 'Diagnostic Check')?.details?.diagnostics;
  const totalQuestions = diagnostics?.totalQuestions || 0;

  if (loading) {
    return (
      <div className="p-4 rounded-lg border">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <div className={`p-4 rounded-lg ${
        error 
          ? 'bg-alert-red/5 border-alert-red' 
          : isConnected 
            ? 'bg-growth-green/5 border-growth-green' 
            : 'bg-gray-100 border-gray-200'
      } border`}>
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-semibold mb-2">Database Connection Status</h2>
            <div className="space-y-2">
              <p className={`flex items-center ${
                error 
                  ? 'text-alert-red' 
                  : isConnected 
                    ? 'text-growth-green' 
                    : 'text-gray-500'
              }`}>
                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                  error 
                    ? 'bg-alert-red' 
                    : isConnected 
                      ? 'bg-growth-green' 
                      : 'bg-gray-400'
                }`}></span>
                {error 
                  ? 'Connection Error' 
                  : isConnected 
                    ? 'Connected to Database' 
                    : 'Connection Failed'}
              </p>
              {isConnected && (
                <p className="text-sm text-gray-600">
                  Total questions available: {totalQuestions}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-neural-purple hover:text-tech-lavender"
          >
            {isExpanded ? 'Hide Details' : 'Show Details'}
          </button>
        </div>

        {/* Category Statistics */}
        {isExpanded && diagnostics && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Question Distribution</h3>
            <div className="grid gap-4">
              {diagnostics.categoryStats.map((stat: CategoryStats) => (
                <div key={stat.category} className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{stat.category}</h4>
                    <span className="text-sm text-gray-500">Total: {stat.total}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-growth-green">Easy: {stat.easy}</span>
                      <span className="text-energy-orange">Medium: {stat.medium}</span>
                      <span className="text-alert-red">Hard: {stat.hard}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-growth-green" style={{ 
                        width: `${(stat.easy / stat.total) * 100}%`,
                        float: 'left'
                      }}></div>
                      <div className="h-full bg-energy-orange" style={{ 
                        width: `${(stat.medium / stat.total) * 100}%`,
                        float: 'left'
                      }}></div>
                      <div className="h-full bg-alert-red" style={{ 
                        width: `${(stat.hard / stat.total) * 100}%`,
                        float: 'left'
                      }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Data Issues */}
            {diagnostics.dataIssues.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Data Issues Found</h3>
                <div className="bg-alert-red/5 p-4 rounded-lg border border-alert-red/20">
                  <ul className="space-y-2">
                    {diagnostics.dataIssues.map((issue) => (
                      <li key={issue.question_id} className="text-sm text-alert-red">
                        Question ID {issue.question_id}: {issue.category} ({issue.difficulty_level})
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Test Results */}
        {isExpanded && (
          <div className="mt-4 space-y-3">
            {testResults.map((result, index) => (
              <div key={index} className="p-3 bg-white rounded border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {result.success ? (
                      <CheckCircleIcon className="w-5 h-5 text-growth-green" />
                    ) : (
                      <XCircleIcon className="w-5 h-5 text-alert-red" />
                    )}
                    <span className="font-medium">{result.step}</span>
                  </div>
                  <span className={`text-sm ${
                    result.success ? 'text-growth-green' : 'text-alert-red'
                  }`}>
                    {result.success ? 'Passed' : 'Failed'}
                  </span>
                </div>
                {result.details && (
                  <div className="mt-2 text-sm text-gray-600">
                    {result.details.message && (
                      <p className="text-alert-red">{result.details.message}</p>
                    )}
                    {result.details.hint && (
                      <p className="text-gray-500 mt-1">Hint: {result.details.hint}</p>
                    )}
                    {result.details.rowCount !== undefined && (
                      <p>Found {result.details.rowCount} questions</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sample Questions */}
      {isConnected && questions.length > 0 && (
        <>
          <h2 className="text-lg font-semibold">Sample Questions</h2>
          <div className="grid gap-4">
            {questions.map((question) => (
              <div key={question.question_id} className="p-4 rounded-lg border bg-white shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div className="space-y-1">
                    <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-neural-purple/10 text-neural-purple">
                      {question.category}
                    </span>
                    <span className="ml-2 inline-block px-2 py-1 text-xs font-medium rounded-full bg-tech-lavender/10 text-tech-lavender">
                      {question.difficulty_level}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">ID: {question.question_id}</span>
                </div>
                
                <p className="text-gray-900 font-medium mb-4">{question.question}</p>
                
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded bg-gray-50">
                      <span className="text-xs font-medium text-gray-500">A:</span>
                      <p className="text-sm">{question.option_a}</p>
                    </div>
                    <div className="p-2 rounded bg-gray-50">
                      <span className="text-xs font-medium text-gray-500">B:</span>
                      <p className="text-sm">{question.option_b}</p>
                    </div>
                    <div className="p-2 rounded bg-gray-50">
                      <span className="text-xs font-medium text-gray-500">C:</span>
                      <p className="text-sm">{question.option_c}</p>
                    </div>
                    <div className="p-2 rounded bg-gray-50">
                      <span className="text-xs font-medium text-gray-500">D:</span>
                      <p className="text-sm">{question.option_d}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-2 rounded bg-growth-green/5 border border-growth-green/10">
                    <div className="flex items-center mb-1">
                      <span className="text-xs font-medium text-growth-green">Correct Answer: {question.answer}</span>
                    </div>
                    <p className="text-sm text-gray-600">{question.explanation}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default SupabaseTest;