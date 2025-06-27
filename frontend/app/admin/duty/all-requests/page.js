'use client';
import { useEffect, useState } from 'react';
import api from '@/utils/axios';
import { useAuth } from '@/context/AuthProvider';
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  User,
  CalendarDays,
  ClipboardList
} from 'lucide-react';

export default function AllDutyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const { authToken } = useAuth();

  useEffect(() => {
    if (!authToken) return;

    const fetchData = async () => {
      try {
        const res = await api.get('/duty/all', {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        setRequests(res.data.requests || []);
      } catch (err) {
        setMessage({
          text: err.response?.data?.message || 'Failed to load requests',
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authToken]);

  const handleStatusChange = async (id, status) => {
    setActionLoading(true);
    try {
      const res = await api.put(
        `/duty/${id}/status`,
        { status },
        {
          headers: { Authorization: `Bearer ${authToken}` }
        }
      );
      setRequests(prev =>
        prev.map(req => (req._id === id ? res.data.request : req))
      );
      setMessage({
        text: `Request ${status} successfully`,
        type: 'success'
      });
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Failed to update status',
        type: 'error'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
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
    <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-8">
        <ClipboardList className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Duty Requests</h1>
          <p className="text-gray-600">Review and manage all duty handover requests</p>
        </div>
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

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-500">No duty requests found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req._id} className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <ClipboardList className="w-5 h-5 text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {req.task?.title || 'Untitled Task'}
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-start gap-2">
                      <User className="w-4 h-4 mt-0.5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-700">From</p>
                        <p>{req.employee?.name || 'Unknown'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <User className="w-4 h-4 mt-0.5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-700">To</p>
                        <p>{req.toEmployee?.name || 'Unknown'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CalendarDays className="w-4 h-4 mt-0.5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-700">Start</p>
                        <p>{formatDate(req.fromDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CalendarDays className="w-4 h-4 mt-0.5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-700">End</p>
                        <p>{formatDate(req.toDate)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(req.status)}
                    <span className={`capitalize font-medium ${
                      req.status === 'approved'
                        ? 'text-green-600'
                        : req.status === 'rejected'
                        ? 'text-red-600'
                        : 'text-yellow-600'
                    }`}>
                      {req.status}
                    </span>
                  </div>

                  {req.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStatusChange(req._id, 'approved')}
                        disabled={actionLoading}
                        className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md ${
                          actionLoading
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        {actionLoading ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            Approve
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleStatusChange(req._id, 'rejected')}
                        disabled={actionLoading}
                        className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md ${
                          actionLoading
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-red-600 text-white hover:bg-red-700'
                        }`}
                      >
                        {actionLoading ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" />
                            Reject
                          </>
                        )}
                      </button>
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