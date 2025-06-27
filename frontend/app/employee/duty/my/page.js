'use client';
import { useState, useEffect } from 'react';
import api from '@/utils/axios';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthProvider';
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  CalendarDays,
  User
} from 'lucide-react';

export default function AssignedToMePage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { authToken } = useAuth();

  useEffect(() => {
    if (!authToken) {
      
      return;
    }

    const fetchAssignedRequests = async () => {
      try {
        const res = await api.get('/duty/assigned-to-me', {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setRequests(res.data.requests);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load assigned duties');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedRequests();
  }, [authToken, router]);

  const handleResponse = async (id, status) => {
    setActionLoading(true);
    try {
      await api.put(
        `/duty/${id}/respond`,
        { status },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      setRequests((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status } : r))
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };



  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-8">
        <User className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Duties Assigned To Me</h1>
          <p className="text-gray-600">Review and respond to duty handover requests</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 mb-6 bg-red-50 text-red-700 rounded-md">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-500">No duty requests assigned to you</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(req => (
            <div
              key={req._id}
              className="bg-white p-5 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {req.task?.title || 'Untitled Task'}
                  </h3>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>
                        From: <span className="font-medium text-gray-700">{req.fromEmployee?.name || 'Unknown'}</span>
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-gray-400" />
                      <span>
                        {formatDate(req.fromDate)} → {formatDate(req.toDate)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                    req.status === 'approved'
                      ? 'bg-green-50 text-green-700'
                      : req.status === 'rejected'
                      ? 'bg-red-50 text-red-700'
                      : 'bg-yellow-50 text-yellow-700'
                  }`}>
                    {getStatusIcon(req.status)}
                    <span className="capitalize">{req.status}</span>
                  </div>
                </div>
              </div>

              {req.status === 'pending' && (
                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end gap-3">
                  <button
                    onClick={() => handleResponse(req._id, 'approved')}
                    disabled={actionLoading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium ${
                      actionLoading
                        ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {actionLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    Approve
                  </button>
                  <button
                    onClick={() => handleResponse(req._id, 'rejected')}
                    disabled={actionLoading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium ${
                      actionLoading
                        ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    {actionLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}