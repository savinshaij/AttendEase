'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/utils/axios';
import { useAuth } from '@/context/AuthProvider';
import {
  Clock, CheckCircle, X, XCircle, ChevronRight, LogIn, LogOut, History, Info,
  AlertCircle, Loader2, Calendar, Sun, Moon, Watch
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AttendancePage() {
  const [attendance, setAttendance] = useState([]);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [todayRecord, setTodayRecord] = useState(null);
  const [loadingInitialData, setLoadingInitialData] = useState(true);
  const [submittingAction, setSubmittingAction] = useState(false);
  const [activeTab, setActiveTab] = useState('today');

  const { authToken } = useAuth();

  useEffect(() => {
    if (!authToken) return;

    const fetchData = async () => {
      setLoadingInitialData(true);
      try {
        const res = await api.get('/attendance/me', {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setAttendance(res.data.records);
        const today = new Date().toDateString();
        const todayData = res.data.records.find(r =>
          new Date(r.date).toDateString() === today
        );
        setTodayRecord(todayData);
      } catch (err) {
        setMessage({ text: 'Failed to fetch attendance records', type: 'error' });
      } finally {
        setLoadingInitialData(false);
      }
    };

    fetchData();
  }, [authToken]);

  const handleAction = async (type) => {
    if (!authToken) {
      setMessage({ text: 'Auth token not found. Please log in.', type: 'error' });
      return;
    }

    setMessage({ text: '', type: '' });
    setSubmittingAction(true);

    try {
      const res = await api.post(`/attendance/${type}`, {}, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      setMessage({ text: res.data.message, type: 'success' });
      setTodayRecord(res.data.record);

      const refreshRes = await api.get('/attendance/me', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setAttendance(refreshRes.data.records);
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Action failed. Please try again.',
        type: 'error',
      });
    } finally {
      setSubmittingAction(false);
    }
  };

  const formatTime = useCallback((dateString) => {
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime())
        ? '--:--'
        : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return '--:--';
    }
  }, []);

  const formatDate = useCallback((dateString) => {
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime())
        ? 'Invalid Date'
        : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    } catch {
      return 'Invalid Date';
    }
  }, []);

  const calculateDuration = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return '--:--';
    try {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const diff = end - start;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m`;
    } catch {
      return '--:--';
    }
  };

  return (
    <div className="max-w-6xl px-4 py-8 mx-auto font-sans bg-gray-50 min-h-screen">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Attendance Dashboard</h1>
        <p className="text-gray-600 text-lg mt-2">
          Track your daily presence and working hours with ease
        </p>
      </div>

      <AnimatePresence>
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className={`relative rounded-lg p-4 mb-8 shadow-sm border ${
              message.type === 'error'
                ? 'bg-red-50 border-red-200'
                : 'bg-green-50 border-green-200'
            }`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {message.type === 'error' ? (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
              </div>
              <div className="ml-3">
                <p
                  className={`text-sm font-medium ${
                    message.type === 'error' ? 'text-red-800' : 'text-green-800'
                  }`}
                >
                  {message.text}
                </p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setMessage({ text: '', type: '' })}
                  className={`-mx-1.5 -my-1.5 p-1.5 rounded-md inline-flex ${
                    message.type === 'error'
                      ? 'bg-red-50 text-red-500 hover:bg-red-100'
                      : 'bg-green-50 text-green-500 hover:bg-green-100'
                  }`}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Today's Status Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Today's Status
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('today')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition ${
                activeTab === 'today'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition ${
                activeTab === 'history'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              History
            </button>
          </div>
        </div>

        {loadingInitialData ? (
          <div className="space-y-6 py-8">
            <div className="animate-pulse flex justify-between">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            </div>
            <div className="animate-pulse flex justify-between pt-4">
              <div className="h-10 bg-gray-200 rounded w-1/2"></div>
              <div className="h-10 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Sun className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Check In</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {todayRecord?.checkIn ? formatTime(todayRecord.checkIn) : '--:--'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-full">
                    <Moon className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Check Out</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {todayRecord?.checkOut ? formatTime(todayRecord.checkOut) : '--:--'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <Watch className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Duration</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {calculateDuration(todayRecord?.checkIn, todayRecord?.checkOut)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={() => handleAction('checkin')}
                disabled={todayRecord?.checkIn || submittingAction}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  todayRecord?.checkIn
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md'
                } ${submittingAction && !todayRecord?.checkIn ? 'opacity-80' : ''}`}
              >
                {submittingAction && !todayRecord?.checkIn ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <LogIn className="h-5 w-5" />
                )}
                {todayRecord?.checkIn ? 'Already Checked In' : 'Check In'}
              </button>

              <button
                onClick={() => handleAction('checkout')}
                disabled={!todayRecord?.checkIn || todayRecord?.checkOut || submittingAction}
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  todayRecord?.checkOut || !todayRecord?.checkIn
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-md'
                } ${submittingAction && todayRecord?.checkIn && !todayRecord?.checkOut ? 'opacity-80' : ''}`}
              >
                {submittingAction && todayRecord?.checkIn && !todayRecord?.checkOut ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <LogOut className="h-5 w-5" />
                )}
                {todayRecord?.checkOut ? 'Checked Out' : 'Check Out'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Attendance History */}
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all ${
        activeTab === 'history' ? 'block' : 'hidden'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-600" />
              Attendance History
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Your recent check-in/out records
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select className="text-sm bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>This month</option>
              <option>Last month</option>
            </select>
          </div>
        </div>

        {loadingInitialData ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex justify-between items-center py-4">
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/5"></div>
                <div className="h-6 bg-gray-200 rounded w-1/5"></div>
                <div className="h-6 bg-gray-200 rounded w-1/6"></div>
              </div>
            ))}
          </div>
        ) : attendance.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
              <Info className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No attendance records
            </h3>
            <p className="text-gray-500 text-sm">
              Your check-in/out history will appear here
            </p>
          </div>
        ) : (
          <div className="overflow-hidden border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Check In
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Check Out
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Duration
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendance.map((entry) => (
                  <tr key={entry._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatDate(entry.date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          entry.checkIn
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {entry.checkIn ? 'Present' : 'Absent'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`text-sm ${
                          entry.checkIn ? 'text-gray-900' : 'text-gray-400'
                        }`}
                      >
                        {formatTime(entry.checkIn)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`text-sm ${
                          entry.checkOut ? 'text-gray-900' : 'text-gray-400'
                        }`}
                      >
                        {formatTime(entry.checkOut)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {calculateDuration(entry.checkIn, entry.checkOut)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}