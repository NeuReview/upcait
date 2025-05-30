import React, { useEffect, useState } from 'react';
import {
  NewspaperIcon,
  WrenchScrewdriverIcon,
  BugAntIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import BugReportModal from './BugReportModal';
import RequestFeatureModal from './RequestFeatureModal';
import { supabase } from '../lib/supabase';

interface FeedbackTriggerButtonProps {
  isVisible: boolean;
}

const FeedbackTriggerButton: React.FC<FeedbackTriggerButtonProps> = ({ isVisible }) => {
  const [userId, setUserId] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [isBugModalOpen, setIsBugModalOpen] = useState(false);
  const [isFeatureModalOpen, setIsFeatureModalOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);

  // Fetch logged-in user
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) {
        setUserId(data.user.id);
      }
    };

    fetchUser();
  }, []);

  // Auto-hide tooltip after 60 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowTooltip(false), 60000);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <>
      <div className="fixed bottom-20 right-4 z-50 flex flex-col items-end space-y-2">
        {/* Tooltip */}
        {showTooltip && (
          <div className="relative animate-fade-in" aria-label="Feedback Tooltip" role="tooltip">
            <div className="absolute bottom-full right-0 translate-y-[-8px] bg-white text-gray-800 text-sm px-4 py-2 rounded-lg shadow-lg border border-gray-200 whitespace-nowrap">
              <div className="flex justify-between items-start gap-2">
                <span className="leading-snug">
                  To report a bug or give feedback
                </span>
                <button
                  onClick={() => setShowTooltip(false)}
                  className="text-gray-400 hover:text-gray-700 ml-2"
                  aria-label="Dismiss tooltip"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
              <div className="absolute bottom-[-6px] right-5 w-3 h-3 bg-white rotate-45 border-b border-r border-gray-200" />
            </div>
          </div>
        )}

        {/* Floating Options */}
        {showOptions && (
          <div className="space-y-2">
            <button
              onClick={() => {
                if (!userId) {
                  alert('You must be logged in to report a bug.');
                  return;
                }
                setShowOptions(false);
                setIsBugModalOpen(true);
              }}
              className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg shadow hover:bg-red-50 transition"
              aria-label="Report a bug"
            >
              <BugAntIcon className="h-5 w-5 text-red-500" />
              <span className="text-sm text-gray-800">Report a Bug</span>
            </button>

            <button
              onClick={() => {
                if (!userId) {
                  alert('You must be logged in to request a feature.');
                  return;
                }
                setShowOptions(false);
                setIsFeatureModalOpen(true);
              }}
              className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg shadow hover:bg-blue-50 transition"
              aria-label="Request a feature"
            >
              <WrenchScrewdriverIcon className="h-5 w-5 text-blue-500" />
              <span className="text-sm text-gray-800">Request Feature</span>
            </button>
          </div>
        )}

        {/* Floating Trigger Button */}
        <button
          onClick={() => {
            setShowTooltip(false);
            setShowOptions(!showOptions);
          }}

          aria-label="Open feedback options"
          title="Give Feedback"
          className="flex items-center justify-center bg-neural-purple text-white rounded-full p-3 shadow-md hover:bg-tech-lavender transition duration-200"
        >
          <NewspaperIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Modals */}
      <BugReportModal
        isOpen={isBugModalOpen}
        onClose={() => setIsBugModalOpen(false)}
        userId={userId}
      />

      <RequestFeatureModal
        isOpen={isFeatureModalOpen}
        onClose={() => setIsFeatureModalOpen(false)}
        userId={userId}
      />
    </>
  );
};

export default FeedbackTriggerButton;
