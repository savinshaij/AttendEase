'use client';
import {
  Clock,
  FileText,
  Calendar,
  CheckCircle,
  AlertCircle,
  Plus,
  History,
  UserCheck,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthProvider';
import api from '@/utils/axios';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';

export default function StudentDashboard() {
  const [stats, setStats] = useState({
    pendingLeaveRequests: 0,
    totalRemainingLeave: 0,
    completedTasks: 0,
    pendingTasks: 0,
  });
  const [todayStatus, setTodayStatus] = useState({ checkedIn: false, checkedOut: false });
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { authToken, user } = useAuth();
  const [hideAttendancePrompt, setHideAttendancePrompt] = useState(false);
  
  const fetchAttendance = async () => {
    try {
      const res = await api.get('/attendance/me', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const records = res.data.records;
      setAttendanceHistory(records);

      const today = new Date().toDateString();
      const todayRecord = records.find(r => {
        const recordDate = new Date(r.checkIn || r.date).toDateString();
        return recordDate === today;
      });

      setTodayStatus({
        checkedIn: !!todayRecord?.checkIn,
        checkedOut: !!todayRecord?.checkOut,
      });
    } catch (err) {
      console.error('Error fetching attendance:', err.response?.data || err.message);
    }
  };

  useEffect(() => {
    if (!authToken) return;

    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [leaveRes, balanceRes, taskRes] = await Promise.all([
          api.get('/leave/my', { headers: { Authorization: `Bearer ${authToken}` } }),
          api.get('/leave/balance/me', { headers: { Authorization: `Bearer ${authToken}` } }),
          api.get('/task/my-tasks', { headers: { Authorization: `Bearer ${authToken}` } }),
        ]);

        const allRequests = leaveRes.data.requests;
        setLeaveRequests(allRequests);
        const pendingCount = allRequests.filter(l => l.status === 'pending').length;

        const totalRemaining = balanceRes.data.balances.reduce(
          (sum, b) => sum + b.remainingBalance,
          0
        );

        const tasks = taskRes.data.tasks;
        const completed = tasks.filter(t => t.status === 'completed').length;

        setStats({
          pendingLeaveRequests: pendingCount,
          totalRemainingLeave: totalRemaining,
          completedTasks: completed,
          pendingTasks: tasks.length - completed,
        });

        await fetchAttendance();
      } catch (err) {
        console.error('Error loading dashboard:', {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [authToken]);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-1"
      >
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Student Dashboard
        </h1>
        <p className="text-gray-600">Welcome back, {user?.name || 'Student'}! Here's your academic overview</p>
      </motion.div>

      {/* Attendance Prompt */}
      <AnimatePresence>
        {!hideAttendancePrompt && !todayStatus.checkedOut && (
          <motion.div
            key="attendance-prompt"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className={`rounded-xl p-5 text-white ${
              !todayStatus.checkedIn
                ? 'bg-gradient-to-r from-amber-500 to-amber-600'
                : 'bg-gradient-to-r from-blue-500 to-blue-600'
            } shadow-md`}
          >
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center mb-4 md:mb-0">
                <div className="p-2 bg-white bg-opacity-20 rounded-lg mr-4">
                  <UserCheck className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    {!todayStatus.checkedIn
                      ? 'Check-In Pending'
                      : 'Check-Out Pending'}
                  </h2>
                  <p className="text-white text-opacity-90">
                    {!todayStatus.checkedIn
                      ? 'Mark your attendance for today'
                      : 'Remember to check out when leaving'}
                  </p>
                </div>
              </div>
              <Link
                href="/employee/attendance"
                className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-opacity-90 transition-all flex items-center"
              >
                {!todayStatus.checkedIn ? 'Check In Now' : 'Check Out Now'}
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <StatCard
          title="Remaining Leave"
          value={stats.totalRemainingLeave}
          icon={<Calendar className="h-5 w-5 text-emerald-500" />}
          description="Days available"
          color="bg-emerald-50"
          link="/leave/apply"
        />
        <StatCard
          title="Tasks Completed"
          value={`${stats.completedTasks}/${stats.completedTasks + stats.pendingTasks}`}
          icon={<FileText className="h-5 w-5 text-blue-500" />}
          description="Your progress"
          color="bg-blue-50"
          link="/tasks"
        />
        <StatCard
          title="Pending Requests"
          value={stats.pendingLeaveRequests}
          icon={<AlertCircle className="h-5 w-5 text-amber-500" />}
          description="Awaiting approval"
          color="bg-amber-50"
          link="/leave/my"
        />
        <StatCard
          title="Attendance Streak"
          value="5"
          icon={<CheckCircle className="h-5 w-5 text-purple-500" />}
          description="Consecutive days"
          color="bg-purple-50"
          link="/attendance"
        />
      </motion.div>

      {/* History Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance History */}
        <DataSection
          title="Recent Attendance"
          icon={<History className="h-5 w-5 text-blue-500" />}
          loading={loading}
          items={attendanceHistory}
          type="attendance"
          emptyMessage="No attendance records found"
          link="/attendance"
        />
        
        {/* Leave History */}
        <DataSection
          title="Leave History"
          icon={<Calendar className="h-5 w-5 text-emerald-500" />}
          loading={loading}
          items={leaveRequests}
          type="leave"
          emptyMessage="No leave requests found"
          link="/leave/my"
        />
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, description, color, link }) {
  return (
    <Link href={link}>
      <motion.div
        whileHover={{ y: -4 }}
        className={`${color} border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer`}
      >
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          </div>
          <div className="p-2 rounded-lg bg-white shadow-sm">
            {icon}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

function DataSection({ title, icon, loading, items, type, emptyMessage, link }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
    >
      <div className="p-5 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          {icon}
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        </div>
        <Link href={link} className="text-sm font-medium text-blue-600 hover:text-blue-800">
          View All
        </Link>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center p-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : items.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          {emptyMessage}
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {items.slice(0, 5).map((item, idx) => (
            <motion.li
              key={idx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="p-4 hover:bg-gray-50 transition-colors"
            >
              {type === 'attendance' ? (
                <AttendanceItem item={item} />
              ) : (
                <LeaveItem item={item} />
              )}
            </motion.li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}

function AttendanceItem({ item }) {
  const formatTime = (dateString) => {
    if (!dateString) return '--:--';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium text-gray-800">
          {new Date(item.date || item.checkIn).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
          })}
        </p>
        <div className="flex items-center space-x-4 mt-1">
          <span className="text-sm text-gray-500">
            <span className="text-emerald-500">In:</span> {formatTime(item.checkIn)}
          </span>
          <span className="text-sm text-gray-500">
            <span className="text-rose-500">Out:</span> {formatTime(item.checkOut)}
          </span>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Present
        </span>
      </div>
    </div>
  );
}

function LeaveItem({ item }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const statusColors = {
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    pending: 'bg-amber-100 text-amber-800'
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium text-gray-800">
          {item.policy?.leaveType?.typeName || 'Leave Request'}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          {formatDate(item.startDate)} - {formatDate(item.endDate)}
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          statusColors[item.status] || 'bg-gray-100 text-gray-800'
        }`}>
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </span>
      </div>
    </div>
  );
}