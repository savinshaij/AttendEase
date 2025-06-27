'use client'

import { useEffect, useState } from 'react'
import api from '@/utils/axios'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Briefcase, User, ClipboardList, Bell, Activity, Clock, CheckCircle, XCircle
} from 'lucide-react'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { useAuth } from '@/context/AuthProvider'

const DashboardPage = () => {
  const [stats, setStats] = useState(null)
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const { authToken } = useAuth()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/admin/overview', {
          headers: { Authorization: `Bearer ${authToken}` }
        })
        setStats(res.data.stats)
        setActivities(res.data.activities)
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }
    if (authToken) fetchData()
  }, [authToken])

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ 
        scale: 1.03,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}
      className={`p-5 rounded-lg bg-white border border-gray-200 shadow-sm`}
    >
      <div className="flex items-start space-x-4">
        <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <div>
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <p className="text-2xl font-bold mt-1 text-gray-800">{value}</p>
        </div>
      </div>
    </motion.div>
  )

  if (loading || !stats) return (
    <div className="p-6 flex items-center justify-center h-screen">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"
      />
    </div>
  )

  // Chart Data
  const pieData = [
    { name: 'Present', value: stats.checkedInToday },
    { name: 'Absent', value: stats.absenteesToday }
  ]
  const barData = [
    {
      name: 'Leaves',
      Approved: stats.leaveRequests - stats.pendingLeaves,
      Pending: stats.pendingLeaves,
    }
  ]
  const COLORS = {
    present: '#10B981',
    absent: '#EF4444',
    approved: '#3B82F6',
    pending: '#F59E0B'
  }

  const statusIcons = {
    approved: <CheckCircle className="w-4 h-4 text-green-500" />,
    pending: <Clock className="w-4 h-4 text-yellow-500" />,
    rejected: <XCircle className="w-4 h-4 text-red-500" />
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-6 space-y-8 max-w-7xl mx-auto bg-gray-50 min-h-screen"
    >
      <div className="flex justify-between items-center">
        <motion.h1 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-2xl font-bold text-gray-800"
        >
          Dashboard Overview
        </motion.h1>
        <motion.p 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm text-gray-600"
        >
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </motion.p>
      </div>

      {/* Stats Grid */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-700">Key Metrics</h2>
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
        >
          <StatCard icon={User} label="Employees" value={stats.employees} color="text-blue-500" />
          <StatCard icon={Briefcase} label="Managers" value={stats.managers} color="text-purple-500" />
          <StatCard icon={ClipboardList} label="Total Leaves" value={stats.leaveRequests} color="text-amber-500" />
          <StatCard icon={ClipboardList} label="Pending Leaves" value={stats.pendingLeaves} color="text-orange-500" />
          <StatCard icon={Bell} label="Feedbacks" value={stats.unreadFeedback} color="text-red-500" />
          <StatCard icon={Activity} label="Checked-in Today" value={stats.checkedInToday} color="text-green-500" />
          <StatCard icon={Activity} label="Absentees Today" value={stats.absenteesToday} color="text-gray-500" />
        </motion.div>
      </section>

      {/* Charts Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <motion.div 
          className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Today's Attendance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={60}
                paddingAngle={5}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                <Cell fill={COLORS.present} />
                <Cell fill={COLORS.absent} />
              </Pie>
              <Legend 
                formatter={(value) => <span className="text-sm text-gray-600">{value}</span>}
              />
              <Tooltip 
                formatter={(value) => [value, value === stats.checkedInToday ? 'Present' : 'Absent']}
                contentStyle={{
                  borderRadius: '0.375rem',
                  border: '1px solid #e5e7eb',
                  background: 'white'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div 
          className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Leave Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#4b5563' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fill: '#4b5563' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{
                  borderRadius: '0.375rem',
                  border: '1px solid #e5e7eb',
                  background: 'white'
                }}
              />
              <Legend 
                formatter={(value) => <span className="text-sm text-gray-600">{value}</span>}
              />
              <Bar 
                dataKey="Approved" 
                fill={COLORS.approved} 
                radius={[4, 4, 0, 0]}
                name="Approved Leaves"
              />
              <Bar 
                dataKey="Pending" 
                fill={COLORS.pending} 
                radius={[4, 4, 0, 0]}
                name="Pending Leaves"
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </section>

      {/* Activity Feed */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm"
      >
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Recent Activities</h2>
        {activities.length === 0 ? (
          <motion.div 
            className="p-8 text-center bg-gray-50 rounded-lg"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
          >
            <p className="text-gray-500">No activity found.</p>
          </motion.div>
        ) : (
          <ul className="space-y-2">
            <AnimatePresence>
              {activities.map((activity, idx) => (
                <motion.li
                  key={idx}
                  className="p-4 rounded-lg border border-gray-100 bg-gray-50"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ 
                    backgroundColor: '#f9fafb'
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {statusIcons[activity.status.toLowerCase()] || <Bell className="w-4 h-4 text-gray-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 font-medium">
                        <span className="text-blue-600">{activity.user}</span> {activity.action}
                      </p>
                      <div className="flex items-center mt-1 text-xs text-gray-500 space-x-3">
                        <span>{new Date(activity.time).toLocaleString()}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                          activity.status.toLowerCase() === 'approved' ? 'bg-green-100 text-green-800' : 
                          activity.status.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {activity.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </motion.section>
    </motion.div>
  )
}

export default DashboardPage