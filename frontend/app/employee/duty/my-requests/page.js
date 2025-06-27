'use client';
import { useState, useEffect } from 'react';
import api from '@/utils/axios';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthProvider';
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  CalendarDays,
  User
} from 'lucide-react';

export default function MyDutyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const { authToken } = useAuth();

  useEffect(() => {
    if (!authToken) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const res = await api.get('/duty/my-requests', {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setRequests(res.data.requests);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load duty requests');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authToken, router]);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

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
        <CalendarDays className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Duty Requests</h1>
          <p className="text-gray-600">Review your submitted duty handover requests</p>
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
          <p className="text-gray-500">No duty requests found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
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
                        To: <span className="font-medium text-gray-700">{req.toEmployee?.name || 'Unknown'}</span>
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

              {req.reason && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-gray-700">Note:</span> {req.reason}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}