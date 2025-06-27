'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Loader,
  UserCheck,
  ClipboardList,
  FileClock,
  Link2,
  ArrowRightCircle,
  Clock,
  CalendarCheck,
  UserCog
} from 'lucide-react';
import api from '@/utils/axios';
import Link from 'next/link';

export default function ManagerDashboard() {
  const [dutyRequests, setDutyRequests] = useState([]);
  const [teamAttendance, setTeamAttendance] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        const [dutyRes, attendanceRes, leaveRes] = await Promise.all([
          api.get('/duty/all', { headers }),
          api.get('/attendance/team', { headers }),
          api.get('/leave/all', { headers }),
        ]);

        setDutyRequests(dutyRes.data.requests || []);
        setTeamAttendance(attendanceRes.data.records || []);
        setLeaveRequests(leaveRes.data.requests || []);
      } catch (err) {
        console.error('Error loading manager dashboard:', err.response?.data || err.message);
        setDutyRequests([]);
        setTeamAttendance([]);
        setLeaveRequests([]);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchData();
  }, [token]);

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
        >
          Manager Dashboard
        </motion.h1>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-gray-500"
        >
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </motion.div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader className="animate-spin w-10 h-10 text-indigo-500" />
        </div>
      ) : (
        <>
          {/* 🔢 Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <StatCard
              icon={<FileClock className="text-indigo-500" size={24} />}
              label="Pending Leave Requests"
              count={leaveRequests.length}
              color="bg-indigo-50"
              link="/manager/leaves"
            />
            <StatCard
              icon={<ClipboardList className="text-amber-500" size={24} />}
              label="Duty Handover Requests"
              count={dutyRequests.length}
              color="bg-amber-50"
              link="/manager/duties"
            />
            <StatCard
              icon={<UserCheck className="text-emerald-500" size={24} />}
              label="Today's Attendance"
              count={teamAttendance.length}
              color="bg-emerald-50"
              link="/manager/team-attendance"
            />
          </motion.div>

          {/* 📋 Data Sections */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid md:grid-cols-2 gap-6"
          >
            <DataCard
              title="Recent Duty Requests"
              icon={<ClipboardList className="text-amber-500" />}
              items={dutyRequests}
              type="duty"
              emptyMessage="No duty requests pending"
              link="/manager/duties"
            />
            <DataCard
              title="Team Attendance"
              icon={<Clock className="text-emerald-500" />}
              items={teamAttendance}
              type="attendance"
              emptyMessage="No attendance records today"
              link="/manager/team-attendance"
            />
          </motion.div>

         
        </>
      )}
    </div>
  );
}

// 📦 Stat Card Component
function StatCard({ icon, label, count, color, link }) {
  return (
    <Link href={link}>
      <motion.div
        whileHover={{ y: -5 }}
        className={`${color} rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-all cursor-pointer`}
      >
        <div className="flex justify-between items-start">
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-white w-fit shadow-sm">
              {icon}
            </div>
            <h3 className="text-gray-500 text-sm font-medium">{label}</h3>
          </div>
          <motion.p
            className="text-3xl font-bold text-gray-800"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500 }}
          >
            {count}
          </motion.p>
        </div>
      </motion.div>
    </Link>
  );
}

// 📋 Data Card Component
function DataCard({ title, icon, items, type, emptyMessage, link }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="p-5 border-b border-gray-100 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          {icon}
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        </div>
        {link && (
          <Link href={link} className="text-sm text-indigo-600 hover:underline">
            View all
          </Link>
        )}
      </div>
      <div className="divide-y divide-gray-100">
        {items.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {emptyMessage}
          </div>
        ) : (
          items.slice(0, 5).map((item) => (
            <motion.div
              key={item._id}
              className="p-4 hover:bg-gray-50 transition-colors"
              whileHover={{ x: 5 }}
            >
              {type === 'duty' && (
                <>
                  <p className="font-medium text-gray-800">{item.task?.title || 'Untitled Task'}</p>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <span>{item.fromEmployee?.name || 'Unknown'}</span>
                    <ArrowRightCircle className="mx-2 w-4 h-4 text-gray-400" />
                    <span>{item.toEmployee?.name || 'Unknown'}</span>
                  </div>
                  <div className="mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                        item.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-gray-100 text-gray-800'
                      }`}>
                      {item.status}
                    </span>
                  </div>
                </>
              )}

              {type === 'attendance' && (
                <>
                  <p className="font-medium text-gray-800">{item.employee?.name}</p>
                  <div className="flex items-center text-sm text-gray-500 mt-1 space-x-4">
                    <div className="flex items-center">
                      <span className="text-emerald-500">In:</span>
                      <span className="ml-1">
                        {item.checkIn ? new Date(item.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-rose-500">Out:</span>
                      <span className="ml-1">
                        {item.checkOut ? new Date(item.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

