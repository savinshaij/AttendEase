'use client';
import { useState } from 'react';
import api from '@/utils/axios';
import { Send, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);

  const { authToken } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!authToken) return 

    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      await api.post(
        '/feedback/submit',
        {
          message: feedback,
          writing: '', // Required field, keep if necessary
        },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      setMessage({
        text: 'Thank you! Your feedback has been submitted successfully.',
        type: 'success',
      });
      setFeedback('');
      setCharacterCount(0);
    } catch (err) {
      setMessage({
        text:
          err.response?.data?.message || 'Failed to submit feedback. Please try again.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackChange = (e) => {
    const value = e.target.value;
    setFeedback(value);
    setCharacterCount(value.length);
    if (message.text) setMessage({ text: '', type: '' });
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Share Your Feedback</h1>
        <p className="text-gray-600">We value your input to help us improve our services.</p>
      </div>

      {message.text && (
        <div className={`p-4 mb-6 rounded-md flex items-start gap-3 ${
          message.type === 'error' 
            ? 'bg-red-50 text-red-700' 
            : 'bg-green-50 text-green-700'
        }`}>
          {message.type === 'error' ? (
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
          )}
          <p className="text-sm">{message.text}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-1">
            Your Feedback
          </label>
          <textarea
            id="feedback"
            rows={6}
            placeholder="What suggestions or issues would you like to share with us?"
            value={feedback}
            onChange={handleFeedbackChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            maxLength={1000}
          />
          <div className="flex justify-between mt-1">
            <p className="text-xs text-gray-500">
              {characterCount}/1000 characters
            </p>
            {characterCount === 1000 && (
              <p className="text-xs text-red-500">Maximum length reached</p>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || !feedback.trim()}
            className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${
              loading || !feedback.trim()
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit Feedback
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Feedback Guidelines</h3>
        <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
          <li>Be specific about your experience or suggestion</li>
          <li>Keep your feedback constructive and professional</li>
          <li>Include relevant details that might help us understand</li>
          <li>Maximum 1000 characters</li>
        </ul>
      </div>
    </div>
  );
}