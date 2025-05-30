import React, { useState } from 'react';
import {
  XMarkIcon,
  BugAntIcon,
  PaperClipIcon,
  VideoCameraIcon,
} from '@heroicons/react/24/outline';
import { supabase } from '../lib/supabase';

interface BugReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

const BugReportModal: React.FC<BugReportModalProps> = ({
  isOpen,
  onClose,
  userId,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  if (!isOpen && !showSuccessModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let screenshotUrl = '';
      let videoUrl = '';

      // Upload screenshot
      if (screenshotFile) {
        const { data, error } = await supabase.storage
          .from('bug-screenshots')
          .upload(
            `screenshots/${userId}-${Date.now()}-${screenshotFile.name}`,
            screenshotFile,
            {
              cacheControl: '3600',
              upsert: false,
              contentType: screenshotFile.type,
            }
          );
        if (error) throw error;

        const { data: publicUrlData } = supabase.storage
          .from('bug-screenshots')
          .getPublicUrl(data.path);
        screenshotUrl = publicUrlData.publicUrl;
      }

      // Upload video
      if (videoFile) {
        const { data, error } = await supabase.storage
          .from('bug-videos')
          .upload(
            `videos/${userId}-${Date.now()}-${videoFile.name}`,
            videoFile
          );

        if (error) throw error;

        const { data: publicUrlData } = supabase.storage
          .from('bug-videos')
          .getPublicUrl(data.path);
        videoUrl = publicUrlData.publicUrl;
      }

      // Insert bug report
      const { error: insertError } = await supabase.from('bug_reports').insert({
        user_id: userId,
        title,
        description,
        screenshot_url: screenshotUrl,
        video_url: videoUrl,
      });

      console.log('Submitting bug report for userId:', userId);

      if (insertError) throw insertError;

      // Clear form and show success modal
      setTitle('');
      setDescription('');
      setScreenshotFile(null);
      setVideoFile(null);
      setShowSuccessModal(true);
    } catch (err: any) {
      alert(`Error submitting bug: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white w-full max-w-sm p-6 rounded-xl text-center shadow-lg">
            <div className="flex justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold mb-1">Bug Report Submitted</h2>
            <p className="text-sm text-gray-600 mb-4">
              Thank you for helping us make ExamGenie better.
            </p>
            <button
              onClick={() => {
                setShowSuccessModal(false);
                onClose();
              }}
              className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Bug Report Modal */}
      {isOpen && !showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white w-full max-w-lg p-6 rounded-xl shadow-lg relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-black"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 mb-4">
              <BugAntIcon className="w-6 h-6 text-purple-600" />
              <h2 className="text-lg font-semibold">Bug Report</h2>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium">Screenshot (optional)</label>
                <div className="mt-1 flex items-center space-x-2">
                  <PaperClipIcon className="w-5 h-5 text-gray-400" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setScreenshotFile(e.target.files?.[0] || null)
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium">Video (optional)</label>
                <div className="mt-1 flex items-center space-x-2">
                  <VideoCameraIcon className="w-5 h-5 text-gray-400" />
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) =>
                      setVideoFile(e.target.files?.[0] || null)
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium">Bug Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Summarize the issue..."
                  className="w-full mt-1 border rounded-md p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Description: (Describe how to reproduce the bug)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={4}
                  placeholder="Describe the bug, steps to reproduce the bug..."
                  className="w-full mt-1 border rounded-md p-2"
                />
              </div>

              <div className="flex justify-end pt-4 space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border rounded-md text-sm text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700"
                >
                  {loading ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default BugReportModal;
