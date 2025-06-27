'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import api from '@/utils/axios'
import { useAuth } from '@/context/AuthProvider'
import {
  Pencil, Trash2, ChevronLeft, Save, Shield, User, Users, Mail, Phone, Briefcase,
  MapPin, GraduationCap, Calendar, ClipboardList, Clock, BookText, MessageCircle,
  AlertCircle, Loader2, ChevronDown, ChevronUp
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const UserDetailsPage = () => {
  const { id } = useParams()
  const router = useRouter()
  const { authToken } = useAuth()

  const [user, setUser] = useState(null)
  const [formData, setFormData] = useState({})
  const [editMode, setEditMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    attendance: true,
    leaves: true,
    tasks: true,
    feedbacks: true
  })

  const [attendance, setAttendance] = useState([])
  const [leaves, setLeaves] = useState([])
  const [tasks, setTasks] = useState([])
  const [feedbacks, setFeedbacks] = useState([])

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true)
        const res = await api.get(`/admin/users/${id}`, {
          headers: { Authorization: `Bearer ${authToken}` }
        })
        setUser(res.data.user)
        setFormData(res.data.user)
        setAttendance(res.data.attendance || [])
        setLeaves(res.data.leaves || [])
        setTasks(res.data.tasks || [])
        setFeedbacks(res.data.feedbacks || [])
      } catch (err) {
        console.error('Fetch failed:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [id, authToken])

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to permanently delete this user?')) return
    try {
      setIsDeleting(true)
      await api.delete(`/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      })
      router.push('/admin/user-management')
    } catch (err) {
      console.error('Delete failed:', err)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      const res = await api.put(`/admin/users/${id}`, formData, {
        headers: { Authorization: `Bearer ${authToken}` }
      })
      setUser(res.data.user)
      setEditMode(false)
    } catch (err) {
      console.error('Update failed:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleStatus = async () => {
    try {
      setToggling(true)
      const res = await api.put(`/admin/users/${id}`, {
        isActive: !user.isActive
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      })
      setUser(res.data.user)
    } catch (err) {
      console.error('Toggle failed:', err)
    } finally {
      setToggling(false)
    }
  }

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const formatDate = (dateString) => {
    if (!dateString) return '—'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return '—'
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const calculateDaysBetween = (startDate, endDate) => {
    if (!startDate || !endDate) return '—'
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
    return `${diff} day${diff !== 1 ? 's' : ''}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 max-w-md text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">User Not Found</h2>
          <p className="text-gray-600 mb-4">The requested user could not be found.</p>
          <button
            onClick={() => router.push('/admin/user-management')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to User Management
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/user-management')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
            <p className="text-gray-600">Manage user information and activities</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Active/Inactive Toggle */}
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
            <span className="text-sm text-gray-600">{user.isActive ? 'Active' : 'Inactive'}</span>
            <motion.button
              onClick={handleToggleStatus}
              whileTap={{ scale: 0.9 }}
              className={`w-10 h-6 rounded-full relative transition-colors duration-300 ${user.isActive ? 'bg-green-500' : 'bg-gray-300'}`}
              disabled={toggling}
            >
              {toggling ? (
                <motion.div className="absolute top-0.5 left-0.5 h-5 w-5 bg-white rounded-full shadow-sm flex items-center justify-center">
                  <Loader2 className="w-3 h-3 animate-spin text-gray-500" />
                </motion.div>
              ) : (
                <motion.div
                  layout
                  className={`absolute top-0.5 left-0.5 h-5 w-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${user.isActive ? 'translate-x-4' : ''}`}
                />
              )}
            </motion.button>
          </div>

          {/* Edit Button */}
          <button
            onClick={() => setEditMode(!editMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${editMode ? 'bg-gray-100 text-gray-700' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
          >
            <Pencil className="w-4 h-4" />
            {editMode ? 'Cancel' : 'Edit'}
          </button>

          {/* Delete Button */}
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            Delete
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* User Information Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { key: 'name', label: 'Full Name', icon: <User className="w-4 h-4 text-gray-500" /> },
              { key: 'email', label: 'Email Address', icon: <Mail className="w-4 h-4 text-gray-500" /> },
              { key: 'phone', label: 'Phone Number', icon: <Phone className="w-4 h-4 text-gray-500" /> },
              { key: 'role', label: 'Role', icon: <Shield className="w-4 h-4 text-gray-500" /> },
              { key: 'department', label: 'Department', icon: <Briefcase className="w-4 h-4 text-gray-500" /> },
              { key: 'position', label: 'Position', icon: <Briefcase className="w-4 h-4 text-gray-500" /> },
              { key: 'age', label: 'Age', icon: <Calendar className="w-4 h-4 text-gray-500" /> },
              { key: 'qualification', label: 'Qualification', icon: <GraduationCap className="w-4 h-4 text-gray-500" /> },
              { key: 'experience', label: 'Experience (years)', icon: <Briefcase className="w-4 h-4 text-gray-500" /> },
              { key: 'address', label: 'Address', icon: <MapPin className="w-4 h-4 text-gray-500" />, full: true }
            ].map(({ key, label, icon, full }) => (
              <div key={key} className={`${full ? 'md:col-span-2' : ''}`}>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                  {icon}
                  {label}
                </label>
                {editMode ? (
                  <input
                    value={formData[key] || ''}
                    onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                ) : (
                  <p className="px-4 py-2 text-gray-800 border border-gray-200 rounded-lg bg-gray-50 min-h-[40px] flex items-center">
                    {user[key] || '—'}
                  </p>
                )}
              </div>
            ))}
          </div>

          {editMode && (
            <div className="flex justify-end mt-6">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Changes
              </button>
            </div>
          )}
        </div>

        {/* Activity Sections */}
        <div className="space-y-6">
          {/* Attendance History */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <button
              onClick={() => toggleSection('attendance')}
              className="w-full flex justify-between items-center p-6 hover:bg-gray-50 transition-colors"
            >
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Attendance History
              </h2>
              {expandedSections.attendance ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>

            <AnimatePresence>
              {expandedSections.attendance && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="px-6 pb-6"
                >
                  {attendance.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No attendance records found
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {attendance.map((record, index) => (
                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                {formatDate(record.date)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {record.checkIn ? formatDateTime(record.checkIn) : '—'}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {record.checkOut ? formatDateTime(record.checkOut) : '—'}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  record.checkIn && record.checkOut 
                                    ? 'bg-green-100 text-green-800' 
                                    : record.checkIn 
                                      ? 'bg-yellow-100 text-yellow-800' 
                                      : 'bg-red-100 text-red-800'
                                }`}>
                                  {record.checkIn && record.checkOut ? 'Present' : record.checkIn ? 'Partial' : 'Absent'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Leave Requests */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <button
              onClick={() => toggleSection('leaves')}
              className="w-full flex justify-between items-center p-6 hover:bg-gray-50 transition-colors"
            >
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-blue-600" />
                Leave Requests
              </h2>
              {expandedSections.leaves ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>

            <AnimatePresence>
              {expandedSections.leaves && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="px-6 pb-6"
                >
                  {leaves.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No leave requests found
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested On</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {leaves.map((leave, index) => (
                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                {formatDate(leave.startDate)} to {formatDate(leave.endDate)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {calculateDaysBetween(leave.startDate, leave.endDate)}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">
                                {leave.reason || '—'}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  leave.status === 'approved' 
                                    ? 'bg-green-100 text-green-800' 
                                    : leave.status === 'pending' 
                                      ? 'bg-yellow-100 text-yellow-800' 
                                      : 'bg-red-100 text-red-800'
                                }`}>
                                  {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {formatDateTime(leave.createdAt)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Task History */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <button
              onClick={() => toggleSection('tasks')}
              className="w-full flex justify-between items-center p-6 hover:bg-gray-50 transition-colors"
            >
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <BookText className="w-5 h-5 text-blue-600" />
                Task History
              </h2>
              {expandedSections.tasks ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>

            <AnimatePresence>
              {expandedSections.tasks && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="px-6 pb-6"
                >
                  {tasks.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No tasks found
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {tasks.map((task, index) => (
                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3 text-sm font-medium text-gray-900 max-w-xs truncate">
                                {task.title}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">
                                {task.description || '—'}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  task.status === 'completed' 
                                    ? 'bg-green-100 text-green-800' 
                                    : task.status === 'in-progress' 
                                      ? 'bg-blue-100 text-blue-800' 
                                      : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {task.status.split('-').map(word => 
                                    word.charAt(0).toUpperCase() + word.slice(1)
                                  ).join(' ')}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {formatDateTime(task.createdAt)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {formatDateTime(task.updatedAt)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Feedbacks */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <button
              onClick={() => toggleSection('feedbacks')}
              className="w-full flex justify-between items-center p-6 hover:bg-gray-50 transition-colors"
            >
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-600" />
                Feedbacks
              </h2>
              {expandedSections.feedbacks ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>

            <AnimatePresence>
              {expandedSections.feedbacks && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="px-6 pb-6"
                >
                  {feedbacks.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No feedbacks found
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {feedbacks.map((feedback, index) => (
                        <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600">
                                {feedback.message || '—'}
                              </div>
                              <span className="text-sm font-medium text-gray-900">
                                Feedback #{index + 1}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {formatDateTime(feedback.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {feedback.writing || 'No additional comments'}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserDetailsPage