import React, { useState } from 'react';
import {
  XMarkIcon,
  BugAntIcon,
  PaperClipIcon,
  VideoCameraIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { supabase } from '../lib/supabase';

interface BugReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

interface BugEntry {
  title: string;
  description: string;
  screenshotFile: File | null;
  videoFile: File | null;
}

const BugReportModal: React.FC<BugReportModalProps> = ({ isOpen, onClose, userId }) => {
  const [entries, setEntries] = useState<BugEntry[]>([
    { title: '', description: '', screenshotFile: null, videoFile: null }
  ]);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  if (!isOpen && !showSuccessModal) return null;

  const handleEntryChange = (index: number, key: keyof BugEntry, value: any) => {
    const updated = [...entries];
    updated[index][key] = value;
    setEntries(updated);
  };

  const handleAddEntry = () => {
    if (entries.length >= 5) return;
    setEntries([...entries, { title: '', description: '', screenshotFile: null, videoFile: null }]);
  };

  const handleRemoveEntry = (index: number) => {
    const updated = entries.filter((_, i) => i !== index);
    setEntries(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!userId || userId.trim() === '') {
      alert('You must be logged in to submit a bug report.');
      setLoading(false);
      return;
    }

    try {
      for (const entry of entries) {
        let screenshotUrl = '';
        let videoUrl = '';

        if (entry.screenshotFile) {
          const { data, error } = await supabase.storage
            .from('bug-screenshots')
            .upload(
              `screenshots/${userId}-${Date.now()}-${entry.screenshotFile.name}`,
              entry.screenshotFile
            );
          if (error) throw error;
          const { data: urlData } = supabase.storage.from('bug-screenshots').getPublicUrl(data.path);
          screenshotUrl = urlData.publicUrl;
        }

        if (entry.videoFile) {
          const { data, error } = await supabase.storage
            .from('bug-videos')
            .upload(
              `videos/${userId}-${Date.now()}-${entry.videoFile.name}`,
              entry.videoFile
            );
          if (error) throw error;
          const { data: urlData } = supabase.storage.from('bug-videos').getPublicUrl(data.path);
          videoUrl = urlData.publicUrl;
        }

        const { error: insertError } = await supabase.from('bug_reports').insert({
          user_id: userId,
          title: entry.title,
          description: entry.description,
          screenshot_url: screenshotUrl,
          video_url: videoUrl,
        });

        if (insertError) throw insertError;
      }

      setShowSuccessModal(true);
    } catch (err: any) {
      alert(`Error submitting bug: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEntries([{ title: '', description: '', screenshotFile: null, videoFile: null }]);
    setShowSuccessModal(false);
    onClose();
  };

  return (
    <>
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white w-full max-w-sm p-6 rounded-xl text-center shadow-lg">
            <div className="flex justify-center mb-4">
              <svg className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold mb-1">Bug Reports Submitted</h2>
            <p className="text-sm text-gray-600 mb-4">
              Thank you for helping us make ExamGenie better.
            </p>
            <button onClick={resetForm} className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm">
              OK
            </button>
          </div>
        </div>
      )}

      {isOpen && !showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
            <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 rounded-xl shadow-lg relative">
            <button onClick={resetForm} className="absolute top-4 right-4 text-gray-400 hover:text-black">
              <XMarkIcon className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 mb-4">
              <BugAntIcon className="w-6 h-6 text-purple-600" />
              <h2 className="text-lg font-semibold">Submit Bug Reports</h2>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {entries.map((entry, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4 relative">
                  {entries.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveEntry(index)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                      title="Remove"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                  <div>
                    <label className="block text-sm font-medium">Bug Title</label>
                    <input
                      value={entry.title}
                      onChange={(e) => handleEntryChange(index, 'title', e.target.value)}
                      required
                      className="w-full mt-1 border rounded-md p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Description</label>
                    <textarea
                      value={entry.description}
                      onChange={(e) => handleEntryChange(index, 'description', e.target.value)}
                      rows={3}
                      required
                      className="w-full mt-1 border rounded-md p-2"
                    />
                  </div>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-purple-600 hover:text-purple-800">
                      <PaperClipIcon className="w-5 h-5" />
                      <span className="text-sm">Screenshot</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleEntryChange(index, 'screenshotFile', e.target.files?.[0] || null)}
                        className="hidden"
                      />
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-purple-600 hover:text-purple-800">
                      <VideoCameraIcon className="w-5 h-5" />
                      <span className="text-sm">Video</span>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => handleEntryChange(index, 'videoFile', e.target.files?.[0] || null)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              ))}

              {entries.length < 5 && (
                <button
                  type="button"
                  onClick={handleAddEntry}
                  className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-800"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add Another Report
                </button>
              )}

              <div className="flex justify-end pt-4 space-x-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border rounded-md text-sm text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700"
                >
                  {loading ? 'Submitting...' : 'Submit All'}
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
