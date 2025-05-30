import React, { useState } from 'react';
import { XMarkIcon, SparklesIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { supabase } from '../lib/supabase';

interface RequestFeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

const RequestFeatureModal: React.FC<RequestFeatureModalProps> = ({
  isOpen,
  onClose,
  userId,
}) => {
  const [featureText, setFeatureText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  if (!isOpen && !showSuccessModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { error } = await supabase.from('feature_requests').insert({
        user_id: userId,
        request_text: featureText,
      });

      if (error) throw error;

      setFeatureText('');
      setShowSuccessModal(true);
    } catch (error: any) {
      alert('Error submitting request: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    onClose();
  };

  return (
    <>
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white w-full max-w-sm p-6 rounded-xl text-center shadow-lg">
            <div className="flex justify-center mb-4">
              <CheckCircleIcon className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-lg font-semibold mb-1">Feature Request Sent</h2>
            <p className="text-sm text-gray-600 mb-4">
              Your feature suggestion has been submitted successfully!
            </p>
            <button
              onClick={handleSuccessClose}
              className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Request Feature Form */}
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
              <SparklesIcon className="w-6 h-6 text-purple-500" />
              <h2 className="text-lg font-semibold">Request a Feature</h2>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <textarea
                value={featureText}
                onChange={(e) => setFeatureText(e.target.value)}
                required
                rows={4}
                placeholder="Describe the feature you'd love to see..."
                className="w-full mt-1 border rounded-md p-2"
              />

              <div className="flex justify-end pt-2 space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border rounded-md text-sm text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default RequestFeatureModal;
