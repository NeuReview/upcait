import React, { useState } from 'react';
import { generateResponse } from '../lib/openai';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
}

const ChatbotTest = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await generateResponse(input);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        role: 'assistant'
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">AI Chat Test</h2>
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="text-sm text-neural-purple hover:text-tech-lavender"
          >
            {showDebug ? 'Hide Debug' : 'Show Debug'}
          </button>
        </div>

        {/* Debug Info */}
        {showDebug && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-2 font-mono text-sm">
            <div>
              <span className="text-gray-500">Loading: </span>
              <span className={isLoading ? 'text-energy-orange' : 'text-growth-green'}>
                {isLoading.toString()}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Error: </span>
              <span className="text-alert-red">
                {error ? error.message : 'null'}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Messages: </span>
              <span>{messages.length}</span>
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div className="space-y-4 mb-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`p-4 rounded-lg ${
                message.role === 'user'
                  ? 'bg-neural-purple/10 ml-12'
                  : 'bg-gray-100 mr-12'
              }`}
            >
              <div className="flex items-center mb-2">
                <span className="text-sm font-medium">
                  {message.role === 'user' ? 'You' : 'AI'}
                </span>
                <span className="text-xs text-gray-500 ml-2">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
              <p className="text-gray-800 whitespace-pre-wrap">{message.content}</p>
            </div>
          ))}
          {isLoading && (
            <div className="flex space-x-2 items-center p-4 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-neural-purple rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-neural-purple rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="w-2 h-2 bg-neural-purple rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex space-x-4">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a test message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-neural-purple focus:border-neural-purple"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-6 py-2 bg-neural-purple text-white rounded-lg hover:bg-tech-lavender transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </form>

        {/* Test Actions */}
        <div className="mt-6 space-y-2">
          <h3 className="text-sm font-medium text-gray-700">Test Messages:</h3>
          <div className="flex flex-wrap gap-2">
            {[
              'Tell me about UPCAT',
              'How do I prepare for Math?',
              'What topics are covered?',
              'Give me study tips'
            ].map((msg) => (
              <button
                key={msg}
                onClick={() => setInput(msg)}
                className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-neural-purple/10 hover:text-neural-purple transition-colors duration-200"
              >
                {msg}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotTest;