'use client';
import { useEffect, useState } from 'react';
import api from '@/utils/axios';
import { useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, Clock, AlertCircle, Loader2, CalendarDays, User, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';
export default function LeaveApprovalPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const { authToken } = useAuth();
  useEffect(() => {


    const fetchRequests = async () => {
      try {
        const res = await api.get('/leave/all', {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        setRequests(res.data || []);
      } catch (err) {
        setMessage({
          text: err.response?.data?.message || 'Failed to load leave requests',
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [authToken]);

  const updateStatus = async (id, status) => {
    setActionLoading(true);
    try {
      const res = await api.put(
        `/leave/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${authToken}` } } 
      );
      setRequests(prev => prev.map(r => (r._id === id ? res.data.leave : r)));
      setMessage({
        text: `Leave request ${status} successfully`,
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
    return new Date(dateString).toLocaleDateString('en-US', {
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
    <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-8">
        <CalendarDays className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave Approvals</h1>
          <p className="text-gray-600">Review and manage team leave requests</p>
        </div>
      </div>

      {message.text && (
        <div className={`p-4 mb-6 rounded-md flex items-start gap-3 ${message.type === 'error'
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
          <p className="text-gray-500">No pending leave requests</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-600 text-sm">
                  <th className="px-6 py-3 font-medium">Employee</th>
                  <th className="px-6 py-3 font-medium">Leave Type</th>
                  <th className="px-6 py-3 font-medium">Period</th>
                  <th className="px-6 py-3 font-medium">Reason</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {requests.map(req => (
                  <tr key={req._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        {req.employee?.name || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {req.policy?.leaveType?.typeName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      <div className="flex flex-col">
                        <span>{formatDate(req.startDate)}</span>
                        <span className="text-xs text-gray-500">to</span>
                        <span>{formatDate(req.endDate)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700 max-w-xs">
                      <p className="line-clamp-2">{req.reason}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(req.status)}
                        <span className={`capitalize font-medium ${req.status === 'approved'
                            ? 'text-green-600'
                            : req.status === 'rejected'
                              ? 'text-red-600'
                              : 'text-yellow-600'
                          }`}>
                          {req.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {req.status === 'pending' && (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => updateStatus(req._id, 'approved')}
                            disabled={actionLoading}
                            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md ${actionLoading
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
                            onClick={() => updateStatus(req._id, 'rejected')}
                            disabled={actionLoading}
                            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md ${actionLoading
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