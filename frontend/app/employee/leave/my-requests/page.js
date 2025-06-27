'use client';
import { useEffect, useState } from 'react';
import api from '@/utils/axios';
import { useAuth } from '@/context/AuthProvider';
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  CalendarDays
} from 'lucide-react';

export default function MyLeaveRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { authToken } = useAuth(); // ✅ Use authToken from context

  useEffect(() => {
    if (!authToken) return;

    const fetchRequests = async () => {
      setLoading(true);
      try {
        const res = await api.get('/leave/my', {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        setRequests(res.data.requests);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch leave requests');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [authToken]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
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

  const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <CalendarDays className="w-8 h-8 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">My Leave Requests</h1>
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
          <p className="text-gray-500">No leave requests found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-600 text-sm">
                  <th className="p-4 font-medium">Leave Type</th>
                  <th className="p-4 font-medium">Period</th>
                  <th className="p-4 font-medium text-right">Days</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {requests.map((req) => (
                  <tr key={req._id} className="hover:bg-gray-50 transition">
                    <td className="p-4 font-medium text-gray-800">
                      {req.policy?.leaveType?.typeName || 'N/A'}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span>{formatDate(req.startDate)}</span>
                        <span className="text-xs text-gray-500">to</span>
                        <span>{formatDate(req.endDate)}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      {calculateDays(req.startDate, req.endDate)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(req.status)}
                        <span className={`capitalize font-medium ${
                          req.status === 'approved' ? 'text-green-600' :
                          req.status === 'rejected' ? 'text-red-600' :
                          'text-yellow-600'
                        }`}>
                          {req.status}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-700">
                      <p className="line-clamp-2">{req.reason}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}