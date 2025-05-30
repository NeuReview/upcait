import React, { useState, useRef, useEffect } from 'react';
import { ChatBubbleLeftIcon, XMarkIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { generateResponse } from '../lib/openai';
import FeedbackTriggerButton from './Feedback';



interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
  isError?: boolean;
}

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hi! I'm your UPCAT AI assistant. How can I help you today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      text: input.trim(),
      isUser: true,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await generateResponse(input.trim());
      
      const aiMessage: Message = {
        text: response,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setRetryCount(0);
    } catch (error) {
      console.error('Error getting response:', error);
      
      if (retryCount < 3) {
        const errorMessage: Message = {
          text: "I'm having trouble responding. Would you like to try again?",
          isUser: false,
          timestamp: new Date(),
          isError: true
        };
        setMessages(prev => [...prev, errorMessage]);
        setRetryCount(prev => prev + 1);
      } else {
        const fallbackMessage: Message = {
          text: "I'm currently experiencing high demand. Please try again in a few moments.",
          isUser: false,
          timestamp: new Date(),
          isError: true
        };
        setMessages(prev => [...prev, fallbackMessage]);
      }
    } finally {
      setIsTyping(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (

    <>
    <FeedbackTriggerButton isVisible={!isOpen} />
    
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${
          isOpen ? 'hidden' : 'flex'
        } items-center space-x-2 bg-neural-purple text-white px-4 py-2 rounded-full shadow-lg hover:bg-tech-lavender transition-colors duration-200`}
      >
        <ChatBubbleLeftIcon className="h-6 w-6" />
        <span>Chat with AI</span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-lg shadow-xl w-96 h-[500px] flex flex-col">
          {/* Header */}
          <div className="bg-neural-purple text-white p-4 rounded-t-lg flex justify-between items-center">
            <div>
              <h3 className="font-semibold">UPCAT AI Assistant</h3>
              <p className="text-xs text-white/80">Powered by GPT-4</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.isUser
                      ? 'bg-neural-purple text-white'
                      : message.isError
                        ? 'bg-alert-red/10 text-alert-red border border-alert-red/20'
                        : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  <p className={`text-xs mt-1 ${
                    message.isUser ? 'text-white/70' : 'text-gray-500'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-neural-purple focus:border-neural-purple"
                disabled={isTyping || retryCount >= 3}
              />
              <button
                type="submit"
                disabled={isTyping || !input.trim() || retryCount >= 3}
                className="bg-neural-purple text-white p-2 rounded-lg hover:bg-tech-lavender transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
              </button>
            </div>
            {retryCount >= 3 && (
              <p className="mt-2 text-xs text-alert-red">
                Service is temporarily unavailable. Please try again later.
              </p>
            )}
          </form>
        </div>
      )}
    </div>
    </>
  );
};

export default Chatbot;