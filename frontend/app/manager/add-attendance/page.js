'use client';
import { useEffect, useState } from 'react';
import api from '@/utils/axios';
import { useRouter } from 'next/navigation';
import { User, Clock, CalendarDays, Trash2, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';

export default function AdminManagerAttendanceEditor() {
  const [users, setUsers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const router = useRouter();
  const { authToken } = useAuth();

  const [form, setForm] = useState({
    employeeId: '',
    date: '',
    checkIn: '',
    checkOut: ''
  });

  useEffect(() => {
    if (!authToken) {
      
      return;
    }

    const fetchEmployees = async () => {
      try {
        const res = await api.get('/users/employees', {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setUsers(res.data.users || []);
      } catch (err) {
        setMessage({ 
          text: err.response?.data?.message || 'Failed to load employees', 
          type: 'error' 
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [authToken, router]);

  useEffect(() => {
    if (form.employeeId) {
      fetchAttendance(form.employeeId);
    }
  }, [form.employeeId]);

  const fetchAttendance = async (employeeId) => {
    try {
      const res = await api.get(`/attendance/history/${employeeId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setAttendance(res.data.records || []);
    } catch (err) {
      setMessage({ 
        text: err.response?.data?.message || 'Failed to fetch attendance', 
        type: 'error' 
      });
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setMessage({ text: '', type: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.post('/attendance/admin/set', form, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setMessage({ 
        text: 'Attendance record saved successfully', 
        type: 'success' 
      });
      setForm(prev => ({ ...prev, date: '', checkIn: '', checkOut: '' }));
      fetchAttendance(form.employeeId);
    } catch (err) {
      setMessage({ 
        text: err.response?.data?.message || 'Failed to save attendance', 
        type: 'error' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (employeeId, date) => {
    if (!confirm('Are you sure you want to delete this attendance record?')) return;
    
    setDeleting(true);
    try {
      await api.delete(`/attendance/admin/${employeeId}/${date}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setMessage({ 
        text: 'Attendance record deleted', 
        type: 'success' 
      });
      fetchAttendance(form.employeeId);
    } catch (err) {
      setMessage({ 
        text: err.response?.data?.message || 'Failed to delete record', 
        type: 'error' 
      });
    } finally {
      setDeleting(false);
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

  const formatTime = (timeString) => {
    if (!timeString) return '-';
    const time = new Date(timeString);
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };


  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-8">
        <Clock className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
          <p className="text-gray-600">Edit employee attendance records</p>
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
        <div className="flex justify-center items-center h-40">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="space-y-8">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Employee
                </span>
              </label>
              <select
                name="employeeId"
                value={form.employeeId}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select an employee</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.department || 'No department'})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" />
                    Date
                  </span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Check-In Time
                </label>
                <input
                  type="time"
                  name="checkIn"
                  value={form.checkIn}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Check-Out Time
                </label>
                <input
                  type="time"
                  name="checkOut"
                  value={form.checkOut}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={submitting || !form.employeeId || !form.date}
                className={`flex items-center gap-2 px-6 py-3 text-base font-medium rounded-md shadow-sm text-white ${
                  submitting || !form.employeeId || !form.date
                    ? 'bg-green-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Save Record
                  </>
                )}
              </button>
            </div>
          </form>

          {form.employeeId && attendance.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-500" />
                  Attendance History
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr className="text-left text-gray-600 text-sm">
                      <th className="px-6 py-3 font-medium">Date</th>
                      <th className="px-6 py-3 font-medium">Check-In</th>
                      <th className="px-6 py-3 font-medium">Check-Out</th>
                      <th className="px-6 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {attendance.map((record) => (
                      <tr key={record._id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {formatDate(record.date)}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {formatTime(record.checkIn)}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {formatTime(record.checkOut)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDelete(form.employeeId, record.date)}
                            disabled={deleting}
                            className={`text-red-600 hover:text-red-800 flex items-center gap-1 justify-end ${
                              deleting ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            {deleting ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Trash2 className="w-4 h-4" />
                                <span className="text-sm">Delete</span>
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}