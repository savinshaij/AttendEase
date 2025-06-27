'use client';

import { useEffect, useState } from 'react';
import api from '@/utils/axios';
import { Loader2, AlertCircle, CircleDollarSign } from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';

export default function LeaveBalancePage() {
  const [balances, setBalances] = useState([]);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(true);

  const { authToken } = useAuth();

  useEffect(() => {
    if (!authToken) return;

    const fetchBalances = async () => {
      setLoading(true);
      try {
        const res = await api.get('/leave/balance/me', {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setBalances(res.data.balances);
      } catch (err) {
        console.error('Failed to fetch leave balances:', err);
        setMessage({
          text: err.response?.data?.message || 'Failed to fetch leave balances',
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBalances();
  }, [authToken]);

  const getPercentage = (remaining, total) => {
    if (total <= 0) return 0;
    return Math.round((remaining / total) * 100);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <CircleDollarSign className="w-8 h-8 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-800">My Leave Balances</h1>
      </div>

      {message.text && (
        <div className={`flex items-center gap-2 p-3 mb-6 rounded-md ${
          message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
        }`}>
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm">{message.text}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : balances.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-500">No leave balances available</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-600 text-sm">
                  <th className="p-4 font-medium">Leave Type</th>
                  <th className="p-4 font-medium text-right">Total Days</th>
                  <th className="p-4 font-medium text-right">Remaining</th>
                  <th className="p-4 w-48">Usage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {balances.map((bal) => {
                  const percentage = getPercentage(bal.remainingBalance, bal.totalBalance);
                  return (
                    <tr key={bal._id} className="hover:bg-gray-50 transition">
                      <td className="p-4 font-medium text-gray-800">
                        {bal.policy.leaveType?.typeName || 'General Leave'}
                      </td>
                      <td className="p-4 text-right">{bal.totalBalance}</td>
                      <td className="p-4 text-right font-semibold">
                        {bal.remainingBalance}
                      </td>
                      <td className="p-4">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className={`h-2.5 rounded-full ${
                              percentage < 30
                                ? 'bg-red-500'
                                : percentage < 70
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {percentage}% remaining
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
