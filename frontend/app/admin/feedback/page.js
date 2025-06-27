'use client';
import { useEffect, useState } from 'react';
import api from '@/utils/axios';
import { MessageSquare, User, Mail, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(true);
  const { authToken } = useAuth();

  useEffect(() => {
    if (!authToken) return;

    const fetchFeedbacks = async () => {
      try {
        const res = await api.get('/feedback/all', {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        setFeedbacks(res.data.feedbacks);
        setMessage({ text: '', type: '' });
      } catch (err) {
        setMessage({ 
          text: err.response?.data?.message || 'Failed to load feedback', 
          type: 'error' 
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, [authToken]);




  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#14121f]">Employee Feedback</h1>
        <p className="text-[#666]">Review feedback submitted by your team</p>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          <div className="flex items-center">
            {message.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-2" />
            )}
            <span>{message.text}</span>
          </div>
        </div>
      )}

      {/* Feedback List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="border border-[#e0e0e0] rounded-lg p-8 text-center bg-white">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No feedback yet</h3>
          <p className="mt-1 text-sm text-gray-500">Employee feedback will appear here when submitted.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {feedbacks.map((fb) => (
            <div key={fb._id} className="border border-[#e0e0e0] rounded-lg p-6 bg-white">
              <div className="flex items-start">
                <div className="flex-shrink-0 p-3 rounded-lg bg-blue-100 text-blue-600 mr-4">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-2">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-500 mr-1.5" />
                      <span className="text-sm font-medium text-gray-900">
                        {fb.employee?.name || 'Anonymous'}
                      </span>
                    </div>
                    <div className="flex items-center mt-1 sm:mt-0 text-xs text-gray-500">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      <span>{new Date(fb.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-3">{fb.message}</p>
                  
                  {fb.writing && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Additional Note:</p>
                      <p className="text-sm text-gray-600 italic">{fb.writing}</p>
                    </div>
                  )}
                  
                  {fb.employee?.email && (
                    <div className="mt-3 flex items-center text-xs text-gray-500">
                      <Mail className="h-3.5 w-3.5 mr-1.5" />
                      <span>{fb.employee.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}